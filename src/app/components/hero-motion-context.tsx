"use client";

import { createContext, useContext } from "react";
import type { MotionValue } from "framer-motion";

export type HeroMotionApi = {
  stageY: MotionValue<number>;
  stageScale: MotionValue<number>;
  textY: MotionValue<number>;
};

export const HeroMotionContext = createContext<HeroMotionApi | null>(null);

export function useHeroMotion() {
  return useContext(HeroMotionContext);
}
