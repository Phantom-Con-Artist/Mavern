/*
  The autopilot's route as pure functions: where it stops on the page, how long it rests at each stop,
  and where the page should be at any moment.
*/

/** A section's place on the page and the points in it to rest at (0 = its top, 1 = its last screen). */
export type SectionStops = { top: number; height: number; stops: number[]; holds: number[] };
export type Stop = { y: number; hold: number };

export function plan(sections: SectionStops[], viewport: number, pageHeight = Infinity): Stop[] {
  const bottom = pageHeight - viewport;
  return sections.flatMap((s) =>
    s.stops.map((p, i) => ({
      y: Math.min(bottom, Math.round(s.top + Math.max(0, s.height - viewport) * p)),
      hold: s.holds[i] ?? s.holds[s.holds.length - 1] ?? 0,
    })),
  );
}

/** Time to travel a leg: about 600 px a second, never rushed, never dragging. */
export function legDuration(distance: number): number {
  return Math.round(Math.min(9000, Math.max(1400, (Math.abs(distance) / 600) * 1000)));
}

/** sine in-out: a gentle start and landing, so the travel reads as a camera move. */
const ease = (t: number) => 0.5 - Math.cos(Math.PI * t) / 2;

/** Where the page is `elapsed` ms after leaving the first stop's hold began. */
export function positionAt(stops: Stop[], elapsed: number): { y: number; done: boolean } {
  let t = elapsed;
  for (let i = 0; i < stops.length; i++) {
    const s = stops[i];
    if (t < s.hold) return { y: s.y, done: false };
    t -= s.hold;
    const next = stops[i + 1];
    if (!next) break;
    const leg = legDuration(next.y - s.y);
    if (t < leg) return { y: s.y + (next.y - s.y) * ease(t / leg), done: false };
    t -= leg;
  }
  return { y: stops[stops.length - 1]?.y ?? 0, done: true };
}
