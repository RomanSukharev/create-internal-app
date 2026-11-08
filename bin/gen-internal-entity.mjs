#!/usr/bin/env node
import { runGenEntityCli } from "../src/gen-entity/index.mjs";

runGenEntityCli(process.argv.slice(2)).catch((err) => {
  console.error(err);
  process.exit(1);
});
