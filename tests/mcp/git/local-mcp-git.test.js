// 실제 Git 저장소에 커밋하거나 Push하지 않고 Git MCP 도구의 명령과 보안 제약을 검증합니다.
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { z } from "zod";
import { createGitService } from "../../../mcp-src/tools/git-tools.mjs";
import { createPathSecurity } from "../../../mcp-src/utils/path-security.mjs";

let directory;
let root;
let definitions;
let commands;
let repositoryTop;

// 임시 .git 구조만 만들고, 모든 Git 실행은 응답을 돌려주는 모의 함수로 대체합니다.
beforeEach(async () => {
  directory = await fs.mkdtemp(path.join(os.tmpdir(), "local-mcp-git-"));
  root = path.join(directory, "project");
  await fs.mkdir(path.join(root, ".git"), { recursive: true });
  await fs.writeFile(
    path.join(root, ".git", "config"),
    "[core]\n\trepositoryformatversion = 0\n",
  );
  await fs.writeFile(path.join(root, "sample.txt"), "테스트 파일");
  const rootReal = await fs.realpath(root);
  const { safePath, isInside } = createPathSecurity({ fs, path, root, rootReal });
  commands = [];
  repositoryTop = rootReal;
  definitions = new Map();

  const service = createGitService({
    fs,
    path,
    root,
    rootReal,
    gitBash: "bash",
    safePath,
    isInside,
    isFile: async () => false,
    executeProcess: async (_command, args, options) => {
      const shellCommand = args.at(-1);
      commands.push({ shellCommand, options });

      // Git 저장소 검증에 필요한 두 조회 명령만 모의 응답합니다.
      if (shellCommand.includes("'--show-toplevel'")) {
        return { exitCode: 0, stdout: repositoryTop, stderr: "" };
      }
      if (shellCommand.includes("'--git-common-dir'")) {
        return { exitCode: 0, stdout: path.join(root, ".git"), stderr: "" };
      }
      return { exitCode: 0, stdout: "성공", stderr: "" };
    },
    commandResult: result => result,
  });

  const server = {
    registerTool(name, options, handler) {
      definitions.set(name, { options, handler });
    },
  };
  service.registerGitTools({ server, z });
});

afterEach(async () => {
  await fs.rm(directory, { recursive: true, force: true });
});

const run = (name, args = {}) => definitions.get(name).handler(args);
const lastCommand = () => commands.at(-1).shellCommand;

describe("로컬 MCP Git 도구", () => {
  it("조회·스테이징·커밋·Push 도구를 등록한다", () => {
    expect([...definitions.keys()].sort()).toEqual([
      "git_add",
      "git_auth_status",
      "git_commit",
      "git_diff",
      "git_log",
      "git_push",
      "git_status",
    ]);
  });

  it("상태 조회 시 읽기 전용 옵션과 프로젝트 경로를 사용한다", async () => {
    await run("git_status");

    expect(lastCommand()).toContain("'status' '--short' '--branch'");
    expect(lastCommand()).toContain("'--no-pager'");
    const options = commands.at(-1).options;
    expect(options.cwd).toBe(root);
    expect(options.env.GIT_CONFIG_NOSYSTEM).toBe("1");
    expect(options.env.GIT_OPTIONAL_LOCKS).toBe("0");
  });

  it("일반 diff와 스테이징된 diff를 구분하고 외부 diff 실행을 차단한다", async () => {
    await run("git_diff", { staged: false });
    expect(lastCommand()).toContain("'diff' '--no-ext-diff' '--no-textconv'");
    expect(lastCommand()).not.toContain("'--cached'");

    await run("git_diff", { staged: true });
    expect(lastCommand()).toContain("'diff' '--no-ext-diff' '--no-textconv' '--cached'");
  });

  it("로그 조회에 전달된 커밋 수 제한을 반영한다", async () => {
    await run("git_log", { limit: 7 });
    expect(lastCommand()).toContain("'log' '--oneline' '--max-count=7'");
  });

  it("Git 인증 상태 조회는 자격 증명 대신 도구 설치 여부만 확인한다", async () => {
    const result = await run("git_auth_status");

    expect(result.structuredContent.credentialManagerCandidates).toEqual(
      expect.any(Array),
    );
    expect(result.structuredContent.note).toContain("never reads or prints stored credentials");
    expect(commands.some(entry => entry.shellCommand.includes("git --version"))).toBe(true);
    expect(commands.some(entry => entry.shellCommand.includes("git credential-manager --version"))).toBe(true);
    expect(commands.every(entry => entry.options.cwd === root)).toBe(true);
  });

  it("명시한 프로젝트 내부 파일만 Git add 대상으로 전달한다", async () => {
    await run("git_add", { files: ["sample.txt"] });
    expect(lastCommand()).toContain("'add' '--' 'sample.txt'");
  });

  it("프로젝트 외부 파일의 스테이징을 거부한다", async () => {
    await expect(run("git_add", { files: ["../outside.txt"] })).rejects.toThrow();
    expect(commands).toHaveLength(0);
  });

  it("커밋 메시지를 변경하지 않고 Git 명령에 전달한다", async () => {
    const message = "테스트: Git 도구 검증 추가";
    await run("git_commit", { message });
    expect(lastCommand()).toContain("'commit' '-m' '테스트: Git 도구 검증 추가'");
  });

  it("명시적인 Push 확인이 없으면 실행하지 않는다", async () => {
    expect(() => run("git_push", { confirm: false })).toThrow(
      "Explicit push confirmation is required",
    );
    expect(commands).toHaveLength(0);
  });

  it("Push 확인 시에만 기본 upstream으로 Push하는 명령을 구성한다", async () => {
    // 실제 원격 통신은 없으며 명령 문자열이 정확한지만 확인합니다.
    await run("git_push", { confirm: true });
    expect(lastCommand()).toContain("'push'");
    expect(lastCommand()).not.toContain("'--force'");
    expect(commands.at(-1).options.timeoutSeconds).toBe(120);
  });

  it("외부 설정을 포함한 Git 설정을 거부한다", async () => {
    await fs.writeFile(
      path.join(root, ".git", "config"),
      "[include]\n\tpath = ../outside-config\n",
    );
    await expect(run("git_status")).rejects.toThrow(
      "External Git configuration is not allowed",
    );
    expect(commands).toHaveLength(0);
  });

  it("허용된 프로젝트와 다른 Git 저장소를 거부한다", async () => {
    repositoryTop = await fs.realpath(directory);
    await expect(run("git_status")).rejects.toThrow(
      "Git repository must equal allowedRoot",
    );
    expect(commands.some(entry => entry.shellCommand.includes("'status'"))).toBe(false);
  });

  it("외부 객체 저장소를 참조하는 Git alternates를 거부한다", async () => {
    const infoDirectory = path.join(root, ".git", "objects", "info");
    await fs.mkdir(infoDirectory, { recursive: true });
    await fs.writeFile(path.join(infoDirectory, "alternates"), "../outside");
    await expect(run("git_status")).rejects.toThrow("Git alternates are not allowed");
    expect(commands.some(entry => entry.shellCommand.includes("'status'"))).toBe(false);
  });
});
