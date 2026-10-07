import fs from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";

export async function copyImage(
  { sourceFile, file, overwrite = false, expectedTargetHash },
  { root, safePath, isInside },
) {
  if (!path.isAbsolute(sourceFile)) {
    throw new Error("원본 이미지의 절대 경로를 지정하세요.");
  }

  const source = path.resolve(sourceFile);
  let cursor = path.parse(source).root;
  for (const part of path.relative(cursor, source).split(path.sep).filter(Boolean)) {
    cursor = path.join(cursor, part);
    if ((await fs.lstat(cursor)).isSymbolicLink()) {
      throw new Error("이미지 심볼릭 링크는 허용하지 않습니다.");
    }
  }

  const stat = await fs.lstat(source);
  if (!stat.isFile() || stat.size > 20 * 1024 * 1024) {
    throw new Error("20MB 이하 일반 이미지 파일만 복사할 수 있습니다.");
  }

  const extension = path.extname(source).toLowerCase();
  if (![".png", ".jpg", ".jpeg", ".webp"].includes(extension)) {
    throw new Error("PNG/JPEG/WebP만 허용합니다.");
  }

  const destination = await safePath(file);
  const publicRoot = path.join(root, "public");
  if (!isInside(publicRoot, destination) || destination === publicRoot) {
    throw new Error("public 내부만 복사할 수 있습니다.");
  }

  const destinationRealPath = await fs.realpath(destination).catch((error) => {
    if (error.code === "ENOENT") {
      return null;
    }
    throw error;
  });
  if (source === destination || await fs.realpath(source) === destinationRealPath) {
    throw new Error("원본과 대상이 같습니다.");
  }

  const targetExtension = path.extname(destination).toLowerCase();
  const sameJpegExtension = [".jpg", ".jpeg"].includes(extension)
    && [".jpg", ".jpeg"].includes(targetExtension);
  if (targetExtension !== extension && !sameJpegExtension) {
    throw new Error("원본과 대상 이미지 확장자가 일치해야 합니다.");
  }

  const handle = await fs.open(source, "r");
  const header = Buffer.alloc(12);
  try {
    await handle.read(header, 0, 12, 0);
  } finally {
    await handle.close();
  }

  const isPng = header.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const isJpeg = header[0] === 0xFF && header[1] === 0xD8 && header[2] === 0xFF;
  const isWebp = header.subarray(0, 4).toString("ascii") === "RIFF"
    && header.subarray(8, 12).toString("ascii") === "WEBP";
  if (
    (extension === ".png" && !isPng)
    || ([".jpg", ".jpeg"].includes(extension) && !isJpeg)
    || (extension === ".webp" && !isWebp)
  ) {
    throw new Error("이미지 파일 형식과 확장자가 일치하지 않습니다.");
  }

  let targetStat;
  try {
    targetStat = await fs.lstat(destination);
    if (targetStat.isSymbolicLink()) {
      throw new Error("대상 이미지 심볼릭 링크는 허용하지 않습니다.");
    }
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  let overwritten = false;
  if (targetStat) {
    if (!targetStat.isFile() || targetStat.size > 20 * 1024 * 1024) {
      throw new Error("덮어쓰기 대상은 20MB 이하 일반 파일이어야 합니다.");
    }

    const hash = createHash("sha256").update(await fs.readFile(destination)).digest("hex");
    if (!overwrite || expectedTargetHash !== hash) {
      return {
        structuredContent: {
          status: "confirmation_required",
          file,
          sourceFile,
          sourceBytes: stat.size,
          targetBytes: targetStat.size,
          expectedTargetHash: hash,
        },
        content: [{
          type: "text",
          text: `${file}이 이미 존재하거나 확인 후 변경되었습니다. 사용자에게 덮어쓰기를 확인한 뒤 overwrite=true와 expectedTargetHash=${hash}로 다시 호출하세요.`,
        }],
      };
    }
    overwritten = true;
  }

  await fs.mkdir(path.dirname(destination), { recursive: true });
  await safePath(file);
  await fs.copyFile(source, destination, overwritten ? 0 : fsConstants.COPYFILE_EXCL);

  return {
    structuredContent: { status: "copied", file, bytes: stat.size, overwritten },
    content: [{
      type: "text",
      text: `${file} 이미지 ${overwritten ? "덮어쓰기" : "복사"} 완료 (${stat.size} bytes)`,
    }],
  };
}

export function registerCopyImageTool({ server, z, root, safePath, isInside }) {
  server.registerTool("copy_image", {
    title: "Copy image into project",
    description: "지정한 절대 경로의 PNG/JPEG/WebP를 프로젝트 public 내부로 복사합니다. 대상이 있으면 확인 정보를 반환합니다. 사용자 확인 후 overwrite=true와 반환된 expectedTargetHash로 다시 호출하세요. 원본 유지, 최대 20MB.",
    inputSchema: {
      sourceFile: z.string(),
      file: z.string(),
      overwrite: z.boolean().default(false),
      expectedTargetHash: z.string().optional(),
    },
    annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  }, args => copyImage(args, { root, safePath, isInside }));
}
