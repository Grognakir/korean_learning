import { describe, expect, it } from "vitest";

import type { PublicDictionaryEntry } from "../domain/types";
import { withHomonymLabels } from "./homonymLabels";

function entry(
  overrides: Pick<PublicDictionaryEntry, "logicalId" | "lemma" | "senseKey" | "gloss">,
): PublicDictionaryEntry {
  return {
    id: overrides.logicalId,
    transliteration: null,
    pos: "noun",
    level: null,
    unitSlugs: ["u01"],
    contentVersion: "1.0.0",
    language: { lemma: "ko", gloss: "ru" },
    ...overrides,
  };
}

describe("withHomonymLabels", () => {
  it("marks only lemmas that appear more than once", () => {
    const labeled = withHomonymLabels([
      entry({
        logicalId: "a",
        lemma: "안녕",
        senseKey: "privet",
        gloss: { ko: "안녕", ru: "привет" },
      }),
      entry({
        logicalId: "b",
        lemma: "안녕",
        senseKey: "poka",
        gloss: { ko: "안녕", ru: "пока" },
      }),
      entry({
        logicalId: "c",
        lemma: "학교",
        senseKey: "shkola",
        gloss: { ko: "학교", ru: "школа" },
      }),
    ]);

    expect(labeled.map((item) => [item.senseKey, item.showSenseLabel])).toEqual([
      ["privet", true],
      ["poka", true],
      ["shkola", false],
    ]);
  });
});
