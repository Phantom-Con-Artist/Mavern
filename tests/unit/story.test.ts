import { describe, expect, it } from "vitest";
import { coverPoint } from "@/lib/cover";
import { soundWanted } from "@/components/sound/preference";
import { CHAPTERS, galleryShot, scrollDirection, windowOpacity } from "@/components/home/galleryPath";

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

describe("galleryShot", () => {
  it("has three chapters in the medium order", () => {
    expect(CHAPTERS.map((c) => c.medium)).toEqual(["software", "websites", "apps"]);
  });

  it("moves the camera forward, never back", () => {
    let last = Infinity;
    for (let p = 0; p <= 1; p += 0.02) {
      const z = galleryShot(p).eye[2];
      expect(z).toBeLessThanOrEqual(last + 1e-9);
      last = z;
    }
  });

  it("faces each arch at its chapter's centre", () => {
    for (const [k, c] of CHAPTERS.entries()) {
      const shot = galleryShot(c.at);
      expect(shot.chapter).toBe(k);
      expect(shot.target[0]).toBeCloseTo(c.arch[0], 6);
      expect(shot.target[2]).toBeCloseTo(c.arch[2], 6);
    }
  });

  it("clamps progress outside 0..1", () => {
    expect(galleryShot(-1)).toEqual(galleryShot(0));
    expect(galleryShot(2)).toEqual(galleryShot(1));
  });
});

describe("windowOpacity", () => {
  it("is 1 at the centre, 0 outside the window, and fades in between", () => {
    expect(windowOpacity(0.5, 0.5, 0.2)).toBe(1);
    expect(windowOpacity(0.2, 0.5, 0.2)).toBe(0);
    expect(windowOpacity(0.8, 0.5, 0.2)).toBe(0);
    const edge = windowOpacity(0.35, 0.5, 0.2);
    expect(edge).toBeGreaterThan(0);
    expect(edge).toBeLessThan(1);
  });
});

describe("scrollDirection", () => {
  it("only changes direction after a deliberate move", () => {
    expect(scrollDirection("down", 100, 98)).toBe("down");
    expect(scrollDirection("down", 100, 80)).toBe("up");
    expect(scrollDirection("up", 100, 104)).toBe("up");
    expect(scrollDirection("up", 100, 130)).toBe("down");
  });
});
