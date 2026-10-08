import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createJiraClient, textToAdf } from "../mcp-src/services/jira-client.mjs";

let root;

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

describe("local MCP Jira client", () => {
  it("checks Jira authentication without exposing the credential value", async () => {
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

  it("creates an issue using the default project and Jira ADF description", async () => {
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

  it("creates a subtask by passing the parent key", async () => {
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

  it("assigns an issue and reads available transitions before changing status", async () => {
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

  it("sets and clears an Epic parent without changing other fields", async () => {
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

  it("deletes only allowlisted unused Epics and prevents deleting children", async () => {
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

  it("rejects non-Atlassian Jira base URLs", async () => {
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
