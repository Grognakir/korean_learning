import { describe, expect, it } from "vitest";

import { capitalizeRu, formatBilingualLabel } from "./formatBilingualLabel";

describe("formatBilingualLabel", () => {
  it("puts Korean first and capitalizes the Russian translation", () => {
    expect(formatBilingualLabel("인사와 소개", "приветствие и представление")).toBe(
      "인사와 소개 (Приветствие и представление)",
    );
  });

  it("capitalizes russian fragments", () => {
    expect(capitalizeRu("школа и дом")).toBe("Школа и дом");
  });
});
