"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Car } from "@/app/data/cars";
import { categoryTokensWithoutTransmission, parseCategoryTokens } from "@/lib/carDisplay";
import CarSpecsRow from "./CarSpecsRow";

type CarsBrowserProps = {
  cars: Car[];
};

const dayRateFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

export default function CarsBrowser({ cars }: CarsBrowserProps) {
  const [search, setSearch] = useState("");

  const filteredCars = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matchingCars = q
      ? cars.filter((car) => {
          const categories = parseCategoryTokens(car.category).join(" ").toLowerCase();
          return `${car.name} ${car.tagline}`.toLowerCase().includes(q) || categories.includes(q);
        })
      : cars;

    return [...matchingCars].sort((a, b) => {
      const aPrimaryCategory =
        categoryTokensWithoutTransmission(parseCategoryTokens(a.category))[0]?.toLowerCase() ?? "";
      const bPrimaryCategory =
        categoryTokensWithoutTransmission(parseCategoryTokens(b.category))[0]?.toLowerCase() ?? "";
      const categoryCompare = aPrimaryCategory.localeCompare(bPrimaryCategory);
      if (categoryCompare !== 0) return categoryCompare;
      return a.name.localeCompare(b.name);
    });
  }, [cars, search]);

  return (
    <section className="fleet-shell" aria-labelledby="fleet-heading">
      <header className="fleet-header">
        <p className="fleet-kicker">Available now</p>
        <h2 id="fleet-heading">Editorial fleet selection</h2>
        <p>Panoramic strips, precise specs, and a direct route into booking.</p>
      </header>

      <label className="fleet-search">
        <span>Search by model or category</span>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="SUV, Sedan, Civic..."
          aria-label="Search available cars"
        />
      </label>

      <div className="fleet-list">
        {filteredCars.map((car) => (
          <article
            key={car.id}
            className="fleet-item"
          >
            <Link href={`/cars/${car.id}`} className="fleet-link" aria-label={`Explore ${car.name}`}>
              <div className="fleet-image-wrap">
                <Image src={car.cardImage} alt="" width={1600} height={900} className="fleet-image" />
                <span className="fleet-explore">Explore</span>
              </div>

              <div className="fleet-copy">
                <div className="fleet-row">
                  <h3>{car.name}</h3>
                  <p>{dayRateFormatter.format(car.dayRate)}</p>
                </div>
                <CarSpecsRow category={car.category} passengerCapacity={car.passengerCapacity} />
                <p className="fleet-tagline">{car.tagline}</p>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
