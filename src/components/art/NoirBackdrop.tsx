/**
 * Fixed backdrop behind every page: venetian-blind shadows falling from a window at the upper right,
 * film grain and a soft vignette. Light-themed noir: shadow, not darkness. Purely decorative.
 */
export function NoirBackdrop() {
  return (
    <div aria-hidden="true" className="noir-backdrop">
      <div className="noir-blinds" />
      <div className="noir-grain" />
      <div className="noir-vignette" />
    </div>
  );
}
