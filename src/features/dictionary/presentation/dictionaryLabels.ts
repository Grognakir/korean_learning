const PART_OF_SPEECH_LABELS: Readonly<Record<string, string>> = {
  adjective: "прилагательное",
  adverb: "наречие",
  conjunction: "союз",
  counter: "счётное слово",
  ending: "окончание",
  interjection: "междометие",
  interrogative: "вопросительное слово",
  noun: "существительное",
  numeral: "числительное",
  particle: "частица",
  pronoun: "местоимение",
  term: "термин",
  verb: "глагол",
};

export function getPartOfSpeechLabel(value: string): string {
  return PART_OF_SPEECH_LABELS[value] ?? "другая часть речи";
}

export function getUnitLabels(unitSlugs: readonly string[]): string {
  const unitNumbers = unitSlugs
    .map((slug) => /^u(\d+)$/i.exec(slug)?.[1])
    .filter((value): value is string => value !== undefined)
    .map(Number)
    .sort((left, right) => left - right);

  if (unitNumbers.length === 0) {
    return "Учебная программа";
  }

  if (unitNumbers.length === 1) {
    return `Урок ${unitNumbers[0]}`;
  }

  return `Уроки ${unitNumbers.join(", ")}`;
}
