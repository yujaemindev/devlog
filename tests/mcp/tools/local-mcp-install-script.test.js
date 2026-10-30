// 설치 스크립트의 프로젝트 설정 생성 코드와 기존 VS Code 설정 보호를 확인합니다.
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

it("프로젝트를 지정하지 않으면 설치 전 즉시 종료하도록 검사한다", () => {
  expect(installer).toContain("if [ -z \"${MCP_ACTIVE_PROJECT:-}\" ]; then");
  expect(installer.indexOf("MCP_ACTIVE_PROJECT를 반드시 지정")).toBeLessThan(
    installer.indexOf("mkdir -p \"$PLUGIN_DIR/.codex-plugin\""),
  );
  const { result } = runConfigGenerator();
  expect(result.status).not.toBe(0);
  expect(result.stderr).toContain("MCP_ACTIVE_PROJECT is required");
});

it("허용되지 않은 프로젝트 이름은 거부한다", () => {
  expect(installer).toContain("devlog|calendar)");
  const { result } = runConfigGenerator("other");
  expect(result.status).not.toBe(0);
  expect(result.stderr).toContain("Unknown MCP project");
});

it("devlog와 calendar 중 명시한 프로젝트만 선택한다", () => {
  for (const projectId of ["devlog", "calendar"]) {
    const { result, devlog, calendar } = runConfigGenerator(projectId);
    expect(result.status).toBe(0);
    const config = JSON.parse(result.stdout);
    expect(config.activeProject).toBe(projectId);
    expect(config.projects.devlog.root).toBe(devlog);
    expect(config.projects.calendar.root).toBe(calendar);
    expect(config.projects.calendar.apiBaseUrl).toBe("http://127.0.0.1:3000");
  }
});

it("기존 config.json을 직접 덮어쓰지 않고 검증된 임시 파일만 적용한다", () => {
  expect(() => new Script(configCode)).not.toThrow();
  expect(configCode).toContain("MCP_ACTIVE_PROJECT");
  expect(configCode).toContain("CALENDAR_PROJECT_ROOT");
  expect(installer).toContain("CONFIG_TEMP=\"$(mktemp \"$PLUGIN_DIR/.config.json.XXXXXX\")\"");
  expect(installer).toContain("mv -f \"$CONFIG_TEMP\" \"$PLUGIN_DIR/config.json\"");
  expect(installer).not.toContain("> \"$PLUGIN_DIR/config.json\"");
  expect(installer).toContain("if (config.servers[\"yujaemin-local\"])");
  expect(installer).toContain("PLUGIN_VERSION=\"1.2.9\"");
});
