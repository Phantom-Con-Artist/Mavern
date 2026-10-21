import { describe, expect, it } from "vitest";
import { coverPoint } from "@/lib/cover";
import { soundWanted } from "@/components/sound/preference";

describe("coverPoint", () => {
  it("maps the centre of a centred cover image to the centre of the box", () => {
    expect(coverPoint({ w: 800, h: 600 }, { w: 1536, h: 1024 }, [0.5, 0.5], [0.5, 0.5])).toEqual({ x: 400, y: 300 });
  });

  it("follows object-position when a tall box crops the sides", () => {
    // 390×844 box, 1536×1024 image: scale = 844/1024, drawn width 1266, overflow 876.
    const p = coverPoint({ w: 390, h: 844 }, { w: 1536, h: 1024 }, [0.68, 0.5], [0.694, 0.293]);
    const scale = 844 / 1024;
    const left = -(1536 * scale - 390) * 0.68;
    expect(p.x).toBeCloseTo(left + 0.694 * 1536 * scale, 6);
    expect(p.y).toBeCloseTo(0.293 * 844, 6);
  });

  it("crops top and bottom when the box is wider than the image", () => {
    const p = coverPoint({ w: 1920, h: 600 }, { w: 1536, h: 1024 }, [0.5, 0.3], [0.5, 0]);
    const scale = 1920 / 1536;
    expect(p.x).toBeCloseTo(960, 6);
    expect(p.y).toBeCloseTo(-(1024 * scale - 600) * 0.3, 6);
  });
});

describe("soundWanted", () => {
  it("plays unless the visitor turned it off", () => {
    expect(soundWanted(null)).toBe(true);
    expect(soundWanted("on")).toBe(true);
    expect(soundWanted("off")).toBe(false);
  });
});
