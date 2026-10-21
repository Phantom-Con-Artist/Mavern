# Direction: Marble to neon

Revises the art direction in `2026-10-21-nextjs-redesign-design.md`. The owner asked for a synthwave and vaporwave retro site that tells a story with the four statue artworks through 3D scroll, uses their colour gradients and kinetic type, works on phone and desktop, carries the Mavern logo, plays Lost Sky's "Dreams" with a sound toggle, uses one text match cut video from textmatchcut.app, and reads as a professional studio a client can hire. The flat sun-yellow neo-brutalist look is retired.

## The idea

On this site, **the artworks' own sunset (violet sky, gold light, red sea) and their classical figures** become **a gallery you walk through at dusk**. Each figure stands for one of Mavern's mediums, and the light changes as you pass from one to the next.

Story, in scroll order:

1. **The spark (Creation).** Two marble hands nearly touch around a glowing orb. The headline says who and what. Scrolling pushes the camera into the orb. Its light fills the screen, and inside it the MAVERN text match cut plays: the name held still while the world cuts around it.
2. **The gallery (3D, pinned).** Out of the orb's light, a neon-grid floor runs to a slit sun on the horizon. Three marble arches stand along it. The camera glides past each in turn, and the sky shifts to that figure's palette.
   - **Athena, Software (gold dusk).** Craft and wisdom: tools that hold up to daily work.
   - **Aphrodite, Websites (orchid).** The face people meet first. The word WEBSITES is set inside her eye bar.
   - **Alexander, Apps (ember).** Made to go where people go.
3. **Experiments (night).** The live diorama and Punkkyber city loop, an actual experiment of mine, lit as the night after the sunset.
4. **Selected work (marble).** The calm, readable catalogue: featured projects in large type, with status and what each one is.
5. **About and how I work (violet).** Plain facts about the practice and what a client gets.
6. **Contact (full sunset gradient).** A huge, kinetic email address and one button.

## Palette

Taken from the artwork. Each section owns one ground and one ink, and the contrast of each pair is tested in `src/lib/color.ts`.

| Token | Value | Role |
|---|---|---|
| night | oklch(17% 0.07 300) | Main ground, ink on light grounds |
| violet | oklch(47% 0.24 300) | Sky, the About ground |
| orchid | oklch(72% 0.2 340) | Websites ground and glow |
| gold | oklch(86% 0.16 85) | Software ground, highlights |
| ember | oklch(60% 0.22 30) | Apps ground |
| marble | oklch(96% 0.015 85) | Text on dark grounds; the Work ground |

The sunset gradient runs violet → orchid → ember → gold. It is used for the wordmark, the contact ground and the horizon, and nowhere as decoration.

## Type

Dela Gothic One for display, set huge and tight with the sunset gradient clipped into the letters on dark grounds. DM Sans for text. Kinetic type: letters rise in a stagger, words flip, the contact address rolls on hover, and the scroll speed skews the marquee.

## Motion rules

Motion is driven by scroll in the pinned scenes and runs once elsewhere. Only transform, opacity and the WebGL canvas animate. With reduced motion, nothing is pinned, the images sit still beside their text, and the video shows its poster frame.

## Sound

"Dreams" by Lost Sky (NCS) starts on load when the browser allows it, and otherwise on the visitor's first tap, click or key press. A sound toggle in the header turns it off and remembers that choice. The music pauses when the tab is hidden. Credit: "Music: Lost Sky – Dreams [NCS Release], provided by NoCopyrightSounds, ncs.io/Dreams".

## Pages

- `/`: the story above.
- `/work/`: every work, grouped by medium. Each medium band uses its figure and palette.
- `/work/<medium>/`: the figure, the medium's palette, and its projects.
- `/work/<medium>/<project>/`: a full project page with name, kind, status, version, platforms, stack, the story, links and a picture. The picture is a screenshot of the live site where one exists, otherwise a typographic title card in the medium's palette. Each page ends with a link to the next project.
- `not-found`, `sitemap.xml`, `robots.txt`, JSON-LD for the person and for each work.
