import fs from "node:fs";
import path from "node:path";

export const NAV_MARKER = "// @internal-template:insert-nav";

/**
 * @param {string} projectRoot
 * @param {ReturnType<import("../naming.mjs").buildEntityNames>} names
 * @param {{ warn?: (msg: string) => void }} [log]
 */
export function wireSidebar(projectRoot, names, log = {}) {
  const sidebarPath = path.join(
    projectRoot,
    "app/widgets/app-sidebar/ui/AppSidebar.vue",
  );
  let source = fs.readFileSync(sidebarPath, "utf8");

  if (source.includes(`name: "${names.routeName}"`)) {
    log.warn?.(`Пункт меню "${names.routeName}" уже есть — пропускаю sidebar`);
    return;
  }

  const item = `      {
        icon: "pi pi-box",
        label: "${names.title}",
        route: { name: "${names.routeName}" },
      },
`;

  if (!source.includes(NAV_MARKER)) {
    throw new Error(
      `Не найден маркер ${NAV_MARKER} в AppSidebar.vue`,
    );
  }

  source = source.replace(NAV_MARKER, `${item}      ${NAV_MARKER}`);
  fs.writeFileSync(sidebarPath, source, "utf8");
}
