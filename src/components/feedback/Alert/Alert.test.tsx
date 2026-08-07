import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Alert } from "./Alert";

describe("Alert", () => {
  it("uses polite announcements for regular feedback", () => {
    render(<Alert title="Подсказка">Можно перейти к следующему примеру.</Alert>);

    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
  });

  it("uses an assertive alert for errors", () => {
    render(
      <Alert title="Не удалось сохранить" tone="danger">
        Попробуйте ещё раз.
      </Alert>,
    );

    expect(screen.getByRole("alert")).toHaveAttribute("aria-live", "assertive");
  });
});
