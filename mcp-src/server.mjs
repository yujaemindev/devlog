import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { createPathSecurity } from "./utils/path-security.mjs";
import { createProcessUtils } from "./utils/process.mjs";
import {
  createNodeRuntime,
  createNodeVersionSchema,
} from "./runtime/node-runtime.mjs";
import { registerFileTools } from "./tools/file-tools.mjs";
import { registerCopyImageTool } from "./tools/copy-image.mjs";
import { registerRenameFileTool } from "./tools/rename-file.mjs";
import { registerMoveFileTool } from "./tools/move-file.mjs";
import { registerNvmTools } from "./tools/nvm-tools.mjs";
import { createGitService } from "./tools/git-tools.mjs";
import { registerCommandTools } from "./tools/command-tools.mjs";
import { registerDevServerTools } from "./tools/dev-server-tools.mjs";
import { registerAliasTools } from "./tools/alias-tools.mjs";
import { createJiraClient } from "./services/jira-client.mjs";
import { registerJiraTools } from "./tools/jira-tools.mjs";
import { registerProjectTools } from "./tools/project-tools.mjs";
import { registerProjectBootstrapTools } from "./tools/project-bootstrap.mjs";
import { registerHttpTools } from "./tools/http-tools.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(
  await fs.readFile(path.join(HERE, "config.json"), "utf8"),
);

const activeProject = config.activeProject || "devlog";
if (config.projects && !Object.prototype.hasOwnProperty.call(config.projects, activeProject)) {
  throw new Error(`등록되지 않은 프로젝트입니다: ${activeProject}`);
}
const selectedProject = config.projects?.[activeProject];
const activeConfig = {
  ...config,
  approvedScripts: selectedProject?.approvedScripts ?? config.approvedScripts,
};
const ROOT = path.resolve(selectedProject?.root ?? config.allowedRoot ?? config.projectRoot);
const ROOT_REAL = await fs.realpath(ROOT);
const PROJECT_INSTRUCTIONS_FILE = path.join(
  config.instructionsRoot ?? ROOT,
  "docs",
  "LOCAL_MCP_INSTRUCTIONS.md",
);
const projectInstructions = await fs.readFile(
  PROJECT_INSTRUCTIONS_FILE,
  "utf8",
);
const GIT_BASH = config.gitBashPath;
const JIRA_ROOT = path.resolve(config.jiraCredentialsRoot ?? ROOT);
const JIRA_ROOT_REAL = await fs.realpath(JIRA_ROOT);
const { safePath: safeJiraPath } = createPathSecurity({
  fs,
  path,
  root: JIRA_ROOT,
  rootReal: JIRA_ROOT_REAL,
});

const { isInside, safePath } = createPathSecurity({
  fs,
  path,
  root: ROOT,
  rootReal: ROOT_REAL,
});

const server = new McpServer(
  {
    name: "yujaemin-local",
    version: "__PLUGIN_VERSION__",
  },
  {
    instructions: `
Yujaemin Local 개발 프로젝트용 MCP입니다.

프로젝트 파일을 수정하기 전에 관련 파일을 먼저 읽으세요.
기존 코드의 구조와 스타일을 최대한 유지하세요.
가능하면 replace_text를 사용하고 전체 파일 덮어쓰기는 최소화하세요.

명령 실행은 등록된 프로젝트 내 Git 작업, 승인된 npm 검증 스크립트, Node 버전 조회 및 비공개 GitHub 저장소 생성 기능으로 제한됩니다.
프로젝트 파일 도구는 현재 선택된 프로젝트 루트 내부에서만 사용하세요.
switch_project는 다음 재연결 때 적용됩니다. 재연결 전까지 현재 서버의 프로젝트는 바뀌지 않습니다.
nvm_status로 Node.js 환경을 조회하세요. nvm 변경 도구는 비활성화되어 있습니다. nvm 도구는 설정된 nvm 설치 폴더를 사용하며 Windows 권한을 높이지 않습니다.

아래는 프로젝트의 docs/LOCAL_MCP_INSTRUCTIONS.md 내용입니다. 이 지침을 작업 전에 확인하고 따르세요.

${projectInstructions}
`,
  },
);

const definitions = new Map();
const registerTool = server.registerTool.bind(server);
server.registerTool = (name, options, handler) => {
  definitions.set(name, { options, handler });
  return registerTool(name, options, handler);
};

const { commandResult, executeProcess } = createProcessUtils({
  spawn,
  root: ROOT,
});
const nodeRuntime = createNodeRuntime({
  fs,
  path,
  config: activeConfig,
  safePath,
});

registerProjectTools({
  server,
  z,
  fs,
  path,
  configFile: path.join(HERE, "config.json"),
  config,
  activeProject,
});

registerProjectBootstrapTools({
  server,
  z,
  fs,
  path,
  root: ROOT,
  safePath,
  gitBash: GIT_BASH,
  executeProcess,
  commandResult,
});

registerHttpTools({
  server,
  z,
  apiBaseUrl: selectedProject?.apiBaseUrl,
});

const nodeVersionSchema = createNodeVersionSchema(z);

registerFileTools({
  server,
  z,
  fs,
  path,
  root: ROOT,
  safePath,
});

registerCopyImageTool({
  server,
  z,
  root: ROOT,
  safePath,
  isInside,
});

registerRenameFileTool({
  server,
  z,
  safePath,
});

registerMoveFileTool({
  server,
  z,
  safePath,
});

registerNvmTools({
  server,
  z,
  nodeVersionSchema,
  nodeRuntime,
  executeProcess,
});

const gitService = createGitService({
  fs,
  path,
  root: ROOT,
  rootReal: ROOT_REAL,
  gitBash: GIT_BASH,
  safePath,
  isInside,
  isFile: nodeRuntime.isFile,
  executeProcess,
  commandResult,
});

registerCommandTools({
  server,
  z,
  fs,
  path,
  root: ROOT,
  config: activeConfig,
  gitBash: GIT_BASH,
  safePath,
  nodeVersionSchema,
  nodeRuntime,
  gitQuery: gitService.gitQuery,
  executeProcess,
  commandResult,
});

registerDevServerTools({
  server,
  nodeVersionSchema,
  fs,
  path,
  root: ROOT,
  config: activeConfig,
  safePath,
  nodeRuntime,
  spawn,
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

const jiraClient = createJiraClient({
  fs,
  safePath: safeJiraPath,
  defaultProjectKeyOverride: selectedProject?.jiraProjectKey,
});

registerJiraTools({
  server,
  z,
  jiraClient,
});

const transport = new StdioServerTransport();
await server.connect(transport);
