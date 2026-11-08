import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, "../..");

/**
 * Приоритет источника шаблона:
 * 1. --template / --template-git / --template-path (флаги CLI)
 * 2. INTERNAL_TEMPLATE_GIT / INTERNAL_TEMPLATE_PATH (env)
 * 3. config.local.json (если есть) → config.default.json
 */
export function loadConfig(flags = {}) {
  const defaultPath = path.join(packageRoot, "config.default.json");
  const localPath = path.join(packageRoot, "config.local.json");

  /** @type {Record<string, string>} */
  let fileConfig = {};
  if (fs.existsSync(defaultPath)) {
    fileConfig = JSON.parse(fs.readFileSync(defaultPath, "utf8"));
  }
  if (fs.existsSync(localPath)) {
    fileConfig = {
      ...fileConfig,
      ...JSON.parse(fs.readFileSync(localPath, "utf8")),
    };
  }

  const templateGitUrl =
    (typeof flags["template-git"] === "string" && flags["template-git"])
    || (typeof flags.template === "string" && flags.template.startsWith("git")
      ? flags.template
      : "")
    || process.env.INTERNAL_TEMPLATE_GIT
    || fileConfig.templateGitUrl
    || "";

  const templatePathRaw =
    (typeof flags["template-path"] === "string" && flags["template-path"])
    || (typeof flags.template === "string"
      && !flags.template.startsWith("git")
      && !flags.template.includes("://")
      ? flags.template
      : "")
    || process.env.INTERNAL_TEMPLATE_PATH
    || fileConfig.templatePath
    || "";

  const templatePath = templatePathRaw
    ? path.resolve(packageRoot, templatePathRaw)
    : "";

  const templateRef =
    (typeof flags.ref === "string" && flags.ref)
    || process.env.INTERNAL_TEMPLATE_REF
    || fileConfig.templateRef
    || "main";

  return {
    packageRoot,
    templateGitUrl,
    templatePath,
    templateRef,
  };
}
