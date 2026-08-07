import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";

import { Card } from "./Card";

describe("Card", () => {
  it("передаёт содержимое, ref и нативные props", () => {
    const ref = createRef<HTMLDivElement>();

    render(
      <Card aria-label="Карточка упражнения" data-state="ready" ref={ref}>
        Задание
      </Card>,
    );

    const card = screen.getByLabelText("Карточка упражнения");

    expect(card).toHaveTextContent("Задание");
    expect(card).toHaveAttribute("data-state", "ready");
    expect(ref.current).toBe(card);
  });
});
