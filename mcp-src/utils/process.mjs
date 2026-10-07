export function createProcessUtils({ spawn, root }) {
  function commandResult(result, extra = {}) {
    const data = { ...result, ...extra };

    return {
      isError: result.exitCode !== 0 || result.timedOut,
      structuredContent: data,
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }

  function executeProcess(
    executable,
    args,
    { cwd = root, env = process.env, timeoutSeconds = 180 } = {},
  ) {
    return new Promise((resolve, reject) => {
      const child = spawn(executable, args, {
        cwd,
        env,
        windowsHide: true,
        shell: false,
        stdio: ["ignore", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";
      let timedOut = false;

      child.stdout.on("data", (data) => {
        stdout = (stdout + data).slice(-30000);
      });
      child.stderr.on("data", (data) => {
        stderr = (stderr + data).slice(-30000);
      });

      const timer = setTimeout(() => {
        timedOut = true;

        if (process.platform === "win32") {
          const killer = spawn("taskkill.exe", ["/PID", String(child.pid), "/T", "/F"], {
            windowsHide: true,
            shell: false,
            stdio: "ignore",
          });
          killer.on("error", () => child.kill());
          killer.on("close", (code) => {
            if (code !== 0) {
              child.kill();
            }
          });
        } else {
          child.kill();
        }
      }, timeoutSeconds * 1000);

      child.once("error", (error) => {
        clearTimeout(timer);
        reject(error);
      });
      child.once("close", (exitCode, signal) => {
        clearTimeout(timer);
        resolve({ exitCode, signal, timedOut, stdout, stderr });
      });
    });
  }

  return { commandResult, executeProcess };
}
