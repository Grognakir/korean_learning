import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ReviewQueueSummary } from "./ReviewQueueSummary";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("ReviewQueueSummary", () => {
  it("shows queue counts and a start action", () => {
    render(
      <ReviewQueueSummary
        summary={{
          dueCount: 2,
          scheduledCount: 1,
          masteredCount: 3,
          suspendedCount: 0,
          dueItems: [],
        }}
      />,
    );

    expect(screen.getByRole("region", { name: "Очередь повторения" })).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
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
