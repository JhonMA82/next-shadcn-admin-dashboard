import { booleanFlag, parseArgs, printUsage } from "./_lib/cli";
import { ensureRepositoryRoot, walkFiles } from "./_lib/files";
import { readFile } from "node:fs/promises";
import path from "node:path";

export type FindingSeverity = "error" | "warning";

export interface ArchitectureFinding {
  severity: FindingSeverity;
  code: string;
  file: string;
  message: string;
}

export interface ArchitectureValidationResult {
  findings: ArchitectureFinding[];
  errorCount: number;
  warningCount: number;
}

const SOURCE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];
const PRIVATE_SEGMENTS = new Set(["_components", "_schemas", "_data", "_lib"]);
const RAW_COLOR_PATTERN =
  /(?:#[0-9a-fA-F]{3,8}\b|(?:rgb|hsl|oklch)a?\s*\(|\b(?:bg|text|border|fill|stroke)-\[[^\]]+\])/;
const EXPLICIT_ANY_PATTERN = /(?:^|[<(:,\s])any(?:[>\]),;\s]|$)/m;

function normalizeSlash(value: string): string {
  return value.split(path.sep).join("/");
}

function firstDirective(source: string): string | null {
  const withoutBom = source.replace(/^\uFEFF/, "");
  const lines = withoutBom.split(/\r?\n/).slice(0, 8);

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line || line.startsWith("//")) {
      continue;
    }

    const match = line.match(/^["']([^"']+)["'];?$/);
    return match?.[1] ?? null;
  }

  return null;
}

function parseImports(source: string): string[] {
  const staticImports = [
    ...source.matchAll(/(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g),
  ].map((match) => match[1]);

  const dynamicImports = [...source.matchAll(/import\(\s*["']([^"']+)["']\s*\)/g)].map((match) => match[1]);

  return [...new Set([...staticImports, ...dynamicImports])];
}

function resolveImport(repositoryRoot: string, sourceFile: string, specifier: string): string | null {
  if (specifier.startsWith("@/")) {
    return path.join(repositoryRoot, "src", specifier.slice(2));
  }

  if (specifier.startsWith(".")) {
    return path.resolve(path.dirname(sourceFile), specifier);
  }

  return null;
}

interface FeatureInfo {
  name: string | null;
  legacy: boolean;
  privateSegment: string | null;
}

function featureInfo(repositoryRoot: string, targetPath: string): FeatureInfo {
  const dashboardRoot = normalizeSlash(path.join(repositoryRoot, "src", "app", "(main)", "dashboard"));
  const normalized = normalizeSlash(targetPath);

  if (!normalized.startsWith(`${dashboardRoot}/`)) {
    return { name: null, legacy: false, privateSegment: null };
  }

  const relativeSegments = normalized.slice(dashboardRoot.length + 1).split("/");
  let legacy = false;
  let feature: string | null = null;

  for (const segment of relativeSegments) {
    if (segment.startsWith("(") && segment.endsWith(")")) {
      if (segment === "(legacy)") {
        legacy = true;
      }
      continue;
    }

    if (PRIVATE_SEGMENTS.has(segment) || SOURCE_EXTENSIONS.includes(path.extname(segment))) {
      break;
    }

    feature = segment;
    break;
  }

  const privateSegment = feature ? (relativeSegments.find((segment) => PRIVATE_SEGMENTS.has(segment)) ?? null) : null;

  return { name: feature, legacy, privateSegment };
}

function isSourceFile(filePath: string): boolean {
  return SOURCE_EXTENSIONS.includes(path.extname(filePath)) && !filePath.endsWith(".d.ts");
}

function displayPath(repositoryRoot: string, filePath: string): string {
  return normalizeSlash(path.relative(repositoryRoot, filePath));
}

function addFinding(findings: ArchitectureFinding[], finding: ArchitectureFinding): void {
  findings.push(finding);
}

export async function validateArchitecture(repositoryRoot: string): Promise<ArchitectureValidationResult> {
  await ensureRepositoryRoot(repositoryRoot);

  const sourceRoot = path.join(repositoryRoot, "src");
  const sourceFiles = await walkFiles(sourceRoot, isSourceFile);
  const findings: ArchitectureFinding[] = [];

  for (const filePath of sourceFiles) {
    const relative = displayPath(repositoryRoot, filePath);
    const source = await readFile(filePath, "utf8");
    const normalized = normalizeSlash(filePath);
    const sourceFeature = featureInfo(repositoryRoot, filePath);

    if (path.basename(filePath) === "page.tsx" && firstDirective(source) === "use client") {
      addFinding(findings, {
        severity: "error",
        code: "PAGE_CLIENT_COMPONENT",
        file: relative,
        message: "page.tsx must remain a Server Component. Move browser interaction into a focused Client Component.",
      });
    }

    if (
      path.basename(filePath) === "page.tsx" &&
      /\b(window|document|localStorage|sessionStorage|navigator)\b/.test(source)
    ) {
      addFinding(findings, {
        severity: "error",
        code: "BROWSER_API_IN_PAGE",
        file: relative,
        message: "A Server Component page references a browser-only API.",
      });
    }

    if (
      normalized.includes(`${path.sep}app${path.sep}(main)${path.sep}dashboard${path.sep}`) &&
      !sourceFeature.legacy &&
      RAW_COLOR_PATTERN.test(source)
    ) {
      addFinding(findings, {
        severity: "warning",
        code: "RAW_FEATURE_COLOR",
        file: relative,
        message:
          "Feature code contains a raw or arbitrary color. Prefer semantic theme tokens unless explicitly required.",
      });
    }

    if (EXPLICIT_ANY_PATTERN.test(source)) {
      addFinding(findings, {
        severity: "warning",
        code: "EXPLICIT_ANY",
        file: relative,
        message: "Explicit any weakens the repository's type contract.",
      });
    }

    for (const specifier of parseImports(source)) {
      const resolved = resolveImport(repositoryRoot, filePath, specifier);
      if (!resolved) {
        continue;
      }

      const targetFeature = featureInfo(repositoryRoot, resolved);
      const targetNormalized = normalizeSlash(resolved);

      if (
        sourceFeature.name &&
        targetFeature.name &&
        sourceFeature.name !== targetFeature.name &&
        targetFeature.privateSegment
      ) {
        addFinding(findings, {
          severity: "error",
          code: "CROSS_FEATURE_PRIVATE_IMPORT",
          file: relative,
          message:
            `Imports private ${targetFeature.privateSegment} code from feature ` +
            `"${targetFeature.name}". Promote a proven shared abstraction instead.`,
        });
      }

      if (!sourceFeature.legacy && targetFeature.legacy) {
        addFinding(findings, {
          severity: "error",
          code: "LEGACY_IMPORT",
          file: relative,
          message: "New or current code imports a legacy route implementation.",
        });
      }

      if (
        (normalized.includes(`${path.sep}components${path.sep}ui${path.sep}`) ||
          normalized.includes(`${path.sep}components${path.sep}calendar${path.sep}`)) &&
        targetNormalized.includes(normalizeSlash(path.join("src", "app", "(main)", "dashboard")))
      ) {
        addFinding(findings, {
          severity: "error",
          code: "PRIMITIVE_DEPENDS_ON_FEATURE",
          file: relative,
          message: "A protected primitive depends on dashboard feature code.",
        });
      }

      if (
        normalized.includes(`${path.sep}server${path.sep}`) &&
        targetNormalized.includes(`${path.sep}src${path.sep}app${path.sep}`)
      ) {
        addFinding(findings, {
          severity: "error",
          code: "SERVER_IMPORTS_APP",
          file: relative,
          message: "Server/domain code must not depend on application routes.",
        });
      }

      if (
        normalized.includes(`${path.sep}lib${path.sep}`) &&
        targetNormalized.includes(`${path.sep}src${path.sep}app${path.sep}`)
      ) {
        addFinding(findings, {
          severity: "error",
          code: "LIB_IMPORTS_APP",
          file: relative,
          message: "Utility code must not depend on application routes.",
        });
      }
    }
  }

  findings.sort((a, b) => {
    let severityOrder = 0;
    if (a.severity !== b.severity) {
      severityOrder = a.severity === "error" ? -1 : 1;
    }
    return severityOrder || a.file.localeCompare(b.file) || a.code.localeCompare(b.code);
  });

  return {
    findings,
    errorCount: findings.filter((finding) => finding.severity === "error").length,
    warningCount: findings.filter((finding) => finding.severity === "warning").length,
  };
}

function printResult(result: ArchitectureValidationResult): void {
  if (result.findings.length === 0) {
    console.log("Architecture validation passed with no findings.");
    return;
  }

  for (const finding of result.findings) {
    console.log(`${finding.severity.toUpperCase()} ${finding.code} ${finding.file}: ${finding.message}`);
  }

  console.log(`Architecture validation: ${result.errorCount} errors, ${result.warningCount} warnings.`);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (args.flags.has("help")) {
    printUsage([
      "Validate high-confidence architecture invariants.",
      "",
      "Usage:",
      "  npm run validate:architecture",
      "  npm run validate:architecture -- --strict-warnings",
      "",
      "Options:",
      "  --strict-warnings  Treat warnings as failures.",
      "  --json             Emit machine-readable output.",
    ]);
    return;
  }

  const result = await validateArchitecture(process.cwd());

  if (booleanFlag(args, "json")) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printResult(result);
  }

  const strictWarnings = booleanFlag(args, "strict-warnings");
  if (result.errorCount > 0 || (strictWarnings && result.warningCount > 0)) {
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
