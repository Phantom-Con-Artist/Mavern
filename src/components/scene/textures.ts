import * as THREE from "three";

function cssFont(variable: string, fallback: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim() || fallback;
}

function texture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** The word in the display face, white on transparent (tinted by the material), with its width ÷ height. */
export async function wordTexture(word: string): Promise<{ texture: THREE.CanvasTexture; aspect: number }> {
  const size = 320;
  const font = `400 ${size}px ${cssFont("--font-dela", "sans-serif")}`;
  await document.fonts.load(font, word).catch(() => undefined);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  ctx.font = font;
  const width = Math.ceil(ctx.measureText(word).width + size * 0.2);
  canvas.width = width;
  canvas.height = Math.ceil(size * 1.15);
  ctx.font = font;
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "middle";
  ctx.fillText(word, size * 0.1, canvas.height / 2);
  return { texture: texture(canvas), aspect: canvas.width / canvas.height };
}

/** A vermilion card with a work's name in the display face and its summary in the text face, in ink. */
export async function cardTexture(title: string, body: string, colours: { card: string; ink: string }): Promise<THREE.CanvasTexture> {
  const display = `400 64px ${cssFont("--font-dela", "sans-serif")}`;
  const text = `500 30px ${cssFont("--font-dm", "sans-serif")}`;
  await Promise.all([document.fonts.load(display, title), document.fonts.load(text, body)]).catch(() => undefined);
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 800;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = colours.card;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = colours.ink;
  ctx.font = display;
  ctx.fillText(title, 48, 120);
  ctx.font = text;
  let line = "";
  let y = 200;
  for (const w of body.split(" ")) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width > canvas.width - 96) {
      ctx.fillText(line, 48, y);
      line = w;
      y += 42;
    } else line = next;
  }
  ctx.fillText(line, 48, y);
  return texture(canvas);
}
