import { describe, expect, it } from "vitest";

import { getPartOfSpeechLabel, getUnitLabels } from "./dictionaryLabels";

describe("dictionaryLabels", () => {
  it("localizes parts of speech without exposing source values", () => {
    expect(getPartOfSpeechLabel("noun")).toBe("существительное");
    expect(getPartOfSpeechLabel("pronoun")).toBe("местоимение");
    expect(getPartOfSpeechLabel("unexpected")).toBe("другая часть речи");
  });

  it("turns internal unit slugs into learner-facing lesson labels", () => {
    expect(getUnitLabels(["u01"])).toBe("Урок 1");
    expect(getUnitLabels(["u14", "u02"])).toBe("Уроки 2, 14");
    expect(getUnitLabels(["unknown"])).toBe("Учебная программа");
  });
});
