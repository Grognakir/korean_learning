const FORBIDDEN = [
  "correctOptionId",
  "acceptedAnswers",
  "is_correct",
  "isCorrect",
  "correctAnswer",
  "sourceRefs",
  "record_hash",
  "recordHash",
  "reviewNotes",
  "review_notes",
] as const;

export function assertPublicCurriculumShape(value: unknown, label: string): void {
  const serialized = JSON.stringify(value);

  for (const key of FORBIDDEN) {
    if (serialized.includes(`"${key}"`)) {
      throw new Error(`${label} must not include "${key}".`);
    }
  }
}
