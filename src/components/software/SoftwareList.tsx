import { sectionPad } from "@/components/ui/Section";
import { statusLabels } from "@/content/software";
import type { Software } from "@/content/types";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/Button";

/** Plain catalogue rows: what each release is, where it stands and a link to its own site. */
export function SoftwareList({ items, headingLevel = 3 }: { items: Software[]; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <ul className="divide-y-2 divide-line">
      {items.map((item) => (
        <li
          key={item.id}
          className={cn("grid gap-4 py-8 md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_auto] md:items-center md:gap-10", sectionPad)}
        >
          <div>
            <Heading className="font-display text-3xl">{item.name}</Heading>
            <p className="mt-1 text-sm text-ink-soft">{item.kind}</p>
          </div>
          <div>
            <p className="max-w-2xl leading-7">{item.summary}</p>
            <p className="mt-2 text-sm text-ink-soft">
              {statusLabels[item.status]}, version {item.version} · {item.platforms}
            </p>
          </div>
          <ButtonLink href={item.href} className="justify-self-start">
            {item.linkLabel}
          </ButtonLink>
        </li>
      ))}
    </ul>
  );
}
