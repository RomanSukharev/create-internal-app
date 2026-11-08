import fs from "node:fs";
import path from "node:path";
import { generateEntity } from "../gen-entity/index.mjs";
import {
  resolvePageLayout,
  resolveViewMode,
} from "../gen-entity/prompts-layout.mjs";
import { loadConfig } from "../shared/config.mjs";
import { parseArgs } from "../shared/parse-args.mjs";
import { exitIfCancel, p } from "../shared/prompts.mjs";
import { run } from "../shared/run.mjs";
import { fetchTemplate } from "./fetch-template.mjs";
import {
  AUTH_MODE_META,
  AUTH_MODE_OPTIONS,
  writeAuthMode,
} from "./patch-auth-mode.mjs";
import { patchPackageName } from "./patch-package.mjs";

function toKebabName(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * @param {string[]} [argv]
 */
export async function runCreateAppCli(argv = process.argv.slice(2)) {
  const { positionals, flags } = parseArgs(argv);
  const config = loadConfig(flags);

  p.intro("create-internal-app — установка Internal Template");

  if (!config.templateGitUrl && !config.templatePath) {
    p.cancel(
      [
        "Не задан источник шаблона.",
        "Пропиши templateGitUrl в config.local.json",
        "или INTERNAL_TEMPLATE_GIT / --template-path ../internal-template",
      ].join("\n"),
    );
    process.exit(1);
  }

  const sourceLabel = config.templateGitUrl
    ? `git: ${config.templateGitUrl} @ ${config.templateRef}`
    : `path: ${config.templatePath}`;

  p.log.info(`Шаблон: ${sourceLabel}`);

  const nameRaw =
    typeof flags.dir === "string"
      ? flags.dir
      : positionals[0]
        ?? exitIfCancel(
          await p.text({
            message: "Имя папки / проекта",
            placeholder: "my-admin",
            validate(value) {
              const name = toKebabName(value || "");
              if (!name) return "Укажи имя";
              if (fs.existsSync(path.resolve(process.cwd(), name))) {
                return `Папка ${name} уже существует`;
              }
            },
          }),
        );

  const projectName = toKebabName(String(nameRaw));
  const targetDir = path.resolve(process.cwd(), projectName);

  if (fs.existsSync(targetDir)) {
    p.cancel(`Папка уже существует: ${targetDir}`);
    process.exit(1);
  }

  /** @type {"none" | "credentials" | "domain"} */
  let authMode;
  if (
    typeof flags.auth === "string"
    && ["none", "credentials", "domain"].includes(flags.auth)
  ) {
    authMode = /** @type {"none" | "credentials" | "domain"} */ (flags.auth);
  } else {
    authMode = /** @type {"none" | "credentials" | "domain"} */ (
      exitIfCancel(
        await p.select({
          message: "Авторизация",
          initialValue: "credentials",
          options: AUTH_MODE_OPTIONS,
        }),
      )
    );
  }

  let withEntity = false;
  if (flags.entity === true || flags.entity === "true") {
    withEntity = true;
  } else if (flags.entity === false || flags.entity === "false") {
    withEntity = false;
  } else {
    withEntity = Boolean(
      exitIfCancel(
        await p.confirm({
          message: "Сразу сгенерировать ещё одну сущность из example?",
          initialValue: false,
        }),
      ),
    );
  }

  const skipInstall = Boolean(flags["skip-install"]);

  p.note(
    [
      `папка: ${targetDir}`,
      `источник: ${sourceLabel}`,
      `auth: ${AUTH_MODE_META[authMode].label}`,
      `доп. сущность: ${withEntity ? "да" : "нет"}`,
      `pnpm install: ${skipInstall ? "пропуск" : "да"}`,
    ].join("\n"),
    "Установка",
  );

  const ok = flags.yes
    ? true
    : exitIfCancel(
      await p.confirm({ message: "Создать проект?", initialValue: true }),
    );

  if (!ok) {
    p.cancel("Отменено");
    process.exit(0);
  }

  const spin = p.spinner();
  spin.start("Скачиваю / копирую шаблон");
  try {
    await fetchTemplate({
      targetDir,
      templateGitUrl: config.templateGitUrl || undefined,
      templatePath: config.templatePath || undefined,
      templateRef: config.templateRef,
    });
    patchPackageName(targetDir, projectName);
    writeAuthMode(targetDir, authMode);
    spin.stop("Шаблон готов");
  } catch (err) {
    spin.stop("Не удалось получить шаблон");
    throw err;
  }

  if (!skipInstall) {
    spin.start("pnpm install");
    try {
      await run("pnpm", ["install"], targetDir);
      spin.stop("Зависимости установлены");
    } catch (err) {
      spin.stop("pnpm install не удался");
      throw err;
    }
  }

  if (withEntity) {
    p.log.step("Генератор сущности (клон example)");
    await runGenEntityInteractive(targetDir);
  }

  p.outro(
    [
      `Проект готов: ${projectName}`,
      "",
      `  cd ${projectName}`,
      "  pnpm dev",
    ].join("\n"),
  );
}

/**
 * Interactive entity prompt after scaffold.
 * @param {string} targetDir
 */
async function runGenEntityInteractive(targetDir) {
  const name = exitIfCancel(
    await p.text({
      message: "Имя сущности (lowercase)",
      placeholder: "order",
      validate(value) {
        if (!value) return "Укажи имя";
        if (!/^[a-z][a-z0-9]*$/.test(value)) return "Только lowercase латиница";
        if (fs.existsSync(path.join(targetDir, "app/entities", value))) {
          return `entities/${value} уже существует`;
        }
      },
    }),
  );

  const title = exitIfCancel(
    await p.text({
      message: "Заголовок (UI)",
      placeholder: "Заказы",
      defaultValue: String(name),
    }),
  );

  const view = await resolveViewMode({});
  const layout = await resolvePageLayout({});

  generateEntity({
    root: targetDir,
    name: String(name),
    title: String(title),
    layout,
    view,
  });
}
