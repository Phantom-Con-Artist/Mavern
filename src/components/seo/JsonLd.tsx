import { jsonLdString } from "@/lib/seo";

/** Structured data for search engines. */
export function JsonLd({ data }: { data: object | object[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(data) }} />;
}
