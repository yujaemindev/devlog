import fs from "node:fs/promises";
import path from "node:path";

export async function moveFile({ file, newFile }, { safePath }) {
  const source = await safePath(file);
  const destination = await safePath(newFile);

  if (source === destination) {
    throw new Error("기존 경로와 이동할 경로가 같습니다.");
  }

  const sourceStat = await fs.lstat(source);
  if (!sourceStat.isFile() || sourceStat.isSymbolicLink()) {
    throw new Error("일반 파일만 이동할 수 있습니다.");
  }

  // Existing parent directories must be real directories, never symlinks.
  const destinationDir = path.dirname(destination);
  const parentStat = await fs.lstat(destinationDir);
  if (!parentStat.isDirectory() || parentStat.isSymbolicLink()) {
    throw new Error("대상 폴더는 심볼릭 링크가 아닌 실제 디렉터리여야 합니다.");
  }

  // Hard links ensure the target is created atomically without overwriting it.
  // Cross-volume moves are rejected rather than using a non-atomic copy.
  await fs.link(source, destination);
  try {
    await fs.unlink(source);
  } catch (error) {
    await fs.unlink(destination);
    throw error;
  }

  return {
    structuredContent: { file, newFile },
    content: [{ type: "text", text: `${file} → ${newFile} 이동 완료` }],
  };
}

export function registerMoveFileTool({ server, z, safePath }) {
  server.registerTool("move_file", {
    title: "Move project file",
    description: "프로젝트 내부의 일반 파일을 기존 폴더에서 다른 기존 폴더로 이동합니다. 덮어쓰기와 심볼릭 링크 이동은 금지됩니다.",
    inputSchema: {
      file: z.string(),
      newFile: z.string(),
    },
    annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  }, args => moveFile(args, { safePath }));
}
