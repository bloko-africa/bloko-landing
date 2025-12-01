import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/sections/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { PainPointsSection } from "@/components/sections/PainPointsSection";
import { SolutionSection } from "@/components/sections/SolutionSection";
import { StorySection } from "@/components/sections/StorySection";
import { WaitlistSection } from "@/components/sections/WaitlistSection";

export default function Home() {
  return (
    <main className="main">
      <Navbar />
      <HeroSection />
      <PainPointsSection />
      <StorySection />
      <SolutionSection />
      <WaitlistSection />
      <Footer />
    </main>
  );
}
