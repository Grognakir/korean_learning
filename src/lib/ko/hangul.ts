const HANGUL_START = 0xac00;
const HANGUL_END = 0xd7a3;

function lastHangulCode(word: string): number | null {
  for (let i = word.length - 1; i >= 0; i -= 1) {
    const code = word.charCodeAt(i);
    if (code >= HANGUL_START && code <= HANGUL_END) {
      return code;
    }
  }
  return null;
}

export function hasBatchim(word: string): boolean {
  const code = lastHangulCode(word);
  if (code === null) {
    return false;
  }
  return (code - HANGUL_START) % 28 !== 0;
}

export function isHangul(text: string): boolean {
  for (const char of text) {
    if (/\s/u.test(char)) {
      continue;
    }
    const code = char.charCodeAt(0);
    if (code < HANGUL_START || code > HANGUL_END) {
      return false;
    }
  }
  return true;
}

export function subjectParticle(word: string): "이" | "가" {
  return hasBatchim(word) ? "이" : "가";
}

export function topicParticle(word: string): "은" | "는" {
  return hasBatchim(word) ? "은" : "는";
}

export function andParticle(word: string): "과" | "와" {
  return hasBatchim(word) ? "과" : "와";
}
