# Mavern Next.js Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Vite site with a static Next.js 16 site: new bright classical/vaporwave identity, a WebGL MAVERN/medium block sculpture, kinetic type, a catalogue of all works, and full SEO.

**Architecture:** App Router with `output: "export"` to `out/`, hosted on Cloudflare Pages. Content lives in typed files under `src/content/`; routes are generated from it with `generateStaticParams`. Pure logic (sculpture placement, content rules, colour contrast, SEO builders) is unit-tested; pages are checked end to end against the static build.

**Tech Stack:** Next.js 16, React 19, TypeScript 5.9, Tailwind CSS 4 (`@tailwindcss/postcss`), Three.js + @react-three/fiber, Motion, sharp, Vitest, Playwright + @axe-core/playwright.

**Spec:** `docs/superpowers/specs/2026-10-21-nextjs-redesign-design.md`

## Global Constraints

- `next.config.ts`: `output: "export"`, `trailingSlash: true`, `images: { unoptimized: true }`. Build output `out/`.
- Site URL `https://mavern.in`. Title template `%s · Mavern`.
- Colour tokens exactly: sun `oklch(91% 0.17 100)`, ultraviolet `oklch(42% 0.24 295)`, vermilion `oklch(64% 0.22 32)`, marble `oklch(96% 0.015 85)`, ink `oklch(20% 0.05 295)`. Components use tokens, never raw colours.
- Fonts: Dela Gothic One (display), DM Sans variable (body) via `next/font/google`. No other families.
- No hand-drawn assets, no whale avatar, no theme switcher, no Drei, no GSAP, no Lenis.
- Animate only `transform`, `opacity`, `font-variation-settings`. Every effect has a `prefers-reduced-motion` static path.
- Copy: plain words, sentence-case headings, no stock marketing phrases (AGENTS.md). No invented facts; unconfirmed links never render.
- Mediums and sculpture words: software → SOFTWARE, websites → WEBSITES, apps → APPS, experiments → EXPERIMENTS.
- Files stay focused, under ~300 lines. Mobile-first CSS.
- Node 22+ (`.node-version` stays `22`).

## Review Focus

- Unknown `/work/<medium>/` or `/work/<medium>/<project>/` paths: must hit the styled 404, not a build error. Pinned in Task 8 (`dynamicParams = false`) and Task 11.
- A work whose links are all unconfirmed: the project page must still render with no empty "Links" block. Pinned in Task 8.
- Long names at 375 px (e.g. "Social Simulation Engine", "Online Tachistoscope" in Dela Gothic at display size): no horizontal scroll. Pinned in Task 11.
- WebGL unavailable or context lost mid-loop: the fallback SVG must remain/return, not a blank box. Pinned in Task 5.
- Tab hidden mid-turn then shown: the sculpture resumes from its current phase without a jump through a half-tween. Pinned in Task 5 (`advance` clamps `dt`).

---

### Task 1: Replace Vite with a Next.js shell

**Files:**
- Create: `next.config.ts`, `postcss.config.mjs`, `app/layout.tsx`, `app/page.tsx` (placeholder `<h1>Mavern</h1>`), `src/styles/tokens.css`, `src/styles/globals.css`, `vitest.config.ts`, `tests/unit/smoke.test.ts`
- Modify: `package.json`, `tsconfig.json`, `.gitignore` (add `.next`, `out`, `renders`; keep `dist` ignored), `src/remotion/*` render script output to `renders/`
- Delete: `vite.config.ts`, `index.html`, `software/`, `src/entries/`, `src/lib/mount.tsx`, `tsconfig.app.json`, `tsconfig.node.json`, `public/theme-init.js`, `src/hooks/useTheme.ts`, `src/components/layout/ThemeSwitcher.tsx`, `src/components/art/`, `src/components/brand/TypingWord.tsx`, `src/components/ui/{Panel,Section,Button}.tsx`, `src/assets/button-*.webp`, `public/brand/whale.webp`, `src/sections/`, `src/pages/`, `src/styles/themes.css`, `src/styles/components.css`, `src/index.css`, `components.json`, `dist/`, `src/content/software.ts`

**Interfaces:**
- Produces: `npm run dev | build | test | test:e2e | typecheck`; CSS custom properties `--sun --ultraviolet --vermilion --marble --ink`, `--ease-out: cubic-bezier(0.16,1,0.3,1)`, `--ease-in-out: cubic-bezier(0.76,0,0.24,1)`; font CSS variables `--font-display`, `--font-body`; Tailwind theme colours `sun ultraviolet vermilion marble ink` and fonts `display body`; `@/*` → `src/*`.

- [ ] **Step 1:** Update dependencies. Remove `vite @vitejs/plugin-react @tailwindcss/vite @react-three/drei @fontsource/dela-gothic-one @fontsource/dm-sans @fontsource/inter @radix-ui/react-slot class-variance-authority`. Add `next@^16 @tailwindcss/postcss@^4.1`; dev `sharp vitest @playwright/test @axe-core/playwright serve`. Scripts: `"dev": "next dev"`, `"build": "node scripts/build-images.mjs && next build && node scripts/csp-hashes.mjs"` (the two scripts are stubs printing `skip` until Tasks 7 and 10), `"typecheck": "tsc --noEmit"`, `"test": "vitest run"`, `"test:e2e": "playwright test"`, remotion render target `renders/mavern-intro.mp4`.
- [ ] **Step 2:** Write `tests/unit/smoke.test.ts` asserting `1 + 1 === 2`; run `npm test`. Expected: 1 passed (proves Vitest wiring with `@` alias).
- [ ] **Step 3:** Write the config files and `app/layout.tsx` (`<html lang="en">`, fonts' variables on `<html>`, `metadataBase: new URL("https://mavern.in")`, title `{ default: "Mavern", template: "%s · Mavern" }`). `tokens.css` holds the five colours, easings, and a fluid type scale (`--step-hero: clamp(3rem, 10vw, 12rem)`, display tracking `-0.03em`, leading `0.92`; body `clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)`, line-height `1.5`). `globals.css` imports Tailwind and tokens, maps them with `@theme`, sets `body` to marble/ink.
- [ ] **Step 4:** Run `npm run typecheck && npm run build`. Expected: exits 0, `out/index.html` exists and contains `<h1>Mavern</h1>`.
- [ ] **Step 5:** Commit `chore: replace Vite with Next.js static export`.

### Task 2: Colour pairings with contrast guarantees

**Files:**
- Create: `src/lib/color.ts`, `tests/unit/color.test.ts`

**Interfaces:**
- Produces: `type Ground = "sun" | "ultraviolet" | "vermilion" | "marble" | "ink"`; `const grounds: Record<Ground, { value: string; ink: Ground }>` (pairs from the spec table); `contrastRatio(a: string, b: string): number` for `oklch(...)` strings; `groundClass(g: Ground): string` returning Tailwind classes `bg-<g> text-<ink>`.

- [ ] **Step 1:** Test `every ground's ink pairing is at least 4.5:1` iterating `grounds`; test `contrastRatio("oklch(96% 0.015 85)","oklch(64% 0.22 32)") < 4.5` (marble on vermilion is disallowed for body). Expected values check `tokens.css` and `grounds` agree: test reads `src/styles/tokens.css` and asserts each `--<name>: <value>` matches `grounds[name].value`.
- [ ] **Step 2:** Run `npx vitest run tests/unit/color.test.ts`; Expected: FAIL, module missing.
- [ ] **Step 3:** Implement: oklch → OKLab → linear sRGB (clamp to [0,1]) → WCAG relative luminance → ratio. No dependency.
- [ ] **Step 4:** Run; Expected: PASS. If a spec pairing fails 4.5:1, adjust that token's lightness by the smallest step that passes, in both `tokens.css` and `grounds`, and note it in the commit message.
- [ ] **Step 5:** Commit `feat: colour grounds with contrast tests`.

### Task 3: Content model and catalogue

**Files:**
- Create: `src/content/types.ts` (replace), `src/content/mediums.ts`, `src/content/works/<slug>.ts` ×14, `src/content/works/index.ts`, `tests/unit/content.test.ts`
- Modify: `src/content/site.ts` (drop `avatar`, nav becomes Work / About / Contact with hrefs `/work/`, `/#about`, `/#contact`)

**Interfaces:**
- Produces: the `Medium`, `WorkStatus`, `WorkLink`, `Work` types exactly as in spec §2; `type MediumInfo = { slug: Medium; label: string; word: string; description: string }`; `mediums: MediumInfo[]` in order software, websites, apps, experiments; `works: Work[]`; `getWork(medium: Medium, slug: string): Work | undefined`; `worksByMedium(m: Medium): Work[]`; `featuredWorks(): Work[]`; `publicLinks(w: Work): WorkLink[]` (confirmed only); `statusLabels: Record<WorkStatus, string>`; `workPath(w: Work): string` → `/work/<medium>/<slug>/`.

- [ ] **Step 1:** Tests: slugs unique; each `medium` in `mediums`; every `summary.length <= 160`; `publicLinks` drops `confirmed: false`; `getWork("software","volpi")?.version === "0.1.1"`; `featuredWorks().length` between 3 and 6; every medium has ≥1 work; `workPath` format; `mediums.map(m => m.word)` equals `["SOFTWARE","WEBSITES","APPS","EXPERIMENTS"]`.
- [ ] **Step 2:** Run; Expected: FAIL.
- [ ] **Step 3:** Write the 14 entries from the spec's catalogue table, reading each project's README in `~/Development/<folder>` for `kind`, `summary`, `body`, `stack`, `platforms`. `source` names the README. Status and links exactly as the table; "to confirm" status → `in-development`; GitHub links `confirmed: false`; confirmed links: Volpi `https://volpi.mavern.in` and `https://github.com/Phantom-Con-Artist/Volpi-Releases/releases/latest`, animepoodle `https://animepoodle.mavern.in`. Text Tycoon and restronaut: one neutral sentence from their source (Tauri + SvelteKit desktop app; Flutter app using OpenStreetMap), with `// OWNER: rewrite` comment. Featured: Volpi, animepoodle, Chimera, Light Year Saga, Social Simulation Engine.
- [ ] **Step 4:** Run; Expected: PASS.
- [ ] **Step 5:** Commit `feat: work catalogue content`.

### Task 4: Pixel font and sculpture placement

**Files:**
- Create: `src/components/hero/pixelFont.ts`, `src/components/hero/sculpture.ts`, `tests/unit/sculpture.test.ts`

**Interfaces:**
- Produces: `GLYPH_W = 5`, `GLYPH_H = 7`, `GAP = 1`; `bitmap(word: string): boolean[][]` (rows top→bottom, width `n*5 + (n-1)`); `type Cube = { x: number; y: number }`; `type Sculpture = { cubes: Cube[]; depths: number[][]; frontWidth: number; sideWidths: number[] }` where `depths[w][i]` is cube `i`'s z for word `w`; `buildSculpture(front: string, words: string[]): Sculpture`.

- [ ] **Step 1:** Tests: `bitmap` throws on an unknown glyph; every letter in `MAVERN` and all medium words is defined; for each word index `w`, the set `{(x,y)}` of cubes equals lit pixels of `bitmap("MAVERN")` and the set `{(depths[w][i], y)}` equals lit pixels of `bitmap(words[w])`; `cubes.length` is identical for all words (it's one array) and `<= 400`.
- [ ] **Step 2:** Run; Expected: FAIL.
- [ ] **Step 3:** Implement. Placement per row `y`: `F` = lit x of front, `S_w` = lit x of word `w`, `n = max(|F|, max_w |S_w|)`; for `i < n` cube `(F[i % |F|], y)` with `depths[w][i] = S_w[i % |S_w|]`. Rows where `F` is empty but some `S_w` is not cannot occur for these words (all share full-height rows); assert it and throw if violated.
- [ ] **Step 4:** Run; Expected: PASS.
- [ ] **Step 5:** Commit `feat: MAVERN block sculpture placement`.

### Task 5: Hero scene, loop, fallback

**Files:**
- Create: `src/components/hero/loop.ts`, `src/components/hero/HeroFallback.tsx`, `src/components/hero/Sculpture.tsx`, `src/components/hero/Hero.tsx`, `src/components/kinetic/FlipWord.tsx`, `src/hooks/usePageActive.ts`, `tests/unit/loop.test.ts`
- Modify: `app/page.tsx` (render `<Hero />`)

**Interfaces:**
- Consumes: `buildSculpture`, `bitmap` (Task 4); `mediums` (Task 3).
- Produces: `type LoopPhase = "holdFront" | "turnOut" | "holdSide" | "turnBack" | "morph"`; `type LoopState = { phase: LoopPhase; t: number; word: number }`; `PHASE_MS: Record<LoopPhase, number>` = holdFront 1600, turnOut 1100, holdSide 1800, turnBack 1100, morph 900 (≈6.5 s); `advance(s: LoopState, dtMs: number, wordCount: number): LoopState` (pure, clamps `dtMs` to 100); `pose(s: LoopState): { yaw: number; pitch: number; morph: number }` (yaw 0→π/2 eased with power4.inOut, pitch peaks 0.25 rad mid-turn and is 0 at both ends, morph 0→1 only in `morph`); `<Hero />`; `<FlipWord word={string} />`; `usePageActive(ref): boolean` (in view AND document visible).

- [ ] **Step 1:** Loop tests: from `holdFront t=0`, advancing the phase durations steps through phases in order and `word` increments only after `morph`, wrapping at `wordCount`; `advance(s, 5000, 4)` moves at most 100 ms; `pose` yaw is exactly 0 in holdFront/morph and exactly π/2 in holdSide; pitch is 0 at turn ends.
- [ ] **Step 2:** Run; Expected: FAIL. Then implement `loop.ts`; run; Expected: PASS.
- [ ] **Step 3:** `HeroFallback`: inline SVG drawing `bitmap("MAVERN")` as sun squares with an ultraviolet offset, `role="img"`-free and `aria-hidden`. `Sculpture`: R3F `<Canvas orthographic dpr={[1,2]}>`, one `InstancedMesh` of `cubes.length` unit boxes with per-face material colours (front sun, sides vermilion, top ultraviolet — read the CSS tokens via `getComputedStyle` and convert with `THREE.Color` from the computed rgb), z lerped between `depths[word]` and `depths[word+1]` by `pose.morph`, group rotation from `pose`, horizon grid as a `ShaderMaterial` plane (ultraviolet lines on ink, fading to horizon). Advance only when `active && !paused`. On `webglcontextlost` call `onFail()`.
- [ ] **Step 4:** `Hero`: `<section>` with `<h1>` "Mavern: software, websites, apps and experiments by Subhradeep Sarkar" (visually the sentence, with the sculpture as art above it), fallback rendered first, `Sculpture` via `next/dynamic` `{ ssr: false }` mounted after idle only when `matchMedia("(prefers-reduced-motion: reduce)")` is false and WebGL2 is available; on `onFail` revert to fallback. Pause/play `<button aria-pressed>`. Under the canvas: "Now showing:" + `<a href="/work/<slug>/"><FlipWord word={label} /></a>`, word synced via a callback from `Sculpture`. `FlipWord`: per-letter spans flipping (`rotateX`) 30 ms apart, `aria-label` = word on parent, static under reduced motion.
- [ ] **Step 5:** Run `npm run dev`, open `/` in a browser: fallback shows, then the sculpture reads MAVERN flat, turns to SOFTWARE, returns, morphs, turns to WEBSITES; pause stops it; with reduced motion emulated only the SVG shows. Run `npm run build`; Expected: exit 0.
- [ ] **Step 6:** Commit `feat: rotating MAVERN block sculpture hero`.

### Task 6: Kinetic type and scroll motion components

**Files:**
- Create: `src/components/kinetic/{SplitText,VelocityMarquee,TrackingScrub,WeightHover,DropTitle}.tsx`, `src/components/motion/{BarReveal,SectionGround,Parallax,ContactZoom}.tsx`, `src/lib/splitLetters.ts`, `tests/unit/splitLetters.test.ts`

**Interfaces:**
- Produces: `splitLetters(text: string): { char: string; key: string; space: boolean }[]` (grapheme-safe via `Intl.Segmenter`); `<SplitText as="h2" text stagger={0.04}>`; `<BarReveal as="h2" text numeral="II">` (bar `scaleX` 1→0 from right, letters rise `translateY(100%)→0` 40 ms apart, once, `useInView` amount 0.6); `<VelocityMarquee items={string[]} />` (`aria-hidden`, base 40 px/s, adds `useVelocity(scrollY)`, skewX ≤ 8°, direction follows scroll sign); `<TrackingScrub lines={string[]} />` (letter-spacing via `scaleX` on per-letter offsets tied to `useScroll` progress — transform only); `<WeightHover text />` (`(hover: hover)` only, per-letter `wght` 400→900 by pointer distance); `<DropTitle text />` (letters from `translateY(-120%)` with back.out overshoot, 50 ms apart); `<SectionGround from={Ground} to={Ground}>` (crossfades two absolutely positioned ground layers with `opacity` by scroll progress; text colour switches at 50%); `<Parallax amount={0.08}>`; `<ContactZoom src alt>` (image `scale` 2.4→1 across section scroll, origin at the orb ≈ 66% 28%).

- [ ] **Step 1:** Tests for `splitLetters`: `"Mavern"` → 6 items; `"A B"` marks the space; an emoji flag stays one item; keys unique.
- [ ] **Step 2:** Run; FAIL; implement; run; Expected: PASS.
- [ ] **Step 3:** Implement the components with Motion (`motion/react`). Every component reads `useReducedMotion()` and renders final-state static text/image when true. Split components put the full text in `aria-label` on the parent and `aria-hidden` on letter spans.
- [ ] **Step 4:** Add a temporary `app/lab/page.tsx` rendering each component; check in browser at 375 px and 1440 px, with and without reduced motion; then delete `app/lab/`. Run `npm run typecheck`; Expected: exit 0.
- [ ] **Step 5:** Commit `feat: kinetic type and scroll motion components`.

### Task 7: Brand, UI primitives, images, layout

**Files:**
- Create: `scripts/build-images.mjs`, `src/content/media.ts`, `src/components/ui/{ButtonLink,Picture,StatusBar}.tsx`, `src/components/layout/{Header,Footer}.tsx`, `src/styles/components.css`, `tests/unit/media.test.ts`
- Modify: `src/components/brand/MavernMark.tsx` (keep mask technique; colour from `currentColor`), `app/layout.tsx` (skip link, Header, `<main id="main">`, Footer), `.gitignore` (`public/media/`)

**Interfaces:**
- Produces: `media: Record<"athena"|"alexander"|"aphrodite"|"orb", { base: string; width: number; height: number; alt: string }>` (base like `/media/athena`; files `<base>-<w>.avif|webp` for w in 640, 1024, 1600); `<Picture name sizes className priority?>`; `<ButtonLink href variant?: "solid"|"ghost">` (block button: `.btn` face + `::before` slab offset 6px; hover `translate(-2px,-2px)`; active `translate(4px,4px)`; focus-visible 3px outline in the ground colour); `<StatusBar status: WorkStatus>` (bar-shaped label, ink on sun); `Header` (mark + "mavern" wordmark, nav from `site.nav`, `aria-current`), `Footer` (nav, confirmed profiles only, contact email, `© <year> Mavern. Made by Subhradeep Sarkar.`).

- [ ] **Step 1:** Test `media.test.ts`: every entry has non-empty alt describing the image (≥ 30 chars) and dimensions matching the source PNG ratio within 1% (read with `sharp(...).metadata()` from `assets/`).
- [ ] **Step 2:** Run; FAIL; write `media.ts` and `build-images.mjs` (reads `assets/mavern-{athena,alexander-face,aphrodite-eyebar,background}*.png`, writes AVIF q50 and WebP q72 at each width, skips when outputs are newer than source); run tests; Expected: PASS. Run `node scripts/build-images.mjs`; Expected: 24 files in `public/media/`, each under 300 KB.
- [ ] **Step 3:** Implement UI and layout. Header is sticky, ink on marble, collapses nav under the mark below 640 px.
- [ ] **Step 4:** `npm run build`; Expected: exit 0; `out/index.html` contains `Skip to content` and a `<nav aria-label="Main">`.
- [ ] **Step 5:** Commit `feat: block buttons, responsive images, header and footer`.

### Task 8: Pages

**Files:**
- Create: `src/sections/home/{WorkPreview,About,Contact}.tsx`, `src/components/work/{WorkCard,WorkList,MediumChapter}.tsx`, `app/work/page.tsx`, `app/work/[medium]/page.tsx`, `app/work/[medium]/[project]/page.tsx`, `app/not-found.tsx`, `tests/unit/routes.test.ts`, `src/lib/routes.ts`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: Tasks 2–7.
- Produces: `allRoutes(): string[]` (`/`, `/work/`, each medium, each project) used by sitemap and e2e.

- [ ] **Step 1:** Test `routes.test.ts`: `allRoutes()` length = 2 + 4 + 14; all end in `/`; no duplicates.
- [ ] **Step 2:** Run; FAIL; implement `routes.ts`; run; PASS.
- [ ] **Step 3:** Home: `Hero` (ink ground) → `VelocityMarquee` of medium words → `WorkPreview` (section I, sun→ultraviolet `SectionGround`, Alexander in a framed plate with `Parallax`, featured `WorkCard`s, `ButtonLink` "See all work" → `/work/`) → `About` (section II, `id="about"`, marble, Athena plate, `TrackingScrub` ["RESEARCHER","MAKER"], three short paragraphs adapted from the current About: research scholar, why Volpi was built, Mavern publishes software, websites, apps and experiments) → `Contact` (section III, `id="contact"`, `ContactZoom` orb image, ink/marble text: "Questions, ideas or a hello", `ButtonLink` "Write an email" → `mailto:contact@mavern.in`). Section headings use `BarReveal` with numerals.
- [ ] **Step 4:** `/work/`: `<h1>` "All work", one `MediumChapter` per medium (heading, description, `WorkList`), Aphrodite plate inside the experiments chapter. `/work/[medium]/`: `generateStaticParams` from `mediums`, `dynamicParams = false`, `<h1>` medium label, description, list. `/work/[medium]/[project]/`: `generateStaticParams` from `works`, `dynamicParams = false`, `DropTitle` name, `StatusBar`, kind, body paragraphs, a `<dl>` of version/platforms/stack (only present fields), "Links" section rendered only when `publicLinks(w).length > 0`, breadcrumb nav Work › Medium › Name. `WorkCard` names use `WeightHover`. `not-found.tsx`: vermilion ground, `<h1>` "Nothing here", link "See the work".
- [ ] **Step 5:** `npm run build`; Expected: exit 0, `out/work/software/volpi/index.html` exists, `out/work/websites/gingerbinger/index.html` contains no `Links` heading (all links unconfirmed), `out/404.html` exists.
- [ ] **Step 6:** Commit `feat: home, work, medium and project pages`.

### Task 9: SEO

**Files:**
- Create: `src/lib/seo.ts`, `app/sitemap.ts`, `app/robots.ts`, `app/opengraph-image.tsx`, `app/work/[medium]/[project]/opengraph-image.tsx`, `src/components/seo/JsonLd.tsx`, `tests/unit/seo.test.ts`
- Modify: every `page.tsx` (export `metadata` / `generateMetadata`; render `JsonLd`)

**Interfaces:**
- Produces: `SITE_URL = "https://mavern.in"`; `pageMetadata({ title, description, path }): Metadata` (canonical = path, OG/Twitter `summary_large_image`); `personLd(): object`, `organizationLd(): object` (name Mavern, url, logo `/brand/mavern-mark.png`, founder person, email); `workLd(w: Work): object` (`SoftwareApplication` with `applicationCategory`, `operatingSystem` from `platforms` for software/apps; `WebSite` for websites; `CreativeWork` for experiments; `url` = first public link else page URL; `softwareVersion` when present); `breadcrumbLd(items: {name: string; path: string}[]): object`; `<JsonLd data={object | object[]} />` (`<script type="application/ld+json">` with `<` escaped as `<`).

- [ ] **Step 1:** Tests: `pageMetadata` canonical is absolute with trailing slash; `workLd(volpi)["@type"] === "SoftwareApplication"` and `softwareVersion === "0.1.1"`; `workLd(animepoodle)["@type"] === "WebSite"`; `workLd` never includes an unconfirmed URL; `breadcrumbLd` positions start at 1; sitemap default export returns one entry per `allRoutes()` with absolute URLs; `JsonLd` output escapes `</script>`.
- [ ] **Step 2:** Run; FAIL; implement; run; PASS. Set `export const dynamic = "force-static"` on `sitemap.ts`, `robots.ts` and OG image routes (required for export). OG image: 1200×630, ultraviolet ground, sun "MAVERN" in pixel squares from `bitmap`, page title in marble; fonts loaded from the `next/font` files or omitted (pixel squares need none).
- [ ] **Step 3:** Descriptions: home "Mavern is Subhradeep Sarkar's independent creative practice: software, websites, apps and experiments." (≤160); medium pages from `MediumInfo.description`; project pages from `summary`.
- [ ] **Step 4:** `npm run build`; Expected: `out/sitemap.xml` lists 20 URLs; `out/robots.txt` references the sitemap; `out/work/software/volpi/index.html` has `<link rel="canonical" href="https://mavern.in/work/software/volpi/">`.
- [ ] **Step 5:** Commit `feat: metadata, structured data, sitemap and OG images`.

### Task 10: Headers, CSP hashes, redirects

**Files:**
- Create: `scripts/csp-hashes.mjs`, `public/_redirects`, `tests/unit/csp.test.ts`
- Modify: `public/_headers` (cache `/_next/static/*` immutable, `/media/*` 1 year; remove `/assets/*` rule), `package.json` build already chains the script

**Interfaces:**
- Produces: `collectInlineHashes(html: string): string[]` and `routeFromFile(outDir: string, file: string): string` exported from `scripts/csp-hashes.mjs`; writes a `<route>` block with `Content-Security-Policy` per HTML file into `out/_headers`, keeping the global block's other headers. Policy: `default-src 'self'; script-src 'self' <hashes>; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'`.

- [ ] **Step 1:** Tests: hashes only `<script>` without `src` and not `type="application/ld+json"`; hash format `'sha256-<base64>'` matching `crypto` of the exact inner text; `routeFromFile("out","out/work/index.html") === "/work/"`, `"out/404.html"` → `"/404.html"`.
- [ ] **Step 2:** Run; FAIL; implement; run; PASS.
- [ ] **Step 3:** `_redirects`: `/software/ /work/software/ 301` and `/software /work/software/ 301`.
- [ ] **Step 4:** `npm run build && npx serve out -l 4173`; open `/` with a header-applying check: `grep -c "Content-Security-Policy" out/_headers` ≥ 21. (Local `serve` ignores `_headers`; real enforcement is verified on the Pages preview in Task 12.)
- [ ] **Step 5:** Commit `feat: per-page CSP hashes and old-URL redirect`.

### Task 11: End-to-end checks

**Files:**
- Create: `playwright.config.ts` (webServer `npx serve out -l 4173`, projects chromium desktop 1440 and mobile 375), `tests/e2e/routes.spec.ts`, `tests/e2e/hero.spec.ts`, `tests/e2e/a11y.spec.ts`

- [ ] **Step 1:** `routes.spec.ts`: for each of `allRoutes()` — status 200, `<title>` non-empty and ends `· Mavern` (except home "Mavern"), meta description present, canonical equals `https://mavern.in` + route, every `application/ld+json` parses, no console errors, `document.documentElement.scrollWidth <= innerWidth` at 375. `/work/software/nope/` and `/work/nope/` render the not-found `<h1>` "Nothing here". `out/_redirects` contains the software rule.
- [ ] **Step 2:** `hero.spec.ts`: with `reducedMotion: "reduce"` the fallback SVG is visible and no `<canvas>` exists; marquee transform unchanged after 1 s. Without it, a `<canvas>` appears within 5 s and the pause button toggles `aria-pressed`. With WebGL disabled (`--disable-webgl` launch arg project), the fallback stays.
- [ ] **Step 3:** `a11y.spec.ts`: axe on `/`, `/work/`, `/work/software/`, `/work/software/volpi/`, 404 — zero `serious`/`critical`; Tab from page top reaches the skip link first and its target is `#main`.
- [ ] **Step 4:** `npm run build && npm run test:e2e`; Expected: all pass. Fix failures in the owning component, not in the test.
- [ ] **Step 5:** Commit `test: end-to-end route, hero and accessibility checks`.

### Task 12: Docs and preview deploy

**Files:**
- Modify: `README.md`, `DEPLOYMENT.md` (build `npm run build`, output `out`, Node 22; owner must change the dashboard output directory), `AGENTS.md` "Visual direction" section (replace the paper/green palette paragraph with the five grounds, the bar, horizon grid, Roman numerals, statue plates, block buttons; keep the general principles)

- [ ] **Step 1:** Write the docs. README covers: run, structure, adding a work (one file in `src/content/works/` + export in `index.ts`), adding a medium (entry in `mediums.ts`, glyphs in `pixelFont.ts` if new letters), tests.
- [ ] **Step 2:** Run `npm run typecheck && npm test && npm run build && npm run test:e2e`; Expected: all exit 0.
- [ ] **Step 3:** Commit `docs: Next.js structure, deployment and visual direction`.
- [ ] **Step 4:** Report to the owner: the Cloudflare output-directory change, the "to confirm" catalogue items, and that pushing the branch gives a Pages preview URL to verify headers and CSP in a real browser.
