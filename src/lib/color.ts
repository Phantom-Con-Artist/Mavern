export type Ground = "night" | "violet" | "orchid" | "gold" | "ember" | "marble";

/**
 * The dusk palette, taken from the statue artwork: each ground and the ink set on it.
 * Values must match src/styles/tokens.css (a test checks).
 */
export const grounds: Record<Ground, { value: string; ink: Ground }> = {
  night: { value: "oklch(17% 0.07 300)", ink: "marble" },
  violet: { value: "oklch(45% 0.24 300)", ink: "marble" },
  orchid: { value: "oklch(72% 0.2 340)", ink: "night" },
  gold: { value: "oklch(86% 0.16 85)", ink: "night" },
  ember: { value: "oklch(62% 0.22 30)", ink: "night" },
  marble: { value: "oklch(96% 0.015 85)", ink: "night" },
};

// Written out in full so Tailwind finds the class names when it scans the source.
const groundClasses: Record<Ground, string> = {
  night: "bg-night text-marble",
  violet: "bg-violet text-marble",
  orchid: "bg-orchid text-night",
  gold: "bg-gold text-night",
  ember: "bg-ember text-night",
  marble: "bg-marble text-night",
};

export function groundClass(g: Ground): string {
  return groundClasses[g];
}

function parseOklch(value: string): [number, number, number] {
  const m = value.match(/oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s*\)/);
  if (!m) throw new Error(`Not an oklch() colour: ${value}`);
  return [Number(m[1]) / 100, Number(m[2]), Number(m[3])];
}

/** oklch → linear sRGB, clamped to the displayable range. */
export function toLinearRgb(value: string): [number, number, number] {
  const [L, C, h] = parseOklch(value);
  const a = C * Math.cos((h * Math.PI) / 180);
  const b = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const clamp = (x: number) => Math.min(1, Math.max(0, x));
  return [
    clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

function luminance(value: string): number {
  const [r, g, b] = toLinearRgb(value);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2 contrast ratio between two oklch() colours. */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
