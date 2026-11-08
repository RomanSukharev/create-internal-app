/**
 * @param {string} value
 */
export function toPascalCase(value) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/**
 * @param {string} singular
 */
export function pluralize(singular) {
  if (singular.endsWith("y") && singular.length > 1) {
    return `${singular.slice(0, -1)}ies`;
  }
  if (singular.endsWith("s")) {
    return `${singular}es`;
  }
  return `${singular}s`;
}

/**
 * @param {string} name lowercase camel entity name, e.g. "order"
 * @param {string} [names]
 * @param {string} [title]
 */
export function buildEntityNames(name, names, title) {
  if (!/^[a-z][a-z0-9]*$/.test(name)) {
    throw new Error("name: только lowercase латиница (order, product)");
  }

  const Name = toPascalCase(name);
  const resolvedNames = names || pluralize(name);

  return {
    name,
    Name,
    names: resolvedNames,
    Names: toPascalCase(resolvedNames),
    title: title || Name,
    routePath: resolvedNames,
    routeName: resolvedNames,
  };
}

/** Shared example enums/labels must survive rename. */
const PRESERVE_TOKENS = [
  "ExampleStatusEnum",
  "ExamplePriorityEnum",
  "exampleStatusesList",
  "examplePrioritiesList",
];

/**
 * @param {string} content
 * @param {(text: string) => string} transform
 */
function withPreservedTokens(content, transform) {
  let text = content;
  const slots = PRESERVE_TOKENS.map((token, index) => {
    const slot = `__PRESERVE_${index}__`;
    text = text.replaceAll(token, slot);
    return { token, slot };
  });

  text = transform(text);

  for (const { token, slot } of slots) {
    text = text.replaceAll(slot, token);
  }

  return text;
}

/**
 * Replace example identifiers with target names (longest tokens first).
 * @param {string} content
 * @param {ReturnType<typeof buildEntityNames>} names
 */
export function replaceExampleTokens(content, names) {
  return withPreservedTokens(content, (text) =>
    text
      .replaceAll("Examples", names.Names)
      .replaceAll("examples", names.names)
      .replaceAll("Example", names.Name)
      .replaceAll("example", names.name)
      .replaceAll("Пример сущности", names.title)
      .replaceAll("Пример", names.title),
  );
}

/**
 * @param {string} content
 * @param {ReturnType<typeof buildEntityNames>} names
 */
export function replaceViewTokens(content, names) {
  return content
    .replaceAll("__Names__", names.Names)
    .replaceAll("__names__", names.names)
    .replaceAll("__Name__", names.Name)
    .replaceAll("__name__", names.name)
    .replaceAll("__title__", names.title);
}
