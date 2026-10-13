// 로컬 MCP 파일 이동 도구가 파일을 보존하고 잘못된 경로를 차단하는지 검사합니다.
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { createPathSecurity } from "../../../mcp-src/utils/path-security.mjs";
import { moveFile } from "../../../mcp-src/tools/move-file.mjs";

let root;
let move;

// 임시 프로젝트에 이동할 파일과 대상 폴더를 생성합니다.
beforeEach(async () => {
  root = await fs.mkdtemp(path.join(os.tmpdir(), "local-mcp-move-"));
  await fs.mkdir(path.join(root, "docs"));
  const { safePath } = createPathSecurity({
    fs,
    path,
    root,
    rootReal: await fs.realpath(root),
  });
  move = args => moveFile(args, { safePath });
  await fs.writeFile(path.join(root, "old.md"), "instructions");
});

afterEach(async () => {
  await fs.rm(root, { recursive: true, force: true });
});

describe("로컬 MCP 파일 이동", () => {
  it("파일을 다른 디렉터리로 이동하고 내용을 보존한다", async () => {
    await move({ file: "old.md", newFile: "docs/new.md" });
    expect(await fs.readFile(path.join(root, "docs/new.md"), "utf8")).toBe("instructions");
    await expect(fs.stat(path.join(root, "old.md"))).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("이미 존재하는 대상 파일을 덮어쓰지 않는다", async () => {
    await fs.writeFile(path.join(root, "docs/new.md"), "existing");
    await expect(move({ file: "old.md", newFile: "docs/new.md" })).rejects.toMatchObject({ code: "EEXIST" });
    expect(await fs.readFile(path.join(root, "docs/new.md"), "utf8")).toBe("existing");
    expect(await fs.readFile(path.join(root, "old.md"), "utf8")).toBe("instructions");
  });

  it("상위 경로 이탈과 없는 대상 폴더 및 폴더 자체의 이동을 거부한다", async () => {
    await expect(move({ file: "old.md", newFile: "../outside.md" })).rejects.toThrow();
    await expect(move({ file: "old.md", newFile: "missing/new.md" })).rejects.toThrow();
    await expect(move({ file: "docs", newFile: "docs/new.md" })).rejects.toThrow();
  });

  // Windows에서는 심볼릭 링크 생성 권한에 따라 테스트를 건너뜁니다.
  it.skipIf(process.platform === "win32")("심볼릭 링크 원본 및 대상 디렉터리를 거부한다", async () => {
    await fs.symlink(path.join(root, "old.md"), path.join(root, "link.md"));
    await expect(move({ file: "link.md", newFile: "docs/new.md" })).rejects.toThrow();
    await fs.symlink(path.join(root, "docs"), path.join(root, "linkdir"), "dir");
    await expect(move({ file: "old.md", newFile: "linkdir/new.md" })).rejects.toThrow();
  });
});
