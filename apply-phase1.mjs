#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { copyFile, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const root = process.cwd();
const packagePath = path.join(root, "package.json");
const scriptsConfigPath = path.join(root, "tsconfig.scripts.json");

if (!existsSync(packagePath)) {
  console.error("package.json was not found. Run this command from the repository root.");
  process.exit(1);
}

let packageJson;
try {
  packageJson = JSON.parse(await readFile(packagePath, "utf8"));
} catch (error) {
  console.error(`Failed to parse package.json: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
}
packageJson.scripts ??= {};

const phase1Scripts = {
  "generate:project": "ts-node -P tsconfig.scripts.json scripts/create-project.ts",
  "generate:feature": "ts-node -P tsconfig.scripts.json scripts/create-feature.ts",
  "generate:crud": "ts-node -P tsconfig.scripts.json scripts/create-crud.ts",
  "generate:dashboard": "ts-node -P tsconfig.scripts.json scripts/create-dashboard.ts",
  "ai:context": "ts-node -P tsconfig.scripts.json scripts/generate-ai-context.ts",
  "ai:context:check": "ts-node -P tsconfig.scripts.json scripts/generate-ai-context.ts --check",
  "validate:architecture": "ts-node -P tsconfig.scripts.json scripts/validate-architecture.ts",
  "validate:navigation": "ts-node -P tsconfig.scripts.json scripts/validate-navigation.ts",
  "phase1:self-test": "ts-node -P tsconfig.scripts.json scripts/self-test.ts",
  typecheck: "tsc --noEmit",
  validate:
    "npm run check && npm run typecheck && npm run validate:architecture && npm run validate:navigation && npm run ai:context:check && npm run build",
};

for (const [name, command] of Object.entries(phase1Scripts)) {
  packageJson.scripts[name] = command;
}

await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

let scriptsConfig = {
  extends: "./tsconfig.json",
  compilerOptions: {
    module: "CommonJS",
    moduleResolution: "node",
  },
  include: ["src/scripts/**/*.ts", "scripts/**/*.ts"],
};

if (existsSync(scriptsConfigPath)) {
  try {
    scriptsConfig = JSON.parse(await readFile(scriptsConfigPath, "utf8"));
  } catch (error) {
    console.error(`Failed to parse tsconfig.scripts.json: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
  scriptsConfig.compilerOptions ??= {};
  scriptsConfig.compilerOptions.module = "CommonJS";
  scriptsConfig.compilerOptions.moduleResolution = "node";

  const includes = new Set(scriptsConfig.include ?? []);
  includes.add("src/scripts/**/*.ts");
  includes.add("scripts/**/*.ts");
  scriptsConfig.include = [...includes];
}

await writeFile(scriptsConfigPath, `${JSON.stringify(scriptsConfig, null, 2)}\n`);

const projectPath = path.join(root, "PROJECT.md");
const projectTemplatePath = path.join(root, "PROJECT.template.md");
if (!existsSync(projectPath) && existsSync(projectTemplatePath)) {
  await copyFile(projectTemplatePath, projectPath);
  console.log("Created PROJECT.md from PROJECT.template.md.");
}

const contextResult = spawnSync(
  process.execPath,
  [require.resolve("ts-node/dist/bin.js"), "-P", "tsconfig.scripts.json", "scripts/generate-ai-context.ts"],
  {
    cwd: root,
    stdio: "inherit",
  },
);

if (contextResult.status !== 0) {
  console.error("Phase 1 files were installed, but AI context generation failed.");
  process.exit(contextResult.status ?? 1);
}

console.log("Phase 1 installation complete.");
console.log("Next: complete PROJECT.md, then run npm run phase1:self-test and npm run validate.");
