export function registerDevServerTools({
  server,
  nodeVersionSchema,
  fs,
  path,
  root,
  config,
  safePath,
  nodeRuntime,
  spawn,
}) {
  const { isFile, resolveNodeRuntime, runtimeEnv } = nodeRuntime;

  let devServerProcess = null;
  let devServerLogs = [];
  let devServerStartedAt = null;

  function appendDevServerLog(stream, chunk) {
    const text = chunk.toString();
    devServerLogs.push({ stream, text, at: new Date().toISOString() });

    if (devServerLogs.length > 200) {
      devServerLogs = devServerLogs.slice(-200);
    }
  }

  function devServerSnapshot() {
    return {
      running: Boolean(devServerProcess && devServerProcess.exitCode === null),
      pid: devServerProcess?.pid ?? null,
      startedAt: devServerStartedAt,
      exitCode: devServerProcess?.exitCode ?? null,
      logs: devServerLogs.slice(-40),
    };
  }

  server.registerTool("start_dev_server", {
    title: "Start development server",
    description: "Start the project's approved npm run dev script in the background. Only the project root and approved package.json scripts are used.",
    inputSchema: {
      nodeVersion: nodeVersionSchema.optional(),
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: true,
    },
  }, async ({ nodeVersion }) => {
    if (devServerProcess && devServerProcess.exitCode === null) {
      const snapshot = devServerSnapshot();
      return {
        structuredContent: snapshot,
        content: [{ type: "text", text: JSON.stringify(snapshot, null, 2) }],
      };
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
    if (!packageManifest.scripts?.dev) {
      throw new Error("package.json does not define a dev script");
    }

    const runtime = await resolveNodeRuntime(nodeVersion);
    const npmCli = path.join(
      runtime.directory,
      "node_modules",
      "npm",
      "bin",
      "npm-cli.js",
    );
    if (!await isFile(npmCli)) {
      throw new Error(`npm 실행 파일이 없습니다: ${npmCli}`);
    }

    devServerLogs = [];
    devServerStartedAt = new Date().toISOString();

    const child = spawn(
      runtime.nodePath,
      [npmCli, "--ignore-scripts", "run", "dev"],
      {
        cwd: root,
        env: runtimeEnv(runtime.directory),
        windowsHide: true,
        stdio: ["ignore", "pipe", "pipe"],
      },
    );

    devServerProcess = child;
    child.stdout?.on("data", chunk => appendDevServerLog("stdout", chunk));
    child.stderr?.on("data", chunk => appendDevServerLog("stderr", chunk));
    child.on("error", error => appendDevServerLog("error", String(error)));
    child.on(
      "exit",
      (code, signal) =>
        appendDevServerLog("exit", `code=${code} signal=${signal ?? ""}`),
    );

    await new Promise(resolve => setTimeout(resolve, 1500));
    const snapshot = devServerSnapshot();

    return {
      structuredContent: snapshot,
      content: [{ type: "text", text: JSON.stringify(snapshot, null, 2) }],
    };
  });

  server.registerTool("dev_server_status", {
    title: "Development server status",
    description: "Show whether the managed development server is running and return its recent output.",
    inputSchema: {},
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false,
    },
  }, async () => {
    const snapshot = devServerSnapshot();
    return {
      structuredContent: snapshot,
      content: [{ type: "text", text: JSON.stringify(snapshot, null, 2) }],
    };
  });

  server.registerTool("stop_dev_server", {
    title: "Stop development server",
    description: "Stop the development server previously started by start_dev_server, including its child process tree on Windows.",
    inputSchema: {},
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: false,
    },
  }, async () => {
    if (!devServerProcess || devServerProcess.exitCode !== null) {
      const snapshot = devServerSnapshot();
      return {
        structuredContent: snapshot,
        content: [{ type: "text", text: JSON.stringify(snapshot, null, 2) }],
      };
    }

    const pid = devServerProcess.pid;

    if (process.platform === "win32") {
      await new Promise((resolve, reject) => {
        const killer = spawn(
          "taskkill",
          ["/PID", String(pid), "/T", "/F"],
          {
            windowsHide: true,
            stdio: ["ignore", "pipe", "pipe"],
          },
        );

        let stderr = "";
        killer.stderr?.on("data", (chunk) => {
          stderr += chunk.toString();
        });
        killer.on("error", reject);
        killer.on("exit", (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(stderr || `taskkill failed with exit code ${code}`));
          }
        });
      });
    } else {
      devServerProcess.kill("SIGTERM");
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    const snapshot = devServerSnapshot();

    return {
      structuredContent: snapshot,
      content: [{ type: "text", text: JSON.stringify(snapshot, null, 2) }],
    };
  });
}
