// Jira MCP 도구의 입력 스키마·호출 전달·안전 제한을 검증합니다.
// 클라이언트는 모의 객체이므로 Jira 서버로 실제 요청하지 않습니다.
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { registerJiraTools } from "../../../mcp-src/tools/jira-tools.mjs";

function createFixture() {
  const tools = new Map();
  const calls = [];
  const methods = [
    "status", "listProjects", "createProject", "listIssueTypes", "searchIssues",
    "getIssue", "createIssue", "updateIssue", "deleteIssue",
    "assignIssue", "listTransitions", "transitionIssue", "addLabels",
  ];
  const jiraClient = Object.fromEntries(methods.map(method => [
    method,
    async (args) => {
      calls.push({ method, args });
      return { operation: method, input: args || null };
    },
  ]));
  registerJiraTools({
    server: {
      registerTool(name, options, handler) {
        tools.set(name, { options, handler });
      },
    },
    z,
    jiraClient,
  });

  const schema = name => z.object(tools.get(name).options.inputSchema);
  const run = async (name, input) => {
    const data = schema(name).parse(input);
    return tools.get(name).handler(data);
  };
  return { tools, calls, schema, run };
}

describe("Jira MCP 도구 등록·입력 검증", () => {
  it("Jira 도구 14개를 등록하고 읽기·삭제 작업의 권한 힌트를 구분한다", () => {
    const { tools } = createFixture();
    expect(tools.size).toBe(14);
    expect(tools.get("jira_search_issues").options.annotations.readOnlyHint).toBe(true);
    expect(tools.get("jira_get_issue").options.annotations.readOnlyHint).toBe(true);
    expect(tools.get("jira_update_issue").options.annotations.destructiveHint).toBe(true);
    expect(tools.get("jira_delete_issue").options.annotations.destructiveHint).toBe(true);
  });

  it("이슈 생성 시 공백 제목·잘못된 라벨·너무 긴 제목을 거부한다", () => {
    const { schema } = createFixture();
    const create = schema("jira_create_issue");
    expect(create.safeParse({ summary: "  ", issueType: "작업" }).success).toBe(false);
    expect(create.safeParse({ summary: "x".repeat(256), issueType: "작업" }).success).toBe(false);
    expect(create.safeParse({ summary: "테스트", issueType: "작업", labels: [""] }).success).toBe(false);
    expect(create.safeParse({
      summary: "테스트",
      issueType: "작업",
      labels: Array.from({ length: 51 }, (_, i) => `label-${i}`),
    }).success).toBe(false);
  });

  it("하위 작업은 부모 키가 필수이며 기본 이슈 유형을 사용한다", async () => {
    const { schema, run, calls } = createFixture();
    expect(schema("jira_create_subtask").safeParse({ summary: "작업" }).success).toBe(false);

    const result = await run("jira_create_subtask", {
      summary: "하위 메뉴",
      parent: "DEVLOG-4",
    });
    expect(calls).toEqual([{
      method: "createIssue",
      args: {
        summary: "하위 메뉴",
        parent: "DEVLOG-4",
        issueType: "Subtask",
        description: "",
        labels: [],
      },
    }]);
    expect(result.structuredContent.operation).toBe("createIssue");
  });

  it("수정할 때 부모 관계와 우선순위를 null로 해제할 수 있다", async () => {
    const { run, calls } = createFixture();
    await run("jira_update_issue", {
      issueKey: "DEVLOG-4",
      parent: null,
      priority: null,
    });
    expect(calls[0]).toEqual({
      method: "updateIssue",
      args: { issueKey: "DEVLOG-4", parent: null, priority: null },
    });
  });

  it("삭제 입력은 DEVLOG-24~26으로만 제한한다", async () => {
    const { schema, run, calls } = createFixture();
    const remove = schema("jira_delete_issue");
    expect(remove.safeParse({ issueKey: "DEVLOG-23" }).success).toBe(false);
    expect(remove.safeParse({ issueKey: "OTHER-24" }).success).toBe(false);
    await run("jira_delete_issue", { issueKey: "DEVLOG-25" });
    expect(calls).toEqual([{
      method: "deleteIssue",
      args: { issueKey: "DEVLOG-25" },
    }]);
  });

  it("JQL 및 전환 ID에는 비어 있지 않은 값만 허용한다", () => {
    const { schema } = createFixture();
    expect(schema("jira_search_issues").safeParse({ jql: "" }).success).toBe(false);
    expect(schema("jira_search_issues").safeParse({
      jql: "project = DEVLOG",
      maxResults: 101,
    }).success).toBe(false);
    expect(schema("jira_transition_issue").safeParse({
      issueKey: "DEVLOG-4",
      transitionId: " ",
    }).success).toBe(false);
  });

  it("도구 결과에 기계 판독용 데이터와 텍스트 응답을 함께 제공한다", async () => {
    const { run } = createFixture();
    const result = await run("jira_list_projects", { query: "DEVLOG" });
    expect(result.structuredContent.operation).toBe("listProjects");
    expect(result.content[0]).toMatchObject({ type: "text" });
    expect(JSON.parse(result.content[0].text)).toEqual(result.structuredContent);
  });

  it("라벨 추가에 빈 배열을 허용하지 않고 정상 요청은 그대로 전달한다", async () => {
    const { schema, run, calls } = createFixture();
    expect(schema("jira_add_labels").safeParse({
      issueKey: "DEVLOG-4", labels: [],
    }).success).toBe(false);
    await run("jira_add_labels", {
      issueKey: "DEVLOG-4", labels: ["area-workflow"],
    });
    expect(calls[0]).toEqual({
      method: "addLabels",
      args: { issueKey: "DEVLOG-4", labels: ["area-workflow"] },
    });
  });
});
