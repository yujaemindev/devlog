import { afterEach, beforeEach, expect, it } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { createPathSecurity } from "../mcp-src/utils/path-security.mjs";
import { copyImage } from "../mcp-src/tools/copy-image.mjs";

let directory;
let root;
let pictures;
let copy;
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1sAAAAASUVORK5CYII=", "base64");

beforeEach(async () => {
  directory = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-image-"));
  root = path.join(directory, "project");
  pictures = path.join(directory, "Pictures");
  await fs.mkdir(root);
  await fs.mkdir(pictures);
  await fs.writeFile(path.join(pictures, "source.png"), png);

  const { isInside, safePath } = createPathSecurity({
    fs,
    path,
    root,
    rootReal: await fs.realpath(root),
  });
  copy = args => copyImage(args, { root, safePath, isInside });
});

afterEach(async () => {
  await fs.rm(directory, { recursive: true, force: true });
});

it("copies the image into nested public/images and retains the original", async () => {
  await copy({ sourceFile: path.join(pictures, "source.png"), file: "public/images/mcp/prepare.png" });
  expect(await fs.readFile(path.join(root, "public/images/mcp/prepare.png"))).toEqual(png);
  expect(await fs.readFile(path.join(pictures, "source.png"))).toEqual(png);
});

it("preserves an existing destination", async () => {
  const args = { sourceFile: path.join(pictures, "source.png"), file: "public/images/image.png" };
  await copy(args);
  const result = await copy(args);
  expect(result.structuredContent.status).toBe("confirmation_required");
  expect(await fs.readFile(path.join(root, args.file))).toEqual(png);
});

it("rejects relative sources, external destinations, and mismatched extensions", async () => {
  await expect(copy({ sourceFile: "../outside.png", file: "public/images/image.png" })).rejects.toThrow();
  await expect(copy({ sourceFile: path.join(pictures, "source.png"), file: "app/image.png" })).rejects.toThrow();
  await expect(copy({ sourceFile: path.join(pictures, "source.png"), file: "../image.png" })).rejects.toThrow();
  await expect(copy({ sourceFile: path.join(pictures, "source.png"), file: "public/images/image.jpg" })).rejects.toThrow();
});

it("rejects disguised non-image files", async () => {
  await fs.writeFile(path.join(pictures, "fake.png"), "not an image");
  await expect(copy({ sourceFile: path.join(pictures, "fake.png"), file: "public/images/fake.png" })).rejects.toThrow();
});

it("accepts sources outside Pictures and targets directly inside public", async () => {
  const source = path.join(directory, "other.png");
  await fs.writeFile(source, png);
  await copy({ sourceFile: source, file: "public/other.png" });
  expect(await fs.readFile(path.join(root, "public/other.png"))).toEqual(png);
});

it("overwrites only with explicit confirmation of the current target", async () => {
  const args = { sourceFile: path.join(pictures, "source.png"), file: "public/image.png" };
  await fs.mkdir(path.join(root, "public"));
  await fs.writeFile(path.join(root, args.file), "existing");
  const confirmation = (await copy(args)).structuredContent;
  expect((await copy({ ...args, overwrite: true })).structuredContent.status).toBe("confirmation_required");
  expect(await fs.readFile(path.join(root, args.file), "utf8")).toBe("existing");
  const result = await copy({ ...args, overwrite: true, expectedTargetHash: confirmation.expectedTargetHash });
  expect(result.structuredContent.overwritten).toBe(true);
  expect(await fs.readFile(path.join(root, args.file))).toEqual(png);
});

it("requires new confirmation when the target changes", async () => {
  const args = { sourceFile: path.join(pictures, "source.png"), file: "public/image.png" };
  await copy(args);
  const confirmation = (await copy(args)).structuredContent;
  await fs.writeFile(path.join(root, args.file), "changed");
  const result = await copy({ ...args, overwrite: true, expectedTargetHash: confirmation.expectedTargetHash });
  expect(result.structuredContent.status).toBe("confirmation_required");
  expect(await fs.readFile(path.join(root, args.file), "utf8")).toBe("changed");
});
