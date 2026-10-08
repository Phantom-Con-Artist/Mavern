import { SiteLayout } from "@/components/layout/SiteLayout";
import { SoftwareList } from "@/components/software/SoftwareList";
import { Section } from "@/components/ui/Section";
import { software } from "@/content/software";

export function SoftwarePage() {
  return (
    <SiteLayout current="software">
      <Section
        id="software"
        level={1}
        number="01"
        label="Software"
        title="Software from Mavern"
        aside={<p className="max-w-sm text-sm leading-6 text-ink-soft">Each release has its own site, linked from here.</p>}
      >
        <SoftwareList items={software} headingLevel={2} />
      </Section>
    </SiteLayout>
  );
}
