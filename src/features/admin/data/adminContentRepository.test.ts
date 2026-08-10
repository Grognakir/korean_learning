import { afterEach, describe, expect, it, vi } from "vitest";

import type { ServiceRoleSupabaseClient } from "@/lib/supabase/serviceRoleClient";

import {
  AdminDeleteBlockedError,
  AdminRepositoryError,
  deleteDictionaryEntry,
  deleteGrammarTopic,
  deleteUnit,
  upsertDictionaryEntry,
  upsertGrammarTopic,
  upsertUnit,
} from "./adminContentRepository";

vi.mock("@/features/admin/server/recordAdminProvenance", () => ({
  recordAdminProvenance: vi.fn().mockResolvedValue(undefined),
}));

afterEach(() => {
  vi.clearAllMocks();
});

function createChain(result: { data: unknown; error: unknown; count?: number | null }) {
  const chain: {
    select: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    upsert: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
    single: ReturnType<typeof vi.fn>;
    maybeSingle: ReturnType<typeof vi.fn>;
    then: (
      onFulfilled: (value: unknown) => unknown,
      onRejected?: (reason: unknown) => unknown,
    ) => Promise<unknown>;
  } = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
    then: (onFulfilled, onRejected) => Promise.resolve(result).then(onFulfilled, onRejected),
  };

  chain.select.mockReturnValue(chain);
  chain.insert.mockReturnValue(chain);
  chain.update.mockReturnValue(chain);
  chain.upsert.mockReturnValue(chain);
  chain.delete.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.order.mockReturnValue(chain);
  chain.single.mockResolvedValue(result);
  chain.maybeSingle.mockResolvedValue(result);

  return chain;
}

const unitInput = {
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

const grammarInput = {
  moduleId: "11111111-1111-4111-8111-111111111111",
  code: "n-i-ga",
  logicalId: "grammar.u01.n01",
  patternKo: "N이/가",
  category: "particle",
  usageKey: null,
  titleRu: "Именительный падеж",
  titleKo: "주격 조사",
  summaryRu: "Кратко",
  summaryKo: null,
  bodyMd: "## Значение\n\nТекст",
  level: "1급",
  contentVersion: "1.0.0",
  status: "draft" as const,
  sortOrder: 1,
};

const dictionaryInput = {
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

describe("upsertUnit", () => {
  it("inserts a unit when id is absent", async () => {
    const modulesChain = createChain({ data: { id: "unit-id" }, error: null });
    const supabase = {
      from: vi.fn(() => modulesChain),
    } as unknown as ServiceRoleSupabaseClient;

    await expect(upsertUnit(unitInput, supabase)).resolves.toEqual({ id: "unit-id" });

    expect(modulesChain.insert).toHaveBeenCalledWith({
      slug: "unit-01",
      level: "1급",
      unit_number: 1,
      title_ko: "인사",
      title_ru: "Приветствие",
      description_ru: "Базовые фразы",
      content_version: "1.0.0",
      status: "draft",
      sort_order: 0,
    });
    expect(modulesChain.update).not.toHaveBeenCalled();
  });

  it("updates a unit when id is present", async () => {
    const modulesChain = createChain({ data: { id: "unit-id" }, error: null });
    const supabase = {
      from: vi.fn(() => modulesChain),
    } as unknown as ServiceRoleSupabaseClient;

    await expect(
      upsertUnit({ ...unitInput, id: "11111111-1111-4111-8111-111111111111" }, supabase),
    ).resolves.toEqual({ id: "unit-id" });

    expect(modulesChain.update).toHaveBeenCalled();
    expect(modulesChain.eq).toHaveBeenCalledWith("id", "11111111-1111-4111-8111-111111111111");
    expect(modulesChain.insert).not.toHaveBeenCalled();
  });
});

describe("upsertGrammarTopic", () => {
  it("builds rule_payload from form fields and preserves unrelated existing keys on update", async () => {
    const existingChain = createChain({
      data: {
        rule_payload: {
          legacyNote: "keep-me",
          detail: { examples: ["a"] },
        },
      },
      error: null,
    });
    const writeChain = createChain({ data: { id: "topic-id" }, error: null });
    const from = vi.fn(() => {
      if (from.mock.calls.length <= 1) {
        return existingChain;
      }
      return writeChain;
    });
    const supabase = { from } as unknown as ServiceRoleSupabaseClient;

    await expect(
      upsertGrammarTopic(
        { ...grammarInput, id: "22222222-2222-4222-8222-222222222222" },
        supabase,
      ),
    ).resolves.toEqual({ id: "topic-id" });

    expect(writeChain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Именительный падеж",
        rule_payload: {
          legacyNote: "keep-me",
          titleKo: "주격 조사",
          detail: {
            examples: ["a"],
            bodyMd: "## Значение\n\nТекст",
          },
        },
      }),
    );
  });
});

describe("upsertDictionaryEntry", () => {
  it("normalizes lemma_ko and upserts the primary module link", async () => {
    const entriesChain = createChain({ data: { id: "entry-id" }, error: null });
    const linksChain = createChain({ data: null, error: null });
    const from = vi.fn((table: string) => {
      if (table === "dictionary_entries") {
        return entriesChain;
      }
      if (table === "dictionary_entry_modules") {
        return linksChain;
      }
      throw new Error(`Unexpected table: ${table}`);
    });
    const supabase = { from } as unknown as ServiceRoleSupabaseClient;

    await expect(upsertDictionaryEntry(dictionaryInput, supabase)).resolves.toEqual({
      id: "entry-id",
    });

    expect(entriesChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        lemma_ko: "안녕",
        normalized_lemma_ko: "안녕".normalize("NFC"),
        module_id: dictionaryInput.primaryModuleId,
        meanings_ru: ["привет"],
      }),
    );
    expect(linksChain.upsert).toHaveBeenCalledWith(
      {
        entry_id: "entry-id",
        module_id: dictionaryInput.primaryModuleId,
        role: "primary",
      },
      { onConflict: "entry_id,module_id" },
    );
  });
});

describe("delete helpers", () => {
  it("raises AdminDeleteBlockedError when Postgres reports a foreign-key conflict", async () => {
    const modulesChain = createChain({
      data: null,
      error: { code: "23503", message: "foreign key" },
    });
    const supabase = {
      from: vi.fn(() => modulesChain),
    } as unknown as ServiceRoleSupabaseClient;

    await expect(deleteUnit("unit-id", supabase)).rejects.toBeInstanceOf(AdminDeleteBlockedError);
    expect(modulesChain.delete).toHaveBeenCalled();
    expect(modulesChain.eq).toHaveBeenCalledWith("id", "unit-id");
  });

  it("raises AdminRepositoryError for non-fk delete failures", async () => {
    const topicsChain = createChain({
      data: null,
      error: { code: "42501", message: "permission denied" },
    });
    const supabase = {
      from: vi.fn(() => topicsChain),
    } as unknown as ServiceRoleSupabaseClient;

    await expect(deleteGrammarTopic("topic-id", supabase)).rejects.toBeInstanceOf(
      AdminRepositoryError,
    );
  });

  it("explains which grammar topic relations block deletion", async () => {
    const topicsChain = createChain({
      data: null,
      error: { code: "23503", message: "foreign key" },
    });
    const exercisesChain = createChain({ data: null, error: null, count: 3 });
    const linksChain = createChain({ data: null, error: null, count: 1 });
    const progressChain = createChain({ data: null, error: null, count: 0 });
    const mistakesChain = createChain({ data: null, error: null, count: 2 });
    const from = vi.fn((table: string) => {
      if (table === "grammar_topics") {
        return topicsChain;
      }
      if (table === "exercises") {
        return exercisesChain;
      }
      if (table === "exercise_topics") {
        return linksChain;
      }
      if (table === "user_topic_progress") {
        return progressChain;
      }
      if (table === "mistake_events") {
        return mistakesChain;
      }
      throw new Error(`Unexpected table: ${table}`);
    });
    const supabase = { from } as unknown as ServiceRoleSupabaseClient;

    await expect(deleteGrammarTopic("topic-id", supabase)).rejects.toMatchObject({
      name: "AdminDeleteBlockedError",
      message:
        "Нельзя удалить: упражнений: 3, доп. привязок к упражнениям: 1, событий ошибок: 2. Сначала удалите или отвяжите их.",
    });
  });

  it("clears dictionary_entry_modules before deleting a dictionary entry", async () => {
    const linksChain = createChain({ data: null, error: null });
    const entriesChain = createChain({ data: null, error: null });
    const from = vi.fn((table: string) => {
      if (table === "dictionary_entry_modules") {
        return linksChain;
      }
      if (table === "dictionary_entries") {
        return entriesChain;
      }
      throw new Error(`Unexpected table: ${table}`);
    });
    const supabase = { from } as unknown as ServiceRoleSupabaseClient;

    await expect(deleteDictionaryEntry("entry-id", supabase)).resolves.toBeUndefined();

    expect(linksChain.delete).toHaveBeenCalled();
    expect(linksChain.eq).toHaveBeenCalledWith("entry_id", "entry-id");
    expect(entriesChain.delete).toHaveBeenCalled();
    expect(entriesChain.eq).toHaveBeenCalledWith("id", "entry-id");
    expect(from.mock.calls.map((call) => call[0])).toEqual([
      "dictionary_entry_modules",
      "dictionary_entries",
    ]);
  });
});