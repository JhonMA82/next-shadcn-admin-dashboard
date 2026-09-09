import { pathExists, readJson } from "./_lib/files";
import { createCrud } from "./create-crud";
import { createDashboard } from "./create-dashboard";
import { createFeature } from "./create-feature";
import { createProject } from "./create-project";
import { generateAiContext } from "./generate-ai-context";
import { validateArchitecture } from "./validate-architecture";
import { validateNavigation } from "./validate-navigation";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

async function fixtureWrite(filePath: string, content: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content, "utf8");
}

async function writeFixture(repositoryRoot: string, fixtureRoot: string): Promise<void> {
  await cp(path.join(repositoryRoot, "templates"), path.join(fixtureRoot, "templates"), {
    recursive: true,
  });
  await cp(path.join(repositoryRoot, "docs"), path.join(fixtureRoot, "docs"), {
    recursive: true,
  });
  await cp(path.join(repositoryRoot, "scripts"), path.join(fixtureRoot, "scripts"), {
    recursive: true,
  });
  await cp(path.join(repositoryRoot, "AGENTS.md"), path.join(fixtureRoot, "AGENTS.md"));

  await fixtureWrite(
    path.join(fixtureRoot, "package.json"),
    `${JSON.stringify(
      {
        name: "phase1-fixture",
        version: "1.0.0",
        private: true,
        scripts: {
          "generate:project": "ts-node -P tsconfig.scripts.json scripts/create-project.ts",
          "generate:feature": "ts-node -P tsconfig.scripts.json scripts/create-feature.ts",
          "generate:dashboard": "ts-node -P tsconfig.scripts.json scripts/create-dashboard.ts",
          "generate:crud": "ts-node -P tsconfig.scripts.json scripts/create-crud.ts",
          "ai:context": "ts-node -P tsconfig.scripts.json scripts/generate-ai-context.ts",
          "ai:context:check": "ts-node -P tsconfig.scripts.json scripts/generate-ai-context.ts --check",
          "validate:architecture": "ts-node -P tsconfig.scripts.json scripts/validate-architecture.ts",
          "validate:navigation": "ts-node -P tsconfig.scripts.json scripts/validate-navigation.ts",
          "phase1:self-test": "ts-node -P tsconfig.scripts.json scripts/self-test.ts",
          typecheck: "tsc --noEmit",
          validate:
            "npm run check && npm run typecheck && npm run validate:architecture && npm run validate:navigation && npm run ai:context:check && npm run build",
        },
        dependencies: {
          next: "^16.2.11",
          react: "^19.2.8",
          zod: "^4.4.3",
          "react-hook-form": "^7.82.0",
          "@tanstack/react-table": "^8.21.3",
          zustand: "^5.0.14",
        },
        devDependencies: {
          typescript: "^5.9.3",
          "ts-node": "^10.9.2",
          "@biomejs/biome": "^2.5.5",
          tailwindcss: "^4.1.5",
        },
      },
      null,
      2,
    )}\n`,
  );

  await fixtureWrite(
    path.join(fixtureRoot, "components.json"),
    `${JSON.stringify(
      {
        style: "radix-nova",
        rsc: true,
        iconLibrary: "lucide",
        aliases: {
          components: "@/components",
          utils: "@/lib/utils",
          ui: "@/components/ui",
          lib: "@/lib",
          hooks: "@/hooks",
        },
      },
      null,
      2,
    )}\n`,
  );

  await fixtureWrite(path.join(fixtureRoot, "PROJECT.md"), "# Fixture\n\nConfigured project contract.\n");

  const defaultRoute = path.join(fixtureRoot, "src", "app", "(main)", "dashboard", "default");
  await cp(path.join(repositoryRoot, "templates", "feature"), path.join(fixtureRoot, ".fixture-template-copy"), {
    recursive: true,
  });
  await rm(path.join(fixtureRoot, ".fixture-template-copy"), { recursive: true, force: true });

  await fixtureWrite(
    path.join(defaultRoute, "page.tsx"),
    "export default function Page() { return <main>Default</main>; }\n",
  );

  for (const demo of ["crm", "finance", "analytics", "chat", "mail"]) {
    await fixtureWrite(
      path.join(fixtureRoot, "src", "app", "(main)", "dashboard", demo, "page.tsx"),
      `export default function Page() { return <main>${demo}</main>; }\n`,
    );
  }

  for (const standalone of ["chat", "mail"]) {
    await fixtureWrite(
      path.join(fixtureRoot, "src", "app", "(main)", standalone, "page.tsx"),
      `export default function Page() { return <main>${standalone}</main>; }\n`,
    );
  }

  for (const shell of ["auth", "unauthorized"]) {
    await fixtureWrite(
      path.join(fixtureRoot, "src", "app", "(main)", shell, "page.tsx"),
      `export default function Page() { return <main>${shell}</main>; }\n`,
    );
  }

  const uiRoot = path.join(fixtureRoot, "src", "components", "ui");
  for (const name of ["button", "card", "input", "skeleton", "table"]) {
    await fixtureWrite(path.join(uiRoot, `${name}.tsx`), `export const ${name} = "${name}";\n`);
  }

  await fixtureWrite(
    path.join(fixtureRoot, "src", "navigation", "sidebar", "sidebar-items.ts"),
    `import {
  LayoutDashboard,
  SquareArrowUpRight,
  type LucideIcon,
  Users,
} from "lucide-react";

export type NavBadge = "new" | "soon";
export interface NavSubItem {
  id: string;
  title: string;
  url: string;
  icon?: LucideIcon;
}
interface NavItemBase {
  id: string;
  title: string;
  icon?: LucideIcon;
}
export interface NavMainLinkItem extends NavItemBase {
  url: string;
  subItems?: never;
}
export interface NavMainParentItem extends NavItemBase {
  subItems: NavSubItem[];
}
export type NavMainItem = NavMainLinkItem | NavMainParentItem;
export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}
export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Dashboards",
    items: [
      {
        id: "default",
        title: "Default",
        url: "/dashboard/default",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: 2,
    label: "Pages",
    items: [],
  },
];
`,
  );
}

async function assertPath(targetPath: string): Promise<void> {
  if (!(await pathExists(targetPath))) {
    throw new Error(`Expected generated path: ${targetPath}`);
  }
}

async function assertAbsent(targetPath: string): Promise<void> {
  if (await pathExists(targetPath)) {
    throw new Error(`Expected path to be removed: ${targetPath}`);
  }
}

async function assertContains(filePath: string, fragment: string): Promise<void> {
  const content = await readFile(filePath, "utf8");
  if (!content.includes(fragment)) {
    throw new Error(`Expected ${filePath} to contain: ${fragment}`);
  }
}

async function assertNotContains(filePath: string, fragment: string): Promise<void> {
  const content = await readFile(filePath, "utf8");
  if (content.includes(fragment)) {
    throw new Error(`Expected ${filePath} not to contain: ${fragment}`);
  }
}

async function assertDerivedCleanup(derivedRoot: string): Promise<void> {
  for (const relative of [
    "scripts/create-project.ts",
    "scripts/self-test.ts",
    "templates/project",
    "apply-phase1.mjs",
    "package-scripts.phase1.json",
    "MANIFEST.md",
    "PROJECT.template.md",
    "INSTALL.es.md",
  ]) {
    await assertAbsent(path.join(derivedRoot, relative));
  }

  const derivedPackage = await readJson<{ name: string; scripts?: Record<string, string> }>(
    path.join(derivedRoot, "package.json"),
  );

  for (const script of [
    "generate:feature",
    "generate:dashboard",
    "generate:crud",
    "ai:context",
    "validate:architecture",
    "validate:navigation",
    "validate",
    "typecheck",
  ]) {
    if (!derivedPackage.scripts?.[script]) {
      throw new Error(`Derived project lost required script: ${script}`);
    }
  }

  for (const script of ["generate:project", "phase1:self-test"]) {
    if (derivedPackage.scripts?.[script]) {
      throw new Error(`Derived project kept source-only script: ${script}`);
    }
  }

  for (const relative of [
    "scripts/_lib/cli.ts",
    "scripts/create-feature.ts",
    "scripts/create-dashboard.ts",
    "scripts/create-crud.ts",
    "scripts/generate-ai-context.ts",
    "scripts/validate-architecture.ts",
    "scripts/validate-navigation.ts",
    "templates/feature/page.tsx.tpl",
    "templates/dashboard/page.tsx.tpl",
    "templates/crud/page.tsx.tpl",
    "AGENTS.md",
    "PROJECT.md",
    "docs/architecture.md",
    "docs/ai/project-map.yaml",
    ".boilerplate.json",
  ]) {
    await assertPath(path.join(derivedRoot, relative));
  }

  await assertNotContains(path.join(derivedRoot, "docs", "ai", "project-map.yaml"), "generateProject:");
}

async function main(): Promise<void> {
  const repositoryRoot = process.cwd();
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "studio-admin-phase1-"));
  const fixtureRoot = path.join(temporaryRoot, "boilerplate");
  const derivedRoot = path.join(temporaryRoot, "derived-project");
  const minimalRoot = path.join(temporaryRoot, "minimal-project");

  try {
    await writeFixture(repositoryRoot, fixtureRoot);

    await createFeature({
      repositoryRoot: fixtureRoot,
      name: "billing",
      navigation: true,
      refreshContext: false,
    });
    await createDashboard({
      repositoryRoot: fixtureRoot,
      name: "insights",
      refreshContext: false,
    });
    await createCrud({
      repositoryRoot: fixtureRoot,
      routeName: "vendors",
      refreshContext: false,
    });
    await createCrud({
      repositoryRoot: fixtureRoot,
      routeName: "warehouse-units",
      singularName: "warehouse-unit",
      refreshContext: false,
    });

    await assertPath(path.join(fixtureRoot, "src", "app", "(main)", "dashboard", "billing", "page.tsx"));
    await assertPath(
      path.join(fixtureRoot, "src", "app", "(main)", "dashboard", "billing", "_components", "billing-overview.tsx"),
    );
    await assertContains(
      path.join(fixtureRoot, "src", "navigation", "sidebar", "sidebar-items.ts"),
      "/dashboard/billing",
    );
    await assertPath(path.join(fixtureRoot, "src", "app", "(main)", "dashboard", "insights", "page.tsx"));
    await assertPath(
      path.join(fixtureRoot, "src", "app", "(main)", "dashboard", "insights", "_components", "insights-kpis.tsx"),
    );
    await assertContains(
      path.join(fixtureRoot, "src", "navigation", "sidebar", "sidebar-items.ts"),
      "/dashboard/insights",
    );
    await assertPath(path.join(fixtureRoot, "src", "app", "(main)", "dashboard", "vendors", "page.tsx"));
    await assertPath(path.join(fixtureRoot, "src", "app", "(main)", "dashboard", "vendors", "new", "page.tsx"));
    await assertPath(
      path.join(fixtureRoot, "src", "app", "(main)", "dashboard", "vendors", "[id]", "edit", "page.tsx"),
    );
    await assertPath(
      path.join(fixtureRoot, "src", "app", "(main)", "dashboard", "vendors", "_components", "vendor-table.tsx"),
    );
    await assertPath(
      path.join(fixtureRoot, "src", "app", "(main)", "dashboard", "vendors", "_components", "vendor-form.tsx"),
    );
    await assertPath(path.join(fixtureRoot, "src", "app", "(main)", "dashboard", "vendors", "_data", "vendors.ts"));
    await assertPath(path.join(fixtureRoot, "src", "app", "(main)", "dashboard", "vendors", "_schemas", "vendor.ts"));

    const singularRoute = path.join(fixtureRoot, "src", "app", "(main)", "dashboard", "warehouse-units");
    await assertPath(path.join(singularRoute, "_components", "warehouse-unit-columns.tsx"));
    const singularSources = [
      await readFile(path.join(singularRoute, "page.tsx"), "utf8"),
      await readFile(path.join(singularRoute, "_components", "warehouse-unit-columns.tsx"), "utf8"),
      await readFile(path.join(singularRoute, "_components", "warehouse-unit-form.tsx"), "utf8"),
      await readFile(path.join(singularRoute, "_data", "warehouse-units.ts"), "utf8"),
    ].join("\n");
    for (const variant of [
      "warehouse-units",
      "warehouse-unit",
      "WarehouseUnits",
      "WarehouseUnit",
      "warehouseUnits",
      "warehouseUnit",
    ]) {
      if (!singularSources.includes(variant)) {
        throw new Error(`Singular CRUD scaffold missing naming variant: ${variant}`);
      }
    }

    await generateAiContext({ repositoryRoot: fixtureRoot });

    const architecture = await validateArchitecture(fixtureRoot);
    if (architecture.errorCount > 0) {
      throw new Error(
        `Architecture self-test produced ${architecture.errorCount} errors:\n${JSON.stringify(
          architecture.findings,
          null,
          2,
        )}`,
      );
    }

    const navigation = await validateNavigation(fixtureRoot);
    if (navigation.errors.length > 0) {
      throw new Error(`Navigation self-test failed:\n${navigation.errors.join("\n")}`);
    }

    await createProject({
      repositoryRoot: fixtureRoot,
      name: "derived-project",
      destination: derivedRoot,
      profile: "full",
    });

    const derivedPackage = await readJson<{ name: string; version: string }>(path.join(derivedRoot, "package.json"));

    if (derivedPackage.name !== "derived-project" || derivedPackage.version !== "0.1.0") {
      throw new Error("Derived project package identity was not updated correctly.");
    }

    await assertDerivedCleanup(derivedRoot);

    await createFeature({
      repositoryRoot: derivedRoot,
      name: "reports",
      navigation: true,
      refreshContext: false,
    });
    await createDashboard({
      repositoryRoot: derivedRoot,
      name: "operations",
      refreshContext: false,
    });
    await createCrud({
      repositoryRoot: derivedRoot,
      routeName: "customers",
      refreshContext: false,
    });
    await createCrud({
      repositoryRoot: derivedRoot,
      routeName: "inventory-items",
      singularName: "inventory-item",
      refreshContext: false,
    });

    await assertPath(path.join(derivedRoot, "src", "app", "(main)", "dashboard", "reports", "page.tsx"));
    await assertPath(path.join(derivedRoot, "src", "app", "(main)", "dashboard", "operations", "page.tsx"));
    await assertPath(path.join(derivedRoot, "src", "app", "(main)", "dashboard", "customers", "page.tsx"));
    await assertPath(
      path.join(
        derivedRoot,
        "src",
        "app",
        "(main)",
        "dashboard",
        "inventory-items",
        "_components",
        "inventory-item-columns.tsx",
      ),
    );
    await assertContains(
      path.join(derivedRoot, "src", "navigation", "sidebar", "sidebar-items.ts"),
      "/dashboard/reports",
    );

    await assertContains(
      path.join(derivedRoot, "src", "navigation", "sidebar", "sidebar-items.ts"),
      "export const sidebarItems: NavGroup[] = [",
    );

    await generateAiContext({ repositoryRoot: derivedRoot });

    const derivedNavigation = await validateNavigation(derivedRoot);
    if (derivedNavigation.errors.length > 0) {
      throw new Error(`Derived navigation self-test failed:\n${derivedNavigation.errors.join("\n")}`);
    }

    const derivedArchitecture = await validateArchitecture(derivedRoot);
    if (derivedArchitecture.errorCount > 0) {
      throw new Error(
        `Derived architecture self-test produced ${derivedArchitecture.errorCount} errors:\n${JSON.stringify(
          derivedArchitecture.findings,
          null,
          2,
        )}`,
      );
    }

    await createProject({
      repositoryRoot: fixtureRoot,
      name: "minimal-project",
      destination: minimalRoot,
      profile: "minimal",
    });

    await assertPath(path.join(minimalRoot, "src", "app", "(main)", "dashboard", "default", "page.tsx"));
    for (const demo of ["crm", "finance", "analytics", "chat", "mail"]) {
      await assertAbsent(path.join(minimalRoot, "src", "app", "(main)", "dashboard", demo));
    }
    await assertAbsent(path.join(minimalRoot, "src", "app", "(main)", "chat"));
    await assertAbsent(path.join(minimalRoot, "src", "app", "(main)", "mail"));
    await assertPath(path.join(minimalRoot, "src", "app", "(main)", "auth", "page.tsx"));
    await assertPath(path.join(minimalRoot, "src", "app", "(main)", "unauthorized", "page.tsx"));

    await assertContains(
      path.join(minimalRoot, "src", "navigation", "sidebar", "sidebar-items.ts"),
      "/dashboard/default",
    );
    await assertNotContains(path.join(minimalRoot, "src", "navigation", "sidebar", "sidebar-items.ts"), "Pages");

    const minimalCanonical = path.join(minimalRoot, "docs", "ai", "canonical-examples.yaml");
    await assertContains(minimalCanonical, "dashboard/default");
    for (const removed of ["/dashboard/crm", "/dashboard/finance", "/dashboard/analytics", "/dashboard/chat"]) {
      await assertNotContains(minimalCanonical, removed);
    }

    const minimalContext = path.join(minimalRoot, "docs", "ai", "generated-context.md");
    await assertContains(minimalContext, "`/dashboard/default`");
    for (const removed of [
      "`/dashboard/crm`",
      "`/dashboard/finance`",
      "`/dashboard/analytics`",
      "`/dashboard/chat`",
      "`/dashboard/mail`",
      "- `/chat`",
      "- `/mail`",
    ]) {
      await assertNotContains(minimalContext, removed);
    }

    await assertDerivedCleanup(minimalRoot);

    await createFeature({
      repositoryRoot: minimalRoot,
      name: "reports",
      navigation: true,
      refreshContext: false,
    });
    await assertPath(path.join(minimalRoot, "src", "app", "(main)", "dashboard", "reports", "page.tsx"));
    await assertContains(
      path.join(minimalRoot, "src", "navigation", "sidebar", "sidebar-items.ts"),
      "/dashboard/reports",
    );

    await assertContains(
      path.join(minimalRoot, "src", "navigation", "sidebar", "sidebar-items.ts"),
      "export const sidebarItems: NavGroup[] = [",
    );

    const minimalNavigation = await validateNavigation(minimalRoot);
    if (minimalNavigation.errors.length > 0) {
      throw new Error(`Minimal navigation self-test failed:\n${minimalNavigation.errors.join("\n")}`);
    }

    const context = await readFile(path.join(fixtureRoot, "docs", "ai", "generated-context.md"), "utf8");

    if (!context.includes("/dashboard/vendors") || !context.includes("billing")) {
      throw new Error("Generated AI context did not include generated routes.");
    }

    console.log("Phase 1 self-test passed.");
    console.log("- Feature generator: passed");
    console.log("- Feature generator with navigation: passed");
    console.log("- Dashboard generator: passed");
    console.log("- CRUD generator: passed");
    console.log("- CRUD generator with explicit singular: passed");
    console.log("- Project generator: passed");
    console.log("- Minimal navigation auto-group: passed");
    console.log("- Derived project cleanup: passed");
    console.log("- Derived project generators: passed");
    console.log("- AI context generation: passed");
    console.log("- Architecture validation: passed");
    console.log("- Navigation validation: passed");
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

if (require.main === module) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
