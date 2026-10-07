function shellQuote(value) {
  return "'" + String(value).replace(/'/g, "'\\''") + "'";
}

export function createGitService({
  fs,
  path,
  root,
  rootReal,
  gitBash,
  safePath,
  isInside,
  isFile,
  executeProcess,
  commandResult,
}) {
  async function gitQuery(args, cwd = ".", timeoutSeconds = 30) {
    const workingDirectory = await safePath(cwd);
    const env = { ...process.env };

    for (const key of Object.keys(env)) {
      if (/^GIT_/i.test(key)) {
        delete env[key];
      }
    }

    env.GIT_CONFIG_NOSYSTEM = "1";
    env.GIT_CONFIG_GLOBAL = process.platform === "win32" ? "NUL" : "/dev/null";
    env.GIT_OPTIONAL_LOCKS = "0";

    const credentialHelper = process.platform === "win32" ? "manager" : null;
    const invoke = values => executeProcess(
      gitBash,
      [
        "--noprofile",
        "--norc",
        "-c",
        [
          "git",
          "-c",
          `safe.directory=${rootReal}`,
          ...(credentialHelper
            ? ["-c", `credential.helper=${credentialHelper}`]
            : []),
          ...values,
        ].map(shellQuote).join(" "),
      ],
      { cwd: workingDirectory, env, timeoutSeconds },
    );

    await safePath(".git");
    if (!(await fs.lstat(path.join(root, ".git"))).isDirectory()) {
      throw new Error("External Git/worktree metadata is not allowed");
    }

    async function inspectMetadata(directory) {
      for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
        if (entry.isSymbolicLink()) {
          throw new Error("Git metadata links are not allowed");
        }
        if (entry.isDirectory()) {
          await inspectMetadata(path.join(directory, entry.name));
        }
      }
    }

    await inspectMetadata(path.join(root, ".git"));

    const gitConfig = await fs.readFile(await safePath(".git/config"), "utf8");
    if (
      /^\s*\[include(?:if)?(?:\s|\])/im.test(gitConfig)
      || /^\s*(?:worktree|commondir)\s*=/im.test(gitConfig)
    ) {
      throw new Error("External Git configuration is not allowed");
    }

    const top = await invoke(["rev-parse", "--show-toplevel"]);
    if (
      top.exitCode !== 0
      || path.relative(rootReal, await fs.realpath(top.stdout.trim())) !== ""
    ) {
      throw new Error("Git repository must equal allowedRoot");
    }

    const metadata = await invoke([
      "rev-parse",
      "--path-format=absolute",
      "--git-common-dir",
    ]);
    if (
      metadata.exitCode !== 0
      || !isInside(rootReal, await fs.realpath(metadata.stdout.trim()))
    ) {
      throw new Error("External Git metadata is not allowed");
    }

    try {
      await fs.lstat(path.join(root, ".git", "objects", "info", "alternates"));
      throw new Error("Git alternates are not allowed");
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }

    return commandResult(await invoke([
      "--no-pager",
      "-c",
      "core.fsmonitor=false",
      "-c",
      "core.hooksPath=/dev/null",
      ...args.slice(0, 1),
      ...(args[0] === "diff" ? ["--no-ext-diff", "--no-textconv"] : []),
      ...args.slice(1),
    ]));
  }

  function registerGitTools({ server, z }) {
    for (const command of ["status", "diff", "log"]) {
      server.registerTool(`git_${command}`, {
        title: `Git ${command}`,
        description: `Read project Git ${command}`,
        inputSchema: command === "log"
          ? { limit: z.number().int().min(1).max(100).default(20) }
          : command === "diff"
            ? { staged: z.boolean().default(false) }
            : {},
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          openWorldHint: false,
        },
      }, args => gitQuery(
        command === "log"
          ? ["log", "--oneline", `--max-count=${args.limit}`]
          : command === "diff"
            ? ["diff", ...(args.staged ? ["--cached"] : [])]
            : ["status", "--short", "--branch"],
      ));
    }

    server.registerTool("git_auth_status", {
      title: "Inspect Git authentication",
      description: "Inspect Git Bash and Git Credential Manager availability without exposing stored credentials.",
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      },
    }, async () => {
      const candidates = process.platform === "win32"
        ? [
            path.join(path.dirname(gitBash), "..", "mingw64", "bin", "git-credential-manager.exe"),
            path.join(path.dirname(gitBash), "..", "mingw64", "bin", "git-credential-manager-core.exe"),
          ]
        : [];

      const candidateStatus = [];
      for (const candidate of candidates) {
        candidateStatus.push({
          path: path.resolve(candidate),
          exists: await isFile(candidate),
        });
      }

      const env = { ...process.env };
      for (const key of Object.keys(env)) {
        if (/^GIT_/i.test(key)) {
          delete env[key];
        }
      }

      env.GIT_CONFIG_NOSYSTEM = "1";
      env.GIT_CONFIG_GLOBAL = process.platform === "win32" ? "NUL" : "/dev/null";

      const probe = command => executeProcess(
        gitBash,
        ["--noprofile", "--norc", "-c", command],
        { cwd: root, env, timeoutSeconds: 30 },
      );

      const gitVersion = await probe("git --version");
      const manager = await probe("git credential-manager --version");
      const managerCore = manager.exitCode === 0
        ? null
        : await probe("git credential-manager-core --version");

      const data = {
        gitBash,
        gitVersion,
        credentialManagerCandidates: candidateStatus,
        credentialManager: manager,
        credentialManagerCore: managerCore,
        note: "This tool reports availability only and never reads or prints stored credentials.",
      };

      return {
        structuredContent: data,
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    });

    server.registerTool("git_add", {
      title: "Git add",
      description: "Stage explicitly selected project files. Paths must stay inside the allowed project root.",
      inputSchema: {
        files: z.array(z.string().min(1)).min(1).max(100),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        openWorldHint: false,
      },
    }, async ({ files }) => {
      const normalized = [];

      for (const file of files) {
        const target = await safePath(file);
        normalized.push(path.relative(root, target).replace(/\\/g, "/") || ".");
      }

      return gitQuery(["add", "--", ...normalized]);
    });

    server.registerTool("git_commit", {
      title: "Git commit",
      description: "Commit currently staged changes with the exact user-provided commit message.",
      inputSchema: {
        message: z.string().trim().min(1).max(500),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        openWorldHint: false,
      },
    }, ({ message }) => gitQuery(["commit", "-m", message]));

    server.registerTool("git_push", {
      title: "Git push",
      description: "Push the current branch to its configured upstream. Use only when the user explicitly asks to push. Force push and arbitrary remote/ref arguments are not supported.",
      inputSchema: {
        confirm: z.literal(true).describe(
          "Must be true only after the user explicitly requested a push.",
        ),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        openWorldHint: true,
      },
    }, ({ confirm }) => {
      if (confirm !== true) {
        throw new Error("Explicit push confirmation is required");
      }
      return gitQuery(["push"], ".", 120);
    });
  }

  return { gitQuery, registerGitTools };
}
