import { booleanFlag, parseArgs, printUsage, stringFlag } from "./_lib/cli";
import { ensureRepositoryRoot } from "./_lib/files";
import { formatGeneratedFiles } from "./_lib/format";
import { assertKebabCase, pascalCase, titleCase } from "./_lib/naming";
import { addNavigationItem } from "./_lib/navigation";
import { renderTemplateTree } from "./_lib/templates";
import { generateAiContext } from "./generate-ai-context";
import path from "node:path";

export interface CreateDashboardOptions {
  repositoryRoot: string;
  name: string;
  description?: string;
  navigation?: boolean;
  navigationIcon?: string;
  navigationTitle?: string;
  force?: boolean;
  refreshContext?: boolean;
}

export async function createDashboard(options: CreateDashboardOptions): Promise<string[]> {
  const {
    repositoryRoot,
    description = "Replace placeholder metrics with approved server data.",
    navigation = true,
    navigationIcon = "LayoutDashboard",
    navigationTitle,
    force = false,
    refreshContext = true,
  } = options;

  await ensureRepositoryRoot(repositoryRoot);
  const routeName = assertKebabCase(options.name, "dashboard name");

  const destination = path.join(repositoryRoot, "src", "app", "(main)", "dashboard", routeName);

  const written = await renderTemplateTree({
    templateDirectory: path.join(repositoryRoot, "templates", "dashboard"),
    destinationDirectory: destination,
    tokens: {
      ROUTE_NAME: routeName,
      PASCAL_NAME: pascalCase(routeName),
      TITLE_NAME: titleCase(routeName),
      DESCRIPTION: description,
    },
    force,
  });

  if (navigation) {
    await addNavigationItem(repositoryRoot, {
      id: routeName,
      title: navigationTitle ?? titleCase(routeName),
      url: `/dashboard/${routeName}`,
      icon: navigationIcon,
      group: "Dashboards",
    });
    written.push(path.join(repositoryRoot, "src", "navigation", "sidebar", "sidebar-items.ts"));
  }

  formatGeneratedFiles(repositoryRoot, written);

  if (refreshContext) {
    await generateAiContext({ repositoryRoot });
  }

  return written;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (args.flags.has("help") || args.positionals.length === 0) {
    printUsage([
      "Create a dashboard overview scaffold.",
      "",
      "Usage:",
      "  npm run generate:dashboard -- <kebab-name> [options]",
      "",
      "Options:",
      "  --description <text>",
      "  --no-nav",
      "  --nav-icon <LucideExport>",
      "  --nav-title <text>",
      "  --force",
      "  --no-context",
    ]);
    return;
  }

  const repositoryRoot = process.cwd();
  const written = await createDashboard({
    repositoryRoot,
    name: args.positionals[0],
    description: stringFlag(args, "description"),
    navigation: booleanFlag(args, "nav", true),
    navigationIcon: stringFlag(args, "nav-icon", "LayoutDashboard"),
    navigationTitle: stringFlag(args, "nav-title"),
    force: booleanFlag(args, "force"),
    refreshContext: booleanFlag(args, "context", true),
  });

  console.log(`Created ${written.length} files:`);
  for (const file of written) {
    console.log(`- ${path.relative(repositoryRoot, file)}`);
  }
}

if (require.main === module) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
