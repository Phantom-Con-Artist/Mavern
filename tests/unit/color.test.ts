import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { contrastRatio, groundClass, grounds, type Ground } from "@/lib/color";

const names = Object.keys(grounds) as Ground[];

describe("colour grounds", () => {
  it.each(names)("%s and its ink reach 4.5:1", (name) => {
    const g = grounds[name];
    expect(contrastRatio(g.value, grounds[g.ink].value)).toBeGreaterThanOrEqual(4.5);
  });

  it("rejects marble on ember for body text", () => {
    expect(contrastRatio(grounds.marble.value, grounds.ember.value)).toBeLessThan(4.5);
  });

  it("has the six grounds of the dusk palette", () => {
    expect(names.sort()).toEqual(["ember", "gold", "marble", "night", "orchid", "violet"]);
  });

  it("is symmetric and 21:1 at the extremes", () => {
    expect(contrastRatio("oklch(100% 0 0)", "oklch(0% 0 0)")).toBeCloseTo(21, 0);
    expect(contrastRatio("oklch(0% 0 0)", "oklch(100% 0 0)")).toBeCloseTo(21, 0);
  });

  it("matches the CSS tokens", () => {
    const css = readFileSync("src/styles/tokens.css", "utf8");
    for (const name of names) {
      const m = css.match(new RegExp(`--${name}:\\s*([^;]+);`));
      expect(m?.[1].trim(), name).toBe(grounds[name].value);
    }
  });

  it("builds ground classes", () => {
    expect(groundClass("gold")).toBe("bg-gold text-night");
  });
});

describe("ground classes", () => {
  it.each(Object.keys(grounds) as Ground[])("%s class names its own ink", (g) => {
    expect(groundClass(g)).toBe(`bg-${g} text-${grounds[g].ink}`);
  });
});
