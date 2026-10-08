#!/usr/bin/env bash

set -euo pipefail

# ============================================================
# Yujaemin Local MCP installer
# Windows + Git Bash + ChatGPT Desktop
# ============================================================

PLUGIN_NAME="yujaemin-local"
PLUGIN_VERSION="1.2.7"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MCP_SOURCE_DIR="$SCRIPT_DIR/mcp-src"
if [ ! -f "$MCP_SOURCE_DIR/server.mjs" ]; then
  echo "ERROR: MCP 개발 소스를 찾을 수 없습니다: $MCP_SOURCE_DIR/server.mjs" >&2
  exit 1
fi
PROJECT_ROOT="$(pwd -W 2>/dev/null || pwd)"
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
PROJECT_ROOT="$PROJECT_ROOT" BASH_PATH="$BASH_PATH" node -e '
const config = {
  projectRoot: process.env.PROJECT_ROOT,
  allowedRoot: process.env.PROJECT_ROOT,
  approvedScripts: JSON.parse(require("fs").readFileSync(require("path").join(process.env.PROJECT_ROOT, "package.json"), "utf8")).scripts,
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
    for (const name of ["list_files", "read_file", "rename_file", "copy_image", "start_dev_server", "dev_server_status", "stop_dev_server", "git_auth_status", "git_add", "git_commit", "git_push", "jira_status", "jira_list_projects", "jira_create_issue", "jira_create_subtask", "jira_update_issue", "jira_delete_issue", "jira_assign_issue", "jira_list_transitions", "jira_transition_issue"]) {
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
VSCODE_CONFIG_PATH="$(cygpath -w "$PROJECT_ROOT/.vscode/mcp.json")" \
NODE_EXECUTABLE="$NODE_EXECUTABLE" \
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
NODE_EXECUTABLE="$NODE_EXECUTABLE" \
MCP_SERVER_PATH="$(cygpath -w "$PLUGIN_DIR/server.mjs")" \
MCP_SERVER_CWD="$(cygpath -w "$PLUGIN_DIR")" \
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

# ============================================================
# OpenAI tunnel-client restart
# ============================================================

echo
echo "[10/10] OpenAI tunnel-client 재시작..."
TUNNEL_CLIENT_DIR="/c/Users/jaemi/Downloads/tunnel-client-v0.0.15-windows-amd64"
TUNNEL_CLIENT_EXE="$TUNNEL_CLIENT_DIR/tunnel-client.exe"
CONTROL_PLANE_TUNNEL_ID="tunnel_6ac4b1cabb1c81918b63712568faac31"
MCP_COMMAND='command=node C:/Users/jaemi/.codex/plugins/yujaemin-local/server.mjs,channel=main'
TUNNEL_LOG="$PLUGIN_DIR/tunnel-client.log"
TUNNEL_ERR_LOG="$PLUGIN_DIR/tunnel-client.log.err"
TUNNEL_API_KEY_FILE="$PROJECT_ROOT/.tunnel-client-api-key"
TUNNEL_CLIENT_WIN="$(cygpath -w "$TUNNEL_CLIENT_EXE")"
TUNNEL_LOG_WIN="$(cygpath -w "$TUNNEL_LOG")"
TUNNEL_ERR_LOG_WIN="$(cygpath -w "$TUNNEL_ERR_LOG")"
TUNNEL_READY_URL="http://127.0.0.1:8080/readyz"
TUNNEL_START_TIMEOUT_SECONDS=30
TUNNEL_STOP_TIMEOUT_SECONDS=10
TUNNEL_LOG_DELETE_RETRIES=10
if [ ! -f "$TUNNEL_API_KEY_FILE" ]; then
  echo "ERROR: tunnel-client API 키 파일이 없습니다: $TUNNEL_API_KEY_FILE"
  exit 1
fi
CONTROL_PLANE_API_KEY="$(tr -d '\r\n' < "$TUNNEL_API_KEY_FILE")"
if [ -z "$CONTROL_PLANE_API_KEY" ]; then
  echo "ERROR: tunnel-client API 키 파일이 비어 있습니다."
  exit 1
fi
if [ ! -f "$TUNNEL_CLIENT_EXE" ]; then
  echo "ERROR: tunnel-client.exe를 찾을 수 없습니다: $TUNNEL_CLIENT_EXE"
  exit 1
fi
echo "기존 tunnel-client 종료..."
powershell.exe -NoProfile -Command \
  "Get-Process tunnel-client -ErrorAction SilentlyContinue | Stop-Process -Force" \
  >/dev/null 2>&1 || true
# Stop-Process 직후 Windows에서 프로세스 종료와 로그 파일 핸들 해제가
# 늦게 끝날 수 있으므로 실제 프로세스 종료까지 확인한다.
for ((i=1; i<=TUNNEL_STOP_TIMEOUT_SECONDS; i++)); do
  if powershell.exe -NoProfile -Command \
    "if (Get-Process tunnel-client -ErrorAction SilentlyContinue) { exit 1 } else { exit 0 }" \
    >/dev/null 2>&1; then
    break
  fi
  echo "tunnel-client 종료 대기 중... ($i/$TUNNEL_STOP_TIMEOUT_SECONDS)"
  sleep 1
done
if ! powershell.exe -NoProfile -Command \
  "if (Get-Process tunnel-client -ErrorAction SilentlyContinue) { exit 1 } else { exit 0 }" \
  >/dev/null 2>&1; then
  echo "ERROR: 기존 tunnel-client 프로세스를 완전히 종료하지 못했습니다."
  powershell.exe -NoProfile -Command \
    "Get-Process tunnel-client -ErrorAction SilentlyContinue | Select-Object Id, ProcessName, Path" \
    || true
  exit 1
fi
# 이전 실행 로그가 새 실행 결과로 오인되지 않도록 정리한다.
# Windows 파일 핸들 해제가 지연될 수 있으므로 삭제를 재시도한다.
for ((i=1; i<=TUNNEL_LOG_DELETE_RETRIES; i++)); do
  if rm -f "$TUNNEL_LOG" "$TUNNEL_ERR_LOG" 2>/dev/null; then
    break
  fi
  echo "tunnel-client 로그 파일 사용 중 - 삭제 재시도 ($i/$TUNNEL_LOG_DELETE_RETRIES)"
  sleep 1
done
if [ -e "$TUNNEL_LOG" ] || [ -e "$TUNNEL_ERR_LOG" ]; then
  echo "ERROR: 기존 tunnel-client 로그 파일을 정리하지 못했습니다."
  echo "  stdout: $TUNNEL_LOG"
  echo "  stderr: $TUNNEL_ERR_LOG"
  echo
  echo "가능한 원인:"
  echo "  tunnel-client 종료 후에도 Yujaemin Local MCP의 node.exe가 고아 프로세스로 남아"
  echo "  tunnel-client.log 또는 tunnel-client.log.err 파일 핸들을 잡고 있을 수 있습니다."
  echo
  echo "현재 남아 있는 Yujaemin Local MCP node 프로세스:"
  powershell.exe -NoProfile -Command \
    "Get-CimInstance Win32_Process | Where-Object { \$_.Name -eq 'node.exe' -and \$_.CommandLine -like '*yujaemin-local*server.mjs*' } | Select-Object ProcessId, ParentProcessId, Name, CommandLine" \
    || true
  echo
  echo "PowerShell에서 아래 명령으로 고아 MCP 프로세스를 종료한 뒤 mcp-create.sh를 다시 실행하세요:"
  echo
  echo "Get-CimInstance Win32_Process |"
  echo "Where-Object {"
  echo '    $_.Name -eq "node.exe" -and'
  echo '    $_.CommandLine -like "*yujaemin-local*server.mjs*"'
  echo "} |"
  echo "ForEach-Object {"
  echo '    taskkill /PID $_.ProcessId /T /F'
  echo "}"
  echo
  echo "종료 후 같은 조회 명령에서 아무 프로세스도 나오지 않는지 확인하세요."
  exit 1
fi
echo "기존 tunnel-client 종료 및 로그 정리 완료"
echo "tunnel-client doctor 실행..."
(
  cd "$TUNNEL_CLIENT_DIR"
  MCP_COMMAND="$MCP_COMMAND" \
  CONTROL_PLANE_TUNNEL_ID="$CONTROL_PLANE_TUNNEL_ID" \
  CONTROL_PLANE_API_KEY="$CONTROL_PLANE_API_KEY" \
  ./tunnel-client.exe doctor
)
echo "tunnel-client 백그라운드 실행..."
export MCP_COMMAND CONTROL_PLANE_TUNNEL_ID CONTROL_PLANE_API_KEY
powershell.exe -NoProfile -Command \
  "\$env:MCP_COMMAND='$MCP_COMMAND'; \$env:CONTROL_PLANE_TUNNEL_ID='$CONTROL_PLANE_TUNNEL_ID'; Start-Process -FilePath '$TUNNEL_CLIENT_WIN' -ArgumentList 'run' -WindowStyle Hidden -RedirectStandardOutput '$TUNNEL_LOG_WIN' -RedirectStandardError '$TUNNEL_ERR_LOG_WIN'"
TUNNEL_READY=0
for ((i=1; i<=TUNNEL_START_TIMEOUT_SECONDS; i++)); do
  if ! powershell.exe -NoProfile -Command \
    "if (Get-Process tunnel-client -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }" \
    >/dev/null 2>&1; then
    echo "ERROR: tunnel-client 프로세스가 시작 후 종료되었습니다."
    if [ -s "$TUNNEL_ERR_LOG" ]; then
      echo "tunnel-client 오류 로그:"
      tail -n 30 "$TUNNEL_ERR_LOG"
    elif [ -s "$TUNNEL_LOG" ]; then
      echo "tunnel-client 로그:"
      tail -n 30 "$TUNNEL_LOG"
    fi
    exit 1
  fi
  # /readyz 200은 MCP 준비와 control-plane polling이 실제로 시작되었음을 의미한다.
  if powershell.exe -NoProfile -Command \
    "try { \$response = Invoke-WebRequest -UseBasicParsing -Uri '$TUNNEL_READY_URL' -TimeoutSec 2; if (\$response.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" \
    >/dev/null 2>&1; then
    TUNNEL_READY=1
    break
  fi
  sleep 1
done
if [ "$TUNNEL_READY" -ne 1 ]; then
  echo "ERROR: tunnel-client가 ${TUNNEL_START_TIMEOUT_SECONDS}초 안에 ready 상태가 되지 않았습니다."
  echo "ready 확인 URL: $TUNNEL_READY_URL"
  if [ -s "$TUNNEL_ERR_LOG" ]; then
    echo "tunnel-client 오류 로그:"
    tail -n 30 "$TUNNEL_ERR_LOG"
  elif [ -s "$TUNNEL_LOG" ]; then
    echo "tunnel-client 최근 로그:"
    tail -n 30 "$TUNNEL_LOG"
  else
    echo "tunnel-client 로그가 생성되지 않았습니다."
  fi
  exit 1
fi
echo "tunnel-client 연결 확인 완료 (/readyz = 200)"
echo "로그: $TUNNEL_LOG"
if [ -s "$TUNNEL_ERR_LOG" ]; then
  echo "참고: stderr 로그가 존재합니다. 필요하면 확인하세요: $TUNNEL_ERR_LOG"
fi
echo
echo "============================================================"
echo " Yujaemin Local MCP 설치 완료"
echo "============================================================"
echo
echo "Version:"
echo "  $PLUGIN_VERSION"
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
