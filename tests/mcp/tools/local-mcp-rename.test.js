// 로컬 MCP 파일 이름 변경 도구가 원본 내용과 기존 대상 파일을 보호하는지 검사합니다.
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { createPathSecurity } from "../../../mcp-src/utils/path-security.mjs";
import { renameFile } from "../../../mcp-src/tools/rename-file.mjs";

let root;
let rename;

// 이름을 변경할 임시 파일을 준비하고 안전한 프로젝트 경로 검사를 연결합니다.
beforeEach(async () => {
  root = await fs.mkdtemp(path.join(os.tmpdir(), "local-mcp-rename-"));
  const { safePath } = createPathSecurity({
    fs,
    path,
    root,
    rootReal: await fs.realpath(root),
  });
  rename = args => renameFile(args, { safePath });
  await fs.writeFile(path.join(root, "old.md"), "instructions");
});

afterEach(async () => {
  await fs.rm(root, { recursive: true, force: true });
});

describe("로컬 MCP 파일 이름 변경", () => {
  it("파일 이름을 변경하고 내용을 보존한다", async () => {
    await rename({ file: "old.md", newFile: "new.md" });
    expect(await fs.readFile(path.join(root, "new.md"), "utf8")).toBe("instructions");
    await expect(fs.stat(path.join(root, "old.md"))).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("이미 존재하는 대상 파일을 덮어쓰지 않는다", async () => {
    await fs.writeFile(path.join(root, "new.md"), "existing");
    await expect(rename({ file: "old.md", newFile: "new.md" })).rejects.toMatchObject({ code: "EEXIST" });
    expect(await fs.readFile(path.join(root, "new.md"), "utf8")).toBe("existing");
    expect(await fs.readFile(path.join(root, "old.md"), "utf8")).toBe("instructions");
  });

  it("상위 경로 이탈과 폴더 이동 및 폴더 이름 변경을 거부한다", async () => {
    await expect(rename({ file: "old.md", newFile: "../outside.md" })).rejects.toThrow();
    await expect(rename({ file: "old.md", newFile: "sub/new.md" })).rejects.toThrow();
    await fs.mkdir(path.join(root, "folder"));
    await expect(rename({ file: "folder", newFile: "new-folder" })).rejects.toThrow();
  });
});
