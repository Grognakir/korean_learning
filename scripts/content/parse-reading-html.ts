export type ReadingHtmlQuestion = {
  readonly variantIndex: number;
  readonly variantLabel: string;
  readonly questionNumber: number;
  readonly section: string;
  readonly promptKo: string;
  readonly passageKo: string;
  readonly options: readonly string[];
  readonly correctOptionIndex: number;
  readonly explanationKo: string | null;
  readonly sharesPassageWithPrevious: boolean;
  readonly passageGroupKey: string;
};

export type ReadingHtmlVariant = {
  readonly index: number;
  readonly label: string;
  readonly questions: readonly ReadingHtmlQuestion[];
};

type RawItem = {
  passage?: string;
  sharedPassage?: string;
  label?: string;
  table?: ReadonlyArray<ReadonlyArray<string>>;
  options: string[];
  answer: number;
  explain?: string;
};

function serializeTable(table: ReadonlyArray<ReadonlyArray<string>>): string {
  return table.map((row) => row.join(" | ")).join("\n");
}

function resolvePassageKo(section: RawSection, item: RawItem): string {
  const parts: string[] = [];
  if (item.table && item.table.length > 0) {
    parts.push(serializeTable(item.table));
  }
  if (item.passage?.trim()) {
    parts.push(item.passage.trim());
  } else if (section.sharedPassage?.trim()) {
    parts.push(section.sharedPassage.trim());
  }
  return parts.join("\n\n").trim();
}

type RawSection = {
  section: string;
  sharedPassage?: string;
  items: RawItem[];
};

type RawVariant = {
  label: string;
  data: RawSection[];
};

const VARIANT_UNIT_HINTS = [3, 7, 10, 15, 16] as const;

export function suggestedUnitForVariant(variantIndex: number): number {
  return VARIANT_UNIT_HINTS[variantIndex] ?? 1;
}

export function parseReadingHtml(html: string): ReadingHtmlVariant[] {
  const match = html.match(/const VARIANTS\s*=\s*(\[[\s\S]*?\n\]);/);
  if (!match) {
    throw new Error("VARIANTS array not found in reading HTML");
  }

  // Derived artifact only; evaluated in trusted local generation context.
  const variants = eval(match[1]!) as RawVariant[];
  if (variants.length !== 5) {
    throw new Error(`Expected 5 reading variants, found ${variants.length}`);
  }

  return variants.map((variant, variantIndex) => {
    const questions: ReadingHtmlQuestion[] = [];
    let questionNumber = 0;
    let previousGroup: string | null = null;

    for (const [sectionIndex, section] of variant.data.entries()) {
      for (const [itemIndex, item] of section.items.entries()) {
        questionNumber += 1;
        if (!Array.isArray(item.options) || item.options.length < 2) {
          throw new Error(`Variant ${variantIndex + 1} question ${questionNumber} missing options`);
        }
        if (
          !Number.isInteger(item.answer) ||
          item.answer < 0 ||
          item.answer >= item.options.length
        ) {
          throw new Error(
            `Variant ${variantIndex + 1} question ${questionNumber} invalid answer index`,
          );
        }

        const passageKo = resolvePassageKo(section, item);
        if (!passageKo) {
          throw new Error(`Variant ${variantIndex + 1} question ${questionNumber} missing passage`);
        }

        const passageGroupKey = section.sharedPassage
          ? `v${variantIndex + 1}-s${sectionIndex + 1}-shared`
          : `v${variantIndex + 1}-s${sectionIndex + 1}-i${itemIndex + 1}`;
        const sharesPassageWithPrevious = previousGroup === passageGroupKey;
        previousGroup = passageGroupKey;

        questions.push({
          variantIndex: variantIndex + 1,
          variantLabel: variant.label,
          questionNumber,
          section: section.section,
          promptKo: item.label?.trim() || section.section,
          passageKo,
          options: item.options,
          correctOptionIndex: item.answer,
          explanationKo: item.explain?.trim() || null,
          sharesPassageWithPrevious,
          passageGroupKey,
        });
      }
    }

    if (questions.length !== 20) {
      throw new Error(
        `Variant ${variantIndex + 1} expected 20 questions, found ${questions.length}`,
      );
    }

    return {
      index: variantIndex + 1,
      label: variant.label,
      questions,
    };
  });
}
