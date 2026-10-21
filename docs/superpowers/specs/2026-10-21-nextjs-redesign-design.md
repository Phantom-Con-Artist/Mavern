# Mavern site: Next.js migration and redesign

Date: 2026-10-21. Branch: `redesign/nextjs`.

## Goal

Rebuild mavern.in in Next.js with a new visual identity, a catalogue of all of Subhradeep Sarkar's work, full SEO (metadata, structured data, sitemap), scroll-linked and ambient motion, kinetic type, and a WebGL hero. Hosting stays on Cloudflare Pages as a static site.

## Decisions

| Topic | Decision |
|---|---|
| Framework | Next.js 16 App Router, `output: "export"`, `trailingSlash: true`, build to `out/` |
| Hosting | Cloudflare Pages, static. Dashboard output directory changes `dist` → `out` (owner does this) |
| Art direction | "Classical marble in loud colour": Renaissance statues meet retro-futurist vaporwave |
| Hero | WebGL block sculpture reading MAVERN from the front and a medium word from the side, cycling mediums |
| Mediums | Software, Websites, Apps, Experiments (only mediums with real work behind them) |
| Motion | Motion (already installed). No GSAP, no Lenis |
| Type | Dela Gothic One (display), DM Sans (body, variable weight). Inter removed |
| Hand-drawn items | None. The Krita buttons and the whale avatar are removed (kept in git history, commit `ec9b9c6`) |
| Themes | One bright system. Paper/Ink/Warm themes, theme switcher and noir art removed |

## 1. Art direction

### Colour

Bright grounds from the artwork; each section pairs a ground with its most contrasting ink, and the pairs swap down the page.

| Token | Value | Ink on it |
|---|---|---|
| `--sun` | `oklch(91% 0.17 100)` | ultraviolet |
| `--ultraviolet` | `oklch(42% 0.24 295)` | sun |
| `--vermilion` | `oklch(64% 0.22 32)` | ink |
| `--marble` | `oklch(96% 0.015 85)` | ink |
| `--ink` | `oklch(20% 0.05 295)` | marble |

Every text pairing must pass WCAG AA (checked by a unit test computing contrast from the tokens). Marble on vermilion is not allowed for body text. No pure black or white. No decorative gradients.

### Recurring cues

- **The bar** (from the Aphrodite eye bar): covers section headings until revealed; used as the shape of status labels.
- **Horizon grid** (vaporwave, present in all four images): the floor the hero sculpture stands on.
- **Roman numerals** for section numbers; statues framed like paintings with a thin rule and caption plate (Renaissance).
- **The M mark** keeps its shape and proportions; it takes the current ink colour via the existing mask technique.

### Images

| Image | Placement | Reason |
|---|---|---|
| Athena | About | Wisdom; the maker is a research scholar |
| Alexander | Opens the work index | The growing catalogue |
| Aphrodite (eye bar) | Experiments medium | Unfinished, partly hidden work |
| Hands and orb | Full-bleed behind Contact | The moment of contact |

All four are generated artwork used as mood, never as evidence of a product or result.

### Buttons

Extruded blocks echoing the hero cubes: front face in the section ink, a darker slab on the bottom and right as depth. Hover lifts the face (`translate(-2px,-2px)`), press sinks it into the slab. Transforms only. Visible focus ring in the contrasting ground colour.

## 2. Structure, content, SEO

### Routes

| Route | Content |
|---|---|
| `/` | Hero, selected work by medium, About, Contact |
| `/work/` | All work grouped by medium |
| `/work/[medium]/` | One page per medium |
| `/work/[medium]/[project]/` | One page per project |
| 404 | Styled not-found page |
| `/software/` | 301 to `/work/software/` via `public/_redirects` |

### Content model

One file per project in `src/content/works/<slug>.ts`, exporting a `Work`:

```ts
type Medium = "software" | "websites" | "apps" | "experiments";
type WorkStatus = "released" | "live" | "beta" | "in-development" | "experiment" | "paused";
type WorkLink = { label: string; href: string; confirmed: boolean };
type Work = {
  slug: string;
  name: string;
  medium: Medium;
  kind: string;          // "Desktop app for researchers"
  summary: string;       // one sentence, used in cards and meta description
  body: string[];        // a few paragraphs for the project page
  status: WorkStatus;
  version?: string;
  platforms?: string;
  stack: string[];
  links: WorkLink[];     // only confirmed links render
  featured?: boolean;    // shown on the home page
  source: string;        // where the facts came from, for review
};
```

`src/content/works/index.ts` collects them. `src/content/mediums.ts` holds each medium's slug, label, sculpture word and description.

### Catalogue (facts from each project's README; nothing invented)

| Work | Medium | Status | Public link | Source |
|---|---|---|---|---|
| Volpi | software | beta, v0.1.1, Windows/macOS/Linux | volpi.mavern.in, GitHub releases | Volpi Website, Volpi-Releases READMEs |
| Chimera | software | in-development (v0.2.0) | none | Chimera Project README |
| Notifly | software | in-development | none | Notifly README |
| ScrapBean | software | in-development | none | ScrapBean README |
| Mistletoe UI | software | to confirm | GitHub Mistletoe-UI (to confirm) | KDE-Workshop README |
| animepoodle | websites | live | animepoodle.mavern.in | Anime-website README |
| Respawn | websites | in-development | GitHub respawn (to confirm) | gamer-website README |
| GingerBinger | websites | in-development | none | gingerbinger README |
| Algal Biotech Lab | websites | to confirm (client site) | GitHub (to confirm) | AlgalBiotechLab README |
| Light Year Saga | websites | to confirm | GitHub Light-Year-Saga (to confirm) | Light Year Saga README |
| restronaut | apps | in-development | none | Flutter source; README is a template |
| Text Tycoon | apps | in-development | none | README is a template; description to confirm |
| Social Simulation Engine | experiments | experiment | none | Simulation Engine README |
| Online Tachistoscope | experiments | experiment (v0.6.0) | GitHub Online-Tachistoscope (to confirm) | WebApp README |

"To confirm" items render conservatively: unconfirmed links are hidden, unknown status defaults to `in-development`, and the owner reviews every entry before publishing. Projects whose READMEs give no description (Text Tycoon, restronaut) get a neutral one-line description marked for the owner to rewrite.

### SEO

- Next metadata API: title template `%s · Mavern`, description, canonical, Open Graph and Twitter tags on every page. `metadataBase` = `https://mavern.in`.
- `opengraph-image.tsx` per route group, rendered at build in the site colours.
- JSON-LD: `Person` + `Organization` on `/`; `SoftwareApplication` (software, apps) or `WebSite` / `CreativeWork` (websites, experiments) on project pages; `BreadcrumbList` on work pages.
- `app/sitemap.ts` and `app/robots.ts` generated from content.
- One `<h1>` per page, semantic landmarks, descriptive alt text.

## 3. Hero and motion

### Sculpture (revised 2026-10-21 at the owner's direction)

The hero is a **classical head made of letters, blocks and shapes**, and **the camera moves** to reveal words.

- **Model:** Poly Haven "Marble Bust 01" by Rico Cilliers (CC0), kept in `assets/models/marble-bust-01/`.
- **Bake** (`scripts/build-bust.mjs`, pure functions tested): area-weighted, seeded sampling of ~14,000 surface points with normals and the ambient-occlusion value at each point, quantised to `public/hero/bust.bin`.
- **Elements:** each point is a letter from Dela Gothic (most points), a small cube (points in occluded hollows: hair, brow, jaw, ears) or a simple shape (triangle, ring, dot). Letters and shapes are instanced quads lying on the surface, drawn from a glyph atlas built at runtime from the loaded font. Cubes are instanced boxes. Base colour marble, dimmed by occlusion; cubes vermilion; lit elements sun.
- **Head word:** one camera viewpoint around the head for MAVERN. A point is lit when, seen from that viewpoint, it faces the camera and projects inside MAVERN's rasterised outline, so only from there do the lit points read as the word.
- **City** (`city.ts`, pure, tested): a top-down cyberpunk city whose built-up blocks spell the current medium word. The word's 5 × 7 block bitmap (`pixelFont.ts`) is the street plan: each lit pixel is a city block, gaps are streets. Every element has a city target: cubes become towers of varied height on the lit blocks, letters become rooftop signs on them, shapes become traffic along the streets. From directly above, the built-up blocks spell the word; the horizon grid becomes the street grid.
- **Morph** (transformer-like, on the GPU): each element stores its head pose and its city pose; a shader blends them with a per-element delay (crown first, then down the head) and a half spin in flight; cubes stretch into towers.
- **Loop** (one self-running cycle per medium, the head itself never moves on its own): head at three-quarters → camera flies to the MAVERN viewpoint, MAVERN lights → elements morph into the city while the camera rises to a top-down view → hold the city spelling the medium → city folds back into the head → next medium.
- **Text sync:** the line under the canvas names the current medium (FlipWord) and links to `/work/<medium>/`.
- **Blender:** not used at runtime (the morph needs one shared set of elements). Optional for rendering the poster when the Blender MCP is connected.

### Accessibility and performance

- `<h1>` is real text: "Mavern: software, websites, apps and experiments by Subhradeep Sarkar". Canvas is `aria-hidden`.
- `HeroFallback.tsx` (a still poster of the head with MAVERN lit, `public/hero/poster.*`) renders first; the WebGL scene loads with a dynamic import after hydration and replaces it. No WebGL or reduced motion keeps the fallback.
- Pauses offscreen (IntersectionObserver) and in hidden tabs. Visible pause/play button.

### Motion list

| Effect | Trigger |
|---|---|
| Bar slides off headings; letters rise 40 ms apart | Enter view, once |
| Section grounds blend between pairs | Scroll position |
| Statue frame parallax (≤ 8%) | Scroll position |
| Hands-and-orb zoom-out | Scroll through Contact |
| Project cards stagger 60 ms | Enter view, once |
| Block buttons lift / sink | Hover, press |

### Kinetic type

| Component | Use |
|---|---|
| `SplitText` | Splits into per-letter spans; full text on the parent `aria-label` |
| `FlipWord` | Split-flap letter change under the hero |
| `VelocityMarquee` | "SOFTWARE ✦ WEBSITES ✦ APPS ✦ EXPERIMENTS" band; speed and skew follow scroll velocity; `aria-hidden` |
| Drop-in titles | Project page titles fall in like cubes |
| `TrackingScrub` | "RESEARCHER / MAKER" in About, letter-spacing tied to scroll |
| `WeightHover` | Project names gain DM Sans weight near the pointer; `(hover: hover)` only |

Body text and buttons are never split. Animate only `transform`, `opacity` and `font-variation-settings`. Under `prefers-reduced-motion`, everything is static text or a plain fade.

## 4. Technical

### Layout

```
app/                     layout.tsx, page.tsx, not-found.tsx, sitemap.ts, robots.ts,
                         opengraph-image.tsx, work/page.tsx, work/[medium]/page.tsx,
                         work/[medium]/[project]/page.tsx
src/content/             site.ts, mediums.ts, works/*.ts, works/index.ts, types.ts
src/components/hero/     bust.ts (decode), pixelFont.ts, city.ts, words.ts (viewpoint, lit set), loop.ts, atlas.ts, HeadCityScene.tsx, HeroFallback.tsx, Hero.tsx
src/components/kinetic/  SplitText, FlipWord, VelocityMarquee, TrackingScrub, WeightHover
src/components/motion/   BarReveal, SectionGround, Parallax, ContactZoom
src/components/layout/   Header, Footer
src/components/ui/       ButtonLink, Picture, StatusBar
src/components/work/     WorkCard, WorkList
src/components/brand/    MavernMark
src/lib/                 seo.ts (metadata + JSON-LD builders), utils.ts
src/styles/              tokens.css, components.css
scripts/                 build-images.mjs, csp-hashes.mjs
tests/unit, tests/e2e
```

Each file has one responsibility; no file over ~300 lines.

### Dependencies

Add: `next`, `@tailwindcss/postcss`, `sharp` (dev), `vitest`, `@playwright/test`, `@axe-core/playwright`.
Remove: `vite`, `@vitejs/plugin-react`, `@tailwindcss/vite`, `@react-three/drei`, `@fontsource/*`, and `@radix-ui/react-slot`, `class-variance-authority` if unused.
Keep: `react`, `react-dom`, `three`, `@react-three/fiber`, `motion`, `tailwindcss`, `clsx`, `tailwind-merge`, `lucide-react`, Remotion (renders move to `renders/`).

Fonts via `next/font/google` (self-hosted at build).

### Security headers

`public/_headers` keeps the strict policy. Because Next emits inline scripts, `scripts/csp-hashes.mjs` runs after `next build`, hashes each page's inline scripts and writes a per-route `script-src 'self' 'sha256-…'` into `out/_headers`. No `unsafe-inline` for scripts.

### Images

`scripts/build-images.mjs` (sharp) converts `assets/*.png` artwork to AVIF and WebP at 640/1024/1600 px into `public/media/`. `<Picture>` serves them with `srcset`, width/height and alt text.

### Removed

Vite entries (`index.html`, `software/index.html`, `src/entries`, `src/lib/mount.tsx`), `public/theme-init.js`, `useTheme`, `ThemeSwitcher`, `NoirBackdrop`, `NoirScene`, `TypingWord`, `Panel`, `Section`, Krita button assets, whale avatar, `dist/`.

## 5. Testing

Unit (Vitest):
- Bust bake: deterministic, exact point count, every point on a mesh triangle, normals unit length, occlusion in [0,1].
- Words: a point is lit only if it faces the viewpoint and projects inside the word mask; MAVERN lights enough points to read (≥ 300).
- City: seen from above, the occupied blocks equal the word bitmap; every element gets exactly one city target; towers stand only on lit blocks; traffic only on streets.
- Content: unique slugs, valid mediums, unconfirmed links filtered out, every work has a summary under 160 characters.
- Colour tokens: each allowed pairing ≥ 4.5:1 (body) or ≥ 3:1 (large).
- Sitemap contains every route.

End-to-end (Playwright on a static server over `out/`):
- Every route returns 200 with title, description, canonical and parseable JSON-LD.
- No console errors; axe finds no serious violations.
- No horizontal scroll at 375 px.
- Reduced motion shows the hero fallback SVG and no marquee motion.
- `/software/` redirect is present in `out/_redirects`.

## 6. Docs and handoff

- Update `README.md`, `DEPLOYMENT.md` (build `npm run build`, output `out`), and the AGENTS.md visual direction section to describe this system.
- Owner actions: change Cloudflare output directory to `out`; review every catalogue entry and confirm links/statuses marked "to confirm".
