// 프로젝트 전환은 등록된 경로에 한정되고 MCP 재연결 후에만 효력이 생기는지 검증합니다.
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { z } from "zod";
import { registerProjectTools } from "../../../mcp-src/tools/project-tools.mjs";

let temporary;
let configFile;
let projects;
let definitions;

beforeEach(async () => {
  temporary = await fs.mkdtemp(path.join(os.tmpdir(), "local-mcp-projects-"));
  const devlog = path.join(temporary, "devlog");
  const calendar = path.join(temporary, "calendar");
  await fs.mkdir(devlog);
  await fs.mkdir(calendar);
  projects = {
    devlog: { root: devlog, jiraProjectKey: "DEVLOG", approvedScripts: {} },
    calendar: { root: calendar, jiraProjectKey: "CAL", approvedScripts: {} },
  };
  configFile = path.join(temporary, "config.json");
  await fs.writeFile(configFile, JSON.stringify({ projects, activeProject: "devlog" }));

  definitions = new Map();
  const server = {
    registerTool(name, options, handler) {
      definitions.set(name, { options, handler });
    },
  };
  registerProjectTools({
    server, z, fs, path, configFile,
    config: { projects, activeProject: "devlog" },
    activeProject: "devlog",
  });
});

afterEach(async () => {
  await fs.rm(temporary, { recursive: true, force: true });
});

const run = (name, input = {}) => definitions.get(name).handler(input);

describe("Yujaemin Local MCP 프로젝트 선택", () => {
  it("프로젝트 목록과 현재 실행 서버의 프로젝트를 표시한다", async () => {
    const response = await run("list_projects");
    expect(response.structuredContent.activeProject).toBe("devlog");
    expect(response.structuredContent.projects).toMatchObject([
      { id: "devlog", active: true, available: true },
      { id: "calendar", active: false, available: true },
    ]);
  });

  it("프로젝트 전환 요청은 설정만 저장하고 현재 서버 루트는 바꾸지 않는다", async () => {
    const response = await run("switch_project", { projectId: "calendar" });
    expect(response.structuredContent).toMatchObject({
      selectedProject: "calendar",
      currentServerProject: "devlog",
      requiresReconnect: true,
    });
    const saved = JSON.parse(await fs.readFile(configFile, "utf8"));
    expect(saved.activeProject).toBe("calendar");
    expect(saved.projects.devlog.root).toBe(projects.devlog.root);
  });

  it("등록되지 않은 프로젝트 접근 및 설정 수정을 차단한다", async () => {
    await expect(run("switch_project", { projectId: "outside" }))
      .rejects.toThrow("등록되지 않은 프로젝트");
    const saved = JSON.parse(await fs.readFile(configFile, "utf8"));
    expect(saved.activeProject).toBe("devlog");
  });

  it("프로젝트 디렉터리가 존재하지 않으면 전환하지 않는다", async () => {
    await fs.rm(projects.calendar.root, { recursive: true });
    await expect(run("switch_project", { projectId: "calendar" }))
      .rejects.toThrow();
    const saved = JSON.parse(await fs.readFile(configFile, "utf8"));
    expect(saved.activeProject).toBe("devlog");
  });

  it("실행 중 등록 경로가 바뀌었으면 변경된 설정을 덮어쓰지 않는다", async () => {
    const other = path.join(temporary, "other");
    await fs.mkdir(other);
    const saved = JSON.parse(await fs.readFile(configFile, "utf8"));
    saved.projects.calendar.root = other;
    await fs.writeFile(configFile, JSON.stringify(saved));
    await expect(run("switch_project", { projectId: "calendar" }))
      .rejects.toThrow("등록 정보가 변경");
  });
});
