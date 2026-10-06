set -euo pipefail

# ============================================================
# Yujaemin Local MCP installer
# Windows + Git Bash + ChatGPT Desktop
# ============================================================

PLUGIN_NAME="yujaemin-local"
PLUGIN_VERSION="1.1.0"

PROJECT_ROOT="$(pwd -W 2>/dev/null || pwd)"

BASH_UNIX_PATH="$(command -v bash)"
BASH_PATH="$(cygpath -w "$BASH_UNIX_PATH")"

PLUGIN_DIR="$HOME/.codex/plugins/$PLUGIN_NAME"
MARKETPLACE_FILE="$HOME/.agents/plugins/marketplace.json"

echo
echo "============================================================"
echo " Yujaemin Local MCP"
echo "============================================================"
echo
echo "Project Root : $PROJECT_ROOT"
echo "Git Bash     : $BASH_PATH"
echo "Plugin Dir   : $PLUGIN_DIR"
echo

read -r -p "현재 프로젝트를 Yujaemin Local MCP에 연결할까요? [y/N] " CONFIRM

case "$CONFIRM" in
  y|Y|yes|YES)
    ;;
  *)
    echo "취소했습니다."
    exit 1
    ;;
esac


# ============================================================
# 프로그램 확인
# ============================================================

echo
echo "[1/9] 필수 프로그램 확인..."

for CMD in node npm git; do
  if ! command -v "$CMD" >/dev/null 2>&1; then
    echo "ERROR: $CMD 를 찾을 수 없습니다."
    exit 1
  fi
done

echo "Node : $(node --version)"
echo "npm  : $(npm --version)"
echo "Git  : $(git --version)"

if command -v docker >/dev/null 2>&1; then
  echo "Docker : $(docker --version)"
else
  echo "Docker : 설치되지 않았거나 PATH에 없습니다."
  echo "         MCP 설치는 계속 진행합니다."
fi


# ============================================================
# Plugin directory
# ============================================================

echo
echo "[2/9] 플러그인 디렉터리 생성..."

mkdir -p "$PLUGIN_DIR/.codex-plugin"
mkdir -p "$HOME/.agents/plugins"


# ============================================================
# config.json
# ============================================================

echo
echo "[3/9] config.json 생성..."

PROJECT_ROOT="$PROJECT_ROOT" \
BASH_PATH="$BASH_PATH" \
node -e '
const config = {
  projectRoot: process.env.PROJECT_ROOT,
  gitBashPath: process.env.BASH_PATH
};

process.stdout.write(
  JSON.stringify(config, null, 2)
);
' > "$PLUGIN_DIR/config.json"


# ============================================================
# MCP Server
# ============================================================

echo
echo "[4/9] MCP 서버 생성..."

cat > "$PLUGIN_DIR/server-src.mjs" <<'MCP_SERVER'
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";


const HERE = path.dirname(fileURLToPath(import.meta.url));

const config = JSON.parse(
  await fs.readFile(
    path.join(HERE, "config.json"),
    "utf8"
  )
);

const ROOT = path.resolve(config.projectRoot);
const ROOT_REAL = await fs.realpath(ROOT);

const GIT_BASH = config.gitBashPath;


/* ============================================================
 * Path security
 * ============================================================ */

function isInside(base, target) {
  const relative = path.relative(base, target);

  return (
    relative === "" ||
    (
      !relative.startsWith("..") &&
      !path.isAbsolute(relative)
    )
  );
}


async function validateRealPath(target) {
  let cursor = target;

  while (true) {
    try {
      const real = await fs.realpath(cursor);

      if (!isInside(ROOT_REAL, real)) {
        throw new Error(
          `프로젝트 외부 경로 접근 차단: ${target}`
        );
      }

      return;
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }

      const parent = path.dirname(cursor);

      if (parent === cursor) {
        throw new Error(
          `안전한 경로를 확인할 수 없습니다: ${target}`
        );
      }

      cursor = parent;
    }
  }
}


async function safePath(relativePath = ".") {
  if (path.isAbsolute(relativePath)) {
    throw new Error(
      "절대 경로는 사용할 수 없습니다. 프로젝트 기준 상대 경로를 사용하세요."
    );
  }

  const target = path.resolve(
    ROOT,
    relativePath
  );

  if (!isInside(ROOT, target)) {
    throw new Error(
      `프로젝트 외부 접근 차단: ${relativePath}`
    );
  }

  await validateRealPath(target);

  return target;
}


/* ============================================================
 * MCP Server
 * ============================================================ */

const server = new McpServer(
  {
    name: "yujaemin-local",
    version: "1.1.0"
  },
  {
    instructions: `
Yujaemin Local 개발 프로젝트용 MCP입니다.

프로젝트 파일을 수정하기 전에 관련 파일을 먼저 읽으세요.
기존 코드의 구조와 스타일을 최대한 유지하세요.
가능하면 replace_text를 사용하고 전체 파일 덮어쓰기는 최소화하세요.

명령 실행은 Git, npm, Node, Docker 기반 개발 작업에 사용하세요.
프로젝트 파일 도구는 프로젝트 루트 내부에서만 사용하세요.
nvm_status, nvm_install, nvm_use로 Node.js 환경을 관리하세요. nvm 도구는 설정된 nvm 설치 폴더를 사용하며 Windows 권한을 높이지 않습니다.
`
  }
);


/* ============================================================
 * list_files
 * ============================================================ */

server.registerTool(
  "list_files",
  {
    title: "List project files",

    description:
      "로컬 프로젝트 내부의 파일과 디렉터리를 조회합니다.",

    inputSchema: {
      directory: z
        .string()
        .default(".")
    },

    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false
    }
  },

  async ({ directory }) => {
    const target = await safePath(directory);

    const entries = await fs.readdir(
      target,
      {
        withFileTypes: true
      }
    );

    const result = entries
      .slice(0, 500)
      .map((entry) => {
        let type = "file";

        if (entry.isDirectory()) {
          type = "directory";
        } else if (entry.isSymbolicLink()) {
          type = "symlink";
        }

        return {
          name: entry.name,
          type
        };
      });

    return {
      structuredContent: {
        directory,
        entries: result
      },

      content: [
        {
          type: "text",

          text: result
            .map(
              (entry) =>
                `[${entry.type.toUpperCase()}] ${entry.name}`
            )
            .join("\n")
        }
      ]
    };
  }
);


/* ============================================================
 * read_file
 * ============================================================ */

server.registerTool(
  "read_file",
  {
    title: "Read project file",

    description:
      "로컬 프로젝트 내부의 텍스트 파일을 읽습니다.",

    inputSchema: {
      file: z.string()
    },

    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false
    }
  },

  async ({ file }) => {
    const target = await safePath(file);

    const stat = await fs.stat(target);

    if (!stat.isFile()) {
      throw new Error(
        `파일이 아닙니다: ${file}`
      );
    }

    if (stat.size > 2 * 1024 * 1024) {
      throw new Error(
        "2MB보다 큰 파일은 직접 읽지 않도록 제한되어 있습니다."
      );
    }

    const text = await fs.readFile(
      target,
      "utf8"
    );

    return {
      content: [
        {
          type: "text",
          text
        }
      ]
    };
  }
);


/* ============================================================
 * write_file
 * ============================================================ */

server.registerTool(
  "write_file",
  {
    title: "Create or write project file",

    description:
      "프로젝트 내부에 파일을 생성합니다. 기존 파일은 overwrite=true가 필요합니다.",

    inputSchema: {
      file: z.string(),

      content: z.string(),

      overwrite: z
        .boolean()
        .default(false)
    },

    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: false
    }
  },

  async ({
    file,
    content,
    overwrite
  }) => {
    const target = await safePath(file);

    let exists = false;

    try {
      await fs.stat(target);
      exists = true;
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }

    if (exists && !overwrite) {
      throw new Error(
        `이미 존재하는 파일입니다: ${file}. ` +
        `기존 파일 수정에는 replace_text를 우선 사용하세요.`
      );
    }

    await fs.mkdir(
      path.dirname(target),
      {
        recursive: true
      }
    );

    await fs.writeFile(
      target,
      content,
      "utf8"
    );

    return {
      content: [
        {
          type: "text",
          text: `${file} 저장 완료`
        }
      ]
    };
  }
);


/* ============================================================
 * replace_text
 * ============================================================ */

server.registerTool(
  "replace_text",
  {
    title: "Replace text in project file",

    description:
      "파일 내부의 특정 문자열을 교체합니다.",

    inputSchema: {
      file: z.string(),

      oldText: z.string(),

      newText: z.string(),

      replaceAll: z
        .boolean()
        .default(false)
    },

    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: false
    }
  },

  async ({
    file,
    oldText,
    newText,
    replaceAll
  }) => {
    if (!oldText) {
      throw new Error(
        "oldText는 비어 있을 수 없습니다."
      );
    }

    const target = await safePath(file);

    const original = await fs.readFile(
      target,
      "utf8"
    );

    let count = 0;
    let index = 0;

    while (true) {
      const found = original.indexOf(
        oldText,
        index
      );

      if (found === -1) {
        break;
      }

      count++;

      index =
        found +
        oldText.length;
    }

    if (count === 0) {
      throw new Error(
        "교체할 문자열을 찾지 못했습니다."
      );
    }

    if (!replaceAll && count > 1) {
      throw new Error(
        `${count}개의 동일 문자열이 있습니다. ` +
        `더 긴 고유 문맥을 지정하거나 replaceAll=true를 사용하세요.`
      );
    }

    const updated =
      replaceAll
        ? original
            .split(oldText)
            .join(newText)
        : original.replace(
            oldText,
            newText
          );

    await fs.writeFile(
      target,
      updated,
      "utf8"
    );

    return {
      content: [
        {
          type: "text",

          text:
            `${file}: ` +
            `${replaceAll ? count : 1}개 위치 수정 완료`
        }
      ]
    };
  }
);


/* ============================================================
 * search_text
 * ============================================================ */

const TEXT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".css",
  ".scss",
  ".html",
  ".md",
  ".yml",
  ".yaml",
  ".sql",
  ".txt",
  ".env",
  ".java",
  ".kt",
  ".py"
]);


const IGNORE_DIRECTORY = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".vite",
  "coverage",
  "target"
]);


async function walk(
  directory,
  files = []
) {
  if (files.length >= 5000) {
    return files;
  }

  const entries = await fs.readdir(
    directory,
    {
      withFileTypes: true
    }
  );

  for (const entry of entries) {
    if (files.length >= 5000) {
      break;
    }

    if (entry.isSymbolicLink()) {
      continue;
    }

    const full = path.join(
      directory,
      entry.name
    );

    if (entry.isDirectory()) {
      if (
        IGNORE_DIRECTORY.has(
          entry.name
        )
      ) {
        continue;
      }

      await walk(
        full,
        files
      );

      continue;
    }

    const ext = path
      .extname(entry.name)
      .toLowerCase();

    if (
      TEXT_EXTENSIONS.has(ext) ||
      entry.name === "Dockerfile"
    ) {
      files.push(full);
    }
  }

  return files;
}


server.registerTool(
  "search_text",
  {
    title: "Search project source",

    description:
      "로컬 프로젝트의 소스 코드와 설정 파일에서 문자열을 검색합니다.",

    inputSchema: {
      query: z.string(),

      directory: z
        .string()
        .default(".")
    },

    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false
    }
  },

  async ({
    query,
    directory
  }) => {
    const base =
      await safePath(directory);

    const files =
      await walk(base);

    const matches = [];

    const needle =
      query.toLowerCase();

    for (const file of files) {
      try {
        const text =
          await fs.readFile(
            file,
            "utf8"
          );

        const lines =
          text.split(/\r?\n/);

        for (
          let index = 0;
          index < lines.length;
          index++
        ) {
          if (
            lines[index]
              .toLowerCase()
              .includes(needle)
          ) {
            matches.push({
              file:
                path.relative(
                  ROOT,
                  file
                ),

              line:
                index + 1,

              text:
                lines[index]
                  .trim()
                  .slice(0, 400)
            });
          }

          if (
            matches.length >= 200
          ) {
            break;
          }
        }

      } catch {
        // ignore
      }

      if (
        matches.length >= 200
      ) {
        break;
      }
    }

    return {
      structuredContent: {
        query,
        matches
      },

      content: [
        {
          type: "text",

          text:
            matches.length === 0
              ? "검색 결과 없음"
              : matches
                  .map(
                    (match) =>
                      `${match.file}:${match.line}\n${match.text}`
                  )
                  .join("\n\n")
        }
      ]
    };
  }
);


/* ============================================================
 * nvm and development command execution
 * ============================================================ */

const NODE_VERSION_PATTERN = /^v?(\d+)(?:\.(\d+))?(?:\.(\d+))?$/;
const nodeVersionSchema = z.string().regex(
  NODE_VERSION_PATTERN,
  "숫자 버전만 지원합니다. 예: 24 또는 24.21.0"
);

async function isFile(file) {
  try { return (await fs.stat(file)).isFile(); }
  catch (error) { if (error.code === "ENOENT") return false; throw error; }
}

async function findNvm() {
  if (config.nvmPath) {
    if (await isFile(config.nvmPath)) return path.resolve(config.nvmPath);
    throw new Error(`설정한 nvm 실행 파일이 없습니다: ${config.nvmPath}`);
  }
  const home = process.env.USERPROFILE;
  const candidates = [
    process.env.NVM_HOME && path.join(process.env.NVM_HOME, "nvm.exe"),
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, "Author Software", "nvm", "nvm.exe"),
    home && path.join(home, "AppData", "Local", "Author Software", "nvm", "nvm.exe"),
    process.env.APPDATA && path.join(process.env.APPDATA, "nvm", "nvm.exe"),
    ...getPathValue(process.env).split(path.delimiter).filter(Boolean).map(dir => path.join(dir, "nvm.exe")),
  ].filter(Boolean);
  for (const candidate of candidates) {
    if (await isFile(candidate)) return path.resolve(candidate);
  }
  return null;
}

function getPathValue(env) {
  const key = Object.keys(env).find(key => key.toLowerCase() === "path");
  return key ? env[key] : "";
}

function runtimeEnv(directory) {
  const env = { ...process.env };
  const currentPath = getPathValue(env);
  for (const key of Object.keys(env)) {
    if (key.toLowerCase() === "path") delete env[key];
  }
  env.PATH = [directory, currentPath].filter(Boolean).join(path.delimiter);
  return env;
}

function commandResult(result, extra = {}) {
  const data = { ...result, ...extra };
  return {
    isError: result.exitCode !== 0 || result.timedOut,
    structuredContent: data,
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  };
}

function executeProcess(executable, args, { cwd = ROOT, env = process.env, timeoutSeconds = 180 } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, {
      cwd, env, windowsHide: true, shell: false, stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    child.stdout.on("data", data => { stdout = (stdout + data).slice(-30000); });
    child.stderr.on("data", data => { stderr = (stderr + data).slice(-30000); });
    const timer = setTimeout(() => {
      timedOut = true;
      if (process.platform === "win32") {
        const killer = spawn("taskkill.exe", ["/PID", String(child.pid), "/T", "/F"], {
          windowsHide: true, shell: false, stdio: "ignore",
        });
        killer.on("error", () => child.kill());
        killer.on("close", code => { if (code !== 0) child.kill(); });
      } else child.kill();
    }, timeoutSeconds * 1000);
    child.once("error", error => { clearTimeout(timer); reject(error); });
    child.once("close", (exitCode, signal) => {
      clearTimeout(timer);
      resolve({ exitCode, signal, timedOut, stdout, stderr });
    });
  });
}

async function installedNodeVersions(nvmPath) {
  if (!nvmPath) return [];
  const home = path.dirname(nvmPath);
  const roots = config.nvmRoot ? [config.nvmRoot] : [path.join(home, "installs"), home];
  const versions = [];
  for (const root of roots) {
    let entries;
    try { entries = await fs.readdir(root, { withFileTypes: true }); }
    catch (error) { if (error.code === "ENOENT") continue; throw error; }
    for (const entry of entries) {
      const match = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(entry.name);
      if (!match) continue;
      const directory = path.resolve(root, entry.name);
      if (await isFile(path.join(directory, "node.exe"))) {
        versions.push({ version: match.slice(1).join("."), directory });
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
    try { version = (await fs.readFile(await safePath(".nvmrc"), "utf8")).trim(); }
    catch (error) { if (error.code !== "ENOENT") throw error; }
  }
  if (version && !NODE_VERSION_PATTERN.test(version)) {
    throw new Error(`지원하지 않는 Node.js 버전: ${version}. 숫자 버전을 지정하세요.`);
  }
  const installed = await installedNodeVersions(nvmPath);
  const selector = version?.replace(/^v/, "").split(".");
  const selected = installed.find(item => !selector || selector.every((part, index) => item.version.split(".")[index] === part));
  if (selected) return { ...selected, nodePath: path.join(selected.directory, "node.exe"), nvmPath, source: "nvm" };
  if (version || nvmPath) {
    throw new Error(`Node.js ${version || "버전"}이 nvm 설치 폴더에 없습니다. nvm_install로 먼저 설치하세요. 사용자 지정 설치 폴더는 config.json의 nvmRoot에 지정하세요.`);
  }
  return { nodePath: process.execPath, directory: path.dirname(process.execPath), version: process.version.replace(/^v/, ""), nvmPath: null, source: "server-runtime" };
}

server.registerTool("nvm_status", {
  title: "Inspect nvm and Node.js",
  description: "nvm 설치 위치·버전·설치된 Node.js 목록과 이 MCP 서버가 실제 사용하는 Node.js를 조회합니다. Windows 사용자 터미널의 활성 버전과 MCP 실행 버전을 구분합니다.",
  inputSchema: {},
  annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
}, async () => {
  const nvmPath = await findNvm();
  const installed = await installedNodeVersions(nvmPath);
  let selected = null;
  let selectionError = null;
  try {
    const runtime = await resolveNodeRuntime();
    const result = await executeProcess(runtime.nodePath, ["-p", "process.version"], { timeoutSeconds: 30 });
    if (result.exitCode !== 0) throw new Error(result.stderr || "Node.js 버전 조회 실패");
    selected = { ...runtime, actualVersion: result.stdout.trim() };
  } catch (error) { selectionError = error.message; }
  const nvmVersion = nvmPath ? await executeProcess(nvmPath, ["version"], { timeoutSeconds: 30 }) : null;
  const list = nvmPath ? await executeProcess(nvmPath, ["list"], { timeoutSeconds: 30 }) : null;
  const data = {
    nvmPath, nvmVersion: nvmVersion?.stdout.trim() || null,
    installed, selected, selectionError, list,
    serverNodeVersion: process.version,
    note: "selected는 MCP 작업의 Node.js입니다. 사용자 터미널의 전역 활성 버전은 별도이며, nvm이 사용하는 Windows 계정에 따라 list 결과가 다를 수 있습니다.",
  };
  return { structuredContent: data, content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});

server.registerTool("nvm_install", {
  title: "Install a Node.js version with nvm",
  description: "사용자가 요청한 숫자 Node.js 버전을 nvm으로 설치합니다. 다운로드가 필요하며 Windows 권한 제한이 적용됩니다. 설치만 수행하고 활성 버전을 바꾸지 않습니다.",
  inputSchema: { version: nodeVersionSchema, timeoutSeconds: z.number().int().min(1).max(600).default(300) },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
}, async ({ version, timeoutSeconds }) => {
  const nvmPath = await findNvm();
  if (!nvmPath) throw new Error("nvm을 찾을 수 없습니다. nvm 설치 후 config.json의 nvmPath를 지정하세요.");
  const result = await executeProcess(nvmPath, ["install", version.replace(/^v/, "")], { timeoutSeconds });
  return commandResult(result, { nvmPath, installed: await installedNodeVersions(nvmPath) });
});

server.registerTool("nvm_use", {
  title: "Select an installed Node.js version",
  description: "이미 설치된 Node.js를 nvm use로 전환합니다. 성공하면 MCP의 node/npm/npx 실행 버전도 config.json에 저장합니다. nvm 전역 전환은 다른 프로젝트에 영향을 줄 수 있고 Windows 권한이 필요할 수 있습니다.",
  inputSchema: { version: nodeVersionSchema, timeoutSeconds: z.number().int().min(1).max(600).default(60) },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
}, async ({ version, timeoutSeconds }) => {
  const runtime = await resolveNodeRuntime(version);
  if (!runtime.nvmPath) throw new Error("nvm을 찾을 수 없습니다.");
  const result = await executeProcess(runtime.nvmPath, ["use", runtime.version], { timeoutSeconds });
  if (result.exitCode === 0 && !result.timedOut) {
    const updatedConfig = { ...config, nodeVersion: runtime.version };
    await fs.writeFile(path.join(HERE, "config.json"), JSON.stringify(updatedConfig, null, 2) + "\n", "utf8");
    config.nodeVersion = runtime.version;
  }
  return commandResult(result, { selectedNodeVersion: config.nodeVersion || null });
});

const COMMANDS = { git: ["git"], docker: ["docker"], "docker-compose": ["docker", "compose"] };

function shellQuote(value) {
  return "'" + String(value).replace(/'/g, "'\"'\"'") + "'";
}

function blockObviouslyDangerousCommands(command, args) {
  const text = `${command} ${args.join(" ")}`.toLowerCase();
  const blocked = [
    /^git\s+clean\b/, /^git\s+reset\s+--hard\b/,
    /^docker\s+system\s+prune\b/, /^docker\s+volume\s+prune\b/,
    /^docker\s+volume\s+rm\b/, /^docker\s+builder\s+prune\b/,
    /^docker\s+container\s+prune\b/,
  ];
  if (blocked.some(rule => rule.test(text))) throw new Error(`안전상 차단된 명령입니다: ${text}`);
}

server.registerTool("run_dev_command", {
  title: "Run local development command",
  description: "프로젝트에서 Git, npm, npx, Node, Docker 명령을 실행합니다. node/npm/npx는 config.json 또는 .nvmrc에 맞는 nvm 런타임을 직접 사용합니다. nodeVersion으로 설치된 버전을 일시 지정할 수 있습니다.",
  inputSchema: {
    command: z.enum(["git", "npm", "npx", "node", "docker", "docker-compose"]),
    args: z.array(z.string()).default([]),
    cwd: z.string().default("."),
    nodeVersion: nodeVersionSchema.optional(),
    timeoutSeconds: z.number().int().min(1).max(600).default(180),
  },
  annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: true },
}, async ({ command, args, cwd, nodeVersion, timeoutSeconds }) => {
  blockObviouslyDangerousCommands(command, args);
  const workingDirectory = await safePath(cwd);
  if (["node", "npm", "npx"].includes(command)) {
    const runtime = await resolveNodeRuntime(nodeVersion);
    const commandArgs = [...args];
    if (command !== "node") {
      const cli = path.join(runtime.directory, "node_modules", "npm", "bin", `${command}-cli.js`);
      if (!await isFile(cli)) throw new Error(`${command} 실행 파일이 없습니다: ${cli}`);
      commandArgs.unshift(cli);
    }
    const result = await executeProcess(runtime.nodePath, commandArgs, {
      cwd: workingDirectory, env: runtimeEnv(runtime.directory), timeoutSeconds,
    });
    return commandResult(result, { nodeVersion: runtime.version, nodePath: runtime.nodePath });
  }
  const commandLine = [...COMMANDS[command], ...args].map(shellQuote).join(" ");
  const env = { ...process.env };
  if (command.startsWith("docker")) env.MSYS2_ARG_CONV_EXCL = "*";
  const result = await executeProcess(GIT_BASH, ["-c", commandLine], { cwd: workingDirectory, env, timeoutSeconds });
  return commandResult(result);
});


/* ============================================================
 * Start MCP
 * ============================================================ */

const transport =
  new StdioServerTransport();

await server.connect(
  transport
);
MCP_SERVER


# ============================================================
# npm install + bundle
# ============================================================

echo
echo "[5/9] MCP SDK 설치 및 서버 빌드..."

cd "$PLUGIN_DIR"

npm init -y >/dev/null 2>&1

npm install \
  @modelcontextprotocol/sdk \
  zod \
  >/dev/null

npm install \
  --save-dev \
  esbuild \
  >/dev/null

npx esbuild server-src.mjs \
  --bundle \
  --platform=node \
  --format=esm \
  --outfile=server.mjs

rm -rf node_modules
rm -f package.json
rm -f package-lock.json


# ============================================================
# VS Code MCP config
# ============================================================

echo
echo "[6/9] VS Code .vscode/mcp.json 생성..."

VSCODE_CONFIG_PATH="$(cygpath -w "$PROJECT_ROOT/.vscode/mcp.json")" \
NODE_EXECUTABLE="$(cygpath -w "$(command -v node)")" \
MCP_SERVER_PATH="$(cygpath -w "$PLUGIN_DIR/server.mjs")" \
MCP_SERVER_CWD="$(cygpath -w "$PLUGIN_DIR")" \
node <<'NODE'
const fs = require("node:fs");
const path = require("node:path");

const file = process.env.VSCODE_CONFIG_PATH;
let config = { servers: {} };

if (fs.existsSync(file)) {
  config = JSON.parse(fs.readFileSync(file, "utf8"));
}

if (!config.servers || typeof config.servers !== "object") {
  config.servers = {};
}

config.servers["yujaemin-local"] = {
  type: "stdio",
  command: process.env.NODE_EXECUTABLE,
  args: [process.env.MCP_SERVER_PATH],
  cwd: process.env.MCP_SERVER_CWD
};

fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, JSON.stringify(config, null, 2) + "\n");
NODE


# ============================================================
# MCP config
# ============================================================

echo
echo "[7/9] .mcp.json 생성..."

cat > "$PLUGIN_DIR/.mcp.json" <<'EOF'
{
  "mcpServers": {
    "yujaemin-local": {
      "command": "node",
      "args": [
        "server.mjs"
      ],
      "cwd": "."
    }
  }
}
EOF


# ============================================================
# Plugin manifest
# ============================================================

echo
echo "[8/9] 플러그인 manifest 생성..."

cat > "$PLUGIN_DIR/.codex-plugin/plugin.json" <<'EOF'
{
  "name": "yujaemin-local",
  "version": "1.1.0",
  "description": "Local project development tools with nvm-managed Node.js",
  "mcpServers": "./.mcp.json",
  "interface": {
    "displayName": "Yujaemin Local",
    "shortDescription": "Local project development tools",
    "developerName": "Yujaemin",
    "category": "Developer Tools",
    "capabilities": [
      "Read",
      "Write"
    ]
  }
}
EOF


# ============================================================
# Marketplace
# ============================================================

echo
echo "[9/9] Local Marketplace 등록..."

if [ -f "$MARKETPLACE_FILE" ]; then
  BACKUP_FILE="${MARKETPLACE_FILE}.bak.$(date +%Y%m%d%H%M%S)"

  cp \
    "$MARKETPLACE_FILE" \
    "$BACKUP_FILE"

  echo "기존 marketplace 백업:"
  echo "$BACKUP_FILE"
fi


MARKETPLACE_FILE="$MARKETPLACE_FILE" \
PLUGIN_NAME="$PLUGIN_NAME" \
node <<'NODE'
const fs = require("fs");

const file =
  process.env.MARKETPLACE_FILE;

const pluginName =
  process.env.PLUGIN_NAME;


let marketplace = {
  name: "yujaemin-local",

  interface: {
    displayName: "Yujaemin Local"
  },

  plugins: []
};


if (fs.existsSync(file)) {
  marketplace =
    JSON.parse(
      fs.readFileSync(
        file,
        "utf8"
      )
    );

  if (
    !Array.isArray(
      marketplace.plugins
    )
  ) {
    marketplace.plugins = [];
  }
}


marketplace.plugins =
  marketplace.plugins.filter(
    (plugin) =>
      plugin?.name !== pluginName
  );


marketplace.plugins.push(
  {
    name: pluginName,

    source: {
      source: "local",
      path:
        `./.codex/plugins/${pluginName}`
    },

    category:
      "Developer Tools"
  }
);


fs.writeFileSync(
  file,
  JSON.stringify(
    marketplace,
    null,
    2
  ) + "\n"
);
NODE


echo
echo "============================================================"
echo " Yujaemin Local MCP 설치 완료"
echo "============================================================"
echo
echo "Project:"
echo "  $PROJECT_ROOT"
echo
echo "Plugin:"
echo "  $PLUGIN_DIR"
echo
echo "Marketplace:"
echo "  $MARKETPLACE_FILE"
echo
echo "ChatGPT Desktop:"
echo
echo "  1. ChatGPT Desktop 완전히 종료"
echo "  2. 다시 실행"
echo "  3. Plugins 열기"
echo "  4. Yujaemin Local 설치"
echo "  5. 새 대화에서 플러그인 선택"
echo
echo "VS Code Copilot Chat:"
echo
echo "  6. VS Code에서 이 프로젝트 열기"
echo "  7. Ctrl+Shift+P > MCP: List Servers"
echo "  8. yujaemin-local 선택 후 Start Server"
echo "  9. Copilot Chat Agent 모드에서 MCP 도구 사용"
echo
echo "테스트:"
echo
echo '  "list_files로 프로젝트 루트 파일 목록을 보여줘."'
echo
echo "============================================================"