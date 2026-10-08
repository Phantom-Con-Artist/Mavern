/** Deterministic pseudo-random numbers in [0, 1), so generated art and backdrop text never change between renders. */
export function seeded(seed: number) {
  let state = seed % 2147483647 || 1;
  return () => (state = (state * 16807) % 2147483647) / 2147483647;
}
