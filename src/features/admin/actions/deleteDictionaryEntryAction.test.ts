import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { deleteDictionaryEntry } from "@/features/admin/data/adminContentRepository";
import { requireAdminSession } from "@/features/admin/server/requireAdminSession";

import { deleteDictionaryEntryAction } from "./deleteDictionaryEntryAction";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/features/admin/server/requireAdminSession", () => ({
  requireAdminSession: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/features/admin/data/adminContentRepository", () => {
  class AdminDeleteBlockedError extends Error {
    constructor(message = "blocked") {
      super(message);
      this.name = "AdminDeleteBlockedError";
    }
  }

  return {
    AdminDeleteBlockedError,
    deleteDictionaryEntry: vi.fn(),
  };
});

describe("deleteDictionaryEntryAction", () => {
  beforeEach(() => {
    vi.mocked(requireAdminSession).mockResolvedValue(undefined);
    vi.mocked(deleteDictionaryEntry).mockReset();
    vi.mocked(updateTag).mockClear();
    vi.mocked(redirect).mockClear();
  });

  it("returns a friendly error when deletion is blocked by related rows", async () => {
    const { AdminDeleteBlockedError } = await import(
      "@/features/admin/data/adminContentRepository"
    );
    vi.mocked(deleteDictionaryEntry).mockRejectedValue(
      new AdminDeleteBlockedError("Нельзя удалить"),
    );

    await expect(deleteDictionaryEntryAction("entry-id")).resolves.toEqual({
      ok: false,
      error: "Нельзя удалить",
    });
    expect(redirect).not.toHaveBeenCalled();
  });

  it("revalidates the dictionary tag and redirects after a successful delete", async () => {
    vi.mocked(deleteDictionaryEntry).mockResolvedValue(undefined);

    await deleteDictionaryEntryAction("entry-id");

    expect(updateTag).toHaveBeenCalledWith("curriculum-dictionary");
    expect(redirect).toHaveBeenCalledWith("/admin/dictionary");
  });
});
