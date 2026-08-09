export const KNOWN_HOMONYM_LEMMAS = ["눈", "다리", "만", "배", "이", "저", "팔", "풀"] as const;

export const DERIVED_COVERAGE_EXPECTATIONS = {
  vocabTrainerCards: 803,
  quizletTsvRows: 731,
  flashcardCards: 179,
} as const;

export type SourceRowClassification = "canonical_sense" | "relation" | "duplicate_source_record";

export type VocabularySourceRow = {
  readonly lineNumber: number;
  readonly sectionTitle: string;
  readonly lemma: string;
  readonly transliteration: string;
  readonly translationRu: string;
  readonly notes: string;
};

export type NormalizedCategory = {
  readonly key: string;
  readonly titleRu: string;
  readonly kind: "lexical" | "irregular";
  readonly irregularClass: "d" | "l" | "b" | "eu" | null;
  readonly defaultPos: string | null;
};

export type ClassifiedVocabularyRow = {
  readonly row: VocabularySourceRow;
  readonly category: NormalizedCategory;
  readonly classification: SourceRowClassification;
  readonly logicalId: string | null;
  readonly senseKey: string | null;
  readonly targetLogicalId: string | null;
  readonly duplicateOfLogicalId: string | null;
  readonly relationType: "irregular-conjugation" | null;
};

const CATEGORY_DEFINITIONS: ReadonlyArray<{
  match: RegExp;
  key: string;
  kind: "lexical" | "irregular";
  irregularClass: NormalizedCategory["irregularClass"];
  defaultPos: string | null;
}> = [
  { match: /^Глаголы$/, key: "verbs", kind: "lexical", irregularClass: null, defaultPos: "verb" },
  {
    match: /^Прилагательные$/,
    key: "adjectives",
    kind: "lexical",
    irregularClass: null,
    defaultPos: "adjective",
  },
  {
    match: /^Неправильные.*ㄷ/,
    key: "irregular-d",
    kind: "irregular",
    irregularClass: "d",
    defaultPos: null,
  },
  {
    match: /^Неправильные.*ㄹ받침/,
    key: "irregular-l",
    kind: "irregular",
    irregularClass: "l",
    defaultPos: null,
  },
  {
    match: /^Неправильные.*ㅂ/,
    key: "irregular-b",
    kind: "irregular",
    irregularClass: "b",
    defaultPos: null,
  },
  {
    match: /^Неправильные.*ㅡ/,
    key: "irregular-eu",
    kind: "irregular",
    irregularClass: "eu",
    defaultPos: null,
  },
  {
    match: /^Местоимения$/,
    key: "pronouns",
    kind: "lexical",
    irregularClass: null,
    defaultPos: "pronoun",
  },
  {
    match: /^Вопросительные слова$/,
    key: "question-words",
    kind: "lexical",
    irregularClass: null,
    defaultPos: "interrogative",
  },
  {
    match: /^Овощи$/,
    key: "vegetables",
    kind: "lexical",
    irregularClass: null,
    defaultPos: "noun",
  },
  { match: /^Фрукты$/, key: "fruits", kind: "lexical", irregularClass: null, defaultPos: "noun" },
  {
    match: /^Продукты и еда$/,
    key: "food",
    kind: "lexical",
    irregularClass: null,
    defaultPos: "noun",
  },
  { match: /^Учёба$/, key: "study", kind: "lexical", irregularClass: null, defaultPos: "noun" },
  {
    match: /^Бытовые предметы$/,
    key: "household-objects",
    kind: "lexical",
    irregularClass: null,
    defaultPos: "noun",
  },
  {
    match: /^Бытовые дела$/,
    key: "household-chores",
    kind: "lexical",
    irregularClass: null,
    defaultPos: "noun",
  },
  {
    match: /^Электроника$/,
    key: "electronics",
    kind: "lexical",
    irregularClass: null,
    defaultPos: "noun",
  },
  {
    match: /^Семья и обращения$/,
    key: "family",
    kind: "lexical",
    irregularClass: null,
    defaultPos: "noun",
  },
  { match: /^Спорт$/, key: "sports", kind: "lexical", irregularClass: null, defaultPos: "noun" },
  {
    match: /^Профессии$/,
    key: "professions",
    kind: "lexical",
    irregularClass: null,
    defaultPos: "noun",
  },
  { match: /^Места$/, key: "places", kind: "lexical", irregularClass: null, defaultPos: "noun" },
  {
    match: /^Положение в пространстве$/,
    key: "spatial",
    kind: "lexical",
    irregularClass: null,
    defaultPos: "adverb",
  },
  {
    match: /^Части тела$/,
    key: "body-parts",
    kind: "lexical",
    irregularClass: null,
    defaultPos: "noun",
  },
  {
    match: /^Одежда и внешний вид$/,
    key: "clothing",
    kind: "lexical",
    irregularClass: null,
    defaultPos: "noun",
  },
  { match: /^Прочее$/, key: "misc", kind: "lexical", irregularClass: null, defaultPos: "noun" },
  {
    match: /^Бизнес и экономика$/,
    key: "business",
    kind: "lexical",
    irregularClass: null,
    defaultPos: "noun",
  },
  {
    match: /^Страны$/,
    key: "countries",
    kind: "lexical",
    irregularClass: null,
    defaultPos: "noun",
  },
  {
    match: /^Числительные$/,
    key: "numerals",
    kind: "lexical",
    irregularClass: null,
    defaultPos: "numeral",
  },
  {
    match: /^Дни недели и даты$/,
    key: "dates",
    kind: "lexical",
    irregularClass: null,
    defaultPos: "noun",
  },
  {
    match: /^Время суток$/,
    key: "times-of-day",
    kind: "lexical",
    irregularClass: null,
    defaultPos: "noun",
  },
  {
    match: /^Временные наречия$/,
    key: "temporal-adverbs",
    kind: "lexical",
    irregularClass: null,
    defaultPos: "adverb",
  },
  {
    match: /^Наречия \(образа действия\)$/,
    key: "manner-adverbs",
    kind: "lexical",
    irregularClass: null,
    defaultPos: "adverb",
  },
  {
    match: /^Союзы и связки$/,
    key: "conjunctions",
    kind: "lexical",
    irregularClass: null,
    defaultPos: "conjunction",
  },
  {
    match: /^Грамматические термины$/,
    key: "grammar-terms",
    kind: "lexical",
    irregularClass: null,
    defaultPos: "term",
  },
  {
    match: /^Частицы$/,
    key: "particles",
    kind: "lexical",
    irregularClass: null,
    defaultPos: "particle",
  },
  {
    match: /^Соединительные окончания/,
    key: "connective-endings",
    kind: "lexical",
    irregularClass: null,
    defaultPos: "ending",
  },
  {
    match: /^Счётные слова/,
    key: "counters",
    kind: "lexical",
    irregularClass: null,
    defaultPos: "counter",
  },
];

const CYRILLIC_TO_LATIN: Readonly<Record<string, string>> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "i",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

export function normalizeCategory(sectionTitle: string): NormalizedCategory {
  const definition = CATEGORY_DEFINITIONS.find((entry) => entry.match.test(sectionTitle));
  if (!definition) {
    throw new Error(`Unknown vocabulary section: ${sectionTitle}`);
  }

  return {
    key: definition.key,
    titleRu: sectionTitle,
    kind: definition.kind,
    irregularClass: definition.irregularClass,
    defaultPos: definition.defaultPos,
  };
}

export function slugifySenseKey(translationRu: string): string {
  const latin = [...translationRu.toLowerCase()]
    .map((char) => CYRILLIC_TO_LATIN[char] ?? char)
    .join("");

  const slug = latin
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  if (slug.length === 0) {
    return "sense";
  }

  return slug.slice(0, 48);
}

export function slugifyTransliteration(transliteration: string): string {
  const slug = transliteration
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug.length > 0 ? slug : "x";
}

export function parseVocabularyMarkdown(markdown: string): VocabularySourceRow[] {
  const rows: VocabularySourceRow[] = [];
  let sectionTitle: string | null = null;

  for (const [index, line] of markdown.split(/\n/).entries()) {
    const heading = line.match(/^##\s+(.+)$/);
    if (heading) {
      sectionTitle = heading[1]!.trim();
      continue;
    }

    if (!sectionTitle) {
      continue;
    }

    const match = line.match(
      /^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]*?)\s*\|$/,
    );
    if (!match) {
      continue;
    }

    const lemma = match[1]!.trim();
    if (lemma === "한국어" || /^-{2,}$/.test(lemma.replace(/\s/g, ""))) {
      continue;
    }

    rows.push({
      lineNumber: index + 1,
      sectionTitle,
      lemma,
      transliteration: match[2]!.trim(),
      translationRu: match[3]!.trim(),
      notes: match[4]!.trim(),
    });
  }

  return rows;
}

function identityKey(row: VocabularySourceRow): string {
  return [
    row.lemma,
    row.transliteration.toLowerCase(),
    row.translationRu.toLowerCase().replace(/\s+/g, " ").trim(),
  ].join("||");
}

function allocateLogicalId(
  transliteration: string,
  senseKey: string,
  used: Set<string>,
): { logicalId: string; senseKey: string } {
  let candidateSense = senseKey;
  let logicalId = `dict.${slugifyTransliteration(transliteration)}.${candidateSense}`;
  let suffix = 2;

  while (used.has(logicalId)) {
    candidateSense = `${senseKey}-${suffix}`;
    logicalId = `dict.${slugifyTransliteration(transliteration)}.${candidateSense}`;
    suffix += 1;
  }

  used.add(logicalId);
  return { logicalId, senseKey: candidateSense };
}

export function classifyVocabularyRows(
  rows: readonly VocabularySourceRow[],
): ClassifiedVocabularyRow[] {
  const usedLogicalIds = new Set<string>();
  const senseByIdentity = new Map<string, string>();
  const sensesByLemma = new Map<string, string[]>();
  const classified: ClassifiedVocabularyRow[] = [];

  // Pass 1: lexical sections create canonical senses / duplicates.
  for (const row of rows) {
    const category = normalizeCategory(row.sectionTitle);
    if (category.kind !== "lexical") {
      continue;
    }

    const key = identityKey(row);
    const existing = senseByIdentity.get(key);
    if (existing) {
      classified.push({
        row,
        category,
        classification: "duplicate_source_record",
        logicalId: null,
        senseKey: null,
        targetLogicalId: null,
        duplicateOfLogicalId: existing,
        relationType: null,
      });
      continue;
    }

    const allocated = allocateLogicalId(
      row.transliteration,
      slugifySenseKey(row.translationRu),
      usedLogicalIds,
    );
    senseByIdentity.set(key, allocated.logicalId);
    const lemmaList = sensesByLemma.get(row.lemma) ?? [];
    lemmaList.push(allocated.logicalId);
    sensesByLemma.set(row.lemma, lemmaList);

    classified.push({
      row,
      category,
      classification: "canonical_sense",
      logicalId: allocated.logicalId,
      senseKey: allocated.senseKey,
      targetLogicalId: null,
      duplicateOfLogicalId: null,
      relationType: null,
    });
  }

  // Pass 2: irregular sections become conjugation relations.
  for (const row of rows) {
    const category = normalizeCategory(row.sectionTitle);
    if (category.kind !== "irregular") {
      continue;
    }

    const lemmaTargets = sensesByLemma.get(row.lemma) ?? [];
    const exact = lemmaTargets.find((logicalId) => {
      const sense = classified.find(
        (item) => item.logicalId === logicalId && item.row.transliteration === row.transliteration,
      );
      return Boolean(sense);
    });
    const targetLogicalId = exact ?? lemmaTargets[0] ?? null;

    if (!targetLogicalId) {
      throw new Error(
        `Irregular row without primary sense: ${row.lemma} (${row.sectionTitle}, line ${row.lineNumber})`,
      );
    }

    classified.push({
      row,
      category,
      classification: "relation",
      logicalId: null,
      senseKey: null,
      targetLogicalId,
      duplicateOfLogicalId: null,
      relationType: "irregular-conjugation",
    });
  }

  // Preserve source order for report determinism.
  classified.sort((left, right) => left.row.lineNumber - right.row.lineNumber);

  if (classified.length !== rows.length) {
    throw new Error(
      `Classification incomplete: rows=${rows.length}, classified=${classified.length}`,
    );
  }

  return classified;
}

export type DictionaryReconciliationReport = {
  readonly schemaVersion: "phase-2.dictionary-reconciliation.v1";
  readonly generatedFrom: "docs/CURRICULUM_VOCABULARY.md";
  readonly canonicalSourceId: "src.curriculum-vocabulary";
  readonly counts: {
    readonly sourceRows: number;
    readonly canonicalSenses: number;
    readonly relations: number;
    readonly duplicateSourceRecords: number;
    readonly categories: number;
  };
  readonly derivedCoverage: {
    readonly vocabTrainerCards: {
      expected: number;
      artifactsPresent: false;
      role: "coverage-only";
    };
    readonly quizletTsvRows: {
      expected: number;
      artifactsPresent: false;
      role: "coverage-only";
    };
    readonly flashcardCards: {
      expected: number;
      artifactsPresent: false;
      role: "coverage-only";
    };
    readonly note: string;
  };
  readonly forbiddenCategoriesAbsent: readonly string[];
  readonly knownHomonyms: ReadonlyArray<{
    readonly lemma: string;
    readonly senseCount: number;
    readonly senseKeys: readonly string[];
  }>;
  readonly rows: ReadonlyArray<{
    readonly lineNumber: number;
    readonly lemma: string;
    readonly categoryKey: string;
    readonly classification: SourceRowClassification;
    readonly logicalId: string | null;
    readonly senseKey: string | null;
    readonly targetLogicalId: string | null;
    readonly duplicateOfLogicalId: string | null;
    readonly relationType: "irregular-conjugation" | null;
  }>;
};

export function buildDictionaryReconciliationReport(
  classified: readonly ClassifiedVocabularyRow[],
): DictionaryReconciliationReport {
  const categories = new Set(classified.map((item) => item.category.key));
  if (categories.has("dobavleno") || [...categories].some((key) => key.includes("добавлено"))) {
    throw new Error("Forbidden category 'добавлено' present in canonical import");
  }

  const knownHomonyms = KNOWN_HOMONYM_LEMMAS.map((lemma) => {
    const senses = classified.filter(
      (item) => item.classification === "canonical_sense" && item.row.lemma === lemma,
    );
    return {
      lemma,
      senseCount: senses.length,
      senseKeys: senses.map((item) => item.senseKey!).sort(),
    };
  });

  for (const homonym of knownHomonyms) {
    if (homonym.senseCount < 2) {
      throw new Error(`Expected multiple senses for homonym ${homonym.lemma}`);
    }
    if (new Set(homonym.senseKeys).size !== homonym.senseKeys.length) {
      throw new Error(`Homonym ${homonym.lemma} produced duplicate sense keys`);
    }
  }

  return {
    schemaVersion: "phase-2.dictionary-reconciliation.v1",
    generatedFrom: "docs/CURRICULUM_VOCABULARY.md",
    canonicalSourceId: "src.curriculum-vocabulary",
    counts: {
      sourceRows: classified.length,
      canonicalSenses: classified.filter((item) => item.classification === "canonical_sense")
        .length,
      relations: classified.filter((item) => item.classification === "relation").length,
      duplicateSourceRecords: classified.filter(
        (item) => item.classification === "duplicate_source_record",
      ).length,
      categories: categories.size,
    },
    derivedCoverage: {
      vocabTrainerCards: {
        expected: DERIVED_COVERAGE_EXPECTATIONS.vocabTrainerCards,
        artifactsPresent: false,
        role: "coverage-only",
      },
      quizletTsvRows: {
        expected: DERIVED_COVERAGE_EXPECTATIONS.quizletTsvRows,
        artifactsPresent: false,
        role: "coverage-only",
      },
      flashcardCards: {
        expected: DERIVED_COVERAGE_EXPECTATIONS.flashcardCards,
        artifactsPresent: false,
        role: "coverage-only",
      },
      note: "Derived HTML/TSV/flashcard artifacts are coverage references only and do not mutate CURRICULUM_VOCABULARY.md.",
    },
    forbiddenCategoriesAbsent: ["добавлено"],
    knownHomonyms,
    rows: classified.map((item) => ({
      lineNumber: item.row.lineNumber,
      lemma: item.row.lemma,
      categoryKey: item.category.key,
      classification: item.classification,
      logicalId: item.logicalId,
      senseKey: item.senseKey,
      targetLogicalId: item.targetLogicalId,
      duplicateOfLogicalId: item.duplicateOfLogicalId,
      relationType: item.relationType,
    })),
  };
}
