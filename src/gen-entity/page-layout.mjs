import fs from "node:fs";
import path from "node:path";

/**
 * @typedef {{
 *   search: boolean;
 *   filter: boolean;
 *   form: boolean;
 *   reload: boolean;
 * }} LayoutFlags
 *
 * @typedef {"cards" | "table" | "table-kanban"} ViewMode
 */

/**
 * @param {string} projectRoot
 * @param {ReturnType<import("./naming.mjs").buildEntityNames>} names
 * @param {LayoutFlags} layout
 * @param {ViewMode} view
 */
export function applyPageLayout(projectRoot, names, layout, view = "table") {
  const pagePath = path.join(
    projectRoot,
    "app/pages",
    names.name,
    "ui",
    `${names.Name}Page.vue`,
  );

  if (!fs.existsSync(pagePath)) {
    throw new Error(`Не найдена страница: ${pagePath}`);
  }

  /** @type {string[]} */
  const featureImports = [];
  if (view === "cards") featureImports.push(`${names.Name}Cards`);
  if (view === "table" || view === "table-kanban") {
    featureImports.push(`${names.Name}Table`);
  }
  if (view === "table-kanban") featureImports.push(`${names.Name}Kanban`);
  if (layout.filter) featureImports.push(`${names.Name}Filter`);
  if (layout.form) featureImports.push(`${names.Name}Form`);

  const storeParts = [];
  if (layout.search) storeParts.push("keyword");
  if (layout.filter) storeParts.push("filterIsApplied");
  storeParts.push("refetch");
  if (layout.reload) storeParts.push("isLoading");
  if (view === "table-kanban") storeParts.push("itemsPerPage");

  const layoutAttrs = [
    layout.search ? `    v-model:search="keyword"` : `    no-search`,
    `    title="${names.title}"`,
    `    no-content-scroll`,
  ];

  if (layout.filter) {
    layoutAttrs.push(`    :is-filter-applied="filterIsApplied"`);
    layoutAttrs.push(`    :filter-component="${names.Name}Filter"`);
  }

  if (layout.form) {
    layoutAttrs.push(`    :form-component="${names.Name}Form"`);
  }

  if (layout.reload) {
    layoutAttrs.push(`    :reload="refetch"`);
    layoutAttrs.push(`    :is-reloading="isLoading"`);
  }

  let scriptExtra = "";
  let body = `    <${names.Name}Table />`;

  if (view === "cards") {
    body = `    <${names.Name}Cards />`;
  }

  if (view === "table-kanban") {
    scriptExtra = `
const viewMode = ref<"table" | "kanban">("table");

const viewOptions = [
  { label: "Таблица", value: "table" },
  { label: "Канбан", value: "kanban" },
];

watch(viewMode, (mode) => {
  itemsPerPage.value = mode === "kanban" ? 50 : 20;
});
`;
    body = `    <div class="mb-3 flex justify-end">
      <PrimeSelectButton
        v-model="viewMode"
        :options="viewOptions"
        option-label="label"
        option-value="value"
        :allow-empty="false"
      />
    </div>

    <${names.Name}Kanban v-if="viewMode === 'kanban'" />
    <${names.Name}Table v-else />`;
  }

  const content = `<script setup lang="ts">
import { use${names.Name} } from "~/entities/${names.name}";
import { ${featureImports.join(", ")} } from "~/features/${names.name}";

const { ${storeParts.join(", ")} } = use${names.Name}();
${scriptExtra}
onMounted(() => {
  void refetch().catch(() => undefined);
});

useHead({
  title: "${names.title}",
});
</script>

<template>
  <ITBaseLayout
${layoutAttrs.join("\n")}
  >
${body}
  </ITBaseLayout>
</template>
`;

  fs.writeFileSync(pagePath, content, "utf8");
}

export const DEFAULT_LAYOUT = {
  search: true,
  filter: true,
  form: true,
  reload: true,
};

/** @type {ViewMode} */
export const DEFAULT_VIEW = "table";
