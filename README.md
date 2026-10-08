# Mavern

React 19, Vite, TypeScript, Tailwind CSS 4, and shadcn/ui-ready starter site, with Three.js, React Three Fiber, Drei, Motion, Lucide icons, local fonts, and Remotion.

## Start the site

```sh
npm install
npm run dev
```

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
