function toolResult(data) {
  return {
    structuredContent: data,
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  };
}

export function registerJiraTools({
  server,
  z,
  jiraClient,
}) {
  server.registerTool("jira_status", {
    title: "Inspect Jira connection",
    description: "프로젝트 루트의 Jira 설정과 API token 존재 여부를 확인하고 인증 상태를 조회합니다. token 값 자체는 절대 출력하지 않습니다.",
    inputSchema: {},
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  }, async () => toolResult(await jiraClient.status()));

  server.registerTool("jira_list_projects", {
    title: "List Jira projects",
    description: "현재 Jira 계정에서 접근 가능한 프로젝트를 조회합니다.",
    inputSchema: {
      query: z.string().default(""),
      maxResults: z.number().int().min(1).max(100).default(50),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  }, async args => toolResult(await jiraClient.listProjects(args)));

  server.registerTool("jira_list_issue_types", {
    title: "List Jira issue types",
    description: "Jira 프로젝트에서 생성 가능한 이슈 타입을 조회합니다. projectKey를 생략하면 .jira-config.json의 defaultProjectKey를 사용합니다.",
    inputSchema: {
      projectKey: z.string().optional(),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  }, async args => toolResult(await jiraClient.listIssueTypes(args)));

  server.registerTool("jira_search_issues", {
    title: "Search Jira issues",
    description: "JQL로 Jira 이슈를 검색합니다.",
    inputSchema: {
      jql: z.string().min(1),
      maxResults: z.number().int().min(1).max(100).default(50),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  }, async args => toolResult(await jiraClient.searchIssues(args)));

  server.registerTool("jira_get_issue", {
    title: "Get Jira issue",
    description: "Jira 이슈 키로 상세 정보를 조회합니다.",
    inputSchema: {
      issueKey: z.string().min(1),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  }, async args => toolResult(await jiraClient.getIssue(args)));

  server.registerTool("jira_create_issue", {
    title: "Create Jira issue",
    description: "Jira 이슈를 생성합니다. projectKey를 생략하면 .jira-config.json의 defaultProjectKey를 사용합니다.",
    inputSchema: {
      projectKey: z.string().optional(),
      summary: z.string().trim().min(1).max(255),
      issueType: z.string().trim().min(1),
      description: z.string().default(""),
      labels: z.array(z.string().trim().min(1)).max(50).default([]),
      parent: z.string().trim().min(1).optional(),
      priority: z.string().trim().min(1).optional(),
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: true,
    },
  }, async args => toolResult(await jiraClient.createIssue(args)));

  server.registerTool("jira_create_subtask", {
    title: "Create Jira subtask",
    description: "부모 Jira 이슈 아래에 Subtask를 생성합니다. 기본 이슈 타입 이름은 Subtask이며 필요하면 issueType으로 변경할 수 있습니다.",
    inputSchema: {
      projectKey: z.string().optional(),
      parent: z.string().trim().min(1),
      summary: z.string().trim().min(1).max(255),
      description: z.string().default(""),
      labels: z.array(z.string().trim().min(1)).max(50).default([]),
      issueType: z.string().trim().min(1).default("Subtask"),
      priority: z.string().trim().min(1).optional(),
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: true,
    },
  }, async args => toolResult(await jiraClient.createIssue(args)));

  server.registerTool("jira_update_issue", {
    title: "Update Jira issue",
    description: "Jira 이슈의 summary, description, labels, priority, parent를 수정합니다. parent에 Epic 키를 넣어 작업을 Epic 하위로 연결하거나 null로 연결을 해제할 수 있습니다. 지정하지 않은 필드는 유지합니다.",
    inputSchema: {
      issueKey: z.string().trim().min(1),
      summary: z.string().trim().min(1).max(255).optional(),
      description: z.string().optional(),
      labels: z.array(z.string().trim().min(1)).max(50).optional(),
      priority: z.string().trim().min(1).nullable().optional(),
      parent: z.string().trim().min(1).nullable().optional(),
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: true,
    },
  }, async args => toolResult(await jiraClient.updateIssue(args)));

  server.registerTool("jira_delete_issue", {
    title: "Delete unused DEVLOG Epics",
    description: "DEVLOG-24, DEVLOG-25, DEVLOG-26 중 하위 이슈가 없는 Epic만 삭제합니다. 그 외 이슈 삭제는 거부합니다.",
    inputSchema: {
      issueKey: z.enum(["DEVLOG-24", "DEVLOG-25", "DEVLOG-26"]),
    },
    annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: true },
  }, async args => toolResult(await jiraClient.deleteIssue(args)));

  server.registerTool("jira_assign_issue", {
    title: "Assign Jira issue",
    description: "Jira 이슈 담당자를 accountId로 지정합니다.",
    inputSchema: {
      issueKey: z.string().trim().min(1),
      accountId: z.string().trim().min(1),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
  }, async args => toolResult(await jiraClient.assignIssue(args)));

  server.registerTool("jira_list_transitions", {
    title: "List Jira workflow transitions",
    description: "이슈에서 가능한 상태 전환과 전환 후 상태 및 카테고리를 조회합니다.",
    inputSchema: { issueKey: z.string().trim().min(1) },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: true },
  }, async args => toolResult(await jiraClient.listTransitions(args)));

  server.registerTool("jira_transition_issue", {
    title: "Transition Jira issue",
    description: "jira_list_transitions에서 확인한 transitionId로 이슈 상태를 변경합니다.",
    inputSchema: {
      issueKey: z.string().trim().min(1),
      transitionId: z.string().trim().min(1),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
  }, async args => toolResult(await jiraClient.transitionIssue(args)));

  server.registerTool("jira_add_labels", {
    title: "Add Jira labels",
    description: "기존 Jira labels를 유지하면서 지정한 labels를 중복 없이 추가합니다.",
    inputSchema: {
      issueKey: z.string().trim().min(1),
      labels: z.array(z.string().trim().min(1)).min(1).max(50),
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: true,
    },
  }, async args => toolResult(await jiraClient.addLabels(args)));
}
