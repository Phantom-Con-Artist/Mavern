import type { Metadata } from "next";
import { contactEmail, creator } from "@/content/site";
import type { Work } from "@/content/types";
import { publicLinks, workPath } from "@/content/works";

export const SITE_URL = "https://mavern.in";

/** A page's title, description, canonical address and share card. */
export function pageMetadata({ title, description, path, image }: { title?: string; description: string; path: string; image?: string }): Metadata {
  const url = `${SITE_URL}${path}`;
  const images = [{ url: image ?? "/media/og-default.jpg", width: 1200, height: 630 }];
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, siteName: "Mavern", title: title ?? "Mavern", description, images },
    twitter: { card: "summary_large_image", title: title ?? "Mavern", description, images: images.map((i) => i.url) },
  };
}

export function personLd() {
  return { "@context": "https://schema.org", "@type": "Person", name: creator.name, url: SITE_URL, worksFor: { "@type": "Organization", name: "Mavern" } };
}

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Mavern",
    url: SITE_URL,
    logo: `${SITE_URL}/brand/mavern-mark.png`,
    email: contactEmail,
    founder: { "@type": "Person", name: creator.name },
  };
}

/** Structured data for a work: an application, a website, or a creative work. Only confirmed links appear. */
export function workLd(w: Work) {
  const live = publicLinks(w)[0]?.href;
  const type = w.medium === "websites" ? "WebSite" : w.medium === "experiments" ? "CreativeWork" : "SoftwareApplication";
  return {
    "@context": "https://schema.org",
    "@type": type,
    name: w.name,
    description: w.summary,
    url: live ?? `${SITE_URL}${workPath(w)}`,
    author: { "@type": "Person", name: creator.name },
    publisher: { "@type": "Organization", name: "Mavern" },
    ...(type === "SoftwareApplication" ? { applicationCategory: w.medium === "apps" ? "MobileApplication" : "DesktopApplication", ...(w.platforms ? { operatingSystem: w.platforms } : {}) } : {}),
    ...(w.version ? { softwareVersion: w.version } : {}),
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${SITE_URL}${it.path}` })),
  };
}

/** JSON for a script tag, with "<" escaped so text can never close the tag. */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
