import Link from "next/link";
import { ToneProbe } from "./ToneProbe";
import { MavernMark } from "@/components/brand/MavernMark";
import { TapeDeck } from "@/components/sound/TapeDeck";
import { contactEmail, nav } from "@/content/site";

/**
 * The frame around every page, read like a monitor's on-screen display: the mark top left, the
 * three places to go, a way to start a project, and the music's tape counter bottom right. No bar,
 * no box: the text sits on the picture and inverts against whatever is under it.
 */
export function Header() {
  return (
    <>
      <a href="#main" className="osd fixed left-4 top-3 z-[60] -translate-y-24 bg-gold text-night focus:translate-y-0">
        Skip to content
      </a>
      <ToneProbe />
      <header className="hud-top pointer-events-none fixed inset-x-0 top-0 z-50 text-marble">
        <div className="mx-auto grid max-w-[120rem] grid-cols-[auto_1fr_auto] items-center gap-4 px-[var(--gutter)] pt-4">
          <Link href="/" aria-label="Mavern, home" className="pointer-events-auto flex items-center gap-3">
            <MavernMark className="w-9" />
            <span className="font-display text-[1.15rem] leading-none tracking-[-0.02em] max-sm:sr-only">Mavern</span>
          </Link>
          <nav aria-label="Main" className="pointer-events-auto justify-self-end md:justify-self-center">
            <ul className="flex items-center gap-1 sm:gap-3">
              {nav.map((item) => (
                <li key={item.id}>
                  <Link href={item.href} className="osd text-[0.9375rem] font-semibold">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <a href={`mailto:${contactEmail}?subject=A%20project%20for%20Mavern`} className="osd pointer-events-auto text-[0.9375rem] font-semibold max-md:hidden">
            Start a project
          </a>
        </div>
      </header>
      <div className="hud-bottom fixed bottom-3 right-[var(--gutter)] z-50 text-marble">
        <TapeDeck />
      </div>
    </>
  );
}
