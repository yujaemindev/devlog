// GitHub Pages 배포 시 정적 자산 경로가 baseURL을 올바르게 반영하는지 검사합니다.
// 앱 소스에 배포 경로를 무시하는 이미지 절대 경로가 없는지도 확인합니다.
import { describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assetPath } from "../../../app/utils/assetPath.js";

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

describe("GitHub Pages 정적 자산 경로", () => {
  it("설정된 baseURL을 사용해 자산 경로를 생성한다", () => {
    expect(assetPath("/devlog/", "images/experience/mcp/mcp메인.png"))
      .toBe("/devlog/images/experience/mcp/mcp메인.png");
    expect(assetPath("/devlog", "/images/test.png"))
      .toBe("/devlog/images/test.png");
    expect(assetPath("/", "/images/test.png"))
      .toBe("/images/test.png");
  });

  it("앱 소스에 루트 기준 이미지 절대 경로를 하드코딩하지 않는다", async () => {
    // 화면 및 스크립트 파일을 모두 검사해 /images/로 직접 시작하는 속성을 찾습니다.
    const files = await collectSourceFiles(fileURLToPath(new URL("../../../app/", import.meta.url)));
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
