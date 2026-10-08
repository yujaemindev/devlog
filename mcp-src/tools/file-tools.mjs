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
  ".py",
]);

const IGNORE_DIRECTORY = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".vite",
  "coverage",
  "target",
  ".nuxt",
  ".output",
  ".data",
]);

export function registerFileTools({
  server,
  z,
  fs,
  path,
  root,
  safePath,
}) {
  async function walk(directory, files = []) {
    if (files.length >= 5000) {
      return files;
    }

    const entries = await fs.readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      if (files.length >= 5000) {
        break;
      }
      if (entry.isSymbolicLink()) {
        continue;
      }

      const full = path.join(directory, entry.name);
      await safePath(path.relative(root, full));

      if (entry.isDirectory()) {
        if (!IGNORE_DIRECTORY.has(entry.name)) {
          await walk(full, files);
        }
        continue;
      }

      const extension = path.extname(entry.name).toLowerCase();
      if (TEXT_EXTENSIONS.has(extension) || entry.name === "Dockerfile") {
        files.push(full);
      }
    }

    return files;
  }

  server.registerTool("create_directory", {
    title: "Create project directory",
    description: "프로젝트 루트 내부에 새 디렉터리 하나를 생성합니다. 상위 폴더는 이미 존재해야 하고 심볼릭 링크는 허용하지 않습니다.",
    inputSchema: {
      directory: z.string(),
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
  }, async ({ directory }) => {
    const target = await safePath(directory);
    if (target === root) {
      throw new Error("프로젝트 루트는 생성 대상이 아닙니다.");
    }
    const parent = path.dirname(target);
    const parentStat = await fs.lstat(parent);
    if (!parentStat.isDirectory() || parentStat.isSymbolicLink()) {
      throw new Error("상위 폴더는 실제 디렉터리여야 합니다.");
    }
    await fs.mkdir(target);
    return {
      structuredContent: { directory },
      content: [{ type: "text", text: `${directory} 폴더 생성 완료` }],
    };
  });

  server.registerTool("list_files", {
    title: "List project files",
    description: "로컬 프로젝트 내부의 파일과 디렉터리를 조회합니다.",
    inputSchema: {
      directory: z.string().default("."),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false,
    },
  }, async ({ directory }) => {
    const target = await safePath(directory);
    const entries = await fs.readdir(target, { withFileTypes: true });
    const result = entries.slice(0, 500).map((entry) => {
      let type = "file";
      if (entry.isDirectory()) {
        type = "directory";
      } else if (entry.isSymbolicLink()) {
        type = "symlink";
      }
      return { name: entry.name, type };
    });

    return {
      structuredContent: { directory, entries: result },
      content: [{
        type: "text",
        text: result
          .map(entry => `[${entry.type.toUpperCase()}] ${entry.name}`)
          .join("\n"),
      }],
    };
  });

  server.registerTool("read_file", {
    title: "Read project file",
    description: "로컬 프로젝트 내부의 텍스트 파일을 읽습니다.",
    inputSchema: {
      file: z.string(),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false,
    },
  }, async ({ file }) => {
    const target = await safePath(file);
    const stat = await fs.stat(target);

    if (!stat.isFile()) {
      throw new Error(`파일이 아닙니다: ${file}`);
    }
    if (stat.size > 2 * 1024 * 1024) {
      throw new Error("2MB보다 큰 파일은 직접 읽지 않도록 제한되어 있습니다.");
    }

    return {
      content: [{
        type: "text",
        text: await fs.readFile(target, "utf8"),
      }],
    };
  });

  server.registerTool("write_file", {
    title: "Create or write project file",
    description: "프로젝트 내부에 파일을 생성합니다. 기존 파일은 overwrite=true가 필요합니다.",
    inputSchema: {
      file: z.string(),
      content: z.string(),
      overwrite: z.boolean().default(false),
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: false,
    },
  }, async ({ file, content, overwrite }) => {
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
        `이미 존재하는 파일입니다: ${file}. 기존 파일 수정에는 replace_text를 우선 사용하세요.`,
      );
    }

    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(
      target,
      content,
      { encoding: "utf8", flag: overwrite ? "w" : "wx" },
    );

    return {
      content: [{ type: "text", text: `${file} 저장 완료` }],
    };
  });

  server.registerTool("replace_text", {
    title: "Replace text in project file",
    description: "파일 내부의 특정 문자열을 교체합니다.",
    inputSchema: {
      file: z.string(),
      oldText: z.string(),
      newText: z.string(),
      replaceAll: z.boolean().default(false),
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: false,
    },
  }, async ({ file, oldText, newText, replaceAll }) => {
    if (!oldText) {
      throw new Error("oldText는 비어 있을 수 없습니다.");
    }

    const target = await safePath(file);
    const original = await fs.readFile(target, "utf8");
    if (Buffer.byteLength(original) > 2 * 1024 * 1024) {
      throw new Error("File exceeds 2MB");
    }

    const lineEnding = original.includes("\r\n") ? "\r\n" : "\n";
    const normalizeLineEndings = value => value.replace(/\r\n|\r|\n/g, "\n");
    const normalizedOriginal = normalizeLineEndings(original);
    const normalizedOldText = normalizeLineEndings(oldText);
    const normalizedNewText = normalizeLineEndings(newText);

    let count = 0;
    let index = 0;
    while (true) {
      const found = normalizedOriginal.indexOf(normalizedOldText, index);
      if (found === -1) {
        break;
      }
      count++;
      index = found + normalizedOldText.length;
    }

    if (count === 0) {
      throw new Error("교체할 문자열을 찾지 못했습니다.");
    }
    if (!replaceAll && count > 1) {
      throw new Error(
        `${count}개의 동일 문자열이 있습니다. 더 긴 고유 문맥을 지정하거나 replaceAll=true를 사용하세요.`,
      );
    }

    const updatedNormalized = replaceAll
      ? normalizedOriginal.split(normalizedOldText).join(normalizedNewText)
      : normalizedOriginal.replace(normalizedOldText, () => normalizedNewText);
    const updated = updatedNormalized.replace(/\n/g, lineEnding);

    await fs.writeFile(target, updated, "utf8");

    return {
      content: [{
        type: "text",
        text: `${file}: ${replaceAll ? count : 1}개 위치 수정 완료`,
      }],
    };
  });

  server.registerTool("search_text", {
    title: "Search project source",
    description: "로컬 프로젝트의 소스 코드와 설정 파일에서 문자열을 검색합니다.",
    inputSchema: {
      query: z.string(),
      directory: z.string().default("."),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false,
    },
  }, async ({ query, directory }) => {
    const base = await safePath(directory);
    const files = await walk(base);
    const matches = [];
    const needle = query.toLowerCase();

    for (const file of files) {
      try {
        await safePath(path.relative(root, file));
        if ((await fs.stat(file)).size > 2 * 1024 * 1024) {
          continue;
        }

        const text = await fs.readFile(file, "utf8");
        const lines = text.split(/\r?\n/);

        for (let index = 0; index < lines.length; index++) {
          if (lines[index].toLowerCase().includes(needle)) {
            matches.push({
              file: path.relative(root, file),
              line: index + 1,
              text: lines[index].trim().slice(0, 400),
            });
          }

          if (matches.length >= 200) {
            break;
          }
        }
      } catch {
        // Ignore unreadable or transient files during a project-wide search.
      }

      if (matches.length >= 200) {
        break;
      }
    }

    return {
      structuredContent: { query, matches },
      content: [{
        type: "text",
        text: matches.length === 0
          ? "검색 결과 없음"
          : matches
              .map(match => `${match.file}:${match.line}\n${match.text}`)
              .join("\n\n"),
      }],
    };
  });
}
