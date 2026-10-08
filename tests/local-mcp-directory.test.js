import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { z } from "zod";
import { createPathSecurity } from "../mcp-src/utils/path-security.mjs";
import { registerFileTools } from "../mcp-src/tools/file-tools.mjs";

let root;
let createDirectory;

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

describe("local MCP create_directory", () => {
  it("creates a directory beneath an existing project directory", async () => {
    const result = await createDirectory({ directory: "docs/jira" });
    expect(result.structuredContent).toEqual({ directory: "docs/jira" });
    expect((await fs.stat(path.join(root, "docs/jira"))).isDirectory()).toBe(true);
  });

  it("rejects an existing target without modifying it", async () => {
    await createDirectory({ directory: "docs/jira" });
    await fs.writeFile(path.join(root, "docs/jira/keep.md"), "keep");
    await expect(createDirectory({ directory: "docs/jira" })).rejects.toMatchObject({
      code: "EEXIST",
    });
    expect(await fs.readFile(path.join(root, "docs/jira/keep.md"), "utf8")).toBe("keep");
  });

  it("rejects traversal, root, and a missing parent", async () => {
    await expect(createDirectory({ directory: "../outside" })).rejects.toThrow();
    await expect(createDirectory({ directory: "." })).rejects.toThrow();
    await expect(createDirectory({ directory: "missing/subdir" })).rejects.toThrow();
  });

  it.skipIf(process.platform === "win32")("rejects a symlink parent", async () => {
    await fs.symlink(path.join(root, "docs"), path.join(root, "shortcut"), "dir");
    await expect(createDirectory({ directory: "shortcut/jira" })).rejects.toThrow();
  });
});
