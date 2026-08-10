import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { upsertGrammarTopic } from "@/features/admin/data/adminContentRepository";
import { requireAdminSession } from "@/features/admin/server/requireAdminSession";

import { saveGrammarTopicAction } from "./saveGrammarTopicAction";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/features/admin/server/requireAdminSession", () => ({
  requireAdminSession: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/features/admin/data/adminContentRepository", () => ({
  AdminRepositoryError: class AdminRepositoryError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "AdminRepositoryError";
    }
  },
  upsertGrammarTopic: vi.fn(),
}));

function grammarFormData(overrides: Record<string, string> = {}): FormData {
  const formData = new FormData();
  const values = {
    moduleId: "11111111-1111-4111-8111-111111111111",
    code: "n-i-ga",
    logicalId: "grammar.u01.n01",
    patternKo: "N이/가",
    category: "particle",
    usageKey: "",
    titleRu: "Именительный падеж",
    titleKo: "",
    summaryRu: "Кратко",
    summaryKo: "",
    bodyMd: "## Значение\n\nТекст",
    level: "1급",
    contentVersion: "1.0.0",
    status: "draft",
    sortOrder: "1",
    ...overrides,
  };

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }

  return formData;
}

describe("saveGrammarTopicAction", () => {
  beforeEach(() => {
    vi.mocked(requireAdminSession).mockResolvedValue(undefined);
    vi.mocked(upsertGrammarTopic).mockReset();
    vi.mocked(updateTag).mockClear();
    vi.mocked(redirect).mockClear();
  });

  it("returns field errors without calling the repository for invalid form data", async () => {
    const result = await saveGrammarTopicAction(
      null,
      grammarFormData({ contentVersion: "1.0", code: "N-I-GA" }),
    );

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.fieldErrors).toBeDefined();
    expect(upsertGrammarTopic).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("upserts, revalidates the catalog tag, then redirects", async () => {
    vi.mocked(upsertGrammarTopic).mockResolvedValue({ id: "topic-id" });

    await saveGrammarTopicAction(null, grammarFormData());

    expect(upsertGrammarTopic).toHaveBeenCalledWith(
      expect.objectContaining({
        logicalId: "grammar.u01.n01",
        usageKey: null,
        titleKo: null,
        summaryKo: null,
        bodyMd: "## Значение\n\nТекст",
        sortOrder: 1,
      }),
    );
    expect(updateTag).toHaveBeenCalledWith("curriculum-catalog");
    expect(redirect).toHaveBeenCalledWith("/admin/grammar");
  });
});
