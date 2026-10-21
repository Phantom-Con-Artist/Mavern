export type Letter = { char: string; key: string; space: boolean };

const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

/** Splits text into letters (graphemes, so an emoji or accented letter stays whole) for per-letter animation. */
export function splitLetters(text: string): Letter[] {
  return [...segmenter.segment(text)].map(({ segment }, i) => ({ char: segment, key: `${i}-${segment}`, space: /^\s+$/.test(segment) }));
}
