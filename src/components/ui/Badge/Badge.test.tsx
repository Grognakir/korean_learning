import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";

import { Badge } from "./Badge";

describe("Badge", () => {
  it("передаёт ref и нативные props", () => {
    const ref = createRef<HTMLSpanElement>();

    render(
      <Badge data-level="1" ref={ref} tone="accent">
        1급
      </Badge>,
    );

    const badge = screen.getByText("1급");

    expect(badge).toHaveAttribute("data-level", "1");
    expect(ref.current).toBe(badge);
  });
});
