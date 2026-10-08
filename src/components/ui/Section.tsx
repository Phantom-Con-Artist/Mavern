import type { ReactNode } from "react";
import { Panel } from "./Panel";

/** Padding shared by a section's heading bar and its content, so their text lines up. */
export const sectionPad = "px-6 sm:px-10 lg:px-14";

/**
 * A page section as one ink panel: a heading bar (number, label, title, optional aside) above the content.
 * Use level 1 for a page's own title.
 */
export function Section({
  id,
  number,
  label,
  title,
  aside,
  level = 2,
  children,
}: {
  id: string;
  number: string;
  label: string;
  title: string;
  aside?: ReactNode;
  level?: 1 | 2;
  children: ReactNode;
}) {
  const Heading = level === 1 ? "h1" : "h2";
  const titleId = `${id}-title`;

  return (
    <section id={id} aria-labelledby={titleId} className="scroll-mt-6">
      <Panel>
        <header className={`flex flex-col gap-3 border-b-2 border-line py-6 md:flex-row md:items-end md:justify-between ${sectionPad}`}>
          <div>
            <p className="tag">
              {number} — {label}
            </p>
            <Heading id={titleId} className="mt-4 max-w-4xl font-display text-[clamp(1.75rem,3.2vw,2.6rem)] leading-[1.05]">
              {title}
            </Heading>
          </div>
          {aside}
        </header>
        {children}
      </Panel>
    </section>
  );
}
