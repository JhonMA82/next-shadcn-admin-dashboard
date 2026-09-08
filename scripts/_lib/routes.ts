import { walkFiles } from "./files";
import path from "node:path";

function normalizeSlash(value: string): string {
  return value.split(path.sep).join("/");
}

function isRouteGroup(segment: string): boolean {
  return segment.startsWith("(") && segment.endsWith(")");
}

function isParallelRoute(segment: string): boolean {
  return segment.startsWith("@");
}

function routeSegment(segment: string): string | null {
  if (isRouteGroup(segment) || isParallelRoute(segment)) {
    return null;
  }

  if (segment.startsWith("[[...") && segment.endsWith("]]")) {
    return `*${segment.slice(5, -2)}?`;
  }

  if (segment.startsWith("[...") && segment.endsWith("]")) {
    return `*${segment.slice(4, -1)}`;
  }

  if (segment.startsWith("[") && segment.endsWith("]")) {
    return `:${segment.slice(1, -1)}`;
  }

  return segment;
}

export function pageFileToRoute(appRoot: string, pageFile: string): string {
  const relativeDirectory = path.relative(appRoot, path.dirname(pageFile));
  const segments = normalizeSlash(relativeDirectory)
    .split("/")
    .filter(Boolean)
    .map(routeSegment)
    .filter((segment): segment is string => Boolean(segment));

  return segments.length === 0 ? "/" : `/${segments.join("/")}`;
}

export async function scanAppRoutes(appRoot: string): Promise<string[]> {
  const pages = await walkFiles(appRoot, (filePath) => path.basename(filePath) === "page.tsx");
  return [...new Set(pages.map((page) => pageFileToRoute(appRoot, page)))].sort((a, b) => a.localeCompare(b));
}

export function routeMatchesUrl(route: string, rawUrl: string): boolean {
  const url = rawUrl.split(/[?#]/)[0];
  const routeSegments = route.split("/").filter(Boolean);
  const urlSegments = url.split("/").filter(Boolean);

  for (let routeIndex = 0, urlIndex = 0; routeIndex < routeSegments.length; routeIndex += 1) {
    const segment = routeSegments[routeIndex];

    if (segment.startsWith("*")) {
      const optional = segment.endsWith("?");
      return optional || urlIndex < urlSegments.length;
    }

    if (urlIndex >= urlSegments.length) {
      return false;
    }

    if (!segment.startsWith(":") && segment !== urlSegments[urlIndex]) {
      return false;
    }

    urlIndex += 1;

    if (routeIndex === routeSegments.length - 1 && urlIndex !== urlSegments.length) {
      return false;
    }
  }

  return routeSegments.length === 0 ? urlSegments.length === 0 : routeSegments.length > 0;
}

export function isExternalUrl(url: string): boolean {
  return /^(https?:|mailto:|tel:|#)/.test(url);
}

export function extractNavigationUrls(source: string): string[] {
  const urls = [...source.matchAll(/\burl:\s*["']([^"']+)["']/g)].map((match) => match[1]);
  return [...new Set(urls)].sort((a, b) => a.localeCompare(b));
}

export function extractNavigationIds(source: string): string[] {
  return [...source.matchAll(/\bid:\s*["']([^"']+)["']/g)].map((match) => match[1]);
}
