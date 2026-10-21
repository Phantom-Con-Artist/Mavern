import Link from "next/link";
import { notFound } from "next/navigation";
import { ArchFigure } from "@/components/home/Gallery";
import { RiseText } from "@/components/kinetic/RiseText";
import { Spatial } from "@/components/kinetic/Spatial";
import { JsonLd } from "@/components/seo/JsonLd";
import { WorkPicture } from "@/components/work/WorkPicture";
import { getMedium, mediums } from "@/content/mediums";
import { statusLabels, workPath, worksByMedium } from "@/content/works";
import { groundClass } from "@/lib/color";
import { breadcrumbLd, pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const dynamicParams = false;

export function generateStaticParams() {
  return mediums.map((m) => ({ medium: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ medium: string }> }) {
  const m = getMedium((await params).medium);
  if (!m) return {};
  return pageMetadata({ title: m.label, description: m.description, path: `/work/${m.slug}/`, image: `/media/og-${m.figure}.jpg` });
}

/** One medium: its figure and colours, then each of its works with a picture and the facts. */
export default async function MediumPage({ params }: { params: Promise<{ medium: string }> }) {
  const m = getMedium((await params).medium);
  if (!m) notFound();
  const list = worksByMedium(m.slug);
  const dark = m.ground === "violet";
  const next = mediums[(mediums.indexOf(m) + 1) % mediums.length];

  return (
    <main id="main" className="overflow-x-clip">
      <JsonLd data={breadcrumbLd([{ name: "Work", path: "/work/" }, { name: m.label, path: `/work/${m.slug}/` }])} />
      <section data-tone={dark ? "dark" : "light"} className={cn(groundClass(m.ground), "px-[var(--gutter)] pb-[clamp(5rem,10vw,8rem)] pt-[clamp(7rem,14vw,11rem)]")}>
        <div className="mx-auto grid max-w-[120rem] items-end gap-12 md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
          <div>
            <nav aria-label="Breadcrumb" className="text-[0.9375rem] font-semibold">
              <Link href="/work/" className="underline underline-offset-4">
                Work
              </Link>
              <span aria-hidden="true"> / </span>
              <span aria-current="page">{m.label}</span>
            </nav>
            <h1 className="mt-6 font-display text-[clamp(3.5rem,13vw,13rem)] leading-[0.8] tracking-[-0.05em]">
              <RiseText text={m.label} />
            </h1>
            <p className="mt-8 max-w-xl text-[length:var(--step-statement)] leading-[1.3]">{m.description}</p>
            <p className="mt-4 font-semibold">{list.length} {list.length === 1 ? "project" : "projects"}</p>
          </div>
          <div className="mx-auto w-[min(64vw,24rem)] md:w-full">
            <ArchFigure figure={m.figure} sizes="(min-width: 768px) 30vw, 64vw" />
          </div>
        </div>
      </section>

      <div className="bg-night px-[var(--gutter)] text-marble">
        {list.map((w, i) => (
          <Spatial key={w.slug}>
            <article className={cn("mx-auto grid max-w-[120rem] items-center gap-x-[5vw] gap-y-8 border-b border-marble/15 py-[clamp(4rem,8vw,7rem)] md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]", i % 2 && "md:[&>*:first-child]:order-2")}>
              <Link href={workPath(w)} className="group block [perspective:1400px]" tabIndex={-1} aria-hidden="true">
                <div className={cn("transition-transform duration-700 ease-[var(--ease-out)] group-hover:[transform:rotateY(0deg)]", i % 2 ? "[transform:rotateY(10deg)]" : "[transform:rotateY(-10deg)]")}>
                  <div className="bg-marble/10 p-1.5">
                    <WorkPicture work={w} sizes="(min-width: 768px) 52vw, 92vw" />
                  </div>
                </div>
              </Link>
              <div>
                <p className="font-semibold text-gold">
                  {statusLabels[w.status]}
                  {w.version ? `, v${w.version}` : ""}
                </p>
                <h2 className="mt-3 font-display text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.9] tracking-[-0.04em]">
                  <Link href={workPath(w)} className="hover:text-gold">
                    {w.name}
                  </Link>
                </h2>
                <p className="mt-3 font-semibold text-marble/80">{w.kind}</p>
                <p className="mt-5 max-w-lg text-[length:var(--step-text)] leading-relaxed">{w.summary}</p>
                <Link href={workPath(w)} className="osd osd-solid mt-7 font-semibold">
                  View the details<span className="sr-only"> of {w.name}</span>
                </Link>
              </div>
            </article>
          </Spatial>
        ))}
        <div className="mx-auto max-w-[120rem] py-[clamp(5rem,10vw,9rem)]">
          <p className="font-semibold text-marble/70">Next medium</p>
          <Link href={`/work/${next.slug}/`} className="chrome-glow mt-2 inline-block font-display text-[clamp(3rem,10vw,9rem)] leading-[0.85] tracking-[-0.045em]">
            <span className="text-chrome">{next.label}</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
