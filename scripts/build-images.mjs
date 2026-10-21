/*
  Builds the site's media into public/media (git-ignored): each picture in AVIF and WebP at a few widths,
  a JPEG texture for the 3D gallery, and copies of the video and music. Skips files that are up to date.

    node scripts/build-images.mjs
*/
import { copyFile, mkdir, readdir, stat } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import sharp from "sharp";

const OUT = "public/media";
const WIDTHS = [640, 1024];

/** Source picture, published name, and the widths it needs. */
const PICTURES = [
  ["assets/mavern-background.png", "creation", [...WIDTHS, 1536]],
  ["assets/mavern-athena-vaporwave.png", "athena", WIDTHS],
  ["assets/mavern-aphrodite-eyebar-vaporwave.png", "aphrodite", WIDTHS],
  ["assets/mavern-alexander-face-vaporwave.png", "alexander", WIDTHS],
];
/** Every screenshot of a live work in assets/screens, published as screen-<slug>. */
const SCREENS = (await readdir("assets/screens")).filter((f) => f.endsWith(".png"));
for (const f of SCREENS) PICTURES.push([`assets/screens/${f}`, `screen-${basename(f, ".png")}`, [...WIDTHS, 1440]]);
/** Pictures the gallery draws as textures, at one size. */
const TEXTURES = ["athena", "aphrodite", "alexander", "creation"];
const COPIES = ["assets/video/match-cut-poster.jpg", "assets/video/match-cut.webm", "assets/video/match-cut.mp4", "assets/audio/lost-sky-dreams.m4a"];

async function fresh(src, out) {
  try {
    return (await stat(out)).mtimeMs >= (await stat(src)).mtimeMs;
  } catch {
    return false;
  }
}

async function main() {
  await mkdir(OUT, { recursive: true });
  let made = 0;
  for (const [src, name, widths] of PICTURES) {
    try {
      await stat(src);
    } catch {
      console.warn(`build-images: missing ${src}`);
      continue;
    }
    for (const w of widths) {
      for (const [ext, opts] of [["avif", { quality: 55, effort: 4 }], ["webp", { quality: 78 }]]) {
        const out = join(OUT, `${name}-${w}.${ext}`);
        if (await fresh(src, out)) continue;
        await sharp(src).resize({ width: w, withoutEnlargement: true })[ext](opts).toFile(out);
        made++;
      }
    }
    if (TEXTURES.includes(name)) {
      const out = join(OUT, `${name}-texture.jpg`);
      if (!(await fresh(src, out))) {
        await sharp(src).resize({ width: 1024 }).jpeg({ quality: 82, mozjpeg: true }).toFile(out);
        made++;
      }
    }
  }
  // Share cards, 1200×630: the default, one per figure, one per screenshot.
  const cards = [["assets/mavern-background.png", "og-default"], ...PICTURES.map(([src, name]) => [src, `og-${name}`])];
  for (const [src, name] of cards) {
    const out = join(OUT, `${name}.jpg`);
    if (await fresh(src, out)) continue;
    await sharp(src).resize(1200, 630, { fit: "cover", position: "attention" }).jpeg({ quality: 80, mozjpeg: true }).toFile(out);
    made++;
  }
  for (const src of COPIES) {
    const out = join(OUT, basename(src, extname(src)) + extname(src));
    if (await fresh(src, out)) continue;
    await copyFile(src, out);
    made++;
  }
  console.log(`build-images: ${made} files written to ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
