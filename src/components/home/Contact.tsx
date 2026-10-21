import { MavernMark } from "@/components/brand/MavernMark";
import { Marquee } from "@/components/kinetic/Marquee";
import { RiseText } from "@/components/kinetic/RiseText";
import { RollLink } from "@/components/kinetic/RollLink";
import { mediums } from "@/content/mediums";
import { contactEmail } from "@/content/site";

/** The last screen: the whole sunset, one question and the address to answer it. */
export function Contact() {
  return (
    <section id="contact" data-tone="light" data-stops="0" data-holds="0" aria-labelledby="contact-title" className="relative overflow-hidden bg-sunset pb-[clamp(5rem,12vw,10rem)] text-night">
      <div className="border-b-2 border-night/80 py-5">
        <Marquee speed={60}>
          {mediums.map((m) => (
            <span key={m.slug} className="flex items-center gap-[clamp(1.5rem,4vw,3.5rem)] pr-[clamp(1.5rem,4vw,3.5rem)] font-display text-[clamp(2rem,6vw,5rem)] leading-none tracking-[-0.03em]">
              {m.label}
              <MavernMark className="w-[0.9em]" />
            </span>
          ))}
        </Marquee>
      </div>
      <div className="mx-auto max-w-[110rem] px-[var(--gutter)] pt-[clamp(5rem,12vw,10rem)]">
        <h2 id="contact-title" className="font-display text-[clamp(3rem,11vw,12rem)] leading-[0.85] tracking-[-0.05em]">
          <RiseText text="Have something in mind?" />
        </h2>
        <p className="mt-8 max-w-xl text-[length:var(--step-statement)] leading-snug">
          Tell me what you want to make. I answer every message myself, usually within a couple of days.
        </p>
        <div className="mt-12 flex flex-col items-start gap-8">
          <RollLink href={`mailto:${contactEmail}`} className="font-display text-[clamp(1.6rem,6.2vw,5.5rem)] leading-[1.05] tracking-[-0.03em] underline decoration-[0.06em] underline-offset-[0.12em]">
            {contactEmail}
          </RollLink>
          <a href={`mailto:${contactEmail}?subject=A%20project%20for%20Mavern`} className="osd osd-solid osd-on-light text-[1.125rem] font-semibold">
            Email Mavern
          </a>
        </div>
      </div>
    </section>
  );
}
