#!/usr/bin/env bash
set -euo pipefail



# ============================================================

# Yujaemin Local MCP installer

# Windows + Git Bash + ChatGPT Desktop

# ============================================================



PLUGIN_NAME="yujaemin-local"

PLUGIN_VERSION="1.2.5"



PROJECT_ROOT="$(pwd -W 2>/dev/null || pwd)"

PROJECT_INSTRUCTIONS_FILE="$PROJECT_ROOT/docs/LOCAL_MCP_INSTRUCTIONS.md"
if [ ! -f "$PROJECT_INSTRUCTIONS_FILE" ] || [ ! -r "$PROJECT_INSTRUCTIONS_FILE" ]; then
  echo "ERROR: 필수 MCP 지침 문서가 없거나 읽을 수 없습니다: $PROJECT_INSTRUCTIONS_FILE" >&2
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



cat > "$PLUGIN_DIR/server-src.mjs" <<'MCP_SERVER'

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { z } from "zod";



import fs from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { createHash } from "node:crypto";

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



const ROOT = path.resolve(config.allowedRoot ?? config.projectRoot);

const ROOT_REAL = await fs.realpath(ROOT);

// Load the project-specific MCP handoff/instructions on every server start.
// This keeps new ChatGPT sessions aligned with the rules documented in the repository.
const PROJECT_INSTRUCTIONS_FILE = path.join(ROOT, "docs", "LOCAL_MCP_INSTRUCTIONS.md");
const projectInstructions = await fs.readFile(PROJECT_INSTRUCTIONS_FILE, "utf8");

const GIT_BASH = config.gitBashPath;





/* ============================================================

 * Path security

 * ============================================================ */



function isInside(base, target) {

  const relative = path.relative(base, target);



  return (

    relative === "" ||

    (

      relative !== ".." && !relative.startsWith(`..${path.sep}`) &&

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

  if (typeof relativePath !== "string" || !relativePath ||

      relativePath.includes("\0") || path.isAbsolute(relativePath) ||

      /^[A-Za-z]:/.test(relativePath) || relativePath.includes(":") ||

      relativePath.split(/[\\/]/).some(part => part === ".." || /[. ]$/.test(part) && part !== "." || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\\.|$)/i.test(part))) {

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



  let cursor = ROOT;

  for (const part of path.relative(ROOT, target).split(path.sep).filter(Boolean)) {

    cursor = path.join(cursor, part);

    try {

      const stat = await fs.lstat(cursor);

      if (stat.isSymbolicLink()) throw new Error("Symbolic links/junctions are not allowed");

    } catch (error) { if (error.code !== "ENOENT") throw error; }

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

    version: "__PLUGIN_VERSION__"

  },

  {

    instructions: `

Yujaemin Local 개발 프로젝트용 MCP입니다.



프로젝트 파일을 수정하기 전에 관련 파일을 먼저 읽으세요.

기존 코드의 구조와 스타일을 최대한 유지하세요.

가능하면 replace_text를 사용하고 전체 파일 덮어쓰기는 최소화하세요.



명령 실행은 Git 조회, 허용된 npm 검증 스크립트, Node 버전 조회로 제한됩니다.

프로젝트 파일 도구는 프로젝트 루트 내부에서만 사용하세요.

nvm_status로 Node.js 환경을 조회하세요. nvm 변경 도구는 비활성화되어 있습니다. nvm 도구는 설정된 nvm 설치 폴더를 사용하며 Windows 권한을 높이지 않습니다.

아래는 프로젝트의 docs/LOCAL_MCP_INSTRUCTIONS.md 내용입니다. 이 지침을 작업 전에 확인하고 따르세요.

${projectInstructions}
`

  }

);





const definitions = new Map();

const registerTool = server.registerTool.bind(server);

server.registerTool = (name, options, handler) => {

  definitions.set(name, { options, handler });

  return registerTool(name, options, handler);

};



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

      { encoding: "utf8", flag: overwrite ? "w" : "wx" }

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
 * copy_image
 * ============================================================ */

server.registerTool("copy_image", {
  title: "Copy image into project",
  description: "지정한 절대 경로의 PNG/JPEG/WebP를 프로젝트 public 내부로 복사합니다. 대상이 있으면 확인 정보를 반환합니다. 사용자 확인 후 overwrite=true와 반환된 expectedTargetHash로 다시 호출하세요. 원본 유지, 최대 20MB.",
  inputSchema: {
    sourceFile: z.string(), file: z.string(),
    overwrite: z.boolean().default(false),
    expectedTargetHash: z.string().optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
}, async ({ sourceFile, file, overwrite = false, expectedTargetHash }) => {
  if (!path.isAbsolute(sourceFile)) throw new Error("원본 이미지의 절대 경로를 지정하세요.");
  const source = path.resolve(sourceFile);
  let cursor = path.parse(source).root;
  for (const part of path.relative(cursor, source).split(path.sep).filter(Boolean)) {
    cursor = path.join(cursor, part);
    if ((await fs.lstat(cursor)).isSymbolicLink()) throw new Error("이미지 심볼릭 링크는 허용하지 않습니다.");
  }
  const stat = await fs.lstat(source);
  if (!stat.isFile() || stat.size > 20 * 1024 * 1024) throw new Error("20MB 이하 일반 이미지 파일만 복사할 수 있습니다.");
  const extension = path.extname(source).toLowerCase();
  if (![".png", ".jpg", ".jpeg", ".webp"].includes(extension)) throw new Error("PNG/JPEG/WebP만 허용합니다.");
  const destination = await safePath(file);
  const publicRoot = path.join(ROOT, "public");
  if (!isInside(publicRoot, destination) || destination === publicRoot) throw new Error("public 내부만 복사할 수 있습니다.");
  if (source === destination || await fs.realpath(source) === await fs.realpath(destination).catch(error => {
    if (error.code === "ENOENT") return null;
    throw error;
  })) throw new Error("원본과 대상이 같습니다.");
  const targetExtension = path.extname(destination).toLowerCase();
  if (targetExtension !== extension && !([".jpg", ".jpeg"].includes(extension) && [".jpg", ".jpeg"].includes(targetExtension))) {
    throw new Error("원본과 대상 이미지 확장자가 일치해야 합니다.");
  }
  const handle = await fs.open(source, "r");
  const header = Buffer.alloc(12);
  try { await handle.read(header, 0, 12, 0); } finally { await handle.close(); }
  const valid = extension === ".png"
    ? header.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    : extension === ".webp"
      ? header.toString("ascii", 0, 4) === "RIFF" && header.toString("ascii", 8, 12) === "WEBP"
      : header[0] === 255 && header[1] === 216 && header[2] === 255;
  if (!valid) throw new Error("파일 내용이 이미지 확장자와 일치하지 않습니다.");
  let targetStat;
  try { targetStat = await fs.lstat(destination); } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  let overwritten = false;
  if (targetStat) {
    if (!targetStat.isFile() || targetStat.size > 20 * 1024 * 1024) throw new Error("덮어쓰기 대상은 20MB 이하 일반 파일이어야 합니다.");
    const hash = createHash("sha256").update(await fs.readFile(destination)).digest("hex");
    if (!overwrite || expectedTargetHash !== hash) {
      return {
        structuredContent: { status: "confirmation_required", file, sourceFile, sourceBytes: stat.size, targetBytes: targetStat.size, expectedTargetHash: hash },
        content: [{ type: "text", text: `${file}이 이미 존재하거나 확인 후 변경되었습니다. 사용자에게 덮어쓰기를 확인한 뒤 overwrite=true와 expectedTargetHash=${hash}로 다시 호출하세요.` }],
      };
    }
    overwritten = true;
  }
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await safePath(file);
  await fs.copyFile(source, destination, overwritten ? 0 : fsConstants.COPYFILE_EXCL);
  return {
    structuredContent: { status: "copied", file, bytes: stat.size, overwritten },
    content: [{ type: "text", text: `${file} 이미지 ${overwritten ? "덮어쓰기" : "복사"} 완료 (${stat.size} bytes)` }],
  };
});/* ============================================================
 * rename_file
 * ============================================================ */

server.registerTool("rename_file", {
  title: "Rename project file",
  description: "프로젝트 내부 파일의 이름을 변경합니다. 대상 파일 덮어쓰기와 디렉터리 이동은 허용하지 않습니다.",
  inputSchema: {
    file: z.string(),
    newFile: z.string(),
  },
  annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
}, async ({ file, newFile }) => {
  const source = await safePath(file);
  const destination = await safePath(newFile);
  if (source === destination) throw new Error("기존 이름과 새 이름이 같습니다.");
  if (path.dirname(source) !== path.dirname(destination)) {
    throw new Error("같은 디렉터리 안에서만 파일 이름을 변경할 수 있습니다.");
  }
  const stat = await fs.lstat(source);
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new Error("일반 파일만 이름을 변경할 수 있습니다.");
  }
  // link fails atomically with EEXIST, preserving any existing destination.
  await fs.link(source, destination);
  try {
    await fs.unlink(source);
  } catch (error) {
    await fs.unlink(destination);
    throw error;
  }
  return {
    structuredContent: { file, newFile },
    content: [{ type: "text", text: `${file} → ${newFile} 이름 변경 완료` }],
  };
});

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

    if (Buffer.byteLength(original) > 2 * 1024 * 1024) throw new Error("File exceeds 2MB");



    const lineEnding =

      original.includes("\r\n")

        ? "\r\n"

        : "\n";



    const normalizeLineEndings = (value) =>

      value.replace(/\r\n|\r|\n/g, "\n");



    const normalizedOriginal =

      normalizeLineEndings(original);



    const normalizedOldText =

      normalizeLineEndings(oldText);



    const normalizedNewText =

      normalizeLineEndings(newText);



    let count = 0;

    let index = 0;



    while (true) {

      const found = normalizedOriginal.indexOf(

        normalizedOldText,

        index

      );



      if (found === -1) {

        break;

      }



      count++;



      index =

        found +

        normalizedOldText.length;

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



    const updatedNormalized =

      replaceAll

        ? normalizedOriginal

            .split(normalizedOldText)

            .join(normalizedNewText)

        : normalizedOriginal.replace(

            normalizedOldText,

            () => normalizedNewText

          );



    const updated =

      updatedNormalized.replace(

        /\n/g,

        lineEnding

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

  "target", ".nuxt", ".output", ".data"

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



    await safePath(path.relative(ROOT, full));

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

        await safePath(path.relative(ROOT, file));

        if ((await fs.stat(file)).size > 2 * 1024 * 1024) continue;

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

  for (const key of Object.keys(env)) {

    if (/^(NODE_OPTIONS|NODE_PATH|NPM_CONFIG_|npm_config_)/i.test(key)) delete env[key];

  }

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

  throw new Error("nvm mutation tools are disabled; manage Node.js locally");

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

  throw new Error("nvm mutation tools are disabled; manage Node.js locally");

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

  return "'" + String(value).replace(/'/g, "'\\''") + "'";

}



function blockObviouslyDangerousCommands(command, args) {

  const equal = expected => JSON.stringify(args) === JSON.stringify(expected);

  const gitFlags = {

    status: new Set(["--short", "--branch", "--porcelain", "--porcelain=v1"]),

    diff: new Set(["--stat", "--name-only", "--name-status", "--cached", "--staged"]),

    log: new Set(["--oneline", "--no-decorate"]),

  };

  if (command === "git" && gitFlags[args[0]] && args.slice(1).every(arg =>

      gitFlags[args[0]].has(arg) || args[0] === "log" && /^--max-count=([1-9]|[1-9][0-9]|100)$/.test(arg))) return;

  if (command === "node" && (equal(["--version"]) || equal(["-v"]))) return;

  if (command === "npm" && (equal(["--version"]) || equal(["test"]) ||

      args.length === 2 && args[0] === "run" && ["build", "dev", "lint", "typecheck", "test", "generate:pages"].includes(args[1]))) return;

  throw new Error("Command/arguments are not in the allowlist");

}



async function gitQuery(args, cwd = ".", timeoutSeconds = 30) {

  const workingDirectory = await safePath(cwd);

  const env = { ...process.env };

  for (const key of Object.keys(env)) if (/^GIT_/i.test(key)) delete env[key];

  env.GIT_CONFIG_NOSYSTEM = "1";

  env.GIT_CONFIG_GLOBAL = process.platform === "win32" ? "NUL" : "/dev/null";

  env.GIT_OPTIONAL_LOCKS = "0";

  // Keep global Git config isolated while explicitly enabling Git Credential Manager.
  // Git for Windows exposes it as the "manager" credential helper even when
  // the executable is not located relative to GIT_BASH.
  const credentialHelper = process.platform === "win32" ? "manager" : null;

  const invoke = values => executeProcess(GIT_BASH, ["--noprofile", "--norc", "-c",

    ["git", "-c", `safe.directory=${ROOT_REAL}`,
      ...(credentialHelper ? ["-c", `credential.helper=${credentialHelper}`] : []),
      ...values].map(shellQuote).join(" ")], { cwd: workingDirectory, env, timeoutSeconds });

  await safePath(".git");

  if (!(await fs.lstat(path.join(ROOT, ".git"))).isDirectory()) throw new Error("External Git/worktree metadata is not allowed");

  async function inspectMetadata(directory) {

    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {

      if (entry.isSymbolicLink()) throw new Error("Git metadata links are not allowed");

      if (entry.isDirectory()) await inspectMetadata(path.join(directory, entry.name));

    }

  }

  await inspectMetadata(path.join(ROOT, ".git"));

  const gitConfig = await fs.readFile(await safePath(".git/config"), "utf8");

  if (/^\s*\[include(?:if)?(?:\s|\])/im.test(gitConfig) || /^\s*(?:worktree|commondir)\s*=/im.test(gitConfig)) throw new Error("External Git configuration is not allowed");

  const top = await invoke(["rev-parse", "--show-toplevel"]);

  if (top.exitCode !== 0 || path.relative(ROOT_REAL, await fs.realpath(top.stdout.trim())) !== "") throw new Error("Git repository must equal allowedRoot");

  const metadata = await invoke(["rev-parse", "--path-format=absolute", "--git-common-dir"]);

  if (metadata.exitCode !== 0 || !isInside(ROOT_REAL, await fs.realpath(metadata.stdout.trim()))) throw new Error("External Git metadata is not allowed");

  try { await fs.lstat(path.join(ROOT, ".git", "objects", "info", "alternates")); throw new Error("Git alternates are not allowed"); }

  catch (error) { if (error.code !== "ENOENT") throw error; }

  return commandResult(await invoke(["--no-pager", "-c", "core.fsmonitor=false", "-c", "core.hooksPath=/dev/null",

    ...args.slice(0, 1), ...(args[0] === "diff" ? ["--no-ext-diff", "--no-textconv"] : []), ...args.slice(1)]));

}



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

  annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: true },

}, async ({ command, args, cwd, nodeVersion, timeoutSeconds }) => {

  blockObviouslyDangerousCommands(command, args);

  if (command === "git") return gitQuery(args, cwd, timeoutSeconds);

  const workingDirectory = await safePath(cwd);

  if (!(await fs.stat(workingDirectory)).isDirectory()) throw new Error("cwd must be a directory");

  if (command === "npm" && args[0] !== "--version") {

    if (path.relative(ROOT, workingDirectory) !== "") throw new Error("npm scripts run only at allowedRoot");

    const pkg = JSON.parse(await fs.readFile(await safePath("package.json"), "utf8"));

    if (JSON.stringify(pkg.scripts) !== JSON.stringify(config.approvedScripts)) throw new Error("package.json scripts changed; approve them locally in config.json before execution");

  }

  if (["node", "npm", "npx"].includes(command)) {

    const runtime = await resolveNodeRuntime(nodeVersion);

    const commandArgs = command === "npm" && args[0] !== "--version" ? ["--ignore-scripts", ...args] : [...args];

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

 * Background development server

 * ============================================================ */

let devServerProcess = null;
let devServerLogs = [];
let devServerStartedAt = null;

function appendDevServerLog(stream, chunk) {
  const text = chunk.toString();
  devServerLogs.push({ stream, text, at: new Date().toISOString() });
  if (devServerLogs.length > 200) devServerLogs = devServerLogs.slice(-200);
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
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
}, async ({ nodeVersion }) => {
  if (devServerProcess && devServerProcess.exitCode === null) {
    return { structuredContent: devServerSnapshot(), content: [{ type: "text", text: JSON.stringify(devServerSnapshot(), null, 2) }] };
  }

  const pkg = JSON.parse(await fs.readFile(await safePath("package.json"), "utf8"));
  if (JSON.stringify(pkg.scripts) !== JSON.stringify(config.approvedScripts)) {
    throw new Error("package.json scripts changed; approve them locally in config.json before execution");
  }
  if (!pkg.scripts?.dev) throw new Error("package.json does not define a dev script");

  const runtime = await resolveNodeRuntime(nodeVersion);
  const npmCli = path.join(runtime.directory, "node_modules", "npm", "bin", "npm-cli.js");
  if (!await isFile(npmCli)) throw new Error(`npm 실행 파일이 없습니다: ${npmCli}`);

  devServerLogs = [];
  devServerStartedAt = new Date().toISOString();
  const child = spawn(runtime.nodePath, [npmCli, "--ignore-scripts", "run", "dev"], {
    cwd: ROOT,
    env: runtimeEnv(runtime.directory),
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  devServerProcess = child;
  child.stdout?.on("data", chunk => appendDevServerLog("stdout", chunk));
  child.stderr?.on("data", chunk => appendDevServerLog("stderr", chunk));
  child.on("error", error => appendDevServerLog("error", String(error)));
  child.on("exit", (code, signal) => appendDevServerLog("exit", `code=${code} signal=${signal ?? ""}`));

  await new Promise(resolve => setTimeout(resolve, 1500));
  const snapshot = devServerSnapshot();
  return { structuredContent: snapshot, content: [{ type: "text", text: JSON.stringify(snapshot, null, 2) }] };
});

server.registerTool("dev_server_status", {
  title: "Development server status",
  description: "Show whether the managed development server is running and return its recent output.",
  inputSchema: {},
  annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
}, async () => {
  const snapshot = devServerSnapshot();
  return { structuredContent: snapshot, content: [{ type: "text", text: JSON.stringify(snapshot, null, 2) }] };
});

server.registerTool("stop_dev_server", {
  title: "Stop development server",
  description: "Stop the development server previously started by start_dev_server, including its child process tree on Windows.",
  inputSchema: {},
  annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
}, async () => {
  if (!devServerProcess || devServerProcess.exitCode !== null) {
    const snapshot = devServerSnapshot();
    return { structuredContent: snapshot, content: [{ type: "text", text: JSON.stringify(snapshot, null, 2) }] };
  }

  const pid = devServerProcess.pid;
  if (process.platform === "win32") {
    await new Promise((resolve, reject) => {
      const killer = spawn("taskkill", ["/PID", String(pid), "/T", "/F"], { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
      let stderr = "";
      killer.stderr?.on("data", chunk => { stderr += chunk.toString(); });
      killer.on("error", reject);
      killer.on("exit", code => code === 0 ? resolve() : reject(new Error(stderr || `taskkill failed with exit code ${code}`)));
    });
  } else {
    devServerProcess.kill("SIGTERM");
  }

  await new Promise(resolve => setTimeout(resolve, 500));
  const snapshot = devServerSnapshot();
  return { structuredContent: snapshot, content: [{ type: "text", text: JSON.stringify(snapshot, null, 2) }] };
});


/* ============================================================

 * Start MCP

 * ============================================================ */



// Public names share the existing handlers and their security checks.

for (const [alias, original] of Object.entries({ list_directory: "list_files", search_files: "search_text", edit_file: "replace_text", run_command: "run_dev_command" })) {

  const { options, handler } = definitions.get(original);

  server.registerTool(alias, options, handler);

}

const create = definitions.get("write_file");

server.registerTool("create_file", { ...create.options, inputSchema: { file: z.string(), content: z.string() } },

  args => create.handler({ ...args, overwrite: false }));

for (const command of ["status", "diff", "log"]) {

  server.registerTool(`git_${command}`, {

    title: `Git ${command}`, description: `Read project Git ${command}`,

    inputSchema: command === "log" ? { limit: z.number().int().min(1).max(100).default(20) }

      : command === "diff" ? { staged: z.boolean().default(false) } : {},

    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },

  }, args => gitQuery(command === "log" ? ["log", "--oneline", `--max-count=${args.limit}`]

    : command === "diff" ? ["diff", ...(args.staged ? ["--cached"] : [])] : ["status", "--short", "--branch"]));

}



server.registerTool("git_auth_status", {
  title: "Inspect Git authentication",
  description: "Inspect Git Bash and Git Credential Manager availability without exposing stored credentials.",
  inputSchema: {},
  annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
}, async () => {
  const candidates = process.platform === "win32"
    ? [
        path.join(path.dirname(GIT_BASH), "..", "mingw64", "bin", "git-credential-manager.exe"),
        path.join(path.dirname(GIT_BASH), "..", "mingw64", "bin", "git-credential-manager-core.exe"),
      ]
    : [];
  const candidateStatus = [];
  for (const candidate of candidates) {
    candidateStatus.push({ path: path.resolve(candidate), exists: await isFile(candidate) });
  }
  const env = { ...process.env };
  for (const key of Object.keys(env)) if (/^GIT_/i.test(key)) delete env[key];
  env.GIT_CONFIG_NOSYSTEM = "1";
  env.GIT_CONFIG_GLOBAL = process.platform === "win32" ? "NUL" : "/dev/null";
  const probe = command => executeProcess(GIT_BASH, ["--noprofile", "--norc", "-c", command], {
    cwd: ROOT, env, timeoutSeconds: 30,
  });
  const gitVersion = await probe("git --version");
  const manager = await probe("git credential-manager --version");
  const managerCore = manager.exitCode === 0 ? null : await probe("git credential-manager-core --version");
  const data = {
    gitBash: GIT_BASH,
    gitVersion,
    credentialManagerCandidates: candidateStatus,
    credentialManager: manager,
    credentialManagerCore: managerCore,
    note: "This tool reports availability only and never reads or prints stored credentials.",
  };
  return { structuredContent: data, content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});


server.registerTool("git_add", {

  title: "Git add",

  description: "Stage explicitly selected project files. Paths must stay inside the allowed project root.",

  inputSchema: {

    files: z.array(z.string().min(1)).min(1).max(100)

  },

  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },

}, async ({ files }) => {

  const normalized = [];

  for (const file of files) {

    const target = await safePath(file);

    normalized.push(path.relative(ROOT, target).replace(/\\/g, "/") || ".");

  }

  return gitQuery(["add", "--", ...normalized]);

});



server.registerTool("git_commit", {

  title: "Git commit",

  description: "Commit currently staged changes with the exact user-provided commit message.",

  inputSchema: {

    message: z.string().trim().min(1).max(500)

  },

  annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },

}, ({ message }) => gitQuery(["commit", "-m", message]));



server.registerTool("git_push", {

  title: "Git push",

  description: "Push the current branch to its configured upstream. Use only when the user explicitly asks to push. Force push and arbitrary remote/ref arguments are not supported.",

  inputSchema: {

    confirm: z.literal(true).describe("Must be true only after the user explicitly requested a push.")

  },

  annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: true },

}, ({ confirm }) => {

  if (confirm !== true) {

    throw new Error("Explicit push confirmation is required");

  }

  return gitQuery(["push"], ".", 120);

});





const transport =

  new StdioServerTransport();



await server.connect(

  transport

);

MCP_SERVER

# Keep the generated MCP server version in sync with PLUGIN_VERSION.
PLUGIN_VERSION="$PLUGIN_VERSION" MCP_SERVER_FILE="$PLUGIN_DIR/server-src.mjs" node <<'NODE'
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



npx esbuild server-src.mjs \
  --bundle \
  --platform=node \
  --format=esm \
  --outfile=server.mjs




# Verify the built server before removing the SDK/build dependencies.
node --check server-src.mjs
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
    for (const name of ["list_files", "read_file", "rename_file", "copy_image", "start_dev_server", "dev_server_status", "stop_dev_server", "git_auth_status", "git_add", "git_commit", "git_push"]) {
      if (!names.has(name)) throw new Error(`Missing required tool: ${name}`);
    }
    if (!names.size) throw new Error("No tools registered");
    await fs.rm(logPath, { force: true });
    console.log(`MCP initialize/tools/list OK: ${names.size} tools; git_add/git_commit/git_push registered`);
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
TUNNEL_API_KEY_FILE="$PROJECT_ROOT/.tunnel-client-api-key"

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

powershell.exe -NoProfile -Command "Get-Process tunnel-client -ErrorAction SilentlyContinue | Stop-Process -Force" >/dev/null 2>&1 || true
sleep 1

echo "tunnel-client doctor 실행..."
(
  cd "$TUNNEL_CLIENT_DIR"
  MCP_COMMAND="$MCP_COMMAND" CONTROL_PLANE_TUNNEL_ID="$CONTROL_PLANE_TUNNEL_ID" CONTROL_PLANE_API_KEY="$CONTROL_PLANE_API_KEY" ./tunnel-client.exe doctor
)

echo "tunnel-client 백그라운드 실행..."
TUNNEL_CLIENT_WIN="$(cygpath -w "$TUNNEL_CLIENT_EXE")"
TUNNEL_LOG_WIN="$(cygpath -w "$TUNNEL_LOG")"
TUNNEL_ERR_LOG="$TUNNEL_LOG.err"
TUNNEL_READY_URL="http://127.0.0.1:8080/readyz"
TUNNEL_START_TIMEOUT_SECONDS=30

# 이전 실행 로그의 성공/실패 메시지를 새 실행 결과로 오인하지 않도록 초기화한다.
rm -f "$TUNNEL_LOG" "$TUNNEL_ERR_LOG"

export MCP_COMMAND CONTROL_PLANE_TUNNEL_ID CONTROL_PLANE_API_KEY
powershell.exe -NoProfile -Command "\$env:MCP_COMMAND='$MCP_COMMAND'; \$env:CONTROL_PLANE_TUNNEL_ID='$CONTROL_PLANE_TUNNEL_ID'; Start-Process -FilePath '$TUNNEL_CLIENT_WIN' -ArgumentList 'run' -WindowStyle Hidden -RedirectStandardOutput '$TUNNEL_LOG_WIN' -RedirectStandardError '$TUNNEL_LOG_WIN.err'"

TUNNEL_READY=0
for ((i=1; i<=TUNNEL_START_TIMEOUT_SECONDS; i++)); do
  if ! powershell.exe -NoProfile -Command "if (Get-Process tunnel-client -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }" >/dev/null 2>&1; then
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
  if powershell.exe -NoProfile -Command "try { \$response = Invoke-WebRequest -UseBasicParsing -Uri '$TUNNEL_READY_URL' -TimeoutSec 2; if (\$response.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >/dev/null 2>&1; then
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