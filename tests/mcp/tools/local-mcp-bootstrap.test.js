// git init 및 GitHub 비공개 저장소 생성 도구의 안전한 명령 제한을 검증합니다.
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { z } from "zod";
import { createPathSecurity } from "../../../mcp-src/utils/path-security.mjs";
import { registerProjectBootstrapTools } from "../../../mcp-src/tools/project-bootstrap.mjs";

let root;
let definitions;
let calls;

beforeEach(async () => {
  root = await fs.mkdtemp(path.join(os.tmpdir(), "local-mcp-bootstrap-"));
  const { safePath } = createPathSecurity({ fs, path, root, rootReal: await fs.realpath(root) });
  definitions = new Map();
  calls = [];
  registerProjectBootstrapTools({
    server: { registerTool: (name, options, handler) => definitions.set(name, { options, handler }) },
    z, fs, path, root, safePath, gitBash: "bash",
    executeProcess: async (program, args, options) => {
      calls.push({ program, args, options });
      return { exitCode: 0, stdout: "success", stderr: "", timedOut: false };
    },
    commandResult: (data, extra = {}) => ({ structuredContent: { ...data, ...extra } }),
  });
});

afterEach(async () => {
  await fs.rm(root, { recursive: true, force: true });
});

const run = (name, input) => definitions.get(name).handler(input);

describe("신규 프로젝트 Git 및 GitHub 준비", () => {
  it("명시적 확인이 없으면 Git init을 실행하지 않는다", async () => {
    await expect(run("git_init", { confirm: false })).rejects.toThrow();
    expect(calls).toHaveLength(0);
  });

  it("초기화 전용 git 명령만 현재 루트에서 실행한다", async () => {
    await run("git_init", { confirm: true });
    expect(calls).toHaveLength(1);
    expect(calls[0].args.at(-1)).toBe("git init --initial-branch=main");
    expect(calls[0].options.cwd).toBe(root);
  });

  it("기존 Git 저장소는 초기화하지 않는다", async () => {
    await fs.mkdir(path.join(root, ".git"));
    await expect(run("git_init", { confirm: true }))
      .rejects.toThrow("이미 Git 저장소");
    expect(calls).toHaveLength(0);
  });

  it("Git 저장소가 없으면 GitHub Repository 생성을 차단한다", async () => {
    await expect(run("github_create_repo", { name: "calendar", confirm: true }))
      .rejects.toThrow("먼저 git_init");
    expect(calls).toHaveLength(0);
  });

  it("GitHub 저장소는 private으로만 생성하며 Push하지 않는다", async () => {
    await fs.mkdir(path.join(root, ".git"));
    await fs.writeFile(path.join(root, ".git", "config"), "[core]\n\trepositoryformatversion = 0\n");
    const result = await run("github_create_repo", { name: "calendar", confirm: true });
    expect(calls).toHaveLength(1);
    expect(calls[0].program).toBe("gh");
    expect(calls[0].args).toContain("--private");
    expect(calls[0].args).not.toContain("--push");
    expect(calls[0].options.env.GH_PROMPT_DISABLED).toBe("1");
    expect(result.structuredContent).toMatchObject({ pushed: false, visibility: "private" });
  });

  it("origin이 이미 지정되었으면 GitHub Repository를 생성하지 않는다", async () => {
    await fs.mkdir(path.join(root, ".git"));
    await fs.writeFile(path.join(root, ".git", "config"), "[remote \"origin\"]\n url = https://example.com/x\n");
    await expect(run("github_create_repo", { name: "calendar", confirm: true }))
      .rejects.toThrow("origin 원격");
    expect(calls).toHaveLength(0);
  });
});
