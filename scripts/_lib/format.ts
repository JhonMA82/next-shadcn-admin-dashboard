import { spawnSync } from "node:child_process";

export function formatGeneratedFiles(repositoryRoot: string, files: string[]): void {
  if (files.length === 0) {
    return;
  }

  const result = spawnSync("npx", ["biome", "check", "--write", ...files], {
    cwd: repositoryRoot,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`biome format generated files failed with status ${result.status ?? "unknown"}.`);
  }
}
