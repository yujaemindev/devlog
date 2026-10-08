const JIRA_CONFIG_FILE = ".jira-config.json";
const JIRA_TOKEN_FILE = ".jira-api-token";

function normalizeBaseUrl(value) {
  const url = new URL(String(value || "").trim());

  if (url.protocol !== "https:" || !url.hostname.endsWith(".atlassian.net")) {
    throw new Error("Jira baseUrl은 https://*.atlassian.net 형식만 허용됩니다.");
  }

  url.pathname = "";
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}

function textToAdf(value) {
  const text = String(value || "");
  const lines = text.split(/\r?\n/);

  return {
    type: "doc",
    version: 1,
    content: lines.map(line => ({
      type: "paragraph",
      content: line
        ? [{ type: "text", text: line }]
        : [],
    })),
  };
}

function issueSummary(issue) {
  const fields = issue?.fields || {};
  return {
    id: issue?.id,
    key: issue?.key,
    summary: fields.summary,
    issueType: fields.issuetype?.name,
    status: fields.status?.name,
    labels: fields.labels || [],
    parent: fields.parent
      ? {
          id: fields.parent.id,
          key: fields.parent.key,
          summary: fields.parent.fields?.summary,
        }
      : null,
  };
}

export function createJiraClient({
  fs,
  safePath,
  fetchImpl = globalThis.fetch,
}) {
  async function loadCredentials({ requireToken = true } = {}) {
    const configPath = await safePath(JIRA_CONFIG_FILE);
    let config;

    try {
      config = JSON.parse(await fs.readFile(configPath, "utf8"));
    } catch (error) {
      if (error.code === "ENOENT") {
        throw new Error(
          `${JIRA_CONFIG_FILE} 파일이 없습니다. 프로젝트 루트에 Jira 설정 파일을 생성하세요.`,
          { cause: error },
        );
      }
      if (error instanceof SyntaxError) {
        throw new Error(`${JIRA_CONFIG_FILE} JSON 형식이 올바르지 않습니다.`, { cause: error });
      }
      throw error;
    }

    const baseUrl = normalizeBaseUrl(config.baseUrl);
    const email = String(config.email || "").trim();
    const defaultProjectKey = String(config.defaultProjectKey || "").trim() || null;

    if (!email || !email.includes("@")) {
      throw new Error(`${JIRA_CONFIG_FILE}의 email 값이 올바르지 않습니다.`);
    }

    let token = null;
    if (requireToken) {
      const tokenPath = await safePath(JIRA_TOKEN_FILE);
      try {
        token = (await fs.readFile(tokenPath, "utf8")).trim();
      } catch (error) {
        if (error.code === "ENOENT") {
          throw new Error(
            `${JIRA_TOKEN_FILE} 파일이 없습니다. Jira API token을 프로젝트 루트의 해당 파일에 저장하세요.`,
            { cause: error },
          );
        }
        throw error;
      }

      if (!token) {
        throw new Error(`${JIRA_TOKEN_FILE} 파일이 비어 있습니다.`);
      }
    }

    return {
      baseUrl,
      email,
      defaultProjectKey,
      token,
    };
  }

  async function request(
    method,
    pathname,
    {
      query,
      body,
      timeoutMs = 30000,
    } = {},
  ) {
    const credentials = await loadCredentials();
    const url = new URL(pathname, `${credentials.baseUrl}/`);

    for (const [key, value] of Object.entries(query || {})) {
      if (value === undefined || value === null || value === "") {
        continue;
      }
      if (Array.isArray(value)) {
        for (const item of value) {
          url.searchParams.append(key, String(item));
        }
      } else {
        url.searchParams.set(key, String(value));
      }
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetchImpl(url, {
        method,
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${credentials.email}:${credentials.token}`,
          ).toString("base64")}`,
          Accept: "application/json",
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const raw = await response.text();
      let data = null;
      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch {
          data = raw;
        }
      }

      if (!response.ok) {
        const details = typeof data === "string"
          ? data
          : JSON.stringify(data);
        throw new Error(
          `Jira API ${response.status} ${response.statusText}: ${details.slice(0, 2000)}`,
        );
      }

      return data;
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error(`Jira API 요청이 ${timeoutMs / 1000}초 후 시간 초과되었습니다.`, { cause: error });
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  async function status() {
    const config = await loadCredentials({ requireToken: false });

    let tokenConfigured = false;
    try {
      const tokenPath = await safePath(JIRA_TOKEN_FILE);
      tokenConfigured = Boolean((await fs.readFile(tokenPath, "utf8")).trim());
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }

    let authenticated = false;
    let account = null;
    let authError = null;

    if (tokenConfigured) {
      try {
        const myself = await request("GET", "rest/api/3/myself");
        authenticated = true;
        account = {
          accountId: myself.accountId,
          displayName: myself.displayName,
          emailAddress: myself.emailAddress,
        };
      } catch (error) {
        authError = error.message;
      }
    }

    return {
      baseUrl: config.baseUrl,
      email: config.email,
      defaultProjectKey: config.defaultProjectKey,
      tokenConfigured,
      authenticated,
      account,
      authError,
    };
  }

  async function listProjects({ query = "", maxResults = 50 } = {}) {
    const data = await request("GET", "rest/api/3/project/search", {
      query: {
        query,
        maxResults,
        expand: "description,lead,issueTypes",
      },
    });

    return {
      isLast: data.isLast ?? true,
      total: data.total ?? data.values?.length ?? 0,
      values: (data.values || []).map(project => ({
        id: project.id,
        key: project.key,
        name: project.name,
        projectTypeKey: project.projectTypeKey,
        style: project.style,
        issueTypes: (project.issueTypes || []).map(type => ({
          id: type.id,
          name: type.name,
          subtask: Boolean(type.subtask),
        })),
      })),
    };
  }

  async function listIssueTypes({ projectKey } = {}) {
    const credentials = await loadCredentials({ requireToken: false });
    const effectiveProjectKey = projectKey || credentials.defaultProjectKey;
    if (!effectiveProjectKey) {
      throw new Error("projectKey를 지정하거나 .jira-config.json에 defaultProjectKey를 설정하세요.");
    }

    const data = await request(
      "GET",
      `rest/api/3/issue/createmeta/${encodeURIComponent(effectiveProjectKey)}/issuetypes`,
      { query: { maxResults: 200 } },
    );

    return {
      projectKey: effectiveProjectKey,
      issueTypes: (data.issueTypes || data.values || []).map(type => ({
        id: type.id,
        name: type.name,
        description: type.description,
        subtask: Boolean(type.subtask),
      })),
    };
  }

  async function searchIssues({ jql, maxResults = 50 }) {
    const data = await request("POST", "rest/api/3/search/jql", {
      body: {
        jql,
        maxResults,
        fields: [
          "summary",
          "status",
          "issuetype",
          "labels",
          "parent",
        ],
      },
    });

    return {
      isLast: data.isLast ?? !data.nextPageToken,
      nextPageToken: data.nextPageToken || null,
      issues: (data.issues || []).map(issueSummary),
    };
  }

  async function getIssue({ issueKey }) {
    const data = await request(
      "GET",
      `rest/api/3/issue/${encodeURIComponent(issueKey)}`,
      {
        query: {
          fields: "summary,description,status,issuetype,labels,parent,assignee,priority",
        },
      },
    );

    return {
      ...issueSummary(data),
      description: data.fields?.description || null,
      assignee: data.fields?.assignee
        ? {
            accountId: data.fields.assignee.accountId,
            displayName: data.fields.assignee.displayName,
          }
        : null,
      priority: data.fields?.priority?.name || null,
    };
  }

  async function createIssue({
    projectKey,
    summary,
    issueType,
    description = "",
    labels = [],
    parent,
    priority,
  }) {
    const credentials = await loadCredentials({ requireToken: false });
    const effectiveProjectKey = projectKey || credentials.defaultProjectKey;

    if (!effectiveProjectKey) {
      throw new Error("projectKey를 지정하거나 .jira-config.json에 defaultProjectKey를 설정하세요.");
    }

    const fields = {
      project: { key: effectiveProjectKey },
      summary,
      issuetype: { name: issueType },
      labels,
    };

    if (description) {
      fields.description = textToAdf(description);
    }
    if (parent) {
      fields.parent = { key: parent };
    }
    if (priority) {
      fields.priority = { name: priority };
    }

    const data = await request("POST", "rest/api/3/issue", {
      body: { fields },
    });

    return {
      id: data.id,
      key: data.key,
      self: data.self,
      projectKey: effectiveProjectKey,
      summary,
      issueType,
      labels,
      parent: parent || null,
    };
  }

  async function updateIssue({
    issueKey,
    summary,
    description,
    labels,
    priority,
    parent,
  }) {
    const fields = {};

    if (summary !== undefined) {
      fields.summary = summary;
    }
    if (description !== undefined) {
      fields.description = textToAdf(description);
    }
    if (labels !== undefined) {
      fields.labels = labels;
    }
    if (priority !== undefined) {
      fields.priority = priority ? { name: priority } : null;
    }
    if (parent !== undefined) {
      fields.parent = parent === null ? null : { key: parent };
    }

    if (!Object.keys(fields).length) {
      throw new Error("수정할 필드를 하나 이상 지정하세요.");
    }

    await request(
      "PUT",
      `rest/api/3/issue/${encodeURIComponent(issueKey)}`,
      { body: { fields } },
    );

    return getIssue({ issueKey });
  }

  async function deleteIssue({ issueKey }) {
    const allowed = new Set(["DEVLOG-24", "DEVLOG-25", "DEVLOG-26"]);
    if (!allowed.has(issueKey)) {
      throw new Error("삭제는 DEVLOG-24, DEVLOG-25, DEVLOG-26만 허용됩니다.");
    }
    const issue = await getIssue({ issueKey });
    if (issue.issueType !== "에픽" && issue.issueType !== "Epic") {
      throw new Error(`${issueKey}은(는) Epic이 아니므로 삭제할 수 없습니다.`);
    }
    const children = await searchIssues({
      jql: `project = DEVLOG AND parent = ${issueKey}`,
      maxResults: 100,
    });
    if (children.issues.length || !children.isLast) {
      throw new Error(`${issueKey}에 하위 이슈가 있거나 검색 결과가 완전하지 않아 삭제할 수 없습니다.`);
    }
    await request("DELETE", `rest/api/3/issue/${encodeURIComponent(issueKey)}`, {
      query: { deleteSubtasks: false },
    });
    return { issueKey, deleted: true };
  }

  async function addLabels({ issueKey, labels }) {
    const issue = await getIssue({ issueKey });
    const merged = [...new Set([...(issue.labels || []), ...labels])].sort();

    return updateIssue({
      issueKey,
      labels: merged,
    });
  }

  async function assignIssue({ issueKey, accountId }) {
    await request(
      "PUT",
      `rest/api/3/issue/${encodeURIComponent(issueKey)}/assignee`,
      { body: { accountId } },
    );
    return getIssue({ issueKey });
  }

  async function listTransitions({ issueKey }) {
    const data = await request(
      "GET",
      `rest/api/3/issue/${encodeURIComponent(issueKey)}/transitions`,
    );
    return {
      issueKey,
      transitions: (data.transitions || []).map(transition => ({
        id: transition.id,
        name: transition.name,
        to: {
          id: transition.to?.id,
          name: transition.to?.name,
          statusCategory: transition.to?.statusCategory?.key,
        },
      })),
    };
  }

  async function transitionIssue({ issueKey, transitionId }) {
    await request(
      "POST",
      `rest/api/3/issue/${encodeURIComponent(issueKey)}/transitions`,
      { body: { transition: { id: transitionId } } },
    );
    return getIssue({ issueKey });
  }

  return {
    configFile: JIRA_CONFIG_FILE,
    tokenFile: JIRA_TOKEN_FILE,
    status,
    listProjects,
    listIssueTypes,
    searchIssues,
    getIssue,
    createIssue,
    updateIssue,
    deleteIssue,
    addLabels,
    assignIssue,
    listTransitions,
    transitionIssue,
  };
}

export { textToAdf };
