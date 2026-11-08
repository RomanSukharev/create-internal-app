import fs from "node:fs";
import path from "node:path";
import { listFilesRecursive } from "../shared/fs.mjs";
import { replaceExampleTokens } from "./naming.mjs";

/**
 * @param {string} filePath
 * @param {ReturnType<import("./naming.mjs").buildEntityNames>} names
 */
function renamePathIfNeeded(filePath, names) {
  const dir = path.dirname(filePath);
  const base = path.basename(filePath);
  const nextBase = replaceExampleTokens(base, names);

  if (nextBase === base) {
    return filePath;
  }

  const nextPath = path.join(dir, nextBase);
  fs.renameSync(filePath, nextPath);
  return nextPath;
}

/**
 * Rename files and rewrite contents under cloned entity trees.
 * @param {string} projectRoot
 * @param {ReturnType<import("./naming.mjs").buildEntityNames>} names
 */
export function renameClonedEntity(projectRoot, names) {
  const roots = ["entities", "features", "pages"].map((slice) =>
    path.join(projectRoot, "app", slice, names.name),
  );

  for (const root of roots) {
    const files = listFilesRecursive(root);

    // Rename deepest paths first
    files
      .sort((a, b) => b.length - a.length)
      .forEach((filePath) => {
        const renamed = renamePathIfNeeded(filePath, names);
        const content = fs.readFileSync(renamed, "utf8");
        const next = replaceExampleTokens(content, names);
        if (next !== content) {
          fs.writeFileSync(renamed, next, "utf8");
        }
      });
  }
}
