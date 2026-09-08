import { booleanFlag, parseArgs, printUsage } from "./_lib/cli";
import { ensureRepositoryRoot, pathExists } from "./_lib/files";
import {
  extractNavigationIds,
  extractNavigationUrls,
  isExternalUrl,
  routeMatchesUrl,
  scanAppRoutes,
} from "./_lib/routes";
import { readFile } from "node:fs/promises";
import path from "node:path";

export interface NavigationValidationResult {
  routes: string[];
  navigationUrls: string[];
  errors: string[];
  warnings: string[];
}

function duplicates(values: string[]): string[] {
  const counts = new Map<string, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([value]) => value)
    .sort((a, b) => a.localeCompare(b));
}

export async function validateNavigation(repositoryRoot: string): Promise<NavigationValidationResult> {
  await ensureRepositoryRoot(repositoryRoot);

  const navigationPath = path.join(repositoryRoot, "src", "navigation", "sidebar", "sidebar-items.ts");

  if (!(await pathExists(navigationPath))) {
    return {
      routes: [],
      navigationUrls: [],
      errors: [`Navigation file not found: ${navigationPath}`],
      warnings: [],
    };
  }

  const source = await readFile(navigationPath, "utf8");
  const navigationUrls = extractNavigationUrls(source);
  const navigationIds = extractNavigationIds(source);
  const routes = await scanAppRoutes(path.join(repositoryRoot, "src", "app"));
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const duplicate of duplicates(navigationIds)) {
    errors.push(`Duplicate navigation id: ${duplicate}`);
  }

  for (const duplicate of duplicates([...source.matchAll(/\burl:\s*["']([^"']+)["']/g)].map((match) => match[1]))) {
    warnings.push(`Duplicate navigation URL: ${duplicate}`);
  }

  for (const url of navigationUrls) {
    if (isExternalUrl(url)) {
      continue;
    }

    if (!routes.some((route) => routeMatchesUrl(route, url))) {
      errors.push(`Navigation URL does not resolve to an App Router page: ${url}`);
    }
  }

  return { routes, navigationUrls, errors, warnings };
}

function printResult(result: NavigationValidationResult): void {
  for (const error of result.errors) {
    console.log(`ERROR ${error}`);
  }

  for (const warning of result.warnings) {
    console.log(`WARNING ${warning}`);
  }

  if (result.errors.length === 0 && result.warnings.length === 0) {
    console.log(
      `Navigation validation passed for ${result.navigationUrls.length} URLs and ${result.routes.length} routes.`,
    );
  } else {
    console.log(`Navigation validation: ${result.errors.length} errors, ${result.warnings.length} warnings.`);
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (args.flags.has("help")) {
    printUsage([
      "Validate sidebar IDs and route targets.",
      "",
      "Usage:",
      "  npm run validate:navigation",
      "",
      "Options:",
      "  --json",
      "  --strict-warnings",
    ]);
    return;
  }

  const result = await validateNavigation(process.cwd());

  if (booleanFlag(args, "json")) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printResult(result);
  }

  if (result.errors.length > 0 || (booleanFlag(args, "strict-warnings") && result.warnings.length > 0)) {
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
