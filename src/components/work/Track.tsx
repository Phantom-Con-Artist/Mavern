import Link from "next/link";
import { statusLabels, workPath } from "@/content/works";
import type { Work } from "@/content/types";
import { cn } from "@/lib/utils";

/**
 * One work as a line on a cassette's J-card: its side and number, its name with a dotted leader,
 * its status, and what it is. `dark` is for dark grounds, where the highlight turns marble.
 */
export function Track({ work, code, dark = false, onFocus, active }: { work: Work; code: string; dark?: boolean; onFocus?: () => void; active?: boolean }) {
  return (
    <li>
      <Link
        href={workPath(work)}
        onMouseEnter={onFocus}
        onFocus={onFocus}
        aria-current={active ? "true" : undefined}
        className={cn(
          "group grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-baseline gap-x-3 py-3 transition-colors duration-150 md:px-3",
          dark ? "hover:bg-marble hover:text-night aria-[current]:bg-marble aria-[current]:text-night" : "hover:bg-night hover:text-marble aria-[current]:bg-night aria-[current]:text-marble",
        )}
      >
        <span className={cn("font-display text-[0.95rem]", dark ? "text-gold group-hover:text-violet" : "text-violet group-hover:text-gold group-aria-[current]:text-gold")}>{code}</span>
        <span className="flex min-w-0 items-baseline gap-3">
          <span className="truncate font-display text-[clamp(1.35rem,2.6vw,2.25rem)] leading-[1.05] tracking-[-0.025em]">{work.name}</span>
          <span aria-hidden="true" className="mb-[0.3em] hidden flex-1 border-b-2 border-dotted border-current opacity-30 sm:block" />
        </span>
        <span className="text-[0.875rem] font-semibold">{statusLabels[work.status]}</span>
        <span className="col-start-2 col-end-4 mt-1 text-[0.9375rem] opacity-80">
          {work.kind}
          {work.version ? `, v${work.version}` : ""}
        </span>
      </Link>
    </li>
  );
}
