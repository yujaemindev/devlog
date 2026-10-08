import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { createPathSecurity } from "../mcp-src/utils/path-security.mjs";
import { moveFile } from "../mcp-src/tools/move-file.mjs";

let root;
let move;

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

describe("local MCP move_file", () => {
  it("moves a file into another directory and retains its content", async () => {
    await move({ file: "old.md", newFile: "docs/new.md" });
    expect(await fs.readFile(path.join(root, "docs/new.md"), "utf8")).toBe("instructions");
    await expect(fs.stat(path.join(root, "old.md"))).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("never overwrites an existing destination", async () => {
    await fs.writeFile(path.join(root, "docs/new.md"), "existing");
    await expect(move({ file: "old.md", newFile: "docs/new.md" })).rejects.toMatchObject({ code: "EEXIST" });
    expect(await fs.readFile(path.join(root, "docs/new.md"), "utf8")).toBe("existing");
    expect(await fs.readFile(path.join(root, "old.md"), "utf8")).toBe("instructions");
  });

  it("rejects traversal, missing destination directories, and directory inputs", async () => {
    await expect(move({ file: "old.md", newFile: "../outside.md" })).rejects.toThrow();
    await expect(move({ file: "old.md", newFile: "missing/new.md" })).rejects.toThrow();
    await expect(move({ file: "docs", newFile: "docs/new.md" })).rejects.toThrow();
  });

  it.skipIf(process.platform === "win32")("rejects symlink source and destination directories", async () => {
    await fs.symlink(path.join(root, "old.md"), path.join(root, "link.md"));
    await expect(move({ file: "link.md", newFile: "docs/new.md" })).rejects.toThrow();
    await fs.symlink(path.join(root, "docs"), path.join(root, "linkdir"), "dir");
    await expect(move({ file: "old.md", newFile: "linkdir/new.md" })).rejects.toThrow();
  });
});
