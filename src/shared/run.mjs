import { spawn } from "node:child_process";

/**
 * @param {string} command
 * @param {string[]} args
 * @param {string} cwd
 */
export function run(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} → exit ${code}`));
    });
    child.on("error", reject);
  });
}
