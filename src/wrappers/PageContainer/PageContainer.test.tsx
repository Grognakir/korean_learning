import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";

import { PageContainer } from "./PageContainer";

describe("PageContainer", () => {
  it("composes external classes and forwards native props", () => {
    const ref = createRef<HTMLDivElement>();

    render(
      <PageContainer
        className="custom-container"
        data-testid="container"
        ref={ref}
        width="narrow"
      />,
    );

    expect(screen.getByTestId("container")).toHaveClass("custom-container");
    expect(ref.current).toBe(screen.getByTestId("container"));
  });
});
