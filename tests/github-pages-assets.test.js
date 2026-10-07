import { describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assetPath } from "../app/utils/assetPath.js";

const sourceExtensions = new Set([".vue", ".js", ".ts", ".mjs"]);

const collectSourceFiles = async (directory) => {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectSourceFiles(file));
    } else if (sourceExtensions.has(path.extname(entry.name))) {
      files.push(file);
    }
  }

  return files;
};

describe("GitHub Pages asset paths", () => {
  it("builds asset paths with the configured baseURL", () => {
    expect(assetPath("/devlog/", "images/experience/mcp/mcp메인.png"))
      .toBe("/devlog/images/experience/mcp/mcp메인.png");
    expect(assetPath("/devlog", "/images/test.png"))
      .toBe("/devlog/images/test.png");
    expect(assetPath("/", "/images/test.png"))
      .toBe("/images/test.png");
  });

  it("does not hard-code root absolute image paths in app source", async () => {
    const files = await collectSourceFiles(fileURLToPath(new URL("../app/", import.meta.url)));
    const violations = [];

    for (const file of files) {
      const source = await fs.readFile(file, "utf8");
      if (/(?:src|href)\s*=\s*["']\/images\//.test(source)) {
        violations.push(path.relative(process.cwd(), file));
      }
    }

    expect(violations, `GitHub Pages baseURL을 우회하는 이미지 경로: ${violations.join(", ")}`)
      .toEqual([]);
  });
});
