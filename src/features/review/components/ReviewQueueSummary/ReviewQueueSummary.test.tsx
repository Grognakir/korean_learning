import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ReviewQueueSummary } from "./ReviewQueueSummary";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("ReviewQueueSummary", () => {
  it("shows queue counts, filters, and a start action", () => {
    render(
      <ReviewQueueSummary
        summary={{
          dueCount: 2,
          scheduledCount: 1,
          masteredCount: 3,
          suspendedCount: 0,
          dueItems: [
            {
              id: "1",
              userId: "u",
              moduleId: "mod-1",
              conceptKey: "grammar:gt-1",
              exerciseId: null,
              status: "due",
              intervalStage: 0,
              consecutiveCorrect: 0,
              dueAt: "2026-08-10T00:00:00.000Z",
              createdAt: "2026-08-10T00:00:00.000Z",
              updatedAt: "2026-08-10T00:00:00.000Z",
            },
            {
              id: "2",
              userId: "u",
              moduleId: "mod-1",
              conceptKey: "vocabulary:de-1",
              exerciseId: null,
              status: "due",
              intervalStage: 0,
              consecutiveCorrect: 0,
              dueAt: "2026-08-10T00:00:00.000Z",
              createdAt: "2026-08-10T00:00:00.000Z",
              updatedAt: "2026-08-10T00:00:00.000Z",
            },
          ],
        }}
        unitOptions={[{ moduleId: "mod-1", unitSlug: "u01", label: "Знакомство" }]}
      />,
    );

    expect(screen.getByRole("region", { name: "Очередь повторения" })).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Навык для повторения" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Тема для повторения" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Начать повторение" })).toBeEnabled();
  });

  it("disables start when nothing is due", () => {
    render(
      <ReviewQueueSummary
        summary={{
          dueCount: 0,
          scheduledCount: 4,
          masteredCount: 0,
          suspendedCount: 0,
          dueItems: [],
        }}
      />,
    );

    expect(screen.getByRole("button", { name: "Начать повторение" })).toBeDisabled();
  });
});
