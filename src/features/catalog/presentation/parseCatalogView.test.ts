import { describe, expect, it } from "vitest";

import { parseCatalogView } from "./parseCatalogView";

describe("parseCatalogView", () => {
  it("defaults to themes and accepts grammar", () => {
    expect(parseCatalogView(undefined)).toBe("themes");
    expect(parseCatalogView("themes")).toBe("themes");
    expect(parseCatalogView("grammar")).toBe("grammar");
    expect(parseCatalogView("nope")).toBe("themes");
    expect(parseCatalogView(["grammar", "themes"])).toBe("grammar");
  });
});
