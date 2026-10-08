import { SoftwareList } from "@/components/software/SoftwareList";
import { Section } from "@/components/ui/Section";
import { software } from "@/content/software";

export function SoftwarePreview() {
  return (
    <Section
      id="software"
      number="01"
      label="Software"
      title="What Mavern makes"
      aside={
        <a href="/software/" className="textlink text-sm">
          All software
        </a>
      }
    >
      <SoftwareList items={software} />
    </Section>
  );
}
