import HeroCopy from "./components/HeroCopy";
import HeroParallaxBg from "./components/HeroParallaxBg";
import ScrollHero from "./components/ScrollHero";
import CarsBrowser from "./components/CarsBrowser";
import { listCars } from "@/lib/cars";

export default async function Home() {
  const cars = await listCars();

  return (
    <ScrollHero>
      <div className="site-shell">
        <section className="hero-image-section">
          <HeroParallaxBg />
          <HeroCopy />
        </section>

        <main className="site-content" id="cars">
          <CarsBrowser cars={cars} />
        </main>
      </div>
    </ScrollHero>
  );
}
