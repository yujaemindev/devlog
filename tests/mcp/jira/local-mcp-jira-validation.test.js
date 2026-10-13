// Jira REST 클라이언트의 오류 처리, 조회 결과 변환 및 삭제 안전장치를 검증합니다.
// 모든 HTTP 요청은 모의 응답을 사용하며 실제 Jira 계정으로 접근하지 않습니다.
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createJiraClient, textToAdf } from "../../../mcp-src/services/jira-client.mjs";

let root;

const config = {
  baseUrl: "https://example.atlassian.net",
  email: "tester@example.com",
  defaultProjectKey: "DEVLOG",
};

const response = (data, status = 200, statusText = "OK") => ({
  ok: status >= 200 && status < 300,
  status,
  statusText,
  async text() {
    return data === null ? "" : JSON.stringify(data);
  },
});

const makeClient = fetchImpl => createJiraClient({
  fs,
  safePath: relative => Promise.resolve(path.join(root, relative)),
  fetchImpl,
});

const saveConfig = value =>
  fs.writeFile(path.join(root, ".jira-config.json"), JSON.stringify(value));

beforeEach(async () => {
  root = await fs.mkdtemp(path.join(os.tmpdir(), "jira-validation-"));
  await saveConfig(config);
  await fs.writeFile(path.join(root, ".jira-api-token"), "test-only-token");
});

afterEach(async () => {
  await fs.rm(root, { recursive: true, force: true });
});

describe("Jira 인증·요청 검증", () => {
  it("설정 파일이 없으면 원인을 안내하고 요청하지 않는다", async () => {
    await fs.rm(path.join(root, ".jira-config.json"));
    let called = false;
    await expect(makeClient(async () => {
      called = true;
      return response({});
    }).status()).rejects.toThrow(".jira-config.json 파일이 없습니다");
    expect(called).toBe(false);
  });

  it("잘못된 설정 JSON을 거부한다", async () => {
    await fs.writeFile(path.join(root, ".jira-config.json"), "{invalid");
    await expect(makeClient(async () => response({})).status())
      .rejects.toThrow("JSON 형식");
  });

  it("이메일 누락과 HTTP 프로토콜을 거부한다", async () => {
    await saveConfig({ ...config, email: "" });
    await expect(makeClient(async () => response({})).status())
      .rejects.toThrow("email");

    await saveConfig({ ...config, baseUrl: "http://example.atlassian.net" });
    await expect(makeClient(async () => response({})).status())
      .rejects.toThrow("https://*.atlassian.net");
  });

  it("API 토큰이 없으면 인증 여부를 false로 반환하고 요청하지 않는다", async () => {
    await fs.rm(path.join(root, ".jira-api-token"));
    let called = false;
    const result = await makeClient(async () => {
      called = true;
      return response({});
    }).status();

    expect(result).toMatchObject({ tokenConfigured: false, authenticated: false });
    expect(called).toBe(false);
  });

  it("비어 있는 API 토큰으로 데이터 조회를 시도하지 않는다", async () => {
    await fs.writeFile(path.join(root, ".jira-api-token"), "  \n");
    let called = false;
    await expect(makeClient(async () => {
      called = true;
      return response({});
    }).listProjects()).rejects.toThrow(".jira-api-token 파일이 비어 있습니다");
    expect(called).toBe(false);
  });

  it("인증 실패 시 토큰 값을 반환하지 않고 실패 원인을 제공한다", async () => {
    const result = await makeClient(async () =>
      response({ errorMessages: ["권한 없음"] }, 401, "Unauthorized")).status();

    expect(result).toMatchObject({
      tokenConfigured: true,
      authenticated: false,
      account: null,
    });
    expect(result.authError).toContain("Jira API 401");
    expect(JSON.stringify(result)).not.toContain("test-only-token");
  });

  it("HTTP 오류의 상태 코드와 메시지를 상위 호출에 전달한다", async () => {
    await expect(makeClient(async () =>
      response({ errorMessages: ["접근할 수 없습니다"] }, 403, "Forbidden"))
      .getIssue({ issueKey: "DEVLOG-1" }))
      .rejects.toThrow("Jira API 403 Forbidden");
  });

  it("요청 중 AbortError를 사용자에게 이해하기 쉬운 시간 초과로 전달한다", async () => {
    const error = new Error("aborted");
    error.name = "AbortError";
    await expect(makeClient(async () => {
      throw error;
    }).getIssue({ issueKey: "DEVLOG-1" })).rejects.toThrow("30초 후 시간 초과");
  });
});

describe("Jira 조회·검색 결과 검증", () => {
  it("프로젝트 검색 조건과 조회 개수를 URL에 전달하고 유형 정보를 정리한다", async () => {
    let requestedUrl;
    const result = await makeClient(async (url) => {
      requestedUrl = new URL(url);
      return response({
        isLast: false,
        total: 2,
        values: [{
          id: "10000",
          key: "DEVLOG",
          name: "개발 로그",
          issueTypes: [{ id: "4", name: "Subtask", subtask: true }],
        }],
      });
    }).listProjects({ query: "개발 로그", maxResults: 5 });

    expect(requestedUrl.pathname).toBe("/rest/api/3/project/search");
    expect(requestedUrl.searchParams.get("query")).toBe("개발 로그");
    expect(requestedUrl.searchParams.get("maxResults")).toBe("5");
    expect(result).toMatchObject({
      isLast: false,
      total: 2,
      values: [{ key: "DEVLOG", issueTypes: [{ subtask: true }] }],
    });
  });

  it("이슈 유형 조회에 기본 프로젝트를 사용하고 결과를 정규화한다", async () => {
    let requestedUrl;
    const result = await makeClient(async (url) => {
      requestedUrl = new URL(url);
      return response({
        issueTypes: [{ id: "3", name: "작업", description: "일반 작업", subtask: false }],
      });
    }).listIssueTypes();

    expect(requestedUrl.pathname).toBe("/rest/api/3/issue/createmeta/DEVLOG/issuetypes");
    expect(requestedUrl.searchParams.get("maxResults")).toBe("200");
    expect(result.issueTypes[0]).toEqual({
      id: "3",
      name: "작업",
      description: "일반 작업",
      subtask: false,
    });
  });

  it("기본 프로젝트가 없으면 이슈 유형 조회와 생성 요청을 차단한다", async () => {
    await saveConfig({ ...config, defaultProjectKey: "" });
    let called = false;
    const client = makeClient(async () => {
      called = true;
      return response({});
    });

    await expect(client.listIssueTypes()).rejects.toThrow("projectKey");
    await expect(client.createIssue({ summary: "테스트", issueType: "작업" }))
      .rejects.toThrow("projectKey");
    expect(called).toBe(false);
  });

  it("JQL 검색을 POST 요청으로 전달하고 다음 페이지 토큰과 부모 정보를 보존한다", async () => {
    let query;
    const result = await makeClient(async (url, options) => {
      expect(new URL(url).pathname).toBe("/rest/api/3/search/jql");
      expect(options.method).toBe("POST");
      query = JSON.parse(options.body);
      return response({
        nextPageToken: "next-123",
        issues: [{
          id: "10",
          key: "DEVLOG-10",
          fields: {
            summary: "페이지 작업",
            labels: ["area-workflow"],
            parent: { id: "23", key: "DEVLOG-23", fields: { summary: "Epic" } },
          },
        }],
      });
    }).searchIssues({ jql: "project = DEVLOG", maxResults: 7 });

    expect(query).toMatchObject({ jql: "project = DEVLOG", maxResults: 7 });
    expect(query.fields).toContain("parent");
    expect(result).toMatchObject({
      isLast: false,
      nextPageToken: "next-123",
      issues: [{ key: "DEVLOG-10", parent: { key: "DEVLOG-23" } }],
    });
  });

  it("이슈 상세 조회 시 담당자·우선순위·라벨을 정규화한다", async () => {
    const result = await makeClient(async () => response({
      id: "4",
      key: "DEVLOG-4",
      fields: {
        summary: "Home",
        issuetype: { name: "작업" },
        status: { name: "해결됨" },
        assignee: { accountId: "acc-1", displayName: "사용자" },
        priority: { name: "높음" },
      },
    })).getIssue({ issueKey: "DEVLOG-4" });

    expect(result).toMatchObject({
      key: "DEVLOG-4",
      labels: [],
      parent: null,
      assignee: { accountId: "acc-1", displayName: "사용자" },
      priority: "높음",
    });
  });

  it("여러 줄 설명을 Jira ADF 문단으로 변환하고 빈 줄도 보존한다", () => {
    const adf = textToAdf("첫째 줄\n\n마지막 줄");
    expect(adf).toMatchObject({ type: "doc", version: 1 });
    expect(adf.content).toEqual([
      { type: "paragraph", content: [{ type: "text", text: "첫째 줄" }] },
      { type: "paragraph", content: [] },
      { type: "paragraph", content: [{ type: "text", text: "마지막 줄" }] },
    ]);
  });
});

describe("Jira 이슈 변경·삭제 안전장치", () => {
  it("빈 수정 요청은 Jira 호출 전에 차단한다", async () => {
    let called = false;
    await expect(makeClient(async () => {
      called = true;
      return response({});
    }).updateIssue({ issueKey: "DEVLOG-4" })).rejects.toThrow("수정할 필드");
    expect(called).toBe(false);
  });

  it("우선순위 해제와 빈 설명을 명시적으로 전달한다", async () => {
    let updated;
    await makeClient(async (url, options) => {
      if (options.method === "PUT") {
        updated = JSON.parse(options.body);
        return response(null, 204, "No Content");
      }
      return response({ id: "4", key: "DEVLOG-4", fields: {} });
    }).updateIssue({ issueKey: "DEVLOG-4", priority: null, description: "" });

    expect(updated.fields).toEqual({
      priority: null,
      description: textToAdf(""),
    });
  });

  it("기존 라벨을 보존하면서 중복을 제거하고 정렬한다", async () => {
    let updated;
    await makeClient(async (_url, options) => {
      if (options.method === "PUT") {
        updated = JSON.parse(options.body);
        return response(null, 204, "No Content");
      }
      return response({
        id: "4",
        key: "DEVLOG-4",
        fields: { labels: ["z-label", "a-label"] },
      });
    }).addLabels({
      issueKey: "DEVLOG-4",
      labels: ["a-label", "b-label", "b-label"],
    });

    expect(updated.fields.labels).toEqual(["a-label", "b-label", "z-label"]);
  });

  it("삭제 허용 목록의 일반 Task는 삭제하지 않는다", async () => {
    const methods = [];
    const client = makeClient(async (_url, options) => {
      methods.push(options.method);
      return response({
        id: "24",
        key: "DEVLOG-24",
        fields: { issuetype: { name: "작업" } },
      });
    });

    await expect(client.deleteIssue({ issueKey: "DEVLOG-24" }))
      .rejects.toThrow("Epic이 아니므로");
    expect(methods).toEqual(["GET"]);
  });

  it("하위 이슈 검색 결과가 마지막 페이지가 아니면 삭제를 차단한다", async () => {
    const calls = [];
    await expect(makeClient(async (url, options) => {
      calls.push(options.method);
      if (new URL(url).pathname.endsWith("/search/jql")) {
        return response({ isLast: false, issues: [] });
      }
      return response({
        id: "24",
        key: "DEVLOG-24",
        fields: { issuetype: { name: "에픽" } },
      });
    }).deleteIssue({ issueKey: "DEVLOG-24" })).rejects.toThrow("검색 결과가 완전하지 않아");
    expect(calls).toEqual(["GET", "POST"]);
  });

  it("삭제 가능 Epic이라도 하위 작업을 함께 삭제하는 옵션을 사용하지 않는다", async () => {
    let deletedUrl;
    await makeClient(async (url, options) => {
      const pathname = new URL(url).pathname;
      if (options.method === "DELETE") {
        deletedUrl = new URL(url);
        return response(null, 204, "No Content");
      }
      if (pathname.endsWith("/search/jql")) {
        return response({ isLast: true, issues: [] });
      }
      return response({
        id: "24",
        key: "DEVLOG-24",
        fields: { issuetype: { name: "에픽" } },
      });
    }).deleteIssue({ issueKey: "DEVLOG-24" });

    expect(deletedUrl.searchParams.get("deleteSubtasks")).toBe("false");
    expect(deletedUrl.pathname).toBe("/rest/api/3/issue/DEVLOG-24");
  });
});
