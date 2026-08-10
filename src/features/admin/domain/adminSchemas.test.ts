import { describe, expect, it } from "vitest";

import {
  bumpContentVersionPatch,
  dictionaryEntryFormSchema,
  grammarTopicFormSchema,
  resolveNextContentVersion,
  unitFormSchema,
  unitNumberFromSlug,
} from "./adminSchemas";

const validUnit = {
  slug: "unit-01",
  level: "1급",
  unitNumber: 1,
  titleKo: "인사",
  titleRu: "Приветствие",
  descriptionRu: "Базовые фразы",
  contentVersion: "1.0.0",
  status: "draft" as const,
  sortOrder: 0,
};

const validGrammar = {
  moduleId: "11111111-1111-4111-8111-111111111111",
  code: "n-i-ga",
  logicalId: "grammar.u01.n01",
  patternKo: "N이/가",
  category: "particle",
  usageKey: null,
  titleRu: "Именительный падеж",
  titleKo: null,
  summaryRu: "Кратко",
  summaryKo: null,
  bodyMd: "## Значение\n\nТекст",
  level: "1급",
  contentVersion: "1.0.0",
  status: "draft" as const,
  sortOrder: 1,
};

const validDictionary = {
  logicalId: "dict.hello",
  senseKey: "default",
  lemmaKo: "안녕",
  partOfSpeech: "interjection",
  meaningsRu: ["привет"],
  usageNoteRu: null,
  transliteration: null,
  level: "1급",
  contentVersion: "1.0.0",
  status: "draft" as const,
  primaryModuleId: "11111111-1111-4111-8111-111111111111",
};

describe("unitNumberFromSlug", () => {
  it("parses curriculum unit codes", () => {
    expect(unitNumberFromSlug("u01")).toBe(1);
    expect(unitNumberFromSlug("u09")).toBe(9);
    expect(unitNumberFromSlug("u16")).toBe(16);
  });

  it("returns null for non-unit codes", () => {
    expect(unitNumberFromSlug("unit-01")).toBeNull();
    expect(unitNumberFromSlug("u00")).toBeNull();
    expect(unitNumberFromSlug("u17")).toBeNull();
  });
});

describe("resolveNextContentVersion", () => {
  it("starts new content at 1.0.0", () => {
    expect(
      resolveNextContentVersion({ previousVersion: undefined, hasContentChanged: true }),
    ).toBe("1.0.0");
  });

  it("bumps the patch when content changed", () => {
    expect(bumpContentVersionPatch("1.2.3")).toBe("1.2.4");
    expect(
      resolveNextContentVersion({ previousVersion: "1.0.0", hasContentChanged: true }),
    ).toBe("1.0.1");
  });

  it("keeps the previous version when content did not change", () => {
    expect(
      resolveNextContentVersion({ previousVersion: "1.4.2", hasContentChanged: false }),
    ).toBe("1.4.2");
  });
});

describe("unitFormSchema", () => {
  it("accepts a valid unit form", () => {
    expect(unitFormSchema.parse(validUnit)).toMatchObject({
      slug: "unit-01",
      contentVersion: "1.0.0",
    });
  });

  it("rejects a content version without a patch segment", () => {
    expect(unitFormSchema.safeParse({ ...validUnit, contentVersion: "1.0" }).success).toBe(false);
  });

  it("rejects an uppercase slug", () => {
    expect(unitFormSchema.safeParse({ ...validUnit, slug: "Unit-01" }).success).toBe(false);
  });
});

describe("grammarTopicFormSchema", () => {
  it("accepts a valid grammar topic form", () => {
    expect(grammarTopicFormSchema.parse(validGrammar)).toMatchObject({
      logicalId: "grammar.u01.n01",
      bodyMd: "## Значение\n\nТекст",
    });
  });

  it("rejects a content version without a patch segment", () => {
    expect(
      grammarTopicFormSchema.safeParse({ ...validGrammar, contentVersion: "1.0" }).success,
    ).toBe(false);
  });

  it("rejects an uppercase topic code", () => {
    expect(grammarTopicFormSchema.safeParse({ ...validGrammar, code: "N-I-GA" }).success).toBe(
      false,
    );
  });
});

describe("dictionaryEntryFormSchema", () => {
  it("accepts a valid dictionary entry form", () => {
    expect(dictionaryEntryFormSchema.parse(validDictionary)).toMatchObject({
      lemmaKo: "안녕",
      meaningsRu: ["привет"],
    });
  });

  it("rejects a content version without a patch segment", () => {
    expect(
      dictionaryEntryFormSchema.safeParse({ ...validDictionary, contentVersion: "1.0" }).success,
    ).toBe(false);
  });

  it("rejects an empty meanings list", () => {
    expect(
      dictionaryEntryFormSchema.safeParse({ ...validDictionary, meaningsRu: [] }).success,
    ).toBe(false);
  });
});
