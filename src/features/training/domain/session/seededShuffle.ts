/**
 * Deterministic seeded shuffle using a small mulberry32 PRNG.
 * Does not mutate the input array.
 */
export function seededShuffle<T>(items: readonly T[], seed: number): readonly T[] {
  const result = [...items];
  let state = seed >>> 0;

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(next() * (index + 1));
    const temporary = result[index]!;
    result[index] = result[swapIndex]!;
    result[swapIndex] = temporary;
  }

  return result;
}
