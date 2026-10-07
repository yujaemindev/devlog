const COMMANDS = {
  "git": ["git"],
  "docker": ["docker"],
  "docker-compose": ["docker", "compose"],
};

function shellQuote(value) {
  return "'" + String(value).replace(/'/g, "'\\''") + "'";
}

function blockObviouslyDangerousCommands(command, args) {
  const equal = expected => JSON.stringify(args) === JSON.stringify(expected);
  const gitFlags = {
    status: new Set(["--short", "--branch", "--porcelain", "--porcelain=v1"]),
    diff: new Set(["--stat", "--name-only", "--name-status", "--cached", "--staged"]),
    log: new Set(["--oneline", "--no-decorate"]),
  };

  if (
    command === "git"
    && gitFlags[args[0]]
    && args.slice(1).every(arg =>
      gitFlags[args[0]].has(arg)
      || (
        args[0] === "log"
        && /^--max-count=([1-9]|[1-9][0-9]|100)$/.test(arg)
      ),
    )
  ) {
    return;
  }

  if (command === "node" && (equal(["--version"]) || equal(["-v"]))) {
    return;
  }

  if (
    command === "npm"
    && (
      equal(["--version"])
      || equal(["test"])
      || (
        args.length === 2
        && args[0] === "run"
        && ["build", "dev", "lint", "typecheck", "test", "generate:pages"].includes(args[1])
      )
    )
  ) {
    return;
  }

  throw new Error("Command/arguments are not in the allowlist");
}

export function registerCommandTools({
  server,
  z,
  fs,
  path,
  root,
  config,
  gitBash,
  safePath,
  nodeVersionSchema,
  nodeRuntime,
  gitQuery,
  executeProcess,
  commandResult,
}) {
  const { isFile, resolveNodeRuntime, runtimeEnv } = nodeRuntime;

  server.registerTool("run_dev_command", {
    title: "Run local development command",
    description: "프로젝트에서 allowlist에 있는 Git 조회, npm 검증 스크립트, Node 버전 조회만 실행합니다. node/npm/npx는 config.json 또는 .nvmrc에 맞는 nvm 런타임을 직접 사용합니다. nodeVersion으로 설치된 버전을 일시 지정할 수 있습니다.",
    inputSchema: {
      command: z.enum(["git", "npm", "npx", "node", "docker", "docker-compose"]),
      args: z.array(z.string()).default([]),
      cwd: z.string().default("."),
      nodeVersion: nodeVersionSchema.optional(),
      timeoutSeconds: z.number().int().min(1).max(600).default(180),
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: true,
    },
  }, async ({ command, args, cwd, nodeVersion, timeoutSeconds }) => {
    blockObviouslyDangerousCommands(command, args);

    if (command === "git") {
      return gitQuery(args, cwd, timeoutSeconds);
    }

    const workingDirectory = await safePath(cwd);
    if (!(await fs.stat(workingDirectory)).isDirectory()) {
      throw new Error("cwd must be a directory");
    }

    if (command === "npm" && args[0] !== "--version") {
      if (path.relative(root, workingDirectory) !== "") {
        throw new Error("npm scripts run only at allowedRoot");
      }

      const packageManifest = JSON.parse(
        await fs.readFile(await safePath("package.json"), "utf8"),
      );
      if (
        JSON.stringify(packageManifest.scripts)
        !== JSON.stringify(config.approvedScripts)
      ) {
        throw new Error(
          "package.json scripts changed; approve them locally in config.json before execution",
        );
      }
    }

    if (["node", "npm", "npx"].includes(command)) {
      const runtime = await resolveNodeRuntime(nodeVersion);
      const commandArgs = command === "npm" && args[0] !== "--version"
        ? ["--ignore-scripts", ...args]
        : [...args];

      if (command !== "node") {
        const cli = path.join(
          runtime.directory,
          "node_modules",
          "npm",
          "bin",
          `${command}-cli.js`,
        );
        if (!await isFile(cli)) {
          throw new Error(`${command} 실행 파일이 없습니다: ${cli}`);
        }
        commandArgs.unshift(cli);
      }

      const result = await executeProcess(runtime.nodePath, commandArgs, {
        cwd: workingDirectory,
        env: runtimeEnv(runtime.directory),
        timeoutSeconds,
      });

      return commandResult(result, {
        nodeVersion: runtime.version,
        nodePath: runtime.nodePath,
      });
    }

    const commandLine = [...COMMANDS[command], ...args]
      .map(shellQuote)
      .join(" ");
    const env = { ...process.env };
    if (command.startsWith("docker")) {
      env.MSYS2_ARG_CONV_EXCL = "*";
    }

    const result = await executeProcess(
      gitBash,
      ["-c", commandLine],
      { cwd: workingDirectory, env, timeoutSeconds },
    );
    return commandResult(result);
  });
}
