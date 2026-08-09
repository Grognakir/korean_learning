export type TextSection = {
  readonly unitNumber: number | null;
  readonly unitTitleKo: string | null;
  readonly unitTitleRu: string | null;
  readonly sectionHeading: string;
  readonly sectionKind: "unit-section" | "appendix";
  readonly titleKo: string;
  readonly titleRu: string;
  readonly bodyKo: string;
  readonly lineStart: number;
  readonly hasBlankMarkers: boolean;
};

export type TextMergeDecision = {
  readonly id: string;
  readonly summary: string;
};

const UNIT_HEADING = /^##\s+\*\*(\d+)과\s*—\s*([^(]+?)(?:\s*\(([^)]+)\))?\*\*\s*$/;
const APPENDIX_HEADING = /^##\s+Приложение\s*—\s*(.+)$/;
const SECTION_HEADING = /^###\s+(.+)$/;

export function extractMergeDecisions(markdown: string): TextMergeDecision[] {
  const decisions: TextMergeDecision[] = [];
  const lines = markdown.split(/\n/);
  for (const line of lines) {
    const bullet = line.match(/^-\s+(.+)$/);
    if (!bullet) {
      if (line.startsWith("---")) {
        break;
      }
      continue;
    }
    decisions.push({
      id: `decision.${decisions.length + 1}`,
      summary: bullet[1]!.trim(),
    });
  }
  return decisions;
}

function extractBlockQuotes(sectionBody: string): string[] {
  const blocks: string[] = [];
  let current: string[] = [];

  for (const line of sectionBody.split(/\n/)) {
    if (line.startsWith(">")) {
      current.push(line.replace(/^>\s?/, ""));
      continue;
    }

    if (current.length > 0) {
      blocks.push(current.join("\n").trim());
      current = [];
    }
  }

  if (current.length > 0) {
    blocks.push(current.join("\n").trim());
  }

  return blocks.filter((block) => block.length > 0);
}

function titleFromSection(heading: string, body: string): { ko: string; ru: string } {
  const bold = body.match(/^\*\*([^*]+)\*\*/m);
  const ko = bold?.[1]?.trim() || heading.split("—")[0]!.trim();
  const ruMatch = heading.match(/\(([^)]+)\)/);
  return { ko, ru: ruMatch?.[1]?.trim() || ko };
}

export function parseCurriculumTexts(markdown: string): TextSection[] {
  const lines = markdown.split(/\n/);
  const sections: TextSection[] = [];

  let unitNumber: number | null = null;
  let unitTitleKo: string | null = null;
  let unitTitleRu: string | null = null;
  let inAppendix = false;
  let sectionHeading: string | null = null;
  let sectionStartLine = 0;
  let sectionLines: string[] = [];

  const flushSection = (endLine: number) => {
    if (!sectionHeading) {
      return;
    }

    const body = sectionLines.join("\n");
    const quotes = extractBlockQuotes(body);
    if (quotes.length === 0) {
      sectionHeading = null;
      sectionLines = [];
      return;
    }

    const titles = titleFromSection(sectionHeading, body);
    const bodyKo = quotes.join("\n\n");
    sections.push({
      unitNumber: inAppendix ? parseAppendixUnit(sectionHeading) : unitNumber,
      unitTitleKo,
      unitTitleRu,
      sectionHeading,
      sectionKind: inAppendix ? "appendix" : "unit-section",
      titleKo: titles.ko,
      titleRu: titles.ru,
      bodyKo,
      lineStart: sectionStartLine,
      hasBlankMarkers: /[㉠㉡㉢㉣]/.test(bodyKo),
    });

    sectionHeading = null;
    sectionLines = [];
    void endLine;
  };

  for (const [index, line] of lines.entries()) {
    const unitMatch = line.match(UNIT_HEADING);
    if (unitMatch) {
      flushSection(index);
      inAppendix = false;
      unitNumber = Number(unitMatch[1]);
      unitTitleKo = unitMatch[2]!.trim();
      unitTitleRu = unitMatch[3]?.trim() ?? unitTitleKo;
      continue;
    }

    const appendixMatch = line.match(APPENDIX_HEADING);
    if (appendixMatch) {
      flushSection(index);
      inAppendix = true;
      unitNumber = null;
      unitTitleKo = "듣기 지문";
      unitTitleRu = "тексты для аудирования";
      continue;
    }

    const sectionMatch = line.match(SECTION_HEADING);
    if (sectionMatch) {
      flushSection(index);
      sectionHeading = sectionMatch[1]!.trim();
      sectionStartLine = index + 1;
      sectionLines = [];
      continue;
    }

    if (sectionHeading) {
      sectionLines.push(line);
    }
  }

  flushSection(lines.length);
  return sections;
}

function parseAppendixUnit(sectionHeading: string): number | null {
  const match = sectionHeading.match(/^(\d+)과/);
  return match ? Number(match[1]) : null;
}

export function slugifySection(heading: string, index: number): string {
  const ascii = heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 40);

  if (/^[a-z0-9][a-z0-9_-]*$/.test(ascii)) {
    return ascii;
  }

  return `s${String(index).padStart(3, "0")}`;
}
