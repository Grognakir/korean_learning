import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "../..");
const REPORT_PATH = join(ROOT, "docs/PHASE_2_QUALITY_REPORT.md");
const AUDIT_PATH = join(ROOT, "content/phase-2/content-audit-report.json");

type AuditReport = {
  readonly generatedAt?: string;
  readonly counts?: Record<string, number>;
  readonly statusCounts?: Record<string, number>;
  readonly security?: { readonly absoluteLocalPathHits?: unknown[] };
};

type StepResult = { readonly name: string; readonly ok: boolean; readonly ms: number };

function run(command: string): {
  readonly ok: boolean;
  readonly output: string;
  readonly ms: number;
} {
  const started = Date.now();
  try {
    const output = execSync(command, {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    });
    return { ok: true, output, ms: Date.now() - started };
  } catch (error) {
    const err = error as { stdout?: string; stderr?: string };
    return {
      ok: false,
      output: `${err.stdout ?? ""}${err.stderr ?? ""}`,
      ms: Date.now() - started,
    };
  }
}

function writeReport(input: {
  readonly startedAt: string;
  readonly steps: readonly StepResult[];
  readonly failedStep?: string;
  readonly passIndex?: number;
}): void {
  let audit: AuditReport = {};
  if (existsSync(AUDIT_PATH)) {
    audit = JSON.parse(readFileSync(AUDIT_PATH, "utf8")) as AuditReport;
  }

  const totalMs = input.steps.reduce((sum, step) => sum + step.ms, 0);
  const lines = [
    "# Phase 2 quality report (F2-I21)",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Gate started: ${input.startedAt}`,
    input.passIndex ? `Pass: ${input.passIndex}` : "",
    "",
    "## Result",
    "",
    input.failedStep
      ? `- Status: **failed** at \`${input.failedStep}\``
      : "- Status: **passed** (automated technical gate)",
    "- Language approval: pending F2-I22 / CP-8",
    "- Speculative spare content: not generated (F2-I21 policy)",
    "",
    "## Durations",
    "",
    "| Step | Result | Duration ms |",
    "| --- | --- | ---: |",
    ...input.steps.map((step) => `| ${step.name} | ${step.ok ? "pass" : "fail"} | ${step.ms} |`),
    `| total | | ${totalMs} |`,
    "",
    "## Content status snapshot",
    "",
    audit.statusCounts
      ? Object.entries(audit.statusCounts)
          .map(([status, count]) => `- \`${status}\`: ${count}`)
          .join("\n")
      : "- status counts unavailable (run `pnpm content:audit`)",
    "",
    "## Counts",
    "",
    audit.counts
      ? Object.entries(audit.counts)
          .map(([key, count]) => `- ${key}: ${count}`)
          .join("\n")
      : "- counts unavailable",
    "",
    "## Security",
    "",
    `- Absolute local path hits: ${audit.security?.absoluteLocalPathHits?.length ?? "n/a"}`,
    "- Secret scan: `pnpm scan:secrets`",
    "- DTO leak scan: `pnpm scan:dto-leaks`",
    "",
    "## Bundle budgets",
    "",
    "- Checked by `pnpm check:bundles` after production build.",
    "- Known nonblocking: curriculum banks remain draft until F2-I22.",
    "",
    "## Next",
    "",
    "- F2-I22 manual language review and approved transitions.",
    "",
  ].filter((line, index, arr) => !(line === "" && arr[index - 1] === ""));

  mkdirSync(join(ROOT, "docs"), { recursive: true });
  writeFileSync(REPORT_PATH, `${lines.join("\n")}\n`, "utf8");
}

function runFullGate(passIndex: number): void {
  const startedAt = new Date().toISOString();
  const steps: StepResult[] = [];
  const commands = [
    ["format", "corepack pnpm format:check"],
    ["lint", "corepack pnpm lint"],
    ["typecheck", "corepack pnpm typecheck"],
    ["unit", "corepack pnpm test:run"],
    ["content-validate", "corepack pnpm content:validate"],
    ["content-audit", "corepack pnpm content:audit"],
    ["content-tests", "corepack pnpm test:content"],
    ["scan-secrets", "corepack pnpm scan:secrets"],
    ["scan-dto", "corepack pnpm scan:dto-leaks"],
    ["integration", "corepack pnpm test:integration"],
    ["build", "corepack pnpm build"],
    ["bundles", "corepack pnpm check:bundles"],
  ] as const;

  for (const [name, command] of commands) {
    const result = run(command);
    steps.push({ name, ok: result.ok, ms: result.ms });
    if (!result.ok) {
      console.error(`Step failed: ${name}`);
      console.error(result.output.slice(-4000));
      writeReport({ startedAt, steps, failedStep: name, passIndex });
      process.exit(1);
    }
    console.log(`✓ ${name} (${result.ms}ms)`);
  }

  writeReport({ startedAt, steps, passIndex });
  console.log(`Wrote ${REPORT_PATH}`);
}

function writeFromAuditOnly(): void {
  writeReport({
    startedAt: new Date().toISOString(),
    steps: [{ name: "ci-aggregate", ok: true, ms: 0 }],
  });
  console.log(`Wrote ${REPORT_PATH} from audit snapshot`);
}

const args = new Set(process.argv.slice(2));
if (args.has("--from-audit-only")) {
  writeFromAuditOnly();
} else {
  const passIndex = Number(process.env.GATE_PASS_INDEX ?? "1");
  runFullGate(Number.isFinite(passIndex) ? passIndex : 1);
}
