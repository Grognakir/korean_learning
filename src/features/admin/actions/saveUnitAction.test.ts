import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getUnitForAdmin, upsertUnit } from "@/features/admin/data/adminContentRepository";
import { requireAdminSession } from "@/features/admin/server/requireAdminSession";

import { saveUnitAction } from "./saveUnitAction";

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
  getUnitForAdmin: vi.fn(),
  upsertUnit: vi.fn(),
}));

function unitFormData(overrides: Record<string, string> = {}): FormData {
  const formData = new FormData();
  const values = {
    slug: "u01",
    level: "1급",
    unitNumber: "1",
    titleKo: "인사",
    titleRu: "Приветствие",
    descriptionRu: "Базовые фразы",
    status: "draft",
    ...overrides,
  };

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }

  return formData;
}

const existingUnit = {
  id: "11111111-1111-4111-8111-111111111111",
  slug: "u01",
  level: "1급",
  unitNumber: 1,
  titleKo: "인사",
  titleRu: "Приветствие",
  descriptionRu: "Базовые фразы",
  contentVersion: "1.0.0",
  status: "draft" as const,
  sortOrder: 1,
};

describe("saveUnitAction", () => {
  beforeEach(() => {
    vi.mocked(requireAdminSession).mockResolvedValue(undefined);
    vi.mocked(getUnitForAdmin).mockReset();
    vi.mocked(upsertUnit).mockReset();
    vi.mocked(updateTag).mockClear();
    vi.mocked(redirect).mockClear();
  });

  it("returns field errors without calling the repository for invalid form data", async () => {
    const result = await saveUnitAction(null, unitFormData({ slug: "Unit" }));

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.fieldErrors).toBeDefined();
    expect(upsertUnit).not.toHaveBeenCalled();
    expect(updateTag).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("creates a unit at content version 1.0.0", async () => {
    vi.mocked(upsertUnit).mockResolvedValue({ id: "unit-id" });

    await saveUnitAction(null, unitFormData());

    expect(upsertUnit).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: "u01",
        unitNumber: 1,
        titleRu: "Приветствие",
        contentVersion: "1.0.0",
        sortOrder: 1,
      }),
    );
    expect(updateTag).toHaveBeenCalledWith("curriculum-catalog");
    expect(updateTag).toHaveBeenCalledWith("learning-modules");
    expect(updateTag).toHaveBeenCalledWith("learning-module:u01");
    expect(redirect).toHaveBeenCalledWith("/admin/units");
  });

  it("bumps the patch version when an existing unit changes", async () => {
    vi.mocked(getUnitForAdmin).mockResolvedValue(existingUnit);
    vi.mocked(upsertUnit).mockResolvedValue({ id: existingUnit.id });

    await saveUnitAction(
      null,
      unitFormData({
        id: existingUnit.id,
        titleRu: "Новое название",
      }),
    );

    expect(upsertUnit).toHaveBeenCalledWith(
      expect.objectContaining({
        id: existingUnit.id,
        titleRu: "Новое название",
        contentVersion: "1.0.1",
      }),
    );
  });

  it("keeps the version when an existing unit is saved unchanged", async () => {
    vi.mocked(getUnitForAdmin).mockResolvedValue(existingUnit);
    vi.mocked(upsertUnit).mockResolvedValue({ id: existingUnit.id });

    await saveUnitAction(null, unitFormData({ id: existingUnit.id }));

    expect(upsertUnit).toHaveBeenCalledWith(
      expect.objectContaining({
        id: existingUnit.id,
        contentVersion: "1.0.0",
      }),
    );
  });
});
