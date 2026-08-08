import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { createTrainingSession } from "../../domain";
import { LocalTrainingSessionStore } from "../../persistence";
import { ResumeTrainingPrompt } from "./ResumeTrainingPrompt";

function createMemoryStorage(initial?: Record<string, string>) {
  const data = new Map<string, string>(Object.entries(initial ?? {}));

  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
  };
}

describe("ResumeTrainingPrompt", () => {
  it("offers continue and restart for an active saved session", async () => {
    const user = userEvent.setup();
    const storage = createMemoryStorage();
    const store = new LocalTrainingSessionStore({
      storage,
      clock: { now: () => new Date("2026-08-08T00:00:00.000Z") },
    });
    const session = createTrainingSession({
      sessionId: "demo-session",
      moduleSlug: "sample-module",
      mode: "practice",
      seed: 17,
      exerciseIds: ["a1111111-1111-4111-8111-111111111111", "a2222222-2222-4222-8222-222222222222"],
      startedAt: "2026-08-01T00:00:00.000Z",
      contentSnapshot: {
        contentVersion: "1.0.0",
        exerciseIds: [
          "a1111111-1111-4111-8111-111111111111",
          "a2222222-2222-4222-8222-222222222222",
        ],
      },
    });
    store.save(session);

    render(<ResumeTrainingPrompt store={store} />);

    expect(
      await screen.findByRole("heading", { name: "Продолжить тренировку?" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Продолжить" })).toHaveAttribute(
      "href",
      "/training/demo-session",
    );

    await user.click(screen.getByRole("button", { name: "Начать заново" }));
    expect(
      screen.queryByRole("heading", { name: "Продолжить тренировку?" }),
    ).not.toBeInTheDocument();
    expect(store.load()).toEqual({ status: "missing" });
  });
});
