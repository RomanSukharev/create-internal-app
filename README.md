# create-internal-app

CLI-установщик для **Internal Template**.

Два бина:

| Команда | Назначение |
|---------|------------|
| `create-internal-app` | Скаффолд проекта из шаблона |
| `gen-internal-entity` | Новая сущность = клон `example` + wire router/sidebar |

Source of truth для сущности — живой `app/*/example` в шаблоне (не отдельные templates в CLI).

## Структура

```
bin/
  create-internal-app.mjs
  gen-internal-entity.mjs
src/
  shared/       # parse-args, config, fs, prompts, run
  create-app/   # fetch/copy/patch + orchestration
  gen-entity/   # clone example, rename, wire/
```

## Создать проект (как nuxi)

```bash
pnpm create github:RomanSukharev/create-internal-app test-app
```

или:

```bash
pnpm dlx git+https://github.com/RomanSukharev/create-internal-app.git test-app
```

Шаблон по умолчанию клонируется из `RomanSukharev/internal-template` (`config.default.json`).

## Локально (разработка CLI)

```bash
cd create-internal-app
pnpm install
# config.local.json → templatePath: ../internal-template (без git)
node bin/create-internal-app.mjs my-admin
```

## Добавить сущность в уже созданный проект

```bash
cd my-admin
node ../create-internal-app/bin/gen-internal-entity.mjs --root .
# или с флагами:
node ../create-internal-app/bin/gen-internal-entity.mjs --root . --name order --title Заказы
```

Генератор:

1. Копирует `entities|features|pages/example` → `<name>`
2. Переименовывает файлы и токены (`example` / `Example` / `examples`)
3. Спрашивает вид списка: карточки / таблица / таблица+канбан
4. Спрашивает, что показать на странице: поиск / фильтр / форма / reload
5. Вставляет роут и пункт меню по маркерам:
   - `// @internal-template:insert-route` в `app/router.options.ts`
   - `// @internal-template:insert-nav` в `AppSidebar.vue`

| `--view` | UI сущности | UI фичи |
|----------|-------------|---------|
| `cards` | `NameCardsWrapper` | `NameCards` |
| `table` | `NameTableWrapper` | `NameTable` |
| `table-kanban` | `NameTableWrapper` | `NameTable`, `NameKanban`, `NameKanbanColumn`, `NameKanbanCard` |

Всегда (из example): `NameForm` / `NameFormWrapper`, `NameFilter` / `NameFilterWrapper`, `useName`. На странице — переключатель таблица/канбан только для `table-kanban`.

```bash
node ../create-internal-app/bin/gen-internal-entity.mjs --root . --name order --title Заказы --view table-kanban --layout search,form,reload
```

Entity-mocks не генерируются (в шаблоне только auth-mock).

## Флаги create-internal-app

```bash
node bin/create-internal-app.mjs my-admin --auth domain --entity false --yes
node bin/create-internal-app.mjs my-admin --template-git https://git.../internal-template.git
node bin/create-internal-app.mjs my-admin --template-path ../internal-template --skip-install
```

## Env

| Переменная | Смысл |
|------------|--------|
| `INTERNAL_TEMPLATE_GIT` | git URL шаблона |
| `INTERNAL_TEMPLATE_PATH` | локальный путь к шаблону |
| `INTERNAL_TEMPLATE_REF` | ветка/тег (по умолчанию `main`) |
