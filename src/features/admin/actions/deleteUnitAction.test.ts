import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { deleteUnit } from "@/features/admin/data/adminContentRepository";
import { requireAdminSession } from "@/features/admin/server/requireAdminSession";

import { deleteUnitAction } from "./deleteUnitAction";

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
    deleteUnit: vi.fn(),
  };
});

describe("deleteUnitAction", () => {
  beforeEach(() => {
    vi.mocked(requireAdminSession).mockResolvedValue(undefined);
    vi.mocked(deleteUnit).mockReset();
    vi.mocked(updateTag).mockClear();
    vi.mocked(redirect).mockClear();
  });

  it("returns a friendly error when deletion is blocked by related rows", async () => {
    const { AdminDeleteBlockedError } = await import(
      "@/features/admin/data/adminContentRepository"
    );
    vi.mocked(deleteUnit).mockRejectedValue(new AdminDeleteBlockedError("Нельзя удалить"));

    await expect(deleteUnitAction("unit-id")).resolves.toEqual({
      ok: false,
      error: "Нельзя удалить",
    });
    expect(redirect).not.toHaveBeenCalled();
    expect(updateTag).not.toHaveBeenCalled();
  });

  it("revalidates tags and redirects after a successful delete", async () => {
    vi.mocked(deleteUnit).mockResolvedValue(undefined);

    await deleteUnitAction("unit-id");

    expect(deleteUnit).toHaveBeenCalledWith("unit-id");
    expect(updateTag).toHaveBeenCalledWith("curriculum-catalog");
    expect(updateTag).toHaveBeenCalledWith("learning-modules");
    expect(redirect).toHaveBeenCalledWith("/admin/units");
  });
});
