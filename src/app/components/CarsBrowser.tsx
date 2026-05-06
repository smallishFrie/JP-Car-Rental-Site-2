"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Car } from "@/lib/cars";
import { categoryTokensWithoutTransmission, parseCategoryTokens } from "@/lib/carDisplay";
import CarSpecsRow from "@/app/components/CarSpecsRow";
import CustomSelect from "@/app/components/CustomSelect";
import RevealOnScroll from "@/app/components/RevealOnScroll";
import { motionSprings } from "@/lib/motion";

const MotionLink = motion(Link);

const carGridContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.03,
    },
  },
};

const carCardItemVariants = {
  hidden: { opacity: 0, y: 16, x: -8 },
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    transition: motionSprings.reveal,
  },
};

type CarsBrowserProps = {
  cars: Car[];
};

const dayRateFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

function formatDayRate(amount: number) {
  return dayRateFormatter.format(amount);
}

export default function CarsBrowser({ cars }: CarsBrowserProps) {
  const reduceMotion = useReducedMotion();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = useMemo(() => {
    return Array.from(new Set(cars.flatMap((car) => parseCategoryTokens(car.category)))).sort((a, b) =>
      a.localeCompare(b),
    );
  }, [cars]);

  const filteredCars = useMemo(() => {
    const query = search.trim().toLowerCase();
    return cars
      .filter((car) => {
        const carCategories = parseCategoryTokens(car.category);
        const categoryMatch = selectedCategory === "all" || carCategories.includes(selectedCategory);
        if (!categoryMatch) {
          return false;
        }
        if (!query) {
          return true;
        }
        return (
          car.name.toLowerCase().includes(query) ||
          car.tagline.toLowerCase().includes(query) ||
          car.category.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        const firstCategoryA = categoryTokensWithoutTransmission(parseCategoryTokens(a.category))[0] ?? "";
        const firstCategoryB = categoryTokensWithoutTransmission(parseCategoryTokens(b.category))[0] ?? "";
        const categoryCompare = firstCategoryA.localeCompare(firstCategoryB);
        if (categoryCompare !== 0) {
          return categoryCompare;
        }
        return a.name.localeCompare(b.name);
      });
  }, [cars, search, selectedCategory]);

  return (
    <div className="fleet-browser">
      <RevealOnScroll className="cars-intro-reveal">
        <header className="fleet-browser-header" id="available-cars-header">
          <p className="fleet-browser-kicker">Available now</p>
          <h3>Find a car in under a minute.</h3>
          <p>
            Filter by category, search by model, and compare daily rates quickly without opening multiple pages.
          </p>
        </header>

        <div className="fleet-browser-controls">
          <label>
            Search cars
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Type vehicle name or keyword"
              aria-label="Search cars"
            />
          </label>
          <label>
            Category
            <CustomSelect
              options={[
                { value: "all", label: "All categories" },
                ...categories.map((category) => ({ value: category, label: category })),
              ]}
              value={selectedCategory}
              onChange={setSelectedCategory}
              optionsAriaLabel="Car categories"
            />
          </label>
        </div>
      </RevealOnScroll>

      <RevealOnScroll className="cars-grid-reveal">
        <motion.div
          className="fleet-list"
          variants={carGridContainerVariants}
          initial={reduceMotion ? undefined : "hidden"}
          whileInView={reduceMotion ? undefined : "visible"}
          viewport={{ once: true, amount: 0.1, margin: "0px 0px -8% 0px" }}
        >
          {filteredCars.map((car) => {
            const categoryTokens = categoryTokensWithoutTransmission(parseCategoryTokens(car.category));
            const primaryCategory = categoryTokens[0] ?? "Rental";

            return (
              <MotionLink
                key={car.id}
                href={`/cars/${car.id}`}
                className="fleet-row"
                aria-labelledby={`car-card-title-${car.id}`}
                variants={reduceMotion ? undefined : carCardItemVariants}
                whileHover={reduceMotion ? undefined : { x: 4 }}
                whileTap={reduceMotion ? undefined : { scale: 0.995 }}
                transition={motionSprings.snappy}
              >
                <div className="fleet-row-media">
                  <Image
                    src={car.cardImage}
                    alt=""
                    width={1280}
                    height={720}
                    className="fleet-row-image"
                  />
                </div>

                <div className="fleet-row-main">
                  <div className="fleet-row-main-top">
                    <div className="fleet-row-title-wrap">
                      <h4 id={`car-card-title-${car.id}`}>{car.name}</h4>
                      <p>{car.tagline}</p>
                    </div>

                    <div className="fleet-row-price" aria-label={`From ${formatDayRate(car.dayRate)} per day`}>
                      <span className="fleet-row-price-value">{formatDayRate(car.dayRate)}</span>
                      <span className="fleet-row-price-unit">per day</span>
                    </div>
                  </div>

                  <div className="fleet-row-meta">
                    <span className="fleet-row-category-primary">{primaryCategory}</span>
                    <div className="fleet-row-categories" aria-label="Car categories">
                      {categoryTokens.map((category) => (
                        <span key={`${car.id}-${category}`} className="fleet-row-chip">
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>

                  <CarSpecsRow category={car.category} passengerCapacity={car.passengerCapacity} className="fleet-row-specs" />
                </div>

                <div className="fleet-row-action">
                  <span className="fleet-row-action-label">View details</span>
                  <span className="fleet-row-action-arrow" aria-hidden="true">
                    →
                  </span>
                </div>
              </MotionLink>
            );
          })}
        </motion.div>
      </RevealOnScroll>

      {!filteredCars.length ? (
        <p className="fleet-empty">No vehicles match your current filters. Try a broader search.</p>
      ) : null}
    </div>
  );
}
