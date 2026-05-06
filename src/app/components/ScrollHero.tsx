"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { HeroMotionContext, type HeroMotionApi } from "./hero-motion-context";

type ScrollHeroProps = {
  children: React.ReactNode;
};

export default function ScrollHero({ children }: ScrollHeroProps) {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const [viewportH, setViewportH] = useState(900);

  useEffect(() => {
    const updateViewportHeight = () => setViewportH(window.innerHeight || 900);
    updateViewportHeight();
    window.addEventListener("resize", updateViewportHeight, { passive: true });
    return () => window.removeEventListener("resize", updateViewportHeight);
  }, []);

  const span = useMemo(() => Math.max(1, viewportH), [viewportH]);
  const stageY = useTransform(scrollY, [0, span], [0, reduceMotion ? 0 : 42]);
  const stageScale = useTransform(scrollY, [0, span], [1, reduceMotion ? 1 : 1.07]);
  const textY = useTransform(scrollY, [0, span], [0, reduceMotion ? 0 : -22]);

  const motionValue = useMemo<HeroMotionApi>(
    () => ({
      stageY,
      stageScale,
      textY,
    }),
    [stageScale, stageY, textY],
  );

  return (
    <HeroMotionContext.Provider value={motionValue}>
      <motion.div className="scroll-hero" initial={false}>
        {children}
      </motion.div>
    </HeroMotionContext.Provider>
  );
}
