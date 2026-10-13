// Jira REST 클라이언트의 인증, 이슈 생성·변경·삭제 및 보안 제약을 검사합니다.
// 실제 Jira로 요청하지 않고 가짜 HTTP 응답을 제공해 입력과 결과를 확인합니다.
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createJiraClient, textToAdf } from "../../../mcp-src/services/jira-client.mjs";

let root;

// 각 테스트에서 사용할 Jira 설정과 임시 API 토큰을 별도 폴더에 준비합니다.
beforeEach(async () => {
  root = await fs.mkdtemp(path.join(os.tmpdir(), "local-mcp-jira-"));
  await fs.writeFile(
    path.join(root, ".jira-config.json"),
    JSON.stringify({
      baseUrl: "https://example.atlassian.net",
      email: "user@example.com",
      defaultProjectKey: "DEVLOG",
    }),
  );
  await fs.writeFile(path.join(root, ".jira-api-token"), "fixture-value\n");
});

afterEach(async () => {
  await fs.rm(root, { recursive: true, force: true });
});

function safePath(relativePath) {
  return Promise.resolve(path.join(root, relativePath));
}

function response(data, { status = 200, statusText = "OK" } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    async text() {
      return data === null || data === undefined ? "" : JSON.stringify(data);
    },
  };
}

describe("로컬 MCP Jira 클라이언트", () => {
  it("Jira 인증 정보를 확인하면서 토큰 값을 노출하지 않는다", async () => {
    const requests = [];
    const client = createJiraClient({
      fs,
      safePath,
      fetchImpl: async (url, options) => {
        requests.push({ url: String(url), options });
        return response({
          accountId: "account-1",
          displayName: "User",
          emailAddress: "user@example.com",
        });
      },
    });

    const result = await client.status();

    expect(result).toMatchObject({
      baseUrl: "https://example.atlassian.net",
      email: "user@example.com",
      defaultProjectKey: "DEVLOG",
      tokenConfigured: true,
      authenticated: true,
    });
    expect(JSON.stringify(result)).not.toContain("fixture-value");
    expect(requests[0].options.headers.Authorization).toMatch(/^Basic /);
    expect(requests[0].options.headers.Authorization).not.toContain("fixture-value");
  });

  it("기본 프로젝트와 Jira ADF 설명을 사용해 이슈를 생성한다", async () => {
    let body;
    const client = createJiraClient({
      fs,
      safePath,
      fetchImpl: async (_url, options) => {
        body = JSON.parse(options.body);
        return response({
          id: "10001",
          key: "DEVLOG-1",
          self: "https://example.atlassian.net/rest/api/3/issue/10001",
        }, { status: 201, statusText: "Created" });
      },
    });

    const result = await client.createIssue({
      summary: "Workflow",
      issueType: "작업",
      description: "메뉴: Workflow\nRoute: /workflow",
      labels: ["area-workflow", "page-menu"],
    });

    expect(result.key).toBe("DEVLOG-1");
    expect(body.fields.project).toEqual({ key: "DEVLOG" });
    expect(body.fields.issuetype).toEqual({ name: "작업" });
    expect(body.fields.labels).toEqual(["area-workflow", "page-menu"]);
    expect(body.fields.description).toEqual(
      textToAdf("메뉴: Workflow\nRoute: /workflow"),
    );
  });

  it("부모 이슈 키를 전달해 하위 작업을 생성한다", async () => {
    let body;
    const client = createJiraClient({
      fs,
      safePath,
      fetchImpl: async (_url, options) => {
        body = JSON.parse(options.body);
        return response({
          id: "10002",
          key: "DEVLOG-2",
          self: "https://example.atlassian.net/rest/api/3/issue/10002",
        }, { status: 201, statusText: "Created" });
      },
    });

    await client.createIssue({
      summary: "Source Control",
      issueType: "Subtask",
      parent: "DEVLOG-1",
      labels: ["area-workflow", "git", "source-control"],
    });

    expect(body.fields.parent).toEqual({ key: "DEVLOG-1" });
    expect(body.fields.issuetype).toEqual({ name: "Subtask" });
  });

  it("담당자를 지정하고 상태 변경에 사용할 전환 목록을 조회한다", async () => {
    const calls = [];
    const client = createJiraClient({
      fs,
      safePath,
      fetchImpl: async (url, options) => {
        const pathname = new URL(url).pathname;
        calls.push({ pathname, method: options.method, body: options.body ? JSON.parse(options.body) : null });
        if (pathname.endsWith("/transitions") && options.method === "GET") {
          return response({ transitions: [{ id: "41", name: "해결됨", to: { id: "10002", name: "해결됨", statusCategory: { key: "done" } } }] });
        }
        if (options.method === "GET") {
          return response({ id: "10003", key: "DEVLOG-4", fields: { summary: "Home", status: { name: "해결됨" }, assignee: { accountId: "account-1", displayName: "User" } } });
        }
        return response(null, { status: 204, statusText: "No Content" });
      },
    });
    const assigned = await client.assignIssue({ issueKey: "DEVLOG-4", accountId: "account-1" });
    const transitions = await client.listTransitions({ issueKey: "DEVLOG-4" });
    const updated = await client.transitionIssue({ issueKey: "DEVLOG-4", transitionId: "41" });

    expect(assigned.assignee.accountId).toBe("account-1");
    expect(transitions.transitions[0]).toMatchObject({ id: "41", to: { name: "해결됨", statusCategory: "done" } });
    expect(updated.status).toBe("해결됨");
    expect(calls.find(call => call.pathname.endsWith("/assignee")).body).toEqual({ accountId: "account-1" });
    expect(calls.find(call => call.method === "POST").body).toEqual({ transition: { id: "41" } });
  });

  it("다른 필드를 변경하지 않고 Epic 부모 관계를 설정하거나 해제한다", async () => {
    const calls = [];
    const client = createJiraClient({
      fs,
      safePath,
      fetchImpl: async (url, options) => {
        calls.push({ method: options.method, body: options.body ? JSON.parse(options.body) : null });
        if (options.method === "GET") {
          return response({ id: "10003", key: "DEVLOG-4", fields: { summary: "Home", parent: null } });
        }
        return response(null, { status: 204, statusText: "No Content" });
      },
    });

    await client.updateIssue({ issueKey: "DEVLOG-4", parent: "DEVLOG-23" });
    await client.updateIssue({ issueKey: "DEVLOG-4", parent: null });

    const updates = calls.filter(call => call.method === "PUT");
    expect(updates[0].body).toEqual({ fields: { parent: { key: "DEVLOG-23" } } });
    expect(updates[1].body).toEqual({ fields: { parent: null } });
  });

  it("허용된 미사용 Epic만 삭제하고 하위 이슈가 있으면 거부한다", async () => {
    const calls = [];
    let occupied = false;
    const client = createJiraClient({
      fs,
      safePath,
      fetchImpl: async (url, options) => {
        const pathname = new URL(url).pathname;
        calls.push({ method: options.method, pathname });
        if (options.method === "GET") {
          return response({ id: "10023", key: "DEVLOG-24", fields: { issuetype: { name: "에픽" } } });
        }
        if (pathname.endsWith("/search/jql")) {
          return response({ isLast: true, issues: occupied ? [{ id: "1", key: "DEVLOG-40", fields: {} }] : [] });
        }
        return response(null, { status: 204, statusText: "No Content" });
      },
    });
    await expect(client.deleteIssue({ issueKey: "DEVLOG-23" })).rejects.toThrow("DEVLOG-24");
    expect(calls).toHaveLength(0);
    occupied = true;
    await expect(client.deleteIssue({ issueKey: "DEVLOG-24" })).rejects.toThrow("하위 이슈");
    expect(calls.some(call => call.method === "DELETE")).toBe(false);
    occupied = false;
    expect(await client.deleteIssue({ issueKey: "DEVLOG-24" })).toEqual({ issueKey: "DEVLOG-24", deleted: true });
    expect(calls.filter(call => call.method === "DELETE")).toHaveLength(1);
  });

  it("Atlassian 도메인이 아닌 Jira 기본 URL을 거부한다", async () => {
    await fs.writeFile(
      path.join(root, ".jira-config.json"),
      JSON.stringify({
        baseUrl: "https://example.com",
        email: "user@example.com",
      }),
    );

    const client = createJiraClient({
      fs,
      safePath,
      fetchImpl: async () => response({}),
    });

    await expect(client.status()).rejects.toThrow("atlassian.net");
  });
});
