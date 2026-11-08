import fs from "node:fs";
import path from "node:path";
import { copyDirRecursive } from "../shared/fs.mjs";

const SLICES = ["entities", "features", "pages"];

/**
 * @param {string} projectRoot
 */
export function assertExampleExists(projectRoot) {
  for (const slice of SLICES) {
    const src = path.join(projectRoot, "app", slice, "example");
    if (!fs.existsSync(src)) {
      throw new Error(`Не найден source of truth: ${src}`);
    }
  }
}

/**
 * @param {string} projectRoot
 * @param {string} name
 */
export function assertTargetFree(projectRoot, name) {
  for (const slice of SLICES) {
    const dest = path.join(projectRoot, "app", slice, name);
    if (fs.existsSync(dest)) {
      throw new Error(`Уже существует: app/${slice}/${name}`);
    }
  }
}

/**
 * Copy example trees → <name> trees.
 * @param {string} projectRoot
 * @param {string} name
 */
export function cloneExampleTrees(projectRoot, name) {
  assertExampleExists(projectRoot);
  assertTargetFree(projectRoot, name);

  for (const slice of SLICES) {
    const src = path.join(projectRoot, "app", slice, "example");
    const dest = path.join(projectRoot, "app", slice, name);
    copyDirRecursive(src, dest);
  }
}
