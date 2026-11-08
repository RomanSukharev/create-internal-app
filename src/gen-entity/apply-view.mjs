import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { replaceViewTokens } from "./naming.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const viewsDir = path.join(__dirname, "templates/views");

/** @typedef {"cards" | "table" | "table-kanban"} ViewMode */

/**
 * @param {string} templateName
 * @param {ReturnType<import("./naming.mjs").buildEntityNames>} names
 * @param {string} destPath
 */
function writeViewTemplate(templateName, names, destPath) {
  const source = fs.readFileSync(path.join(viewsDir, templateName), "utf8");
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, replaceViewTokens(source, names), "utf8");
}

/**
 * @param {string} projectRoot
 * @param {ReturnType<import("./naming.mjs").buildEntityNames>} names
 * @param {ViewMode} view
 */
export function applyViewMode(projectRoot, names, view) {
  const entityUi = path.join(projectRoot, "app/entities", names.name, "ui");
  const featureUi = path.join(projectRoot, "app/features", names.name, "ui");
  const entityIndex = path.join(projectRoot, "app/entities", names.name, "index.ts");
  const featureIndex = path.join(projectRoot, "app/features", names.name, "index.ts");

  if (view === "cards") {
    writeViewTemplate(
      "CardsWrapper.vue",
      names,
      path.join(entityUi, `${names.Name}CardsWrapper.vue`),
    );
    writeViewTemplate(
      "Cards.vue",
      names,
      path.join(featureUi, `${names.Name}Cards.vue`),
    );

    // table UI не нужна в cards-режиме
    for (const file of [
      path.join(entityUi, `${names.Name}TableWrapper.vue`),
      path.join(featureUi, `${names.Name}Table.vue`),
    ]) {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    }
  }

  if (view === "table-kanban") {
    writeViewTemplate(
      "Kanban.vue",
      names,
      path.join(featureUi, `${names.Name}Kanban.vue`),
    );
    writeViewTemplate(
      "KanbanColumn.vue",
      names,
      path.join(featureUi, `${names.Name}KanbanColumn.vue`),
    );
    writeViewTemplate(
      "KanbanCard.vue",
      names,
      path.join(featureUi, `${names.Name}KanbanCard.vue`),
    );
  }

  writeEntityIndex(entityIndex, names, view);
  writeFeatureIndex(featureIndex, names, view);
}

/**
 * @param {string} filePath
 * @param {ReturnType<import("./naming.mjs").buildEntityNames>} names
 * @param {ViewMode} view
 */
function writeEntityIndex(filePath, names, view) {
  const lines = [
    `import use${names.Name} from "./composables/use${names.Name}";`,
    `import ${names.Name}FormWrapper from "./ui/${names.Name}FormWrapper.vue";`,
    `import ${names.Name}FilterWrapper from "./ui/${names.Name}FilterWrapper.vue";`,
  ];

  if (view === "cards") {
    lines.push(
      `import ${names.Name}CardsWrapper from "./ui/${names.Name}CardsWrapper.vue";`,
    );
  } else {
    lines.push(
      `import ${names.Name}TableWrapper from "./ui/${names.Name}TableWrapper.vue";`,
    );
  }

  lines.push("", "export {", `  use${names.Name},`, `  ${names.Name}FormWrapper,`, `  ${names.Name}FilterWrapper,`);

  if (view === "cards") {
    lines.push(`  ${names.Name}CardsWrapper,`);
  } else {
    lines.push(`  ${names.Name}TableWrapper,`);
  }

  lines.push("};", "");
  fs.writeFileSync(filePath, lines.join("\n"), "utf8");
}

/**
 * @param {string} filePath
 * @param {ReturnType<import("./naming.mjs").buildEntityNames>} names
 * @param {ViewMode} view
 */
function writeFeatureIndex(filePath, names, view) {
  const imports = [];
  const exports = [];

  if (view === "cards") {
    imports.push(
      `import ${names.Name}Cards from "./ui/${names.Name}Cards.vue";`,
    );
    exports.push(`${names.Name}Cards`);
  }

  if (view === "table" || view === "table-kanban") {
    imports.push(
      `import ${names.Name}Table from "./ui/${names.Name}Table.vue";`,
    );
    exports.push(`${names.Name}Table`);
  }

  if (view === "table-kanban") {
    imports.push(
      `import ${names.Name}Kanban from "./ui/${names.Name}Kanban.vue";`,
    );
    exports.push(`${names.Name}Kanban`);
  }

  imports.push(`import ${names.Name}Form from "./ui/${names.Name}Form.vue";`);
  imports.push(
    `import ${names.Name}Filter from "./ui/${names.Name}Filter.vue";`,
  );
  exports.push(`${names.Name}Form`, `${names.Name}Filter`);

  const content = `${imports.join("\n")}\n\nexport { ${exports.join(", ")} };\n`;
  fs.writeFileSync(filePath, content, "utf8");
}
