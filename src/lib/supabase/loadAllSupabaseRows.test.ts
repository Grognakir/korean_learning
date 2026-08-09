import { describe, expect, it, vi } from "vitest";

import { loadAllSupabaseRows, SupabaseRowPaginationError } from "./loadAllSupabaseRows";

describe("loadAllSupabaseRows", () => {
  it("loads every page until the first short page", async () => {
    const loadPage = vi
      .fn()
      .mockResolvedValueOnce({ data: [1, 2], error: null })
      .mockResolvedValueOnce({ data: [3, 4], error: null })
      .mockResolvedValueOnce({ data: [5], error: null });

    await expect(loadAllSupabaseRows(loadPage, 2)).resolves.toEqual([1, 2, 3, 4, 5]);
    expect(loadPage).toHaveBeenNthCalledWith(1, 0, 1);
    expect(loadPage).toHaveBeenNthCalledWith(2, 2, 3);
    expect(loadPage).toHaveBeenNthCalledWith(3, 4, 5);
  });

  it("fails instead of returning a truncated result", async () => {
    const loadPage = vi.fn().mockResolvedValue({ data: null, error: { message: "timeout" } });

    await expect(loadAllSupabaseRows(loadPage, 2)).rejects.toEqual(
      new SupabaseRowPaginationError("timeout"),
    );
  });
});
