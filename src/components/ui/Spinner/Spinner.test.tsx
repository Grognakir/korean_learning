import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it("announces its loading state politely", () => {
    render(<Spinner label="Загружаем урок" />);

    expect(screen.getByRole("status", { name: "Загружаем урок" })).toHaveAttribute(
      "aria-live",
      "polite",
    );
  });
});
