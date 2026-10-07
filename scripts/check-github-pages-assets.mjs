import fs from "node:fs/promises";
import path from "node:path";

const outputRoot = path.resolve(process.argv[2] || ".output/public");
const textExtensions = new Set([".html", ".js", ".mjs", ".css", ".json"]);

const collectFiles = async (directory) => {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectFiles(file));
    } else if (textExtensions.has(path.extname(entry.name))) {
      files.push(file);
    }
  }

  return files;
};

try {
  const files = await collectFiles(outputRoot);
  const violations = [];

  for (const file of files) {
    const content = await fs.readFile(file, "utf8");
    if (/(?:["'(=]|url\()\/images\//.test(content)) {
      violations.push(path.relative(outputRoot, file));
    }
  }

  if (violations.length) {
    process.stderr.write("GitHub Pages baseURL을 우회하는 /images/ 경로가 발견되었습니다:\n");
    for (const file of violations) process.stderr.write(`- ${file}\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write("GitHub Pages asset 경로 검사 통과\n");
  }
} catch (error) {
  if (error?.code === "ENOENT") {
    process.stderr.write(`빌드 산출물 디렉터리를 찾을 수 없습니다: ${outputRoot}\n`);
    process.stderr.write("먼저 npm run generate:pages를 실행하세요.\n");
    process.exitCode = 1;
  } else {
    throw error;
  }
}
