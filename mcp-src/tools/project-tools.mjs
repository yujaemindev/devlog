// 등록된 로컬 프로젝트만 선택합니다. 서버의 실제 작업 루트는 재연결 후 변경됩니다.
export function registerProjectTools({ server, z, fs, path, configFile, config, activeProject }) {
  const projects = config.projects || {};

  function assertRegistered(projectId) {
    if (!Object.prototype.hasOwnProperty.call(projects, projectId)) {
      throw new Error("등록되지 않은 프로젝트입니다. mcp-create.sh에서 프로젝트를 등록하세요.");
    }
    return projects[projectId];
  }

  async function checkDirectory(root) {
    const target = path.resolve(root);
    const stat = await fs.lstat(target);
    if (!stat.isDirectory() || stat.isSymbolicLink()) {
      throw new Error("프로젝트 경로는 심볼릭 링크가 아닌 실제 디렉터리여야 합니다.");
    }
    const real = await fs.realpath(target);
    // Junction을 통한 우회 및 다른 위치를 가리키는 경로는 허용하지 않습니다.
    const normalize = value => process.platform === "win32" ? value.toLowerCase() : value;
    if (normalize(path.resolve(real)) !== normalize(target)) {
      throw new Error("프로젝트 경로의 실제 위치가 등록된 경로와 다릅니다.");
    }
    return target;
  }

  const result = data => ({
    structuredContent: data,
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  });

  server.registerTool("list_projects", {
    title: "List registered local projects",
    description: "등록된 프로젝트, 실제 폴더 존재 여부, 현재 서버의 작업 프로젝트를 조회합니다. 비밀 정보는 반환하지 않습니다.",
    inputSchema: {},
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  }, async () => {
    const items = [];
    for (const [id, project] of Object.entries(projects)) {
      let available = false;
      try {
        await checkDirectory(project.root);
        available = true;
      } catch {
        // 없는 프로젝트 폴더는 조회 결과에 unavailable로 표시합니다.
      }
      items.push({
        id,
        root: project.root,
        jiraProjectKey: project.jiraProjectKey || null,
        available,
        active: id === activeProject,
      });
    }
    return result({ activeProject, projects: items });
  });

  server.registerTool("switch_project", {
    title: "Select local project after reconnect",
    description: "설치 시 등록된 프로젝트만 선택합니다. 현재 MCP의 작업 루트는 유지되며 재연결 후 새 프로젝트가 적용됩니다.",
    inputSchema: { projectId: z.string().trim().min(1) },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  }, async ({ projectId }) => {
    const entry = assertRegistered(projectId);
    await checkDirectory(entry.root);

    // 이전 세션의 설정을 바탕으로 쓰지 않도록 현재 설정을 다시 확인합니다.
    const latest = JSON.parse(await fs.readFile(configFile, "utf8"));
    const current = latest.projects?.[projectId];
    if (!current || path.resolve(current.root) !== path.resolve(entry.root)) {
      throw new Error("프로젝트 등록 정보가 변경되었습니다. MCP를 재설치해 주세요.");
    }

    if (latest.activeProject !== projectId) {
      const next = { ...latest, activeProject: projectId };
      const temporary = path.join(path.dirname(configFile), `.config-${process.pid}-${Date.now()}.tmp`);
      try {
        await fs.writeFile(temporary, JSON.stringify(next, null, 2) + "\n", { flag: "wx" });
        await fs.rename(temporary, configFile);
      } finally {
        await fs.rm(temporary, { force: true });
      }
    }
    return result({
      selectedProject: projectId,
      currentServerProject: activeProject,
      requiresReconnect: projectId !== activeProject,
      message: projectId === activeProject
        ? "이미 현재 프로젝트입니다."
        : "설정 저장 완료. MCP 연결을 재시작해야 새 프로젝트가 적용됩니다.",
    });
  });
}
