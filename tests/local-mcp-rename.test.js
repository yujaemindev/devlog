import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { createPathSecurity } from "../mcp-src/utils/path-security.mjs";
import { renameFile } from "../mcp-src/tools/rename-file.mjs";

let root;
let rename;

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

describe("local MCP rename_file", () => {
  it("renames a file and preserves its contents", async () => {
    await rename({ file: "old.md", newFile: "new.md" });
    expect(await fs.readFile(path.join(root, "new.md"), "utf8")).toBe("instructions");
    await expect(fs.stat(path.join(root, "old.md"))).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("does not overwrite an existing destination", async () => {
    await fs.writeFile(path.join(root, "new.md"), "existing");
    await expect(rename({ file: "old.md", newFile: "new.md" })).rejects.toMatchObject({ code: "EEXIST" });
    expect(await fs.readFile(path.join(root, "new.md"), "utf8")).toBe("existing");
    expect(await fs.readFile(path.join(root, "old.md"), "utf8")).toBe("instructions");
  });

  it("rejects traversal, directory moves, and directories", async () => {
    await expect(rename({ file: "old.md", newFile: "../outside.md" })).rejects.toThrow();
    await expect(rename({ file: "old.md", newFile: "sub/new.md" })).rejects.toThrow();
    await fs.mkdir(path.join(root, "folder"));
    await expect(rename({ file: "folder", newFile: "new-folder" })).rejects.toThrow();
  });
});
