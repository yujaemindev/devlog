import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import vm from "node:vm";

const script = await fs.readFile(new URL("../mcp-create.sh", import.meta.url), "utf8");
const helpers = script.slice(script.indexOf("function isInside("), script.indexOf("const server = new McpServer("));
const registration = script.slice(script.indexOf('server.registerTool("rename_file"'), script.indexOf(" * replace_text"));
let root;
let rename;

beforeEach(async () => {
  root = await fs.mkdtemp(path.join(os.tmpdir(), "local-mcp-rename-"));
  const context = {
    fs, path, ROOT: root, ROOT_REAL: await fs.realpath(root),
    z: { string: () => ({}) },
    server: { registerTool: (_name, _options, handler) => { rename = handler; } },
  };
  // Run the actual generated server helpers and tool, without starting the installer.
  vm.runInNewContext(helpers + registration.slice(0, registration.lastIndexOf("/*")), context);
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
