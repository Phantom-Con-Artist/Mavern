import { Autopilot } from "@/components/autopilot/Autopilot";
import { About } from "@/components/home/About";
import { Contact } from "@/components/home/Contact";
import { EntryScreen } from "@/components/home/EntryScreen";
import { Experiments } from "@/components/home/Experiments";
import { Gallery } from "@/components/home/Gallery";
import { Overture } from "@/components/home/Overture";
import { SelectedWork } from "@/components/home/SelectedWork";
import { Spatial } from "@/components/kinetic/Spatial";

export default function HomePage() {
  return (
    <main id="main" className="overflow-x-clip">
      <EntryScreen />
      <Autopilot />
      <Overture />
      <Gallery />
      <Spatial>
        <Experiments />
      </Spatial>
      <Spatial>
        <SelectedWork />
      </Spatial>
      <Spatial>
        <About />
      </Spatial>
      <Spatial>
        <Contact />
      </Spatial>
    </main>
  );
}
