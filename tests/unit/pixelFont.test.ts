import { describe, expect, it } from "vitest";
import { GAP, GLYPH_H, GLYPH_W, bitmap } from "@/components/hero/pixelFont";
import { mediums } from "@/content/mediums";

const words = mediums.map((m) => m.word);

describe("pixel font", () => {
  it("draws every letter the sculpture needs", () => {
    for (const word of ["MAVERN", ...words]) expect(() => bitmap(word)).not.toThrow();
  });

  it("throws on a letter it does not have", () => {
    expect(() => bitmap("MAVERN?")).toThrow(/\?/);
  });

  it("sizes a word from its glyphs and gaps", () => {
    const rows = bitmap("APPS");
    expect(rows).toHaveLength(GLYPH_H);
    expect(rows[0]).toHaveLength(4 * GLYPH_W + 3 * GAP);
  });
});
