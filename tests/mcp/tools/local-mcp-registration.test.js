// MCP 서버가 필요한 도구를 빠짐없이 등록하는지 검증합니다.
// 실제 파일 접근이나 외부 명령 실행 대신 가짜 의존성을 사용합니다.
import { expect, it } from "vitest";
import { z } from "zod";
import path from "node:path";
import { registerFileTools } from "../../../mcp-src/tools/file-tools.mjs";
import { registerCopyImageTool } from "../../../mcp-src/tools/copy-image.mjs";
import { registerRenameFileTool } from "../../../mcp-src/tools/rename-file.mjs";
import { registerMoveFileTool } from "../../../mcp-src/tools/move-file.mjs";
import { registerNvmTools } from "../../../mcp-src/tools/nvm-tools.mjs";
import { createGitService } from "../../../mcp-src/tools/git-tools.mjs";
import { registerCommandTools } from "../../../mcp-src/tools/command-tools.mjs";
import { registerDevServerTools } from "../../../mcp-src/tools/dev-server-tools.mjs";
import { registerAliasTools } from "../../../mcp-src/tools/alias-tools.mjs";
import { registerJiraTools } from "../../../mcp-src/tools/jira-tools.mjs";
import { registerProjectTools } from "../../../mcp-src/tools/project-tools.mjs";
import { registerProjectBootstrapTools } from "../../../mcp-src/tools/project-bootstrap.mjs";
import { registerHttpTools } from "../../../mcp-src/tools/http-tools.mjs";

it("로컬 MCP 도구 전체가 서버에 정상 등록된다", () => {
  // 각 도구의 등록 이름·설정·실행 핸들러를 수집합니다.
  const definitions = new Map();
  const server = {
    registerTool(name, options, handler) {
      definitions.set(name, { options, handler });
    },
  };
  const noOpAsync = async () => ({ exitCode: 0, timedOut: false });
  const nodeRuntime = {
    findNvm: async () => null,
    installedNodeVersions: async () => [],
    isFile: async () => true,
    resolveNodeRuntime: async () => ({
      nodePath: process.execPath,
      directory: path.dirname(process.execPath),
      version: process.version.replace(/^v/, ""),
    }),
    runtimeEnv: () => process.env,
  };
  const nodeVersionSchema = z.string();

  registerFileTools({
    server,
    z,
    fs: {},
    path,
    root: "C:\\project",
    safePath: noOpAsync,
  });
  registerCopyImageTool({
    server,
    z,
    root: "C:\\project",
    safePath: noOpAsync,
    isInside: () => true,
  });
  registerRenameFileTool({
    server,
    z,
    safePath: noOpAsync,
  });
  registerMoveFileTool({
    server,
    z,
    safePath: noOpAsync,
  });
  registerNvmTools({
    server,
    z,
    nodeVersionSchema,
    nodeRuntime,
    executeProcess: noOpAsync,
  });

  const gitService = createGitService({
    fs: {},
    path,
    root: "C:\\project",
    rootReal: "C:\\project",
    gitBash: "bash.exe",
    safePath: noOpAsync,
    isInside: () => true,
    isFile: async () => true,
    executeProcess: noOpAsync,
    commandResult: result => result,
  });

  registerCommandTools({
    server,
    z,
    fs: {},
    path,
    root: "C:\\project",
    config: { approvedScripts: {} },
    gitBash: "bash.exe",
    safePath: noOpAsync,
    nodeVersionSchema,
    nodeRuntime,
    gitQuery: gitService.gitQuery,
    executeProcess: noOpAsync,
    commandResult: result => result,
  });
  registerDevServerTools({
    server,
    nodeVersionSchema,
    fs: {},
    path,
    root: "C:\\project",
    config: { approvedScripts: {} },
    safePath: noOpAsync,
    nodeRuntime,
    spawn: () => {},
  });
  registerHttpTools({
    server,
    z,
    apiBaseUrl: "http://127.0.0.1:3000",
  });
  registerAliasTools({
    server,
    z,
    definitions,
  });
  gitService.registerGitTools({
    server,
    z,
  });

  registerProjectTools({
    server,
    z,
    fs: {},
    path,
    configFile: "config.json",
    config: { projects: { devlog: { root: "C:\\\\project" } } },
    activeProject: "devlog",
  });

  registerProjectBootstrapTools({
    server,
    z,
    fs: {},
    path,
    root: "C:\\\\project",
    safePath: noOpAsync,
    gitBash: "bash.exe",
    executeProcess: noOpAsync,
    commandResult: result => result,
  });

  registerJiraTools({
    server,
    z,
    jiraClient: {
      createProject: noOpAsync,
      status: noOpAsync,
      listProjects: noOpAsync,
      listIssueTypes: noOpAsync,
      searchIssues: noOpAsync,
      getIssue: noOpAsync,
      createIssue: noOpAsync,
      updateIssue: noOpAsync,
      deleteIssue: noOpAsync,
      addLabels: noOpAsync,
      assignIssue: noOpAsync,
      listTransitions: noOpAsync,
      transitionIssue: noOpAsync,
    },
  });

  // 도구 이름은 MCP 호출 계약이므로 번역하지 않고 실제 등록 목록과 비교합니다.
  expect([...definitions.keys()].sort()).toEqual([
    "copy_image",
    "create_directory",
    "create_file",
    "dev_server_status",
    "edit_file",
    "git_add",
    "git_auth_status",
    "git_commit",
    "git_diff",
    "git_init",
    "git_log",
    "git_push",
    "git_status",
    "github_create_repo",
    "http_request",
    "jira_add_labels",
    "jira_assign_issue",
    "jira_create_issue",
    "jira_create_project",
    "jira_create_subtask",
    "jira_delete_issue",
    "jira_get_issue",
    "jira_list_issue_types",
    "jira_list_projects",
    "jira_list_transitions",
    "jira_search_issues",
    "jira_status",
    "jira_transition_issue",
    "jira_update_issue",
    "list_directory",
    "list_files",
    "list_projects",
    "move_file",
    "nvm_install",
    "nvm_status",
    "nvm_use",
    "read_file",
    "rename_file",
    "replace_text",
    "run_command",
    "run_dev_command",
    "search_files",
    "search_text",
    "start_dev_server",
    "stop_dev_server",
    "switch_project",
    "write_file",
  ]);
});
