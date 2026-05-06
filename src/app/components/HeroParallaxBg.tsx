"use client";

import { motion } from "framer-motion";
import { useHeroMotion } from "./hero-motion-context";

export default function HeroParallaxBg() {
  const heroMotion = useHeroMotion();

  return (
    <div className="hero-stage" aria-hidden="true">
      <motion.div
        className="hero-stage-image"
        style={
          heroMotion
            ? {
                y: heroMotion.stageY,
                scale: heroMotion.stageScale,
              }
            : undefined
        }
      />
      <div className="hero-grid-overlay" />
    </div>
  );
}
