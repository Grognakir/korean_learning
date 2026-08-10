/**
 * Copy grammar bodies from docs/CURRICULUM_GRAMMAR.md into enrichment JSON.
 * One topic → one markdown body (catalog line + full expanded section when present).
 *
 * Usage:
 *   pnpm exec tsx scripts/content/parse-curriculum-grammar-details.ts --write
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { loadPhase2ContentGraph, PHASE_2_CONTENT_ROOT } from "./contentValidation";

type Enrichment = {
  /** Full learner-facing markdown copied from CURRICULUM_GRAMMAR.md */
  bodyMd: string;
};

const DOC_PATH = path.join(process.cwd(), "docs/CURRICULUM_GRAMMAR.md");
const OUT_PATH = path.join(PHASE_2_CONTENT_ROOT, "grammar-detail-enrichment.json");

/** Exact patternKo → expanded MD heading prefix (before "—"). */
const PATTERN_TO_SECTION: Record<string, string> = {
  "N이/가": "N-이/가",
  "N은/는①": "N-은/는",
  "N도": "N-도",
  "N이/가 아니다": "안 / -지 않다",
  "N의": "N-의",
  "N에①": "N-에 / N-에서",
  "N에서": "N-에 / N-에서",
  "N에②": "N-에 / N-에서",
  "N이/가 있다/없다": "N이/가 있다/없다",
  "N을/를": "N-을/를",
  "N에 가다/오다": "N에 가다/오다",
  "수①": "수①",
  "N와/과 N": "N와/과",
  "N하고 N": "N와/과",
  "수②": "수②",
  "V-아/어/여요①": "-아요/어요/여요",
  "N이에요/예요": "-아요/어요/여요",
  "AV-아/어/여요②": "AV-아/어/여요②",
  "N부터 N까지": "N부터 N까지",
  "안 V/V-지 않다": "안 / -지 않다",
  "V-고①": "N이고 / V-고",
  "N(이)고": "N이고 / V-고",
  "AV-아/어/여 보다": "AV-아/어/여 보다",
  "ㅡ 동사": "ㅡ 탈락",
  "N은/는②": "N-은/는②",
  "ㅂ 동사": "ㅂ 불규칙",
  "AV-아/어/여서①": "AV-아/어/여서①",
  "N(으)로①": "N(으)로①",
  "AV-(으)러 가다/오다": "AV-(으)러 가다/오다",
  "AV-(으)ㄹ 거예요①": "AV-(으)ㄹ 거예요①",
  "AV-고②": "AV-고②",
  "AV-기 전에/N 전에": "AV-기 전에/N 전에",
  "AV-(으)ㄴ 후에/N 후에": "AV-(으)ㄴ 후에/N 후에",
  "N 동안": "N 동안",
  "수④": "수④",
  "AV-(으)세요/-(으)십시오": "AV-(으)세요/-(으)십시오",
  "N이랑": "N이랑",
  "AV-고 있다①": "AV-고 있다①",
  "N에게(서)/한테(서)": "N에게(서)/한테(서)",
  "AV-(으)ㄹ까요?①": "AV-(으)ㄹ까요?①",
  "AV-(으)ㅂ시다": "AV-(으)ㅂ시다",
  "V-(으)니까①/N(이)니까": "V-(으)니까①/N(이)니까",
  "AV-고 싶다": "AV-고 싶다",
  "AV-겠-①": "AV-겠-①",
  "V-지요?/N(이)지요?": "V-지요?/N(이)지요?",
  "V-겠-②/N이겠-": "V-겠-②/N이겠-",
  "AV-아/어/여 주다": "AV-아/어/여 주다",
  "V-(으)면/N이면": "V-(으)면/N이면",
  "ㄷ 동사": "ㄷ 불규칙",
  "V-아/어/여서②/N이어/여서": "V-아/어/여서②/N이어/여서",
  "AV-(으)ㄹ 수 있다/없다": "AV-(으)ㄹ 수 있다/없다",
  "V-(으)ㄹ까요?②/N일까요?": "V-(으)ㄹ까요?②/N일까요?",
  "AV-(으)ㄹ 거예요②/N일 거예요": "AV-(으)ㄹ 거예요②/N일 거예요",
  "AV-(으)ㄹ게요": "AV-(으)ㄹ게요",
  "N(으)로②": "N(으)로②",
  "ㄹ 동사": "ㄹ 동사",
  "V-거나/N이나": "V-거나/N이나",
  "못 AV/AV-지 못하다": "못 AV/AV-지 못하다",
  "AV-(으)려고 하다": "AV-(으)려고 하다",
  "N께서/N께서는": "N께서/N께서는",
  "V-(으)시-/N이시-": "V-(으)시-/N이시-",
  "V-아/어/여야 되다/하다": "V-아/어/여야 되다/하다",
  "AV-지 말다": "AV-지 말다",
  "N보다": "N보다",
  "V-지만/N(이)지만": "V-지만/N(이)지만",
  "DV-(으)ㄴ N": "DV-(으)ㄴ N",
  "V-아/어/여도 되다(좋다, 괜찮다)": "V-아/어/여도 되다(좋다, 괜찮다)",
  "AV-(으)면 안 되다": "AV-(으)면 안 되다",
  "AV-(으)ㄴ/는/(으)ㄹ N": "AV-(으)ㄴ/는/(으)ㄹ N",
  "N인 N": "N인 N",
  "V-(으)ㄴ/는데/N인데": "V-(으)ㄴ/는데/N인데",
  "N께": "N께",
  "AV-아/어/여 드리다/주시다": "AV-아/어/여 드리다/주시다",
};

function parseCatalogEntries(markdown: string): Map<string, string> {
  const map = new Map<string, string>();
  const catalog = markdown.split("## Краткий каталог 80 пунктов")[1]?.split(/^## Урок /m)[0] ?? "";
  let unit = 0;
  for (const line of catalog.split(/\r?\n/)) {
    const unitMatch = line.match(/^###\s+(\d+)과/u);
    if (unitMatch) {
      unit = Number(unitMatch[1]);
      continue;
    }
    const itemMatch = line.match(/^(\d+)\.\s+`([^`]+)`\s+—\s+(.+)$/u);
    if (!itemMatch || !unit) {
      continue;
    }
    const index = Number(itemMatch[1]);
    const logicalId = `grammar.u${String(unit).padStart(2, "0")}.n${String(index).padStart(2, "0")}`;
    map.set(logicalId, line.trim());
  }
  return map;
}

/** Extract raw markdown bodies keyed by heading pattern (text before —). */
function parseExpandedBodies(markdown: string): Map<string, string> {
  const bodies = new Map<string, string>();
  const start = markdown.search(/^## Урок 1\b/m);
  if (start < 0) {
    return bodies;
  }

  const lessonPart = markdown.slice(start);
  const chunks = lessonPart.split(/^## /m).slice(1);

  for (const chunk of chunks) {
    const firstNewline = chunk.indexOf("\n");
    const headingLine = (firstNewline >= 0 ? chunk.slice(0, firstNewline) : chunk).trim();
    if (headingLine.startsWith("Урок ")) {
      continue;
    }

    const pattern = headingLine.split("—")[0]?.trim() ?? headingLine;
    const body = (firstNewline >= 0 ? chunk.slice(firstNewline + 1) : "")
      .replace(/^\s*---\s*$/gm, "")
      .trim();

    const full = `## ${headingLine}\n\n${body}`.trim();
    bodies.set(pattern, full);
  }

  return bodies;
}

/** Prefer the expanded section; catalog line numbers are UI noise on the detail page. */
function buildBody(catalogLine: string | undefined, sectionMd: string | undefined): string {
  if (sectionMd?.trim()) {
    return sectionMd.trim();
  }
  if (!catalogLine) {
    return "";
  }
  // Strip leading "4. `pattern` — " and keep only the learner-facing gloss.
  const gloss = catalogLine.replace(/^\d+\.\s+`[^`]+`\s+—\s+/u, "").trim();
  return gloss;
}

const write = process.argv.includes("--write");
const graph = loadPhase2ContentGraph();
const markdown = readFileSync(DOC_PATH, "utf8");
const catalog = parseCatalogEntries(markdown);
const sections = parseExpandedBodies(markdown);
const enrichment: Record<string, Enrichment> = {};
let withExpanded = 0;

for (const topic of graph.grammarTopics.items) {
  const sectionKey = PATTERN_TO_SECTION[topic.patternKo];
  const sectionMd = sectionKey ? sections.get(sectionKey) : undefined;
  if (sectionMd) {
    withExpanded += 1;
  }

  const bodyMd = buildBody(catalog.get(topic.logicalId), sectionMd);
  if (!bodyMd) {
    enrichment[topic.logicalId] = {
      bodyMd: `## ${topic.patternKo}\n\n${topic.summary?.ru ?? topic.title.ru}`,
    };
    continue;
  }

  enrichment[topic.logicalId] = { bodyMd };
}

if (write) {
  writeFileSync(
    OUT_PATH,
    `${JSON.stringify(
      {
        schemaVersion: "phase-2.grammar-detail-enrichment.v3",
        source: "docs/CURRICULUM_GRAMMAR.md",
        matched: Object.keys(enrichment).length,
        withExpanded,
        total: graph.grammarTopics.items.length,
        items: enrichment,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  console.log(
    `Wrote ${OUT_PATH} matched=${Object.keys(enrichment).length}/${graph.grammarTopics.items.length} withExpanded=${withExpanded}`,
  );
  const missingKeys = [...new Set(Object.values(PATTERN_TO_SECTION))].filter(
    (key) => !sections.has(key),
  );
  if (missingKeys.length > 0) {
    console.log(`Missing section keys:\n${missingKeys.join("\n")}`);
  }
} else {
  console.log(
    `Dry-run matched=${Object.keys(enrichment).length}/${graph.grammarTopics.items.length} withExpanded=${withExpanded}`,
  );
}
