import { Section, sectionPad } from "@/components/ui/Section";
import { contactEmail } from "@/content/site";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/Button";

export function Contact() {
  return (
    <Section id="contact" number="03" label="Contact" title="Write to Mavern">
      <div className={cn("flex flex-col gap-6 py-8 sm:py-10 md:flex-row md:items-center md:justify-between lg:py-12", sectionPad)}>
        <p className="bubble self-start rounded-[2rem] px-6 py-4 text-left text-lg leading-7" data-tail="left">
          Questions, ideas or a hello: {contactEmail}
        </p>
        <ButtonLink href={`mailto:${contactEmail}`} primary className="self-start md:self-center">
          Write an email
        </ButtonLink>
      </div>
    </Section>
  );
}
