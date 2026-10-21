import Link from "next/link";
import { RiseText } from "@/components/kinetic/RiseText";
import { Spatial } from "@/components/kinetic/Spatial";
import { ArchFigure } from "@/components/home/Gallery";
import { JsonLd } from "@/components/seo/JsonLd";
import { Track } from "@/components/work/Track";
import { mediums } from "@/content/mediums";
import { works, worksByMedium } from "@/content/works";
import { groundClass } from "@/lib/color";
import { breadcrumbLd, pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Work",
  description: "Every Mavern project: desktop software, websites, apps and experiments by Subhradeep Sarkar, with what is live and what is still being made.",
  path: "/work/",
});

const live = works.filter((w) => w.screenshot).length;

/** The whole catalogue: one band per medium, each in its figure's colours. */
export default function WorkPage() {
  return (
    <main id="main" className="overflow-x-clip">
      <JsonLd data={breadcrumbLd([{ name: "Work", path: "/work/" }])} />
      <section className="bg-night px-[var(--gutter)] pb-24 pt-[clamp(8rem,16vw,13rem)] text-marble">
        <div className="mx-auto max-w-[120rem]">
          <h1 className="chrome-glow font-display text-[clamp(5rem,22vw,22rem)] leading-[0.78] tracking-[-0.055em]">
            <RiseText text="Work" letterClassName="text-chrome" />
          </h1>
          <p className="mt-10 max-w-2xl text-[length:var(--step-statement)] leading-[1.3]">
            {works.length} projects across software, websites, apps and experiments. {live} of them are live today; the rest are still being made, and say so.
          </p>
          <nav aria-label="Mediums" className="mt-10 flex flex-wrap gap-2">
            {mediums.map((m) => (
              <a key={m.slug} href={`#${m.slug}`} className="osd font-semibold">
                {m.label}
              </a>
            ))}
          </nav>
        </div>
      </section>

      {mediums.map((m, i) => {
        const dark = m.ground === "violet";
        return (
          <Spatial key={m.slug}>
            <section id={m.slug} data-tone={dark ? "dark" : "light"} aria-labelledby={`${m.slug}-title`} className={cn(groundClass(m.ground), "px-[var(--gutter)] py-[clamp(5rem,10vw,9rem)]")}>
              <div className={cn("mx-auto grid max-w-[120rem] items-start gap-x-[6vw] gap-y-12 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]", i % 2 && "lg:[&>*:first-child]:order-2")}>
                <div className="mx-auto w-[min(70vw,24rem)] lg:sticky lg:top-28 lg:w-full">
                  <ArchFigure figure={m.figure} sizes="(min-width: 1024px) 28vw, 70vw" />
                </div>
                <div>
                  <h2 id={`${m.slug}-title`} className="font-display text-[clamp(3rem,9vw,8.5rem)] leading-[0.85] tracking-[-0.045em]">
                    <Link href={`/work/${m.slug}/`} className="hover:underline hover:decoration-4 hover:underline-offset-8">
                      {m.label}
                    </Link>
                  </h2>
                  <p className="mt-6 max-w-xl text-[length:var(--step-statement)] leading-[1.3]">{m.description}</p>
                  <ol className={cn("mt-10 divide-y border-y-4", dark ? "divide-marble/20 border-marble" : "divide-night/20 border-night")}>
                    {worksByMedium(m.slug).map((w, k) => (
                      <Track key={w.slug} work={w} code={`${m.label[0]}${k + 1}`} dark={dark} />
                    ))}
                  </ol>
                  <Link href={`/work/${m.slug}/`} className={cn("osd osd-solid mt-8 font-semibold", !dark && "osd-on-light")}>
                    Open {m.label.toLowerCase()}
                  </Link>
                </div>
              </div>
            </section>
          </Spatial>
        );
      })}
    </main>
  );
}
