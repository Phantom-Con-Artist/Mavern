/** Hairline column rules over every page: the site's grid, drawn, like the floor of the gallery. */
export function Hairlines() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-40 mx-auto max-w-[120rem] px-[var(--gutter)] mix-blend-difference">
      <div className="grid h-full grid-cols-2 border-r border-marble/[0.07] md:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className={i >= 2 ? "border-l border-marble/[0.07] max-md:hidden" : "border-l border-marble/[0.07]"} />
        ))}
      </div>
    </div>
  );
}
