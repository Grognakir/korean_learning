import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ReadingPassage } from "./ReadingPassage";

describe("ReadingPassage", () => {
  it("marks Korean body with lang=ko", () => {
    render(
      <ReadingPassage
        passage={{
          logicalId: "sample-reading-intro",
          title: { ko: "자기소개", ru: "Самопредставление" },
          bodyKo: "안녕하세요? 저는 왕루입니다.",
        }}
      />,
    );

    expect(screen.getByLabelText("Текст для чтения")).toBeInTheDocument();
    expect(screen.getByText("안녕하세요? 저는 왕루입니다.")).toHaveAttribute("lang", "ko");
  });
});
