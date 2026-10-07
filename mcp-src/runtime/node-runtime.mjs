export const NODE_VERSION_PATTERN = /^v?(\d+)(?:\.(\d+))?(?:\.(\d+))?$/;

export function createNodeVersionSchema(z) {
  return z.string().regex(
    NODE_VERSION_PATTERN,
    "숫자 버전만 지원합니다. 예: 24 또는 24.21.0",
  );
}

export function createNodeRuntime({
  fs,
  path,
  config,
  safePath,
}) {
  async function isFile(file) {
    try {
      return (await fs.stat(file)).isFile();
    } catch (error) {
      if (error.code === "ENOENT") {
        return false;
      }
      throw error;
    }
  }

  function getPathValue(env) {
    const key = Object.keys(env).find(key => key.toLowerCase() === "path");
    return key ? env[key] : "";
  }

  function runtimeEnv(directory) {
    const env = { ...process.env };
    const currentPath = getPathValue(env);

    for (const key of Object.keys(env)) {
      if (key.toLowerCase() === "path") {
        delete env[key];
      }
    }

    env.PATH = [directory, currentPath].filter(Boolean).join(path.delimiter);

    for (const key of Object.keys(env)) {
      if (/^(NODE_OPTIONS|NODE_PATH|NPM_CONFIG_|npm_config_)/i.test(key)) {
        delete env[key];
      }
    }

    return env;
  }

  async function findNvm() {
    if (config.nvmPath) {
      if (await isFile(config.nvmPath)) {
        return path.resolve(config.nvmPath);
      }
      throw new Error(`설정한 nvm 실행 파일이 없습니다: ${config.nvmPath}`);
    }

    const home = process.env.USERPROFILE;
    const candidates = [
      process.env.NVM_HOME && path.join(process.env.NVM_HOME, "nvm.exe"),
      process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, "Author Software", "nvm", "nvm.exe"),
      home && path.join(home, "AppData", "Local", "Author Software", "nvm", "nvm.exe"),
      process.env.APPDATA && path.join(process.env.APPDATA, "nvm", "nvm.exe"),
      ...getPathValue(process.env)
        .split(path.delimiter)
        .filter(Boolean)
        .map(directory => path.join(directory, "nvm.exe")),
    ].filter(Boolean);

    for (const candidate of candidates) {
      if (await isFile(candidate)) {
        return path.resolve(candidate);
      }
    }

    return null;
  }

  async function installedNodeVersions(nvmPath) {
    if (!nvmPath) {
      return [];
    }

    const home = path.dirname(nvmPath);
    const roots = config.nvmRoot
      ? [config.nvmRoot]
      : [path.join(home, "installs"), home];
    const versions = [];

    for (const root of roots) {
      let entries;
      try {
        entries = await fs.readdir(root, { withFileTypes: true });
      } catch (error) {
        if (error.code === "ENOENT") {
          continue;
        }
        throw error;
      }

      for (const entry of entries) {
        const match = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(entry.name);
        if (!match) {
          continue;
        }

        const directory = path.resolve(root, entry.name);
        if (await isFile(path.join(directory, "node.exe"))) {
          versions.push({
            version: match.slice(1).join("."),
            directory,
          });
        }
      }
    }

    return versions.sort((a, b) => {
      const av = a.version.split(".").map(Number);
      const bv = b.version.split(".").map(Number);
      return bv[0] - av[0] || bv[1] - av[1] || bv[2] - av[2];
    });
  }

  async function resolveNodeRuntime(requestedVersion) {
    const nvmPath = await findNvm();
    let version = requestedVersion || config.nodeVersion;

    if (!version) {
      try {
        version = (await fs.readFile(await safePath(".nvmrc"), "utf8")).trim();
      } catch (error) {
        if (error.code !== "ENOENT") {
          throw error;
        }
      }
    }

    if (version && !NODE_VERSION_PATTERN.test(version)) {
      throw new Error(`지원하지 않는 Node.js 버전: ${version}. 숫자 버전을 지정하세요.`);
    }

    const installed = await installedNodeVersions(nvmPath);
    const selector = version?.replace(/^v/, "").split(".");
    const selected = installed.find(item =>
      !selector
      || selector.every((part, index) =>
        item.version.split(".")[index] === part,
      ),
    );

    if (selected) {
      return {
        ...selected,
        nodePath: path.join(selected.directory, "node.exe"),
        nvmPath,
        source: "nvm",
      };
    }

    if (version || nvmPath) {
      throw new Error(
        `Node.js ${version || "버전"}이 nvm 설치 폴더에 없습니다. nvm_install로 먼저 설치하세요. 사용자 지정 설치 폴더는 config.json의 nvmRoot에 지정하세요.`,
      );
    }

    return {
      nodePath: process.execPath,
      directory: path.dirname(process.execPath),
      version: process.version.replace(/^v/, ""),
      nvmPath: null,
      source: "server-runtime",
    };
  }

  return {
    findNvm,
    installedNodeVersions,
    isFile,
    resolveNodeRuntime,
    runtimeEnv,
  };
}
