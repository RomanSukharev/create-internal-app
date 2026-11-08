/**
 * @param {string[]} argv
 * @returns {{ positionals: string[]; flags: Record<string, string | boolean> }}
 */
export function parseArgs(argv) {
  const positionals = [];
  /** @type {Record<string, string | boolean>} */
  const flags = {};

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token.startsWith("--")) {
      const key = token.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) {
        flags[key] = true;
      } else {
        flags[key] = next;
        i++;
      }
    } else {
      positionals.push(token);
    }
  }

  return { positionals, flags };
}
