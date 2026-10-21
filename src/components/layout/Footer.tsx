import Link from "next/link";
import { MavernMark } from "@/components/brand/MavernMark";
import { mediums } from "@/content/mediums";
import { contactEmail, creator, nav } from "@/content/site";

/** Every page ends here: the mark, the catalogue's doors, the address, and the music credit. */
export function Footer() {
  return (
    <footer className="bg-night px-[var(--gutter)] pb-10 pt-20 text-marble">
      <div className="mx-auto grid max-w-[110rem] gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <MavernMark className="w-14 text-gold" label="Mavern" />
          <p className="mt-6 max-w-sm text-marble/80">
            Mavern is the independent creative practice of {creator.name}: software, websites, apps and experiments.
          </p>
          <a href={`mailto:${contactEmail}`} className="mt-6 inline-block font-display text-[1.25rem] underline decoration-orchid decoration-2 underline-offset-[6px] hover:text-gold">
            {contactEmail}
          </a>
        </div>
        <nav aria-label="Work by medium">
          <h2 className="text-[length:var(--step-small)] font-semibold text-marble/60">Work</h2>
          <ul className="mt-4 space-y-2">
            {mediums.map((m) => (
              <li key={m.slug}>
                <Link href={`/work/${m.slug}/`} className="hover:text-gold">
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Site">
          <h2 className="text-[length:var(--step-small)] font-semibold text-marble/60">Mavern</h2>
          <ul className="mt-4 space-y-2">
            {nav.map((item) => (
              <li key={item.id}>
                <Link href={item.href} className="hover:text-gold">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="mx-auto mt-16 flex max-w-[110rem] flex-col gap-2 border-t border-marble/10 pt-6 text-[0.8125rem] text-marble/60 md:flex-row md:justify-between">
        <p>© {new Date().getFullYear()} Mavern. Made by {creator.name}.</p>
        <p>
          Music: Lost Sky – Dreams [NCS Release], provided by NoCopyrightSounds.{" "}
          <a href="https://ncs.io/Dreams" className="underline underline-offset-2 hover:text-marble">ncs.io/Dreams</a>
        </p>
      </div>
    </footer>
  );
}
