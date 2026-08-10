import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { upsertDictionaryEntry } from "@/features/admin/data/adminContentRepository";
import { requireAdminSession } from "@/features/admin/server/requireAdminSession";

import { saveDictionaryEntryAction } from "./saveDictionaryEntryAction";

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
  upsertDictionaryEntry: vi.fn(),
}));

function dictionaryFormData(overrides: Record<string, string> = {}): FormData {
  const formData = new FormData();
  const values = {
    logicalId: "dict.hello",
    senseKey: "default",
    lemmaKo: "안녕",
    partOfSpeech: "interjection",
    meaningsRu: "привет\nздравствуй",
    usageNoteRu: "",
    transliteration: "",
    level: "1급",
    contentVersion: "1.0.0",
    status: "draft",
    primaryModuleId: "11111111-1111-4111-8111-111111111111",
    ...overrides,
  };

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }

  return formData;
}

describe("saveDictionaryEntryAction", () => {
  beforeEach(() => {
    vi.mocked(requireAdminSession).mockResolvedValue(undefined);
    vi.mocked(upsertDictionaryEntry).mockReset();
    vi.mocked(updateTag).mockClear();
    vi.mocked(redirect).mockClear();
  });

  it("returns field errors without calling the repository for invalid form data", async () => {
    const result = await saveDictionaryEntryAction(
      null,
      dictionaryFormData({ meaningsRu: "", contentVersion: "1.0" }),
    );

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.fieldErrors).toBeDefined();
    expect(upsertDictionaryEntry).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("upserts, revalidates the dictionary tag, then redirects", async () => {
    vi.mocked(upsertDictionaryEntry).mockResolvedValue({ id: "entry-id" });

    await saveDictionaryEntryAction(null, dictionaryFormData());

    expect(upsertDictionaryEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        logicalId: "dict.hello",
        meaningsRu: ["привет", "здравствуй"],
        usageNoteRu: null,
        transliteration: null,
        level: "1급",
        primaryModuleId: "11111111-1111-4111-8111-111111111111",
      }),
    );
    expect(updateTag).toHaveBeenCalledWith("curriculum-dictionary");
    expect(redirect).toHaveBeenCalledWith("/admin/dictionary");
  });
});
