import fs from "node:fs";
import path from "node:path";

/**
 * @param {string} projectRoot
 * @param {string} projectName
 */
export function patchPackageName(projectRoot, projectName) {
  const pkgPath = path.join(projectRoot, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  pkg.name = projectName;
  fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
}
