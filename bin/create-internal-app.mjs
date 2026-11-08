#!/usr/bin/env node
import { runCreateAppCli } from "../src/create-app/index.mjs";

runCreateAppCli(process.argv.slice(2)).catch((err) => {
  console.error(err);
  process.exit(1);
});
