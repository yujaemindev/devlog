import fs from "node:fs/promises";
import path from "node:path";

export async function renameFile({ file, newFile }, { safePath }) {
  const source = await safePath(file);
  const destination = await safePath(newFile);

  if (source === destination) {
    throw new Error("기존 이름과 새 이름이 같습니다.");
  }
  if (path.dirname(source) !== path.dirname(destination)) {
    throw new Error("같은 디렉터리 안에서만 파일 이름을 변경할 수 있습니다.");
  }

  const stat = await fs.lstat(source);
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new Error("일반 파일만 이름을 변경할 수 있습니다.");
  }

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
}

export function registerRenameFileTool({ server, z, safePath }) {
  server.registerTool("rename_file", {
    title: "Rename project file",
    description: "프로젝트 내부 파일의 이름을 변경합니다. 대상 파일 덮어쓰기와 디렉터리 이동은 허용하지 않습니다.",
    inputSchema: {
      file: z.string(),
      newFile: z.string(),
    },
    annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  }, args => renameFile(args, { safePath }));
}
