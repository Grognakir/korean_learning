import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { deleteGrammarTopic } from "@/features/admin/data/adminContentRepository";
import { requireAdminSession } from "@/features/admin/server/requireAdminSession";

import { deleteGrammarTopicAction } from "./deleteGrammarTopicAction";

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
    deleteGrammarTopic: vi.fn(),
  };
});

describe("deleteGrammarTopicAction", () => {
  beforeEach(() => {
    vi.mocked(requireAdminSession).mockResolvedValue(undefined);
    vi.mocked(deleteGrammarTopic).mockReset();
    vi.mocked(updateTag).mockClear();
    vi.mocked(redirect).mockClear();
  });

  it("returns a friendly error when deletion is blocked by related rows", async () => {
    const { AdminDeleteBlockedError } = await import(
      "@/features/admin/data/adminContentRepository"
    );
    vi.mocked(deleteGrammarTopic).mockRejectedValue(new AdminDeleteBlockedError("Нельзя удалить"));

    await expect(deleteGrammarTopicAction("topic-id")).resolves.toEqual({
      ok: false,
      error: "Нельзя удалить",
    });
    expect(redirect).not.toHaveBeenCalled();
  });

  it("revalidates the catalog tag and redirects after a successful delete", async () => {
    vi.mocked(deleteGrammarTopic).mockResolvedValue(undefined);

    await deleteGrammarTopicAction("topic-id");

    expect(updateTag).toHaveBeenCalledWith("curriculum-catalog");
    expect(redirect).toHaveBeenCalledWith("/admin/grammar");
  });
});
