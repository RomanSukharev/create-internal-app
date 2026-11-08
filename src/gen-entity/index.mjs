import fs from "node:fs";
import path from "node:path";
import { exitIfCancel, p } from "../shared/prompts.mjs";
import { parseArgs } from "../shared/parse-args.mjs";
import { applyViewMode } from "./apply-view.mjs";
import { cloneExampleTrees } from "./clone-example.mjs";
import { buildEntityNames } from "./naming.mjs";
import { applyPageLayout, DEFAULT_LAYOUT, DEFAULT_VIEW } from "./page-layout.mjs";
import { resolvePageLayout, resolveViewMode } from "./prompts-layout.mjs";
import { renameClonedEntity } from "./rename.mjs";
import { wireRouter } from "./wire/router.mjs";
import { wireSidebar } from "./wire/sidebar.mjs";

/**
 * @typedef {{
 *   root: string;
 *   name: string;
 *   names?: string;
 *   title?: string;
 *   layout?: import("./page-layout.mjs").LayoutFlags;
 *   view?: import("./page-layout.mjs").ViewMode;
 * }} GenerateEntityInput
 */

/**
 * @param {GenerateEntityInput} input
 */
export function generateEntity(input) {
  const names = buildEntityNames(input.name, input.names, input.title);
  const projectRoot = path.resolve(input.root);
  const layout = input.layout ?? { ...DEFAULT_LAYOUT };
  const view = input.view ?? DEFAULT_VIEW;

  cloneExampleTrees(projectRoot, names.name);
  renameClonedEntity(projectRoot, names);
  applyViewMode(projectRoot, names, view);
  applyPageLayout(projectRoot, names, layout, view);
  wireRouter(projectRoot, names, { warn: (msg) => p.log.warn(msg) });
  wireSidebar(projectRoot, names, { warn: (msg) => p.log.warn(msg) });

  return { ...names, layout, view };
}

/**
 * @param {string[]} [argv]
 * @param {string} [cwd]
 */
export function resolveProjectRoot(argv = process.argv.slice(2), cwd = process.cwd()) {
  const { flags } = parseArgs(argv);
  if (typeof flags.root === "string") {
    return path.resolve(flags.root);
  }
  return path.resolve(cwd);
}

/**
 * @param {string[]} [argv]
 */
export async function runGenEntityCli(argv = process.argv.slice(2)) {
  p.intro("gen-internal-entity — клон example → новая сущность");

  const { flags } = parseArgs(argv);
  const root = resolveProjectRoot(argv);

  if (!fs.existsSync(path.join(root, "app/entities/example"))) {
    p.cancel(`В ${root} нет app/entities/example (нужен Internal Template)`);
    process.exit(1);
  }

  let name;
  if (typeof flags.name === "string") {
    name = flags.name;
  } else {
    name = exitIfCancel(
      await p.text({
        message: "Имя сущности (lowercase)",
        placeholder: "order",
        validate(value) {
          if (!value) return "Укажи имя";
          if (!/^[a-z][a-z0-9]*$/.test(value)) {
            return "Только lowercase латиница";
          }
          if (fs.existsSync(path.join(root, "app/entities", value))) {
            return `entities/${value} уже существует`;
          }
        },
      }),
    );
  }

  let title;
  if (typeof flags.title === "string") {
    title = flags.title;
  } else {
    title = exitIfCancel(
      await p.text({
        message: "Заголовок (UI)",
        placeholder: "Заказы",
        defaultValue: String(name),
      }),
    );
  }

  let names;
  if (typeof flags.names === "string") {
    names = flags.names;
  }

  const view = await resolveViewMode(flags);
  const layout = await resolvePageLayout(flags);

  p.note(
    [
      `root: ${root}`,
      `name: ${name}`,
      `title: ${title}`,
      `view: ${view}`,
      `layout: ${[
        layout.search && "search",
        layout.filter && "filter",
        layout.form && "form",
        layout.reload && "reload",
      ].filter(Boolean).join(", ") || "пусто"}`,
      "source: app/*/example",
    ].join("\n"),
    "Генерация",
  );

  const result = generateEntity({
    root,
    name: String(name),
    names,
    title: String(title),
    layout,
    view,
  });

  const viewComponents =
    result.view === "cards"
      ? `${result.Name}Cards, ${result.Name}CardsWrapper`
      : result.view === "table-kanban"
        ? `${result.Name}Table, ${result.Name}TableWrapper, ${result.Name}Kanban, ${result.Name}KanbanColumn, ${result.Name}KanbanCard`
        : `${result.Name}Table, ${result.Name}TableWrapper`;

  p.outro(
    [
      `Сущность ${result.Name} готова`,
      `  entities/${result.name}`,
      `  features/${result.name}`,
      `  pages/${result.name}`,
      `  view: ${result.view}`,
      `  components: ${viewComponents}`,
      `  route /${result.routePath}`,
    ].join("\n"),
  );

  return result;
}
