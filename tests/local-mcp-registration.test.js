import { expect, it } from "vitest";
import { z } from "zod";
import path from "node:path";
import { registerFileTools } from "../mcp-src/tools/file-tools.mjs";
import { registerCopyImageTool } from "../mcp-src/tools/copy-image.mjs";
import { registerRenameFileTool } from "../mcp-src/tools/rename-file.mjs";
import { registerNvmTools } from "../mcp-src/tools/nvm-tools.mjs";
import { createGitService } from "../mcp-src/tools/git-tools.mjs";
import { registerCommandTools } from "../mcp-src/tools/command-tools.mjs";
import { registerDevServerTools } from "../mcp-src/tools/dev-server-tools.mjs";
import { registerAliasTools } from "../mcp-src/tools/alias-tools.mjs";

it("registers the complete local MCP tool surface", () => {
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
  registerAliasTools({
    server,
    z,
    definitions,
  });
  gitService.registerGitTools({
    server,
    z,
  });

  expect([...definitions.keys()].sort()).toEqual([
    "copy_image",
    "create_file",
    "dev_server_status",
    "edit_file",
    "git_add",
    "git_auth_status",
    "git_commit",
    "git_diff",
    "git_log",
    "git_push",
    "git_status",
    "list_directory",
    "list_files",
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
    "write_file",
  ]);
});
