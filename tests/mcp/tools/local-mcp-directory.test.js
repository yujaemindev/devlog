// MCP 디렉터리 생성 도구가 프로젝트 범위와 기존 파일을 보호하는지 검사합니다.
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { z } from "zod";
import { createPathSecurity } from "../../../mcp-src/utils/path-security.mjs";
import { registerFileTools } from "../../../mcp-src/tools/file-tools.mjs";

let root;
let createDirectory;

// 임시 루트에 기존 docs 폴더를 생성하고 MCP 도구를 테스트 서버에 등록합니다.
beforeEach(async () => {
  root = await fs.mkdtemp(path.join(os.tmpdir(), "local-mcp-directory-"));
  await fs.mkdir(path.join(root, "docs"));
  const { safePath } = createPathSecurity({
    fs,
    path,
    root,
    rootReal: await fs.realpath(root),
  });
  const tools = new Map();
  const server = {
    registerTool(name, _options, handler) {
      tools.set(name, handler);
    },
  };
  registerFileTools({ server, z, fs, path, root, safePath });
  createDirectory = args => tools.get("create_directory")(args);
});

afterEach(async () => {
  await fs.rm(root, { recursive: true, force: true });
});

describe("로컬 MCP 디렉터리 생성", () => {
  it("기존 프로젝트 폴더 아래에 새 디렉터리를 생성한다", async () => {
    const result = await createDirectory({ directory: "docs/jira" });
    expect(result.structuredContent).toEqual({ directory: "docs/jira" });
    expect((await fs.stat(path.join(root, "docs/jira"))).isDirectory()).toBe(true);
  });

  it("이미 존재하는 대상 폴더를 수정하지 않고 거부한다", async () => {
    await createDirectory({ directory: "docs/jira" });
    await fs.writeFile(path.join(root, "docs/jira/keep.md"), "keep");
    await expect(createDirectory({ directory: "docs/jira" })).rejects.toMatchObject({
      code: "EEXIST",
    });
    expect(await fs.readFile(path.join(root, "docs/jira/keep.md"), "utf8")).toBe("keep");
  });

  it("상위 경로 이탈과 루트 경로 및 없는 부모 폴더를 거부한다", async () => {
    await expect(createDirectory({ directory: "../outside" })).rejects.toThrow();
    await expect(createDirectory({ directory: "." })).rejects.toThrow();
    await expect(createDirectory({ directory: "missing/subdir" })).rejects.toThrow();
  });

  // Windows에서는 심볼릭 링크 생성 권한 문제를 피하기 위해 검사를 건너뜁니다.
  it.skipIf(process.platform === "win32")("심볼릭 링크 부모 폴더를 거부한다", async () => {
    await fs.symlink(path.join(root, "docs"), path.join(root, "shortcut"), "dir");
    await expect(createDirectory({ directory: "shortcut/jira" })).rejects.toThrow();
  });
});
