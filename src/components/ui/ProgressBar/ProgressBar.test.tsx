import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProgressBar } from "./ProgressBar";

describe("ProgressBar", () => {
  it("exposes its current value and accessible name", () => {
    render(<ProgressBar label="Прогресс урока" max={10} showValue value={4} />);

    const progress = screen.getByRole("progressbar", { name: "Прогресс урока" });

    expect(progress).toHaveAttribute("aria-valuemin", "0");
    expect(progress).toHaveAttribute("aria-valuemax", "10");
    expect(progress).toHaveAttribute("aria-valuenow", "4");
    expect(screen.getByText("40%")).toHaveAttribute("aria-hidden", "true");
  });

  it("clamps values outside the available range", () => {
    render(<ProgressBar label="Прогресс урока" max={10} value={14} />);

    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "10");
  });
});
