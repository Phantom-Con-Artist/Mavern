# Deploying Mavern

The site is a static build. These steps are for Cloudflare Pages connected to the GitHub repository
`Phantom-Con-Artist/Mavern`.

## Cloudflare Pages settings

In the Cloudflare dashboard: Workers & Pages, Create, Pages, Connect to Git, then pick the repository and use:

| Setting | Value |
|---|---|
| Production branch | `main` |
| Framework preset | None (or Vite) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | (leave empty) |
| Node.js version | from `.node-version` (22) |

No environment variables are needed. Every push to `main` deploys; other branches get preview URLs.

## What the build produces

`npm run build` type-checks, then writes two pages and their assets to `dist/`:

- `dist/index.html`, served at `/`
- `dist/software/index.html`, served at `/software/`
- `dist/404.html`, served for any address that does not exist
- `dist/assets/`, hashed JavaScript, CSS and fonts

Everything in `public/` is copied into `dist/` as is, including:

- `public/_headers`: security headers and caching for Cloudflare Pages. The Content Security Policy only
  allows the site's own files. If you add a third-party script, font or image host, add it there first.
- `public/theme-init.js`: sets the saved theme before the page paints. It is a file, not an inline script,
  so the policy does not need `unsafe-inline` for scripts.

To add a page, add its HTML entry to `build.rollupOptions.input` in `vite.config.ts`.

## Custom domain

In the Pages project: Custom domains, Set up a domain, then `mavern.in` (and `www.mavern.in` if wanted).
Volpi is planned at `volpi.mavern.in`; that subdomain belongs to the Volpi site's own Pages project, not this one.

## Check before deploying

```sh
npm ci
npm run build
npm run preview   # serves dist/ locally
```
