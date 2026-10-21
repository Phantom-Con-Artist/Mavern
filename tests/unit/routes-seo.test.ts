import { describe, expect, it } from "vitest";
import { allRoutes } from "@/lib/routes";
import { breadcrumbLd, jsonLdString, pageMetadata, SITE_URL, workLd } from "@/lib/seo";
import { getWork } from "@/content/works";
import sitemap from "../../app/sitemap";

describe("routes", () => {
  it("lists home, work, each medium and each project once, with trailing slashes", () => {
    const routes = allRoutes();
    expect(routes).toHaveLength(2 + 4 + 15);
    expect(new Set(routes).size).toBe(routes.length);
    expect(routes.every((r) => r.endsWith("/"))).toBe(true);
    expect(routes).toContain("/work/software/volpi/");
  });
});

describe("seo", () => {
  it("gives absolute canonical URLs with a trailing slash", () => {
    const m = pageMetadata({ title: "Work", description: "d", path: "/work/" });
    expect(m.alternates?.canonical).toBe(`${SITE_URL}/work/`);
  });

  it("describes software as a SoftwareApplication with its version", () => {
    const ld = workLd(getWork("software", "volpi")!);
    expect(ld["@type"]).toBe("SoftwareApplication");
    expect(ld.softwareVersion).toBe("0.1.1");
  });

  it("describes a website as a WebSite at its live address", () => {
    const ld = workLd(getWork("websites", "animepoodle")!);
    expect(ld["@type"]).toBe("WebSite");
    expect(ld.url).toBe("https://animepoodle.mavern.in");
  });

  it("never links an unconfirmed address", () => {
    const ld = workLd(getWork("software", "mistletoe-ui")!);
    expect(JSON.stringify(ld)).not.toContain("github.com");
  });

  it("numbers breadcrumbs from 1", () => {
    const ld = breadcrumbLd([{ name: "Work", path: "/work/" }, { name: "Software", path: "/work/software/" }]);
    expect(ld.itemListElement.map((i: { position: number }) => i.position)).toEqual([1, 2]);
  });

  it("escapes a closing script tag inside JSON-LD", () => {
    expect(jsonLdString({ a: "</script>" })).not.toContain("</script>");
  });

  it("puts every route in the sitemap as an absolute URL", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toHaveLength(allRoutes().length);
    expect(urls.every((u) => u.startsWith(`${SITE_URL}/`))).toBe(true);
  });
});
