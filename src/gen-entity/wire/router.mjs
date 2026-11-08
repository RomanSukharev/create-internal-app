import fs from "node:fs";
import path from "node:path";

export const ROUTE_MARKER = "// @internal-template:insert-route";

/**
 * @param {string} projectRoot
 * @param {ReturnType<import("../naming.mjs").buildEntityNames>} names
 * @param {{ warn?: (msg: string) => void }} [log]
 */
export function wireRouter(projectRoot, names, log = {}) {
  const routerPath = path.join(projectRoot, "app/router.options.ts");
  let source = fs.readFileSync(routerPath, "utf8");

  if (source.includes(`name: "${names.routeName}"`)) {
    log.warn?.(`Роут "${names.routeName}" уже есть — пропускаю router`);
    return;
  }

  const routeBlock = `    {
      path: "/${names.routePath}",
      name: "${names.routeName}",
      component: () => import("~/pages/${names.name}"),
    },
`;

  if (!source.includes(ROUTE_MARKER)) {
    throw new Error(
      `Не найден маркер ${ROUTE_MARKER} в app/router.options.ts`,
    );
  }

  source = source.replace(
    ROUTE_MARKER,
    `${routeBlock}    ${ROUTE_MARKER}`,
  );
  fs.writeFileSync(routerPath, source, "utf8");
}
