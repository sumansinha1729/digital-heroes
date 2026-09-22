import { TopNav } from "../components/layout/TopNav.jsx";
import { Footer } from "../components/layout/Footer.jsx";
import { Hero } from "./home/Hero.jsx";
import { HowItWorks } from "./home/HowItWorks.jsx";
import { CharitySpotlight } from "./home/CharitySpotlight.jsx";
import { PrizeTeaser } from "./home/PrizeTeaser.jsx";
import { FinalCta } from "./home/FinalCta.jsx";

export function Home() {
  return (
    <div className="relative min-h-screen bg-surface">
      <div className="absolute top-0 z-10 w-full">
        <TopNav variant="dark" />
      </div>
      <Hero />
      <HowItWorks />
      <CharitySpotlight />
      <PrizeTeaser />
      <FinalCta />
      <Footer />
    </div>
  );
}
