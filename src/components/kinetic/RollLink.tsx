import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A link whose label rolls up to a second copy on hover and focus. */
export function RollLink({ href, children, className }: { href: string; children: string; className?: string }): ReactNode {
  return (
    <a href={href} className={cn("group relative inline-flex overflow-hidden", className)}>
      <span className="block transition-transform duration-500 ease-[var(--ease-out)] group-hover:-translate-y-full group-focus-visible:-translate-y-full motion-reduce:transition-none">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-[var(--ease-out)] group-hover:translate-y-0 group-focus-visible:translate-y-0 motion-reduce:transition-none"
      >
        {children}
      </span>
    </a>
  );
}
