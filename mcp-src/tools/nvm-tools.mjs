export function registerNvmTools({
  server,
  z,
  nodeVersionSchema,
  nodeRuntime,
  executeProcess,
}) {
  const {
    findNvm,
    installedNodeVersions,
    resolveNodeRuntime,
  } = nodeRuntime;

  server.registerTool("nvm_status", {
    title: "Inspect nvm and Node.js",
    description: "nvm 설치 위치·버전·설치된 Node.js 목록과 이 MCP 서버가 실제 사용하는 Node.js를 조회합니다. Windows 사용자 터미널의 활성 버전과 MCP 실행 버전을 구분합니다.",
    inputSchema: {},
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false,
    },
  }, async () => {
    const nvmPath = await findNvm();
    const installed = await installedNodeVersions(nvmPath);
    let selected = null;
    let selectionError = null;

    try {
      const runtime = await resolveNodeRuntime();
      const result = await executeProcess(
        runtime.nodePath,
        ["-p", "process.version"],
        { timeoutSeconds: 30 },
      );
      if (result.exitCode !== 0) {
        throw new Error(result.stderr || "Node.js 버전 조회 실패");
      }
      selected = { ...runtime, actualVersion: result.stdout.trim() };
    } catch (error) {
      selectionError = error.message;
    }

    const nvmVersion = nvmPath
      ? await executeProcess(nvmPath, ["version"], { timeoutSeconds: 30 })
      : null;
    const list = nvmPath
      ? await executeProcess(nvmPath, ["list"], { timeoutSeconds: 30 })
      : null;

    const data = {
      nvmPath,
      nvmVersion: nvmVersion?.stdout.trim() || null,
      installed,
      selected,
      selectionError,
      list,
      serverNodeVersion: process.version,
      note: "selected는 MCP 작업의 Node.js입니다. 사용자 터미널의 전역 활성 버전은 별도이며, nvm이 사용하는 Windows 계정에 따라 list 결과가 다를 수 있습니다.",
    };

    return {
      structuredContent: data,
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  });

  server.registerTool("nvm_install", {
    title: "Install a Node.js version with nvm",
    description: "사용자가 요청한 숫자 Node.js 버전을 nvm으로 설치합니다. 다운로드가 필요하며 Windows 권한 제한이 적용됩니다. 설치만 수행하고 활성 버전을 바꾸지 않습니다.",
    inputSchema: {
      version: nodeVersionSchema,
      timeoutSeconds: z.number().int().min(1).max(600).default(300),
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: true,
    },
  }, async () => {
    throw new Error("nvm mutation tools are disabled; manage Node.js locally");
  });

  server.registerTool("nvm_use", {
    title: "Select an installed Node.js version",
    description: "이미 설치된 Node.js를 nvm use로 전환합니다. 성공하면 MCP의 node/npm/npx 실행 버전도 config.json에 저장합니다. nvm 전역 전환은 다른 프로젝트에 영향을 줄 수 있고 Windows 권한이 필요할 수 있습니다.",
    inputSchema: {
      version: nodeVersionSchema,
      timeoutSeconds: z.number().int().min(1).max(600).default(60),
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
  }, async () => {
    throw new Error("nvm mutation tools are disabled; manage Node.js locally");
  });
}
