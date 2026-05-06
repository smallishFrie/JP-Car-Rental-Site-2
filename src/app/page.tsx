import HeroCopy from "./components/HeroCopy";
import HomeContactStrip from "./components/HomeContactStrip";
import HomeCredibilityStrip from "./components/HomeCredibilityStrip";
import HomeFaq from "./components/HomeFaq";
import HomeHowItWorks from "./components/HomeHowItWorks";
import HomeTrustStrip from "./components/HomeTrustStrip";
import HomeWhatsIncluded from "./components/HomeWhatsIncluded";
import SiteFooter from "./components/SiteFooter";
import SiteHeader from "./components/SiteHeader";
import CarsBrowser from "./components/CarsBrowser";
import HomeAvailableCarsHashScroll from "./components/HomeAvailableCarsHashScroll";
import { listCars } from "@/lib/cars";

export default async function Home() {
  const cars = await listCars();

  return (
    <div className="site-shell site-shell-clean-light">
      <HomeAvailableCarsHashScroll />
      <SiteHeader />
      <main className="site-content site-content-clean-light">
        <section className="hero-image-section hero-image-section-clean-light">
          <HeroCopy />
        </section>

        <section className="content-canvas content-canvas-clean-light" id="cars" aria-label="Available rental cars">
          <div className="home-section home-section--prelude">
            <div className="home-prelude home-prelude-alt">
              <HomeCredibilityStrip />
              <div className="home-prelude-main home-clean-light-two-col">
                <HomeHowItWorks />
                <HomeTrustStrip />
              </div>
            </div>
          </div>

          <div className="home-section home-section--fleet">
            <CarsBrowser cars={cars} />
          </div>

          <div className="home-section home-section--bottom">
            <div className="home-bottom-stack home-bottom-stack-alt">
              <div className="home-clean-light-two-col">
                <HomeFaq />
                <div className="home-bottom-rail">
                  <HomeWhatsIncluded />
                  <HomeContactStrip />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
