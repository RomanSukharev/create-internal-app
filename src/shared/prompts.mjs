import * as p from "@clack/prompts";

export function exitIfCancel(value) {
  if (p.isCancel(value)) {
    p.cancel("Отменено");
    process.exit(0);
  }
  return value;
}

export { p };
