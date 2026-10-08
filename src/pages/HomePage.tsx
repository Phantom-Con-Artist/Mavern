import { SiteLayout } from "@/components/layout/SiteLayout";
import { About } from "@/sections/About";
import { Contact } from "@/sections/Contact";
import { Hero } from "@/sections/Hero";
import { SoftwarePreview } from "@/sections/SoftwarePreview";

export function HomePage() {
  return (
    <SiteLayout current="home">
      <Hero />
      <SoftwarePreview />
      <About />
      <Contact />
    </SiteLayout>
  );
}
