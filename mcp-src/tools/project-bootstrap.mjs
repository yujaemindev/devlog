// 프로젝트 초기 설정만 허용하는 제한된 Git/GitHub 도구입니다.
export function registerProjectBootstrapTools({
  server, z, fs, path, root, safePath, gitBash, executeProcess, commandResult,
}) {
  const cleanEnv = () => {
    const env = { ...process.env, GH_PROMPT_DISABLED: "1", GIT_TERMINAL_PROMPT: "0" };
    for (const key of Object.keys(env)) {
      if (/^GIT_/i.test(key) && key !== "GIT_TERMINAL_PROMPT") delete env[key];
    }
    return env;
  };

  async function requireProjectRoot() {
    const target = await safePath(".");
    if (path.resolve(target) !== path.resolve(root)) {
      throw new Error("프로젝트 루트 검증에 실패했습니다.");
    }
    return target;
  }

  async function hasGitDirectory() {
    try {
      const stat = await fs.lstat(path.join(root, ".git"));
      return stat.isDirectory() && !stat.isSymbolicLink();
    } catch (error) {
      if (error.code === "ENOENT") return false;
      throw error;
    }
  }

  server.registerTool("git_init", {
    title: "Initialize current project Git",
    description: "선택된 프로젝트에만 main 브랜치의 Git 저장소를 초기화합니다. 기존 .git이 있으면 거부하며 커밋이나 Push는 하지 않습니다.",
    inputSchema: { confirm: z.literal(true) },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  }, async ({ confirm }) => {
    if (confirm !== true) throw new Error("Git 저장소 생성 확인이 필요합니다.");
    await requireProjectRoot();
    if (await hasGitDirectory()) throw new Error("이미 Git 저장소가 존재합니다.");
    // 외부 Git 설정의 영향을 줄이고, 허용된 초기화 명령만 실행합니다.
    const result = await executeProcess(gitBash, [
      "--noprofile", "--norc", "-c", "git init --initial-branch=main",
    ], { cwd: root, env: cleanEnv(), timeoutSeconds: 30 });
    return commandResult(result);
  });

  server.registerTool("github_create_repo", {
    title: "Create private GitHub repository",
    description: "GitHub CLI(gh) 로그인 상태에서 현재 프로젝트의 비공개 저장소를 생성하고 origin을 설정합니다. Push는 하지 않습니다.",
    inputSchema: {
      name: z.string().trim().regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,99}$/),
      confirm: z.literal(true),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
  }, async ({ name, confirm }) => {
    if (confirm !== true) throw new Error("GitHub Repository 생성 확인이 필요합니다.");
    await requireProjectRoot();
    if (!await hasGitDirectory()) throw new Error("먼저 git_init을 실행해야 합니다.");
    const gitRemote = await fs.readFile(await safePath(".git/config"), "utf8");
    if (/^\s*\[remote\s+"origin"\]/im.test(gitRemote)) {
      throw new Error("이미 origin 원격 저장소가 설정되어 있습니다.");
    }
    let result;
    try {
      result = await executeProcess("gh", [
        "repo", "create", name, "--private", "--source", root, "--remote", "origin",
      ], { cwd: root, env: cleanEnv(), timeoutSeconds: 120 });
    } catch (error) {
      if (error.code === "ENOENT") {
        throw new Error("GitHub CLI(gh)가 설치되지 않았습니다. gh 설치와 gh auth login이 필요합니다.", { cause: error });
      }
      throw error;
    }
    return commandResult(result, { pushed: false, visibility: "private" });
  });
}
