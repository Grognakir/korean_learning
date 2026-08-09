import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "content", "phase-2");
const EXPECTED_COUNTS = [5, 4, 5, 5, 5, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5] as const;

type Localized = { ko: string; ru: string };

function sourceRef(sourceId: string, locator: string) {
  return {
    sourceId,
    locator: { kind: "section" as const, value: locator },
    confidence: "high" as const,
  };
}

function parseTopics(markdown: string): Array<{
  unitNumber: number;
  title: Localized;
  summary: Localized;
}> {
  const tableRows = [...markdown.matchAll(/\|\s*(\d+)과\s*\|\s*`([^`]+)`\s*—\s*([^|]+)\|/g)];
  if (tableRows.length !== 16) {
    throw new Error(`Expected 16 topic rows, found ${tableRows.length}`);
  }

  return tableRows.map((match) => {
    const unitNumber = Number(match[1]);
    const titleKo = match[2]!.trim();
    const titleRu = match[3]!.trim();
    return {
      unitNumber,
      title: { ko: titleKo, ru: titleRu },
      summary: {
        ko: `${unitNumber}과 ${titleKo}`,
        ru: `Урок ${unitNumber}: ${titleRu}`,
      },
    };
  });
}

function parseGrammarCatalog(markdown: string): Array<{
  unitNumber: number;
  orderInUnit: number;
  patternKo: string;
  summaryRu: string;
}> {
  const catalogStart = markdown.indexOf("## Краткий каталог 80 пунктов");
  // Prefer `\n## ` so `###` unit headings inside the catalog are not treated as H2.
  const catalogEnd = markdown.indexOf("\n## ", catalogStart + 1);
  const section = markdown.slice(catalogStart, catalogEnd === -1 ? undefined : catalogEnd);
  const unitBlocks = [
    ...section.matchAll(/###\s*(\d+)과[^\n]*\n([\s\S]*?)(?=\n###\s*\d+과|\s*$)/g),
  ];

  if (unitBlocks.length !== 16) {
    throw new Error(`Expected 16 grammar unit blocks, found ${unitBlocks.length}`);
  }

  const items: Array<{
    unitNumber: number;
    orderInUnit: number;
    patternKo: string;
    summaryRu: string;
  }> = [];

  for (const block of unitBlocks) {
    const unitNumber = Number(block[1]);
    const body = block[2] ?? "";
    const entries = [...body.matchAll(/^\d+\.\s*`([^`]+)`\s*—\s*(.+)$/gm)];

    entries.forEach((entry, index) => {
      items.push({
        unitNumber,
        orderInUnit: index + 1,
        patternKo: entry[1]!.trim(),
        summaryRu: entry[2]!.trim(),
      });
    });
  }

  if (items.length !== 80) {
    throw new Error(`Expected 80 grammar items, found ${items.length}`);
  }

  for (const [index, expected] of EXPECTED_COUNTS.entries()) {
    const count = items.filter((item) => item.unitNumber === index + 1).length;
    if (count !== expected) {
      throw new Error(`Unit ${index + 1} expected ${expected} grammar items, found ${count}`);
    }
  }

  return items;
}

function usageKeyFromPattern(patternKo: string): string | null {
  const circled = patternKo.match(/[①②③④⑤⑥⑦⑧⑨⑩]/);
  return circled?.[0] ?? null;
}

function slugForUnit(unitNumber: number): string {
  return `u${String(unitNumber).padStart(2, "0")}`;
}

function writeJson(fileName: string, value: unknown): void {
  writeFileSync(path.join(CONTENT_DIR, fileName), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

const topicsMarkdown = readFileSync(path.join(ROOT, "docs/CURRICULUM_TOPICS.md"), "utf8");
const grammarMarkdown = readFileSync(path.join(ROOT, "docs/CURRICULUM_GRAMMAR.md"), "utf8");

const topics = parseTopics(topicsMarkdown);
const grammarItems = parseGrammarCatalog(grammarMarkdown);

const units = {
  schemaVersion: "phase-2.v1",
  items: topics.map((topic) => {
    const padded = String(topic.unitNumber).padStart(2, "0");
    const logicalId = `unit.u${padded}`;
    return {
      logicalId,
      contentVersion: "1.0.0",
      status: "draft",
      sourceRefs: [sourceRef("src.curriculum-topics", `u${padded}`)],
      unitNumber: topic.unitNumber,
      slug: slugForUnit(topic.unitNumber),
      title: topic.title,
      summary: topic.summary,
    };
  }),
};

const grammarTopics = {
  schemaVersion: "phase-2.v1",
  items: grammarItems.map((item) => {
    const paddedUnit = String(item.unitNumber).padStart(2, "0");
    const paddedOrder = String(item.orderInUnit).padStart(2, "0");
    const usageKey = usageKeyFromPattern(item.patternKo);
    return {
      logicalId: `grammar.u${paddedUnit}.n${paddedOrder}`,
      contentVersion: "1.0.0",
      status: "draft",
      sourceRefs: [sourceRef("src.curriculum-grammar", `u${paddedUnit}.n${paddedOrder}`)],
      unitLogicalId: `unit.u${paddedUnit}`,
      patternKo: item.patternKo,
      category: "syllabus",
      usageKey,
      title: {
        ko: item.patternKo,
        ru: item.summaryRu,
      },
      summary: {
        ko: item.patternKo,
        ru: item.summaryRu,
      },
    };
  }),
};

const provenance = {
  schemaVersion: "phase-2.v1",
  items: [
    ...units.items.map((unit) => ({
      logicalId: `prov.${unit.logicalId}`,
      subjectLogicalId: unit.logicalId,
      contentVersion: unit.contentVersion,
      sourceRefs: unit.sourceRefs,
      notes: "Imported from CURRICULUM_TOPICS.md as draft catalog metadata.",
    })),
    ...grammarTopics.items.map((topic) => ({
      logicalId: `prov.${topic.logicalId}`,
      subjectLogicalId: topic.logicalId,
      contentVersion: topic.contentVersion,
      sourceRefs: topic.sourceRefs,
      notes: "Imported from CURRICULUM_GRAMMAR.md short catalog as draft.",
    })),
  ],
};

writeJson("units.json", units);
writeJson("grammar-topics.json", grammarTopics);
writeJson("provenance.json", provenance);

console.log(
  `Wrote curriculum catalog: ${units.items.length} units, ${grammarTopics.items.length} grammar topics, ${provenance.items.length} provenance rows.`,
);
