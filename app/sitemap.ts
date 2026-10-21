import type { MetadataRoute } from "next";
import { allRoutes } from "@/lib/routes";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return allRoutes().map((path) => ({ url: `${SITE_URL}${path}`, changeFrequency: "monthly", priority: path === "/" ? 1 : path.split("/").length > 4 ? 0.6 : 0.8 }));
}
