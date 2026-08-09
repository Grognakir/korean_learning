import { beforeEach, describe, expect, it, vi } from "vitest";

const getUser = vi.fn();

vi.mock("@/lib/supabase/serverClient", () => ({
  createServerSupabaseClient: vi.fn(async () => ({
    auth: {
      getUser,
    },
  })),
}));

describe("getServerAuthUser", () => {
  beforeEach(() => {
    getUser.mockReset();
  });

  it("returns authenticated user data", async () => {
    getUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "learner@example.com" } },
      error: null,
    });

    const { getServerAuthUser } = await import("./getServerAuthUser");

    await expect(getServerAuthUser()).resolves.toEqual({
      id: "user-1",
      email: "learner@example.com",
    });
  });

  it("returns null for missing session", async () => {
    getUser.mockResolvedValue({
      data: { user: null },
      error: { message: "missing" },
    });

    const { getServerAuthUser } = await import("./getServerAuthUser");

    await expect(getServerAuthUser()).resolves.toBeNull();
  });
});
