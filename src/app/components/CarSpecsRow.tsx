"use client";

import { categoryTokensWithoutTransmission, parseCategoryTokens, transmissionFromCategoryTokens } from "@/lib/carDisplay";

type CarSpecsRowProps = {
  category: string;
  passengerCapacity: number | null | undefined;
  className?: string;
};

export default function CarSpecsRow({ category, passengerCapacity, className = "" }: CarSpecsRowProps) {
  const tokens = parseCategoryTokens(category);
  const transmission = transmissionFromCategoryTokens(tokens);
  const nonTransmission = categoryTokensWithoutTransmission(tokens);

  return (
    <div className={`fleet-meta ${className}`.trim()}>
      {typeof passengerCapacity === "number" ? <span>{passengerCapacity} seats</span> : null}
      {transmission ? <span>{transmission === "manual" ? "Manual" : "Automatic"}</span> : null}
      {nonTransmission.slice(0, 1).map((token) => (
        <span key={`${category}-${token}`}>{token}</span>
      ))}
    </div>
  );
}
