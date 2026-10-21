import { mediums } from "@/content/mediums";
import { workPath, works } from "@/content/works";

/** Every page the site publishes, for the sitemap and the end-to-end checks. */
export function allRoutes(): string[] {
  return ["/", "/work/", ...mediums.map((m) => `/work/${m.slug}/`), ...works.map(workPath)];
}
