import { Autopilot } from "@/components/autopilot/Autopilot";
import { EntryScreen } from "@/components/home/EntryScreen";
import { About } from "@/components/home/About";
import { Contact } from "@/components/home/Contact";
import { Experiments } from "@/components/home/Experiments";
import { Gallery } from "@/components/home/Gallery";
import { Overture } from "@/components/home/Overture";
import { SelectedWork } from "@/components/home/SelectedWork";

export default function HomePage() {
  return (
    <main id="main">
      <EntryScreen />
      <Autopilot />
      <Overture />
      <Gallery />
      <Experiments />
      <SelectedWork />
      <About />
      <Contact />
    </main>
  );
}
