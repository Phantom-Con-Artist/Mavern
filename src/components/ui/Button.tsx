import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = { children: ReactNode; primary?: boolean; className?: string } & Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "className" | "children"
>;

/**
 * A link styled as a jagged ink box with an offset slab (styles/components.css, .btn).
 * On hover and keyboard focus a hand-drawn pen ring circles it (.btn-scribble).
 */
export function ButtonLink({ children, primary, className, ...rest }: Props) {
  return (
    <a className={cn("btn", primary && "btn-primary", className)} {...rest}>
      <span className="btn-scribble" aria-hidden="true" />
      <span className="btn-in">{children}</span>
    </a>
  );
}
