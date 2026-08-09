import { gzipSync } from "node:zlib";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

type RouteBudget = {
  readonly pattern: RegExp;
  readonly maxGzipBytes: number;
};

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const NEXT_DIR = join(ROOT, ".next");
const STATIC_DIR = join(NEXT_DIR, "static", "chunks");

const ROUTE_BUDGETS: readonly RouteBudget[] = [
  { pattern: /^\/$/, maxGzipBytes: 150 * 1024 },
  { pattern: /^\/dictionary$/, maxGzipBytes: 150 * 1024 },
  { pattern: /^\/review$/, maxGzipBytes: 150 * 1024 },
  { pattern: /^\/topics$/, maxGzipBytes: 180 * 1024 },
  { pattern: /^\/training$/, maxGzipBytes: 180 * 1024 },
  { pattern: /^\/training\/[^/]+$/, maxGzipBytes: 220 * 1024 },
];

function gzipSizeBytes(filePath: string): number {
  const source = readFileSync(filePath);
  return gzipSync(source).length;
}

function collectChunkFiles(): Map<string, number> {
  const sizes = new Map<string, number>();

  if (!existsSync(STATIC_DIR)) {
    throw new Error("Missing .next/static/chunks. Run `pnpm build` first.");
  }

  for (const entry of readdirSync(STATIC_DIR, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".js")) {
      continue;
    }

    sizes.set(entry.name, gzipSizeBytes(join(STATIC_DIR, entry.name)));
  }

  return sizes;
}

function routeFromManifestPath(manifestPath: string): string {
  const relativePath = relative(join(NEXT_DIR, "server", "app"), manifestPath);
  const withoutSuffix = relativePath.replace(/\/page_client-reference-manifest\.js$/, "");
  const segments = withoutSuffix.split("/").filter(Boolean);

  if (segments.length === 0) {
    return "/";
  }

  return `/${segments.join("/")}`;
}

function chunkNamesFromManifest(manifestPath: string): string[] {
  const source = readFileSync(manifestPath, "utf8");
  const matches = source.match(/static\/chunks\/[^"]+\.js/g) ?? [];
  return [...new Set(matches.map((match) => match.split("/").pop() ?? match))];
}

function findBudget(route: string): number | undefined {
  return ROUTE_BUDGETS.find((budget) => budget.pattern.test(route))?.maxGzipBytes;
}

function main(): void {
  const chunkSizes = collectChunkFiles();
  const manifestRoot = join(NEXT_DIR, "server", "app");
  const manifests: string[] = [];

  function walk(directory: string): void {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const fullPath = join(directory, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }

      if (entry.name === "page_client-reference-manifest.js") {
        manifests.push(fullPath);
      }
    }
  }

  walk(manifestRoot);

  const violations: string[] = [];
  const reportLines: string[] = ["Route bundle report (gzip):"];

  for (const manifestPath of manifests.sort()) {
    const route = routeFromManifestPath(manifestPath);
    const budget = findBudget(route);

    if (budget === undefined) {
      continue;
    }

    const chunkNames = chunkNamesFromManifest(manifestPath);
    const totalGzip = chunkNames.reduce(
      (sum, chunkName) => sum + (chunkSizes.get(chunkName) ?? 0),
      0,
    );
    reportLines.push(
      `- ${route}: ${Math.round(totalGzip / 1024)} KB gzip (budget ${Math.round(budget / 1024)} KB)`,
    );

    if (totalGzip > budget) {
      violations.push(`${route} exceeded budget (${totalGzip} > ${budget} bytes gzip)`);
    }
  }

  console.log(reportLines.join("\n"));

  if (violations.length > 0) {
    console.error("\nBundle budget violations:");
    for (const violation of violations) {
      console.error(`- ${violation}`);
    }
    process.exit(1);
  }
}

main();
