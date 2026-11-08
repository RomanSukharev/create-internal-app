import { copyDirRecursive } from "../shared/fs.mjs";

const SKIP_DIR_NAMES = new Set([
  ".git",
  ".nuxt",
  ".nitro",
  ".output",
  ".cache",
  ".data",
  "node_modules",
  "dist",
  "packages",
  ".cursor",
]);

const SKIP_FILE_NAMES = new Set([
  "pnpm-lock.yaml",
]);

/**
 * @param {string} src
 * @param {string} dest
 */
export function copyTemplate(src, dest) {
  copyDirRecursive(
    src,
    dest,
    (name) => SKIP_DIR_NAMES.has(name),
    (name) => SKIP_FILE_NAMES.has(name),
  );
}
