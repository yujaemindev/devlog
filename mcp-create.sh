set -euo pipefail

# ============================================================
# Yujaemin Local MCP installer
# Windows + Git Bash + ChatGPT Desktop
# ============================================================

PLUGIN_NAME="yujaemin-local"
PLUGIN_VERSION="1.0.0"

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
    version: "1.0.0"
  },
  {
    instructions: `
Yujaemin Local 개발 프로젝트용 MCP입니다.

프로젝트 파일을 수정하기 전에 관련 파일을 먼저 읽으세요.
기존 코드의 구조와 스타일을 최대한 유지하세요.
가능하면 replace_text를 사용하고 전체 파일 덮어쓰기는 최소화하세요.

명령 실행은 Git, npm, Node, Docker 기반 개발 작업에 사용하세요.
프로젝트 루트 외부의 파일에는 접근하지 마세요.
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
 * Git Bash command execution
 * ============================================================ */

const COMMANDS = {
  git: [
    "git"
  ],

  npm: [
    "npm"
  ],

  npx: [
    "npx"
  ],

  node: [
    "node"
  ],

  docker: [
    "docker"
  ],

  "docker-compose": [
    "docker",
    "compose"
  ]
};


function shellQuote(value) {
  return (
    "'" +
    String(value).replace(
      /'/g,
      "'\"'\"'"
    ) +
    "'"
  );
}


function blockObviouslyDangerousCommands(
  command,
  args
) {
  const text =
    `${command} ${args.join(" ")}`
      .toLowerCase();

  const blocked = [
    /^git\s+clean\b/,

    /^git\s+reset\s+--hard\b/,

    /^docker\s+system\s+prune\b/,

    /^docker\s+volume\s+prune\b/,

    /^docker\s+volume\s+rm\b/,

    /^docker\s+builder\s+prune\b/,

    /^docker\s+container\s+prune\b/
  ];

  for (const rule of blocked) {
    if (rule.test(text)) {
      throw new Error(
        `안전상 차단된 명령입니다: ${text}`
      );
    }
  }
}


server.registerTool(
  "run_dev_command",
  {
    title: "Run local development command",

    description:
      "Git Bash 환경에서 Git, npm, npx, Node, Docker 개발 명령을 실행합니다.",

    inputSchema: {
      command: z.enum([
        "git",
        "npm",
        "npx",
        "node",
        "docker",
        "docker-compose"
      ]),

      args: z
        .array(z.string())
        .default([]),

      cwd: z
        .string()
        .default("."),

      timeoutSeconds: z
        .number()
        .int()
        .min(1)
        .max(600)
        .default(180)
    },

    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: true
    }
  },

  async ({
    command,
    args,
    cwd,
    timeoutSeconds
  }) => {
    blockObviouslyDangerousCommands(
      command,
      args
    );

    const workingDirectory =
      await safePath(cwd);

    const executable =
      COMMANDS[command];

    const bashDirectory =
      workingDirectory.replace(
        /\\/g,
        "/"
      );

    const commandParts = [
      ...executable,
      ...args
    ];

    const commandLine =
      commandParts
        .map(shellQuote)
        .join(" ");

    const bashCommand =
      `cd -- ${shellQuote(bashDirectory)} && ${commandLine}`;

    return await new Promise(
      (resolve, reject) => {
        const env = {
          ...process.env
        };

        if (
          command === "docker" ||
          command === "docker-compose"
        ) {
          env.MSYS2_ARG_CONV_EXCL = "*";
        }

        const child = spawn(
          GIT_BASH,
          [
            "-lc",
            bashCommand
          ],
          {
            cwd: ROOT,
            env,
            windowsHide: true,
            shell: false
          }
        );

        let stdout = "";
        let stderr = "";

        child.stdout.on(
          "data",
          (data) => {
            stdout +=
              data.toString();
          }
        );

        child.stderr.on(
          "data",
          (data) => {
            stderr +=
              data.toString();
          }
        );

        const timer =
          setTimeout(
            () => {
              child.kill();
            },
            timeoutSeconds * 1000
          );

        child.on(
          "error",
          (error) => {
            clearTimeout(timer);
            reject(error);
          }
        );

        child.on(
          "close",
          (code) => {
            clearTimeout(timer);

            const trimmedStdout =
              stdout.slice(-30000);

            const trimmedStderr =
              stderr.slice(-30000);

            resolve({
              structuredContent: {
                exitCode: code,
                stdout: trimmedStdout,
                stderr: trimmedStderr
              },

              content: [
                {
                  type: "text",

                  text:
                    `exitCode: ${code}\n\n` +
                    `STDOUT\n${trimmedStdout}\n\n` +
                    `STDERR\n${trimmedStderr}`
                }
              ]
            });
          }
        );
      }
    );
  }
);


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
  "version": "1.0.0",
  "description": "Yujaemin local development MCP tools using Git Bash",
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