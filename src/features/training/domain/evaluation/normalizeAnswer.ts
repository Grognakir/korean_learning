/**
 * Basic answer normalization for phase 1:
 * Unicode NFC, trim, and collapse runs of whitespace.
 * Comparison stays case-, punctuation-, and morphology-sensitive.
 */
export function normalizeAnswer(value: string): string {
  return value.normalize("NFC").trim().replace(/\s+/gu, " ");
}
