import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { run } from "../shared/run.mjs";
import { copyTemplate } from "./copy-template.mjs";

/**
 * @param {string} gitUrl
 * @param {string} ref
 * @param {string} tmpDir
 */
async function cloneTo(gitUrl, ref, tmpDir) {
  try {
    await run("git", [
      "clone",
      "--depth",
      "1",
      "--branch",
      ref,
      gitUrl,
      tmpDir,
    ], process.cwd());
  } catch {
    await run("git", [
      "clone",
      "--depth",
      "1",
      gitUrl,
      tmpDir,
    ], process.cwd());
  }

  if (!fs.existsSync(path.join(tmpDir, "package.json"))) {
    throw new Error("После git clone не найден package.json шаблона");
  }
}

/**
 * @param {{
 *   targetDir: string;
 *   templateGitUrl?: string;
 *   templatePath?: string;
 *   templateRef?: string;
 * }} opts
 */
export async function fetchTemplate(opts) {
  const {
    targetDir,
    templateGitUrl,
    templatePath,
    templateRef = "main",
  } = opts;

  if (templateGitUrl) {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "internal-template-"));
    try {
      await cloneTo(templateGitUrl, templateRef, tmp);
      copyTemplate(tmp, targetDir);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
    return;
  }

  if (templatePath) {
    if (!fs.existsSync(path.join(templatePath, "package.json"))) {
      throw new Error(`Локальный шаблон не найден: ${templatePath}`);
    }
    copyTemplate(templatePath, targetDir);
    return;
  }

  throw new Error(
    "Не задан источник шаблона. Укажи templateGitUrl в config или INTERNAL_TEMPLATE_GIT / --template-path.",
  );
}
