import fs from "node:fs";
import path from "node:path";

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

/**
 * @param {string} src
 * @param {string} dest
 * @param {(name: string) => boolean} [skipDir]
 * @param {(name: string) => boolean} [skipFile]
 */
export function copyDirRecursive(src, dest, skipDir, skipFile) {
  ensureDir(dest);

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.isDirectory() && skipDir?.(entry.name)) continue;
    if (entry.isFile() && skipFile?.(entry.name)) continue;

    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);

    if (path.resolve(from) === path.resolve(dest)) continue;

    if (entry.isDirectory()) {
      copyDirRecursive(from, to, skipDir, skipFile);
      continue;
    }

    if (entry.isFile()) {
      fs.copyFileSync(from, to);
    }
  }
}

/**
 * @param {string} dir
 * @returns {string[]}
 */
export function listFilesRecursive(dir) {
  /** @type {string[]} */
  const files = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFilesRecursive(full));
    } else if (entry.isFile()) {
      files.push(full);
    }
  }

  return files;
}
