import { exitIfCancel, p } from "../shared/prompts.mjs";
import { DEFAULT_LAYOUT, DEFAULT_VIEW } from "./page-layout.mjs";

/**
 * @returns {Promise<"cards" | "table" | "table-kanban">}
 */
export async function promptViewMode() {
  return /** @type {"cards" | "table" | "table-kanban"} */ (
    exitIfCancel(
      await p.select({
        message: "Вид списка",
        initialValue: "table",
        options: [
          {
            value: "cards",
            label: "Карточки",
            hint: "NameCards + NameCardsWrapper",
          },
          {
            value: "table",
            label: "Таблица",
            hint: "NameTable + NameTableWrapper",
          },
          {
            value: "table-kanban",
            label: "Таблица + канбан",
            hint: "NameTable + NameKanban / Column / Card",
          },
        ],
      }),
    )
  );
}

/**
 * @returns {Promise<import("./page-layout.mjs").LayoutFlags>}
 */
export async function promptPageLayout() {
  const selected = exitIfCancel(
    await p.multiselect({
      message: "Что показать на странице сущности",
      initialValues: ["search", "filter", "form", "reload"],
      required: false,
      options: [
        { value: "search", label: "Поиск" },
        { value: "filter", label: "Фильтр" },
        { value: "form", label: "Создание / редактирование" },
        { value: "reload", label: "Кнопка обновить" },
      ],
    }),
  );

  const set = new Set(selected || []);
  return {
    search: set.has("search"),
    filter: set.has("filter"),
    form: set.has("form"),
    reload: set.has("reload"),
  };
}

/**
 * @param {Record<string, string | boolean>} flags
 */
export async function resolveViewMode(flags) {
  if (
    typeof flags.view === "string"
    && ["cards", "table", "table-kanban"].includes(flags.view)
  ) {
    return /** @type {"cards" | "table" | "table-kanban"} */ (flags.view);
  }

  if (flags.yes === true) {
    return DEFAULT_VIEW;
  }

  return promptViewMode();
}

/**
 * @param {Record<string, string | boolean>} flags
 */
export async function resolvePageLayout(flags) {
  if (typeof flags.layout === "string") {
    const fromFlag = flags.layout.split(",").map((s) => s.trim()).filter(Boolean);
    return {
      search: fromFlag.includes("search"),
      filter: fromFlag.includes("filter"),
      form: fromFlag.includes("form"),
      reload: fromFlag.includes("reload"),
    };
  }

  if (flags.yes === true) {
    return { ...DEFAULT_LAYOUT };
  }

  return promptPageLayout();
}
