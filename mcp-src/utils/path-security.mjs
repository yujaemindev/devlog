export function createPathSecurity({ fs, path, root, rootReal }) {
  function isInside(base, target) {
    const relative = path.relative(base, target);

    return (
      relative === ""
      || (
        relative !== ".."
        && !relative.startsWith(`..${path.sep}`)
        && !path.isAbsolute(relative)
      )
    );
  }

  async function validateRealPath(target) {
    let cursor = target;

    while (true) {
      try {
        const real = await fs.realpath(cursor);

        if (!isInside(rootReal, real)) {
          throw new Error(`프로젝트 외부 경로 접근 차단: ${target}`);
        }

        return;
      } catch (error) {
        if (error.code !== "ENOENT") {
          throw error;
        }

        const parent = path.dirname(cursor);

        if (parent === cursor) {
          throw new Error(`안전한 경로를 확인할 수 없습니다: ${target}`, { cause: error });
        }

        cursor = parent;
      }
    }
  }

  async function safePath(relativePath = ".") {
    if (
      typeof relativePath !== "string"
      || !relativePath
      || relativePath.includes("\0")
      || path.isAbsolute(relativePath)
      || /^[A-Za-z]:/.test(relativePath)
      || relativePath.includes(":")
      || relativePath.split(/[\\/]/).some(part =>
        part === ".."
        || (/[. ]$/.test(part) && part !== ".")
        || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\\.|$)/i.test(part),
      )
    ) {
      throw new Error("절대 경로는 사용할 수 없습니다. 프로젝트 기준 상대 경로를 사용하세요.");
    }

    const target = path.resolve(root, relativePath);

    if (!isInside(root, target)) {
      throw new Error(`프로젝트 외부 접근 차단: ${relativePath}`);
    }

    let cursor = root;
    for (const part of path.relative(root, target).split(path.sep).filter(Boolean)) {
      cursor = path.join(cursor, part);
      try {
        const stat = await fs.lstat(cursor);
        if (stat.isSymbolicLink()) {
          throw new Error("Symbolic links/junctions are not allowed");
        }
      } catch (error) {
        if (error.code !== "ENOENT") {
          throw error;
        }
      }
    }

    await validateRealPath(target);
    return target;
  }

  return { isInside, safePath };
}
