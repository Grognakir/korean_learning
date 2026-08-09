import { describe, expect, it } from "vitest";

import { buildDictionaryHref, parseDictionaryQuery } from "./parseDictionaryQuery";

describe("parseDictionaryQuery", () => {
  it("parses filters and falls back safely", () => {
    expect(parseDictionaryQuery({})).toEqual({ unitSlug: null, pos: null, page: 1 });
    expect(parseDictionaryQuery({ unit: "u01", pos: "noun", page: "2" })).toEqual({
      unitSlug: "u01",
      pos: "noun",
      page: 2,
    });
    expect(parseDictionaryQuery({ page: "0" }).page).toBe(1);
    expect(parseDictionaryQuery({ page: "nope" }).page).toBe(1);
  });
});

describe("buildDictionaryHref", () => {
  it("omits default page and empty filters", () => {
    expect(buildDictionaryHref({})).toBe("/dictionary");
    expect(buildDictionaryHref({ unitSlug: "u01", pos: "noun", page: 2 })).toBe(
      "/dictionary?unit=u01&pos=noun&page=2",
    );
  });
});
