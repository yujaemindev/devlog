// 로컬 MCP 이미지 복사 도구의 파일 검증과 안전한 덮어쓰기 절차를 검사합니다.
import { afterEach, beforeEach, expect, it } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { createPathSecurity } from "../../../mcp-src/utils/path-security.mjs";
import { copyImage } from "../../../mcp-src/tools/copy-image.mjs";

let directory;
let root;
let pictures;
let copy;
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1sAAAAASUVORK5CYII=", "base64");

// 실제 사용자 파일 대신 임시 프로젝트와 최소 PNG 파일을 준비합니다.
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

it("이미지를 public/images 하위에 복사하고 원본을 보존한다", async () => {
  await copy({ sourceFile: path.join(pictures, "source.png"), file: "public/images/mcp/prepare.png" });
  expect(await fs.readFile(path.join(root, "public/images/mcp/prepare.png"))).toEqual(png);
  expect(await fs.readFile(path.join(pictures, "source.png"))).toEqual(png);
});

it("대상 파일이 이미 존재하면 기존 파일을 보존한다", async () => {
  const args = { sourceFile: path.join(pictures, "source.png"), file: "public/images/image.png" };
  await copy(args);
  const result = await copy(args);
  expect(result.structuredContent.status).toBe("confirmation_required");
  expect(await fs.readFile(path.join(root, args.file))).toEqual(png);
});

it("상대 원본 경로와 허용 범위 밖 대상 및 확장자 불일치를 거부한다", async () => {
  await expect(copy({ sourceFile: "../outside.png", file: "public/images/image.png" })).rejects.toThrow();
  await expect(copy({ sourceFile: path.join(pictures, "source.png"), file: "app/image.png" })).rejects.toThrow();
  await expect(copy({ sourceFile: path.join(pictures, "source.png"), file: "../image.png" })).rejects.toThrow();
  await expect(copy({ sourceFile: path.join(pictures, "source.png"), file: "public/images/image.jpg" })).rejects.toThrow();
});

it("이미지 확장자로 위장한 파일을 거부한다", async () => {
  await fs.writeFile(path.join(pictures, "fake.png"), "not an image");
  await expect(copy({ sourceFile: path.join(pictures, "fake.png"), file: "public/images/fake.png" })).rejects.toThrow();
});

it("Pictures 외부 원본과 public 바로 아래 대상 경로를 허용한다", async () => {
  const source = path.join(directory, "other.png");
  await fs.writeFile(source, png);
  await copy({ sourceFile: source, file: "public/other.png" });
  expect(await fs.readFile(path.join(root, "public/other.png"))).toEqual(png);
});

it("현재 대상 파일의 확인 정보를 전달해야만 덮어쓴다", async () => {
  const args = { sourceFile: path.join(pictures, "source.png"), file: "public/image.png" };
  await fs.mkdir(path.join(root, "public"));
  await fs.writeFile(path.join(root, args.file), "existing");
  // overwrite 옵션만으로는 덮어쓰지 못하고 대상 파일의 해시도 일치해야 합니다.
  const confirmation = (await copy(args)).structuredContent;
  expect((await copy({ ...args, overwrite: true })).structuredContent.status).toBe("confirmation_required");
  expect(await fs.readFile(path.join(root, args.file), "utf8")).toBe("existing");
  const result = await copy({ ...args, overwrite: true, expectedTargetHash: confirmation.expectedTargetHash });
  expect(result.structuredContent.overwritten).toBe(true);
  expect(await fs.readFile(path.join(root, args.file))).toEqual(png);
});

it("확인 이후 대상 파일이 변경되면 재확인을 요구한다", async () => {
  const args = { sourceFile: path.join(pictures, "source.png"), file: "public/image.png" };
  await copy(args);
  const confirmation = (await copy(args)).structuredContent;
  await fs.writeFile(path.join(root, args.file), "changed");
  const result = await copy({ ...args, overwrite: true, expectedTargetHash: confirmation.expectedTargetHash });
  expect(result.structuredContent.status).toBe("confirmation_required");
  expect(await fs.readFile(path.join(root, args.file), "utf8")).toBe("changed");
});
