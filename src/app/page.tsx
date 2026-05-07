import dynamic from "next/dynamic";
import CarsBrowser from "./components/CarsBrowser";
import HeroCopy from "./components/HeroCopy";
import HeroParallaxBg from "./components/HeroParallaxBg";
import HomeAvailableCarsHashScroll from "./components/HomeAvailableCarsHashScroll";
import HomeContactStrip from "./components/HomeContactStrip";
import HomeCredibilityStrip from "./components/HomeCredibilityStrip";
import HomeFaq from "./components/HomeFaq";
import HomeHowItWorks from "./components/HomeHowItWorks";
import HomeTrustStrip from "./components/HomeTrustStrip";
import HomeWhatsIncluded from "./components/HomeWhatsIncluded";
import { listCars } from "@/lib/cars";

/** Dynamic import avoids Turbopack occasionally failing to resolve the ScrollHero chunk from the app page graph ("module factory is not available"). */
const ScrollHero = dynamic(() => import("./components/ScrollHero"), {
  ssr: true,
});

export default async function Home() {
  const cars = await listCars();

  return (
    <ScrollHero>
      <div className="site-shell">
        <HomeAvailableCarsHashScroll />
        <section className="hero-image-section">
          <HeroParallaxBg />
          <HeroCopy />
        </section>

        <main className="site-content" id="cars">
          <div className="home-v2-canvas">
            <HomeCredibilityStrip />

            <div className="home-v2-prelude">
              <HomeTrustStrip />
              <HomeHowItWorks />
            </div>

            <div className="home-v2-divider" aria-hidden="true" id="available-cars-scroll-mark" />

            <div className="home-v2-fleet-wrap">
              <CarsBrowser cars={cars} />
            </div>

            <div className="home-v2-divider" aria-hidden="true" />

            <div className="home-v2-bottom">
              <HomeFaq />
              <HomeContactStrip />
              <HomeWhatsIncluded />
            </div>
          </div>
        </main>
      </div>
    </ScrollHero>
  );
}
