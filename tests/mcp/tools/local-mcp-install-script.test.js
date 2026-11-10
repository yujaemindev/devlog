import { expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Script } from "node:vm";

const scriptPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../mcp-create.sh",
);

const installer = fs.readFileSync(scriptPath, "utf8");
const scriptStart = installer.indexOf("node -e '");
const scriptEnd = installer.indexOf("' > \"$CONFIG_TEMP\"; then", scriptStart);
const configCode = installer.slice(scriptStart + "node -e '".length, scriptEnd);

function runConfigGenerator(activeProject) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-config-"));
  const devlog = path.join(directory, "devlog");
  const calendar = path.join(directory, "calendar");
  fs.mkdirSync(devlog);
  fs.mkdirSync(calendar);
  fs.writeFileSync(path.join(devlog, "package.json"), "{\"scripts\":{\"test\":\"vitest\"}}");
  fs.writeFileSync(path.join(calendar, "package.json"), "{\"scripts\":{\"dev\":\"vite\"}}");
  const env = {
    ...process.env,
    PROJECT_ROOT: devlog,
    PROJECT_SOURCE_ROOT: devlog,
    GIT_ROOT: devlog,
    JIRA_ROOT: devlog,
    INSTRUCTIONS_ROOT: devlog,
    CALENDAR_PROJECT_ROOT: calendar,
    BASH_PATH: "bash",
  };
  delete env.MCP_ACTIVE_PROJECT;
  if (activeProject !== undefined) env.MCP_ACTIVE_PROJECT = activeProject;
  try {
    return {
      result: spawnSync(process.execPath, ["-e", configCode], { env, encoding: "utf8" }),
      devlog,
      calendar,
    };
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

it("defaults to devlog when no active project is provided", () => {
  const { result } = runConfigGenerator();
  expect(result.status).toBe(0);
  expect(JSON.parse(result.stdout).activeProject).toBe("devlog");
});

it("rejects unsupported project names", () => {
  expect(installer).toContain("devlog|calendar)");
  const { result } = runConfigGenerator("other");
  expect(result.status).not.toBe(0);
  expect(result.stderr).toContain("Unknown MCP project");
});

it("selects only the explicitly requested project", () => {
  for (const projectId of ["devlog", "calendar"]) {
    const { result, devlog, calendar } = runConfigGenerator(projectId);
    expect(result.status).toBe(0);
    const config = JSON.parse(result.stdout);
    expect(config.activeProject).toBe(projectId);
    expect(config.projects.devlog.root).toBe(devlog);
    expect(config.projects.calendar.root).toBe(calendar);
    expect(config.gitRoot).toBe(devlog);
    expect(config.jiraCredentialsRoot).toBe(devlog);
    expect(config.instructionsRoot).toBe(devlog);
    expect(config.projects.calendar.apiBaseUrl).toBe("http://127.0.0.1:3000");
  }
});

it("validates config before replacing the existing config file", () => {
  expect(() => new Script(configCode)).not.toThrow();
  expect(configCode).toContain("MCP_ACTIVE_PROJECT");
  expect(configCode).toContain("CALENDAR_PROJECT_ROOT");
  expect(installer).toContain("CONFIG_TEMP=\"$(mktemp \"$PLUGIN_DIR/.config.json.XXXXXX\")\"");
  expect(installer).toContain("mv -f \"$CONFIG_TEMP\" \"$PLUGIN_DIR/config.json\"");
  expect(installer).not.toContain("> \"$PLUGIN_DIR/config.json\"");
  expect(installer).toContain("if (config.servers[\"yujaemin-local\"])");
  expect(installer).toContain("PLUGIN_VERSION=\"1.2.9\"");
});
