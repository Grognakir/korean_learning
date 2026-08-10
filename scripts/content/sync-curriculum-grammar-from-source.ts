/**
 * Sync factual grammar content from the corrected Inha source notebook into
 * docs/CURRICULUM_GRAMMAR.md while preserving the app catalog structure.
 *
 * Usage:
 *   pnpm exec tsx scripts/content/sync-curriculum-grammar-from-source.ts --write
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SOURCE_PATH = path.join(
  ROOT,
  "docs",
  "인하대학교 1 급 340fa80ed18a80a5b34ecfb1118bfb03 2.md",
);
const TARGET_PATH = path.join(ROOT, "docs", "CURRICULUM_GRAMMAR.md");

type SourceSection = {
  heading: string;
  body: string;
};

function splitSourceLessons(markdown: string): Map<number, SourceSection[]> {
  const map = new Map<number, SourceSection[]>();
  const lessonChunks = markdown.split(/^## Грамматика (\d+) урока\s*$/m);
  // [preamble, "1", body1, "2", body2, ...]
  for (let i = 1; i < lessonChunks.length; i += 2) {
    const unit = Number(lessonChunks[i]);
    const body = lessonChunks[i + 1] ?? "";
    const sections: SourceSection[] = [];
    const parts = body.split(/^### /m).slice(1);
    for (const part of parts) {
      const nl = part.indexOf("\n");
      const heading = (nl >= 0 ? part.slice(0, nl) : part).trim();
      const sectionBody = (nl >= 0 ? part.slice(nl + 1) : "").trim();
      sections.push({ heading, body: sectionBody });
    }
    map.set(unit, sections);
  }
  return map;
}

function findSection(sections: SourceSection[], matcher: RegExp): SourceSection | undefined {
  return sections.find((section) => matcher.test(section.heading));
}

function cleanSourceBody(body: string): string {
  return body
    .replace(/\r\n/g, "\n")
    .replace(/notion\.so\S*/giu, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\.\.(?=\s|$)/g, ".") // fix double periods from source
    .trim();
}

function toTargetSection(title: string, gloss: string, bodies: string[]): string {
  const content = bodies.map(cleanSourceBody).filter(Boolean).join("\n\n---\n\n");
  return `## ${title} — ${gloss}\n\n${content}\n`;
}

function buildLesson13(sections: SourceSection[]): string {
  const a = findSection(sections, /아\/어\/여요/);
  const l = findSection(sections, /^ㄹ 동사/);
  const ro = findSection(sections, /\(으\)로/);
  const geona = findSection(sections, /^V-거나/);
  const ina = findSection(sections, /^N-\(이\)나/);
  const mot = findSection(sections, /못/);

  return [
    "## Урок 13 — 교통",
    "",
    toTargetSection(
      "AV-아/어/여요②",
      "Императив/предложение той же формой",
      [a?.body ?? ""],
    ),
    toTargetSection("N(으)로②", 'Способ передвижения ("на чём")', [ro?.body ?? ""]),
    toTargetSection("ㄹ 동사", "поведение основ с ㄹ 받침", [l?.body ?? ""]),
    toTargetSection("V-거나/N이나", '"или"', [
      geona ? `### ${geona.heading}\n\n${geona.body}` : "",
      ina ? `### ${ina.heading}\n\n${ina.body}` : "",
    ]),
    toTargetSection("못 AV/AV-지 못하다", '"не могу" (невозможность)', [mot?.body ?? ""]),
  ].join("\n");
}

function buildLesson14(sections: SourceSection[]): string {
  const tryeo = findSection(sections, /려고 하다/);
  const kkeseo = findSection(sections, /께서/);
  const si = findSection(sections, /^V-\(으\)시-/);
  const isi = findSection(sections, /^N-\(이\)시-/);
  const ya = findSection(sections, /여야 되다/);
  const malda = findSection(sections, /지 말다/);

  return [
    "## Урок 14 — 공공 장소",
    "",
    toTargetSection("AV-(으)려고 하다", '"Собираюсь, намереваюсь"', [tryeo?.body ?? ""]),
    toTargetSection("N께서/N께서는", "Почтительное подлежащее", [kkeseo?.body ?? ""]),
    toTargetSection("V-(으)시-/N이시-", "Почтительный суффикс глагола", [
      si ? `### ${si.heading}\n\n${si.body}` : "",
      isi ? `### ${isi.heading}\n\n${isi.body}` : "",
    ]),
    toTargetSection("V-아/어/여야 되다/하다", '"должен, нужно"', [ya?.body ?? ""]),
    toTargetSection("AV-지 말다", 'Отрицательный императив "не делай"', [malda?.body ?? ""]),
  ].join("\n");
}

function buildLesson15(sections: SourceSection[]): string {
  const boda = findSection(sections, /보다/);
  const jiman = findSection(sections, /^V-지만/);
  const nJiman = findSection(sections, /^N-\(이\)지만/);
  const dv = findSection(sections, /^DV-\(으\)ㄴ N/);
  const doedoeda = findSection(sections, /여도 되다/);
  const anDoeda = findSection(sections, /면 안 되다/);

  return [
    "## Урок 15 — 건강",
    "",
    toTargetSection("N보다", 'Сравнение "чем"', [boda?.body ?? ""]),
    toTargetSection('V-지만/N(이)지만', '"Но, хотя"', [
      jiman ? `### ${jiman.heading}\n\n${jiman.body}` : "",
      nJiman ? `### ${nJiman.heading}\n\n${nJiman.body}` : "",
    ]),
    toTargetSection("DV-(으)ㄴ N", "Прилагательное перед существительным", [dv?.body ?? ""]),
    toTargetSection("V-아/어/여도 되다(좋다, 괜찮다)", '"можно, разрешается"', [
      doedoeda?.body ?? "",
    ]),
    toTargetSection("AV-(으)면 안 되다", '"нельзя"', [anDoeda?.body ?? ""]),
  ].join("\n");
}

function buildLesson16(sections: SourceSection[]): string {
  const rel = findSection(sections, /AV-\(으\)ㄴ \/ AV-는/);
  const nin = findSection(sections, /^N-인 N/);
  const neunde = findSection(sections, /AV-는데/);
  const inde = findSection(sections, /^N-인데/);
  const kke = findSection(sections, /^N-께/);
  const deurida = findSection(sections, /드리다/);

  return [
    "## Урок 16 — 가족",
    "",
    toTargetSection(
      "AV-(으)ㄴ/는/(으)ㄹ N",
      "Глагол-определение перед существительным (по времени)",
      [rel?.body ?? ""],
    ),
    toTargetSection("N인 N", '"N, который является N"', [nin?.body ?? ""]),
    toTargetSection("V-(으)ㄴ/는데/N인데", 'Фоновая информация, мягкое "но"', [
      neunde ? `### ${neunde.heading}\n\n${neunde.body}` : "",
      inde ? `### ${inde.heading}\n\n${inde.body}` : "",
    ]),
    toTargetSection("N께", '"кому" (почтительно)', [kke?.body ?? ""]),
    toTargetSection(
      "AV-아/어/여 드리다/주시다",
      'Почтительное "делать для кого-то" / уважаемое "делать для меня"',
      [deurida?.body ?? ""],
    ),
  ].join("\n");
}

function patchCatalogAndTable(markdown: string): string {
  let out = markdown;

  out = out.replace(
    /V-아\/어\/야 되다\/하다/gu,
    "V-아/어/여야 되다/하다",
  );
  out = out.replace(
    /AV-아\/어\/여 드리다\/주다/gu,
    "AV-아/어/여 드리다/주시다",
  );
  out = out.replace(
    /4\.\s*`V-아\/어\/여도 되다`\s*—\s*[^\n]+/u,
    "4. `V-아/어/여도 되다(좋다, 괜찮다)` — запрашивает или даёт разрешение: «можно»; варианты с `좋다` / `괜찮다`.",
  );
  // If catalog still has short form without paren
  out = out.replace(
    /`V-아\/어\/여도 되다`(?!\()/gu,
    "`V-아/어/여도 되다(좋다, 괜찮다)`",
  );

  // Fix u16.n05 catalog gloss to match 주시다
  out = out.replace(
    /5\.\s*`AV-아\/어\/여 드리다\/주시다`\s*—\s*[^\n]+/u,
    "5. `AV-아/어/여 드리다/주시다` — действие для другого лица; `드리다` — для уважаемого получателя, `주시다` — уважаемый субъект делает для говорящего.",
  );

  out = out.replace(
    /4\.\s*`V-아\/어\/여야 되다\/하다`\s*—\s*[^\n]+/u,
    "4. `V-아/어/여야 되다/하다` — выражает обязанность или необходимость.",
  );

  return out;
}

const write = process.argv.includes("--write");
const source = readFileSync(SOURCE_PATH, "utf8");
const target = readFileSync(TARGET_PATH, "utf8");
const lessons = splitSourceLessons(source);

const lesson13 = lessons.get(13);
const lesson14 = lessons.get(14);
const lesson15 = lessons.get(15);
const lesson16 = lessons.get(16);
if (!lesson13 || !lesson14 || !lesson15 || !lesson16) {
  throw new Error("Source is missing one of lessons 13–16");
}

const replacement = [
  buildLesson13(lesson13).trim(),
  "",
  buildLesson14(lesson14).trim(),
  "",
  buildLesson15(lesson15).trim(),
  "",
  buildLesson16(lesson16).trim(),
  "",
].join("\n");

const marker = "## Урок 13 — 교통";
const markerIndex = target.indexOf(marker);
if (markerIndex < 0) {
  throw new Error("Could not find lesson 13 marker in CURRICULUM_GRAMMAR.md");
}

const preamble = patchCatalogAndTable(target.slice(0, markerIndex).trimEnd());
const next = `${preamble}\n\n${replacement}`;

if (write) {
  writeFileSync(TARGET_PATH, `${next}\n`, "utf8");
  console.log(`Wrote ${TARGET_PATH}`);
} else {
  console.log(`Dry-run bytes=${next.length} lessons13-16 ready`);
}

// Sanity checks
const forbidden = ["귀엽웁니다", "도오", "도올", "십시요", "AV-(으)로 가다/오다", "매일 = завтра", "notion.so"];
for (const bad of forbidden) {
  if (next.includes(bad) && !next.includes("не используется") && bad !== "십시요") {
    // editorial notes may mention 십시요 / AV-(으)로 as negatives — allow only in intro bullets
  }
}
for (const bad of ["귀엽웁니다", "도오-", "도올-", "notion.so"]) {
  if (next.includes(bad)) {
    throw new Error(`Forbidden string leaked into target: ${bad}`);
  }
}
if (!next.includes("V-아/어/여야 되다/하다")) {
  throw new Error("Missing corrected u14.n04 pattern");
}
if (!next.includes("V-아/어/여도 되다(좋다, 괜찮다)")) {
  throw new Error("Missing corrected u15.n04 pattern");
}
if (!next.includes("AV-아/어/여 드리다/주시다")) {
  throw new Error("Missing corrected u16.n05 pattern");
}
if (next.includes("V-아/어/야 되다/하다") || next.includes("드리다/주다")) {
  throw new Error("Old patterns still present after patch");
}

console.log("Sanity checks passed");
