import Link from "next/link";
import { notFound } from "next/navigation";
import { RiseText } from "@/components/kinetic/RiseText";
import { Spatial } from "@/components/kinetic/Spatial";
import { JsonLd } from "@/components/seo/JsonLd";
import { WorkPicture } from "@/components/work/WorkPicture";
import { getMedium } from "@/content/mediums";
import { getWork, publicLinks, statusLabels, workPath, works } from "@/content/works";
import type { Medium } from "@/content/types";
import { groundClass } from "@/lib/color";
import { breadcrumbLd, pageMetadata, workLd } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const dynamicParams = false;

type Params = { params: Promise<{ medium: string; project: string }> };

export function generateStaticParams() {
  return works.map((w) => ({ medium: w.medium, project: w.slug }));
}

async function find(params: Params["params"]) {
  const { medium, project } = await params;
  return getWork(medium as Medium, project);
}

export async function generateMetadata({ params }: Params) {
  const w = await find(params);
  if (!w) return {};
  const m = getMedium(w.medium)!;
  return pageMetadata({ title: w.name, description: w.summary, path: workPath(w), image: w.screenshot ? `/media/og-screen-${w.slug}.jpg` : `/media/og-${m.figure}.jpg` });
}

/** A project's own page: what it is, where it stands, its story, where to find it, and the next one. */
export default async function ProjectPage({ params }: Params) {
  const w = await find(params);
  if (!w) notFound();
  const m = getMedium(w.medium)!;
  const dark = m.ground === "violet";
  const links = publicLinks(w);
  const next = works[(works.indexOf(w) + 1) % works.length];
  const facts = [
    ["Status", statusLabels[w.status]],
    ["Version", w.version],
    ["Runs on", w.platforms],
    ["Built with", w.stack.length ? w.stack.join(", ") : undefined],
  ].filter((f): f is [string, string] => !!f[1]);

  return (
    <main id="main" className="overflow-x-clip">
      <JsonLd
        data={[
          workLd(w),
          breadcrumbLd([
            { name: "Work", path: "/work/" },
            { name: m.label, path: `/work/${m.slug}/` },
            { name: w.name, path: workPath(w) },
          ]),
        ]}
      />
      <section data-tone={dark ? "dark" : "light"} className={cn(groundClass(m.ground), "px-[var(--gutter)] pb-[clamp(10rem,22vw,18rem)] pt-[clamp(7rem,14vw,11rem)]")}>
        <div className="mx-auto max-w-[120rem]">
          <nav aria-label="Breadcrumb" className="text-[0.9375rem] font-semibold">
            <Link href="/work/" className="underline underline-offset-4">
              Work
            </Link>
            <span aria-hidden="true"> / </span>
            <Link href={`/work/${m.slug}/`} className="underline underline-offset-4">
              {m.label}
            </Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">{w.name}</span>
          </nav>
          <h1 className="mt-6 font-display text-[clamp(3.25rem,12vw,12rem)] leading-[0.82] tracking-[-0.05em] [overflow-wrap:anywhere]">
            <RiseText text={w.name} />
          </h1>
          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-end">
            <div>
              <p className="font-semibold">{w.kind}</p>
              <p className="mt-3 max-w-2xl text-[length:var(--step-statement)] leading-[1.3]">{w.summary}</p>
              {links.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-2">
                  {links.map((l, i) => (
                    <a key={l.href} href={l.href} className={cn("osd font-semibold", i === 0 && "osd-solid", !dark && "osd-on-light")}>
                      {l.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
            <dl className={cn("grid grid-cols-2 border-t-4", dark ? "border-marble" : "border-night")}>
              {facts.map(([k, v]) => (
                <div key={k} className={cn("border-b py-3 pr-4", dark ? "border-marble/25" : "border-night/25")}>
                  <dt className="text-[0.875rem] font-semibold opacity-75">{k}</dt>
                  <dd className="mt-1 font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <div className="bg-night px-[var(--gutter)] text-marble">
        <div className="mx-auto -mt-[clamp(7rem,18vw,14rem)] max-w-[100rem] [perspective:1800px]">
          <div className="origin-bottom [transform:rotateX(6deg)]">
            <div className="bg-night p-2 shadow-[0_3rem_6rem_-2rem_var(--night)]">
              <WorkPicture work={w} sizes="(min-width: 1600px) 1600px, 96vw" priority />
            </div>
          </div>
        </div>

        <Spatial>
          <article className="mx-auto max-w-[120rem] py-[clamp(5rem,10vw,8rem)]">
            <h2 className="font-display text-[clamp(2rem,4vw,3.25rem)] tracking-[-0.03em] text-gold">About {w.name}</h2>
            <div className="mt-8 max-w-[44rem] space-y-6 text-[length:var(--step-text)] leading-[1.7]">
              {w.body.map((p, i) => (
                <p key={i} className={i === 0 ? "text-[length:var(--step-statement)] leading-[1.4]" : undefined}>
                  {p}
                </p>
              ))}
            </div>
          </article>
        </Spatial>

        <div className="mx-auto flex max-w-[120rem] flex-wrap items-end justify-between gap-8 border-t border-marble/15 py-[clamp(4rem,9vw,8rem)]">
          <div>
            <p className="font-semibold text-marble/70">Next project</p>
            <Link href={workPath(next)} className="chrome-glow mt-2 inline-block font-display text-[clamp(2.75rem,9vw,8rem)] leading-[0.88] tracking-[-0.045em]">
              <span className="text-chrome">{next.name}</span>
            </Link>
          </div>
          <a href="mailto:contact@mavern.in?subject=A%20project%20for%20Mavern" className="osd osd-solid font-semibold">
            Start a project like this
          </a>
        </div>
      </div>
    </main>
  );
}
