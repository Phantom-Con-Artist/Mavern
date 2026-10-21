import { describe, expect, it } from "vitest";
import { mediums } from "@/content/mediums";
import { featuredWorks, getWork, publicLinks, workPath, works, worksByMedium } from "@/content/works";

describe("catalogue", () => {
  it("has unique slugs", () => {
    const slugs = works.map((w) => w.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("uses only known mediums", () => {
    const known = new Set(mediums.map((m) => m.slug));
    for (const w of works) expect(known.has(w.medium), w.slug).toBe(true);
  });

  it("keeps summaries short enough for a meta description", () => {
    for (const w of works) expect(w.summary.length, w.slug).toBeLessThanOrEqual(160);
  });

  it("names a source for every entry", () => {
    for (const w of works) expect(w.source.length, w.slug).toBeGreaterThan(0);
  });

  it("drops unconfirmed links", () => {
    const work = { ...works[0], links: [{ label: "a", href: "https://a.test", confirmed: true }, { label: "b", href: "https://b.test", confirmed: false }] };
    expect(publicLinks(work).map((l) => l.label)).toEqual(["a"]);
  });

  it("finds Volpi at its current version", () => {
    expect(getWork("software", "volpi")?.version).toBe("0.1.1");
    expect(getWork("websites", "volpi")).toBeUndefined();
  });

  it("features three to six works", () => {
    expect(featuredWorks().length).toBeGreaterThanOrEqual(3);
    expect(featuredWorks().length).toBeLessThanOrEqual(6);
  });

  it("gives every medium at least one work", () => {
    for (const m of mediums) expect(worksByMedium(m.slug).length, m.slug).toBeGreaterThan(0);
  });

  it("builds project paths", () => {
    expect(workPath(getWork("software", "volpi")!)).toBe("/work/software/volpi/");
  });

  it("orders the sculpture words", () => {
    expect(mediums.map((m) => m.word)).toEqual(["SOFTWARE", "WEBSITES", "APPS", "EXPERIMENTS"]);
  });

  it("lists all fifteen works", () => {
    expect(works).toHaveLength(15);
  });
});

describe("medium art direction", () => {
  it("gives every medium its own figure and ground", async () => {
    const { mediums } = await import("@/content/mediums");
    expect(mediums.map((m) => [m.slug, m.figure, m.ground])).toEqual([
      ["software", "athena", "gold"],
      ["websites", "aphrodite", "orchid"],
      ["apps", "alexander", "ember"],
      ["experiments", "creation", "violet"],
    ]);
  });
});

describe("screenshots", () => {
  it("has a screenshot file for every work that claims one", async () => {
    const { existsSync } = await import("node:fs");
    const missing = works.filter((w) => w.screenshot && !existsSync(`assets/screens/${w.slug}.png`)).map((w) => w.slug);
    expect(missing).toEqual([]);
  });

  it("shows the live sites the owner listed", () => {
    expect(works.filter((w) => w.screenshot).map((w) => w.slug).sort()).toEqual(
      ["algal-biotech-lab", "animepoodle", "cineviz", "light-year-saga", "online-tachistoscope", "respawn", "scrapbean", "volpi"],
    );
  });
});
