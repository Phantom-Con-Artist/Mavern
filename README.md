# Mavern

React 19, Vite, TypeScript, Tailwind CSS 4, and shadcn/ui-ready starter site, with Three.js, React Three Fiber, Drei, Motion, Lucide icons, local fonts, and Remotion.

## Start the site

```sh
npm install
npm run dev
```

## Structure

Two pages, each an HTML entry listed in `vite.config.ts`:

- `/` (`index.html` → `src/pages/HomePage.tsx`): hero, software, about and contact. Sections are in `src/sections/`.
- `/software/` (`software/index.html` → `src/pages/SoftwarePage.tsx`): every release.

Content:

- `src/content/software.ts` — the releases. Each one keeps its own site and branding; Mavern lists it plainly and links out (Volpi → `volpi.mavern.in`). Add a release by adding an entry here.
- `src/content/site.ts` — contact address (receives mail only; the site sends nothing), creator credit and profile links. GitHub is a placeholder until its address is ready.

Components:

- `src/components/art/` — the noir backdrop (blind shadows, grain, vignette) and the hero scene (drifting blinds and rain).
- `src/components/brand/MavernMark.tsx` — the current mark (`public/brand/mavern-mark.png`, a trimmed copy of `assets/mavern-logo.png`), masked so it takes the theme's ink colour.
- `src/styles/components.css` — cut panels and buttons, tags, the speech bubble, the wordmark caret and the noir art.

## Themes

Paper, Ink and Warm are colour-token sets in `src/styles/themes.css`, switched with `data-theme` on `<html>`. Components use the tokens (`bg-paper`, `text-ink`, `text-accent`), never raw hex values.

## Add shadcn/ui components

The project is configured in `components.json`. For example:

```sh
npx shadcn@latest add button card
```

Use `cn()` from `src/lib/utils.ts` to combine Tailwind classes.

## Create a video

```sh
npm run video:studio
npm run video:render
```

The sample `MavernIntro` composition is in `src/remotion/root.tsx`; renders go to the ignored `out/` directory.

## Deploy

Cloudflare Pages builds `main` with `npm run build` into `dist/`. Settings and headers are in [DEPLOYMENT.md](DEPLOYMENT.md).
