import { describe, expect, it } from "vitest";

import { classNames } from "@/lib/utilities";

describe("classNames", () => {
  it("объединяет только заданные классы", () => {
    expect(classNames("button", false, undefined, "buttonActive", null)).toBe(
      "button buttonActive",
    );
  });
});
