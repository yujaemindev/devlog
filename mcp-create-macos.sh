#!/usr/bin/env bash

set -euo pipefail

if [ "$(uname -s)" != "Darwin" ]; then echo "ERROR: macOS 전용 스크립트입니다." >&2; exit 1; fi

# 실행한 작업 디렉터리를 현재 프로젝트로 사용합니다.
# MCP_ACTIVE_PROJECT 환경변수는 필요하지 않습니다.

# ============================================================
# Yujaemin Local MCP installer
# macOS (Apple Silicon / Intel) + ChatGPT Desktop
# ============================================================

PLUGIN_NAME="yujaemin-local"
PLUGIN_VERSION="1.2.9"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MCP_SOURCE_DIR="$SCRIPT_DIR/mcp-src"
if [ ! -f "$MCP_SOURCE_DIR/server.mjs" ]; then
  echo "ERROR: MCP 개발 소스를 찾을 수 없습니다: $MCP_SOURCE_DIR/server.mjs" >&2
  exit 1
fi
PROJECT_ROOT="$(pwd -P)"
WORKSPACE_ROOT="$(dirname "$PROJECT_ROOT")"
ACTIVE_PROJECT="$(basename "$PROJECT_ROOT")"
PROJECT_INSTRUCTIONS_FILE="$PROJECT_ROOT/docs/LOCAL_MCP_INSTRUCTIONS.md"
JIRA_API_TOKEN_FILE="$PROJECT_ROOT/.jira-api-token"
if [ ! -f "$PROJECT_INSTRUCTIONS_FILE" ] || [ ! -r "$PROJECT_INSTRUCTIONS_FILE" ]; then
  echo "ERROR: 필수 MCP 지침 문서가 없거나 읽을 수 없습니다: $PROJECT_INSTRUCTIONS_FILE" >&2
  exit 1
fi
if [ ! -f "$JIRA_API_TOKEN_FILE" ]; then
  echo "ERROR: Jira API token 파일이 없습니다: $JIRA_API_TOKEN_FILE" >&2
  exit 1
fi
if ! grep -q '[^[:space:]]' "$JIRA_API_TOKEN_FILE"; then
  echo "ERROR: Jira API token 파일이 비어 있습니다: $JIRA_API_TOKEN_FILE" >&2
  exit 1
fi
BASH_PATH="$(command -v bash)"
PLUGIN_DIR="$HOME/.codex/plugins/$PLUGIN_NAME"
MARKETPLACE_FILE="$HOME/.agents/plugins/marketplace.json"
echo
echo "============================================================"
echo " Yujaemin Local MCP"
echo "============================================================"
echo
echo "Project Root : $PROJECT_ROOT"
echo "Workspace    : $WORKSPACE_ROOT"
echo "Active       : $ACTIVE_PROJECT"
echo "Bash         : $BASH_PATH"
echo "Plugin Dir   : $PLUGIN_DIR"
echo
read -r -p "현재 프로젝트 및 부모 디렉터리 아래 하위 폴더에 MCP 접근을 허용할까요? [y/N] " CONFIRM
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
NODE_EXECUTABLE="$(node -p 'process.execPath')"
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
# 기존 설정을 설치 시작 전에 비우지 않도록 임시 파일로 검증 후 교체합니다.
CONFIG_TEMP="$(mktemp "$PLUGIN_DIR/.config.json.XXXXXX")"
if ! PROJECT_ROOT="$PROJECT_ROOT" WORKSPACE_ROOT="$WORKSPACE_ROOT" BASH_PATH="$BASH_PATH" node -e '
const fs = require("node:fs");
const path = require("node:path");
const activeRoot = fs.realpathSync(process.env.PROJECT_ROOT);
const workspaceRoot = fs.realpathSync(process.env.WORKSPACE_ROOT);
const activeProject = path.basename(activeRoot);
function approvedScripts(root) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).scripts || {};
  } catch (error) {
    if (error.code === "ENOENT") return {};
    throw error;
  }
}
const projects = {};
for (const entry of fs.readdirSync(workspaceRoot, { withFileTypes: true })) {
  // 숨김 디렉터리와 symlink는 제외해 예상치 못한 경로 접근을 방지합니다.
  if (!entry.isDirectory() || entry.name.startsWith(".")) continue;
  const root = path.join(workspaceRoot, entry.name);
  const real = fs.realpathSync(root);
  if (path.dirname(real) !== workspaceRoot) continue;
  const project = {
    root: real,
    jiraProjectKey: entry.name === "calendar" ? "CAL" : entry.name === "devlog" ? "DEVLOG" : entry.name.toUpperCase(),
    approvedScripts: approvedScripts(real)
  };
  if (entry.name === "calendar") project.apiBaseUrl = "http://127.0.0.1:3000";
  projects[entry.name] = project;
}
if (!projects[activeProject]) throw new Error("현재 프로젝트 폴더를 탐색하지 못했습니다: " + activeRoot);
const config = {
  projectRoot: activeRoot,
  allowedRoot: workspaceRoot,
  instructionsRoot: activeRoot,
  jiraCredentialsRoot: activeRoot,
  activeProject,
  projects,
  approvedScripts: projects[activeProject].approvedScripts,
  gitBashPath: process.env.BASH_PATH
};
process.stdout.write(JSON.stringify(config, null, 2));
'  > "$CONFIG_TEMP"; then
  rm -f "$CONFIG_TEMP"
  echo "ERROR: 프로젝트 설정 생성에 실패했습니다. 기존 config.json은 보존됩니다." >&2
  exit 1
fi
if ! node -e 'JSON.parse(require("node:fs").readFileSync(process.argv[1], "utf8"))' "$CONFIG_TEMP"; then
  rm -f "$CONFIG_TEMP"
  echo "ERROR: 생성된 프로젝트 설정 JSON이 올바르지 않습니다." >&2
  exit 1
fi
if ! mv -f "$CONFIG_TEMP" "$PLUGIN_DIR/config.json"; then
  rm -f "$CONFIG_TEMP"
  echo "ERROR: 검증된 프로젝트 설정을 적용하지 못했습니다." >&2
  exit 1
fi

# ============================================================
# MCP Server
# ============================================================

echo
echo "[4/9] MCP 서버 생성..."
rm -rf "$PLUGIN_DIR/mcp-src"
cp -R "$MCP_SOURCE_DIR" "$PLUGIN_DIR/mcp-src"
# Keep the generated MCP server version in sync with PLUGIN_VERSION.
PLUGIN_VERSION="$PLUGIN_VERSION" MCP_SERVER_FILE="$PLUGIN_DIR/mcp-src/server.mjs" node <<'NODE'
const fs = require("node:fs");
const file = process.env.MCP_SERVER_FILE;
const version = process.env.PLUGIN_VERSION;
const source = fs.readFileSync(file, "utf8");
const marker = 'version: "__PLUGIN_VERSION__"';
if (!source.includes(marker)) throw new Error("MCP version marker not found");
fs.writeFileSync(file, source.replace(marker, `version: "${version}"`), "utf8");
NODE

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
npx esbuild mcp-src/server.mjs \
  --bundle \
  --platform=node \
  --format=esm \
  --outfile=server.mjs
# Verify the built server before removing the SDK/build dependencies.
node --check mcp-src/server.mjs
node --check server.mjs
cat > verify-mcp.mjs <<'MCP_VERIFY'
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const logPath = path.join(here, "mcp-verify-failure.log");
const client = new Client({ name: "installer-check", version: "1.0.0" });
const transport = new StdioClientTransport({
  command: process.execPath,
  args: [path.join(here, "server.mjs")],
  cwd: here,
  stderr: "pipe"
});
let stderr = "";
let phase = "initialize";
let timeout;
const deadline = new Promise((_, reject) => {
  timeout = setTimeout(() => reject(new Error("MCP verification timed out after 30 seconds")), 30000);
});
try {
  const check = async () => {
    // connect performs initialize and sends notifications/initialized.
    const connected = client.connect(transport);
    transport.stderr?.on("data", chunk => {
      stderr = (stderr + chunk.toString()).slice(-65536);
    });
    await connected;
    phase = "tools/list";
    const names = new Set();
    const cursors = new Set();
    let cursor;
    do {
      const result = await client.listTools(cursor ? { cursor } : {});
      for (const tool of result.tools) names.add(tool.name);
      cursor = result.nextCursor;
      if (cursor && cursors.has(cursor)) throw new Error("Repeated tools/list cursor");
      if (cursor) cursors.add(cursor);
    } while (cursor);
    for (const name of ["list_files", "read_file", "rename_file", "copy_image", "list_projects", "switch_project", "git_init", "github_create_repo", "jira_create_project", "http_request", "start_dev_server", "dev_server_status", "stop_dev_server", "git_auth_status", "git_add", "git_commit", "git_push", "jira_status", "jira_list_projects", "jira_create_issue", "jira_create_subtask", "jira_update_issue", "jira_delete_issue", "jira_assign_issue", "jira_list_transitions", "jira_transition_issue"]) {
      if (!names.has(name)) throw new Error(`Missing required tool: ${name}`);
    }
    if (!names.size) throw new Error("No tools registered");
    await fs.rm(logPath, { force: true });
    console.log(`MCP initialize/tools/list OK: ${names.size} tools; Git/Jira tools registered`);
  };
  await Promise.race([check(), deadline]);
} catch (error) {
  await fs.writeFile(logPath, `${new Date().toISOString()} phase=${phase}\n${error.stack || error}\nServer stderr (last 64 KiB):\n${stderr}\n`, { mode: 0o600 });
  console.error(`MCP verification failed (${phase}). Log: ${logPath}`);
  process.exitCode = 1;
} finally {
  clearTimeout(timeout);
  // Bound cleanup too, so a failed server cannot leave the installer hanging.
  const forcedExit = setTimeout(() => process.exit(process.exitCode || 0), 5000);
  try { await client.close(); await transport.close(); }
  finally { clearTimeout(forcedExit); }
}
MCP_VERIFY
if ! node verify-mcp.mjs; then
  echo "ERROR: MCP 검증 실패. $PLUGIN_DIR/mcp-verify-failure.log 를 확인하세요." >&2
  exit 1
fi
rm -f verify-mcp.mjs
rm -rf mcp-src
rm -rf node_modules
rm -f package.json
rm -f package-lock.json

# ============================================================
# VS Code MCP config
# ============================================================

echo
echo "[6/9] VS Code .vscode/mcp.json 생성..."
VSCODE_CONFIG_PATH="$PROJECT_ROOT/.vscode/mcp.json" \
NODE_EXECUTABLE="$NODE_EXECUTABLE" \
MCP_SERVER_PATH="$PLUGIN_DIR/server.mjs" \
MCP_SERVER_CWD="$PLUGIN_DIR" \
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
{
  config.servers["yujaemin-local"] = {
    type: "stdio",
    command: process.env.NODE_EXECUTABLE,
    args: [process.env.MCP_SERVER_PATH],
    cwd: process.env.MCP_SERVER_CWD
  };
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(config, null, 2) + "\n");
}
NODE

# ============================================================
# MCP config
# ============================================================

echo
echo "[7/9] .mcp.json 생성..."
NODE_EXECUTABLE="$NODE_EXECUTABLE" \
MCP_SERVER_PATH="$PLUGIN_DIR/server.mjs" \
MCP_SERVER_CWD="$PLUGIN_DIR" \
node <<'NODE'
const fs = require("fs");
const config = {
  mcpServers: {
    "yujaemin-local": {
      command: process.env.NODE_EXECUTABLE,
      args: [process.env.MCP_SERVER_PATH],
      cwd: process.env.MCP_SERVER_CWD
    }
  }
};
fs.writeFileSync(
  ".mcp.json",
  JSON.stringify(config, null, 2) + "\n",
  "utf8"
);
NODE

# ============================================================
# Plugin manifest
# ============================================================

echo
echo "[8/9] 플러그인 manifest 생성..."
PLUGIN_VERSION="$PLUGIN_VERSION" node <<'NODE'
const fs = require("fs");
const manifest = {
  name: "yujaemin-local",
  version: process.env.PLUGIN_VERSION,
  description: "Local project development tools with nvm-managed Node.js",
  mcpServers: "./.mcp.json",
  interface: {
    displayName: "Yujaemin Local",
    shortDescription: "Local project development tools",
    developerName: "Yujaemin",
    category: "Developer Tools",
    capabilities: ["Read", "Write"]
  }
};
fs.writeFileSync(
  ".codex-plugin/plugin.json",
  JSON.stringify(manifest, null, 2) + "\n",
  "utf8"
);
NODE

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
        `${process.env.HOME}/.codex/plugins/${pluginName}`
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

# ============================================================
# OpenAI tunnel-client (macOS)
# ============================================================

echo
echo "[10/10] OpenAI tunnel-client 설정..."
TUNNEL_LOG="$PLUGIN_DIR/tunnel-client.log"
TUNNEL_ERR_LOG="$PLUGIN_DIR/tunnel-client.log.err"
TUNNEL_PID_FILE="$PLUGIN_DIR/tunnel-client.pid"
TUNNEL_API_KEY_FILE="$PROJECT_ROOT/.tunnel-client-api-key"
CONTROL_PLANE_TUNNEL_ID="${CONTROL_PLANE_TUNNEL_ID:-tunnel_6ae6bfebf3e08191926f057184e3a9db}"
TUNNEL_READY_URL="http://127.0.0.1:8080/readyz"
MCP_COMMAND="command=$NODE_EXECUTABLE $PLUGIN_DIR/server.mjs,channel=main"

# Provide TUNNEL_CLIENT_BIN explicitly if automatic discovery fails.
TUNNEL_CLIENT_BIN="${TUNNEL_CLIENT_BIN:-}"
if [ -z "$TUNNEL_CLIENT_BIN" ]; then
  if command -v tunnel-client >/dev/null 2>&1; then
    TUNNEL_CLIENT_BIN="$(command -v tunnel-client)"
  else
    for CANDIDATE in \
      "$HOME/Downloads/tunnel-client-darwin-arm64/tunnel-client" \
      "$HOME/Downloads/tunnel-client-darwin-amd64/tunnel-client" \
      "$HOME/Downloads/tunnel-client/tunnel-client" \
      "$HOME/bin/tunnel-client"; do
      if [ -f "$CANDIDATE" ]; then TUNNEL_CLIENT_BIN="$CANDIDATE"; break; fi
    done
  fi
fi

if [ -z "$TUNNEL_CLIENT_BIN" ] || [ ! -f "$TUNNEL_CLIENT_BIN" ]; then
  echo "안내: macOS tunnel-client 바이너리를 찾지 못했습니다. MCP 설치는 완료되며 터널 시작은 건너뜁니다."
  echo "macOS용 바이너리를 받은 후 TUNNEL_CLIENT_BIN=/absolute/path/tunnel-client 를 설정하여 재실행하세요."
elif [ ! -s "$TUNNEL_API_KEY_FILE" ]; then
  echo "안내: $TUNNEL_API_KEY_FILE 이 없어 터널 시작을 건너뜁니다."
else
  chmod +x "$TUNNEL_CLIENT_BIN"
  CONTROL_PLANE_API_KEY="$(tr -d '\r\n' < "$TUNNEL_API_KEY_FILE")"
  if [ -z "$CONTROL_PLANE_API_KEY" ]; then
    echo "ERROR: tunnel API key file is empty" >&2
    exit 1
  fi
  echo "tunnel-client doctor 실행..."
  ( cd "$(dirname "$TUNNEL_CLIENT_BIN")" && \
    MCP_COMMAND="$MCP_COMMAND" CONTROL_PLANE_TUNNEL_ID="$CONTROL_PLANE_TUNNEL_ID" \
    CONTROL_PLANE_API_KEY="$CONTROL_PLANE_API_KEY" "$TUNNEL_CLIENT_BIN" doctor )

  if [ -f "$TUNNEL_PID_FILE" ]; then
    OLD_PID="$(cat "$TUNNEL_PID_FILE")"
    if [[ "$OLD_PID" =~ ^[0-9]+$ ]] && kill -0 "$OLD_PID" 2>/dev/null; then
      echo "기존 관리 대상 tunnel-client 종료 (PID: $OLD_PID)"
      kill "$OLD_PID" 2>/dev/null || true
      for ((i=0; i<10; i++)); do
        if ! kill -0 "$OLD_PID" 2>/dev/null; then break; fi
        sleep 1
      done
      if kill -0 "$OLD_PID" 2>/dev/null; then
        echo "ERROR: 기존 터널이 종료되지 않았습니다. 다른 프로세스는 강제로 종료하지 않습니다." >&2
        exit 1
      fi
    fi
  fi
  rm -f "$TUNNEL_LOG" "$TUNNEL_ERR_LOG"
  echo "tunnel-client 백그라운드 실행..."
  ( cd "$(dirname "$TUNNEL_CLIENT_BIN")" && \
    MCP_COMMAND="$MCP_COMMAND" CONTROL_PLANE_TUNNEL_ID="$CONTROL_PLANE_TUNNEL_ID" \
    CONTROL_PLANE_API_KEY="$CONTROL_PLANE_API_KEY" \
    nohup "$TUNNEL_CLIENT_BIN" run >"$TUNNEL_LOG" 2>"$TUNNEL_ERR_LOG" </dev/null & \
    echo $! > "$TUNNEL_PID_FILE" )
  TUNNEL_PID="$(cat "$TUNNEL_PID_FILE")"
  TUNNEL_READY=0
  for ((i=1; i<=30; i++)); do
    if ! kill -0 "$TUNNEL_PID" 2>/dev/null; then
      echo "ERROR: tunnel-client 프로세스가 종료되었습니다." >&2
      tail -n 30 "$TUNNEL_ERR_LOG" "$TUNNEL_LOG" 2>/dev/null || true
      exit 1
    fi
    if curl -fsS --max-time 2 "$TUNNEL_READY_URL" >/dev/null 2>&1; then
      TUNNEL_READY=1
      break
    fi
    sleep 1
  done
  if [ "$TUNNEL_READY" -ne 1 ]; then
    echo "ERROR: 30초 안에 tunnel-client ready 상태를 확인하지 못했습니다." >&2
    tail -n 30 "$TUNNEL_ERR_LOG" "$TUNNEL_LOG" 2>/dev/null || true
    exit 1
  fi
  echo "tunnel-client 연결 확인 완료 (/readyz = 200)"
fi

echo
echo "============================================================"
echo " Yujaemin Local MCP 설치 완료 (macOS)"
echo "============================================================"
echo "Version: $PLUGIN_VERSION"
echo "Project: $PROJECT_ROOT"
echo "Plugin: $PLUGIN_DIR"
echo "Marketplace: $MARKETPLACE_FILE"
echo
echo "ChatGPT Desktop를 완전히 종료 후 재시작해 Yujaemin Local 플러그인을 확인하세요."
echo "VS Code: Command+Shift+P > MCP: List Servers > yujaemin-local"
echo "============================================================"
