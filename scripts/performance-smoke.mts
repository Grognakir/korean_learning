type RouteSpec = {
  readonly path: string;
  readonly expectRedirect?: boolean;
};

const DEFAULT_ROUTES: readonly RouteSpec[] = [
  { path: "/" },
  { path: "/topics" },
  { path: "/topics/sample-module" },
  { path: "/training" },
  { path: "/training/demo-session" },
  { path: "/progress" },
  { path: "/review" },
  { path: "/dictionary" },
  { path: "/login" },
];

type Sample = {
  readonly status: number;
  readonly ttfbMs: number;
  readonly totalMs: number;
};

async function measureRoute(baseUrl: string, path: string): Promise<Sample> {
  const started = performance.now();
  const response = await fetch(new URL(path, baseUrl), {
    redirect: "manual",
  });
  const ttfbMs = performance.now() - started;
  await response.arrayBuffer();
  const totalMs = performance.now() - started;

  return {
    status: response.status,
    ttfbMs,
    totalMs,
  };
}

function median(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1]! + sorted[middle]!) / 2;
  }

  return sorted[middle]!;
}

async function main(): Promise<void> {
  const baseUrl = process.env.PERF_BASE_URL?.trim();

  if (!baseUrl) {
    console.error("PERF_BASE_URL is required.");
    process.exit(1);
  }

  const repeats = Number(process.env.PERF_REPEATS ?? "5");
  const violations: string[] = [];
  const lines: string[] = [`Performance smoke for ${baseUrl}`];

  for (const route of DEFAULT_ROUTES) {
    const warmSamples: Sample[] = [];

    for (let index = 0; index < repeats; index += 1) {
      const sample = await measureRoute(baseUrl, route.path);
      warmSamples.push(sample);

      if (sample.status >= 500) {
        violations.push(`${route.path} returned ${sample.status}`);
      }

      if (!route.expectRedirect && sample.status >= 400 && sample.status !== 401 && sample.status !== 403) {
        violations.push(`${route.path} returned unexpected status ${sample.status}`);
      }
    }

    lines.push(
      `- ${route.path}: median ttfb ${Math.round(median(warmSamples.map((sample) => sample.ttfbMs)))} ms, median total ${Math.round(median(warmSamples.map((sample) => sample.totalMs)))} ms`,
    );
  }

  console.log(lines.join("\n"));

  if (violations.length > 0) {
    console.error("\nSmoke violations:");
    for (const violation of violations) {
      console.error(`- ${violation}`);
    }
    process.exit(1);
  }
}

void main();
