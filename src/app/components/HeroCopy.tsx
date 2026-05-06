"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useHeroMotion } from "./hero-motion-context";

const premiumEase: [number, number, number, number] = [0.76, 0, 0.24, 1];

function splitWords(text: string) {
  return text.split(/\s+/).filter(Boolean);
}

function scrollToFleet(event: React.MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
  const section = document.getElementById("cars");
  section?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function HeroCopy() {
  const reduceMotion = useReducedMotion();
  const heroMotion = useHeroMotion();
  const words = splitWords("JP Car Rental");

  return (
    <motion.div className="hero-copy" style={heroMotion ? { y: heroMotion.textY } : undefined}>
      <div className="hero-copy-inner">
        <motion.span
          className="hero-kicker"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: premiumEase }}
        >
          Editorial-grade automotive rental
        </motion.span>

        <h1 className="hero-title" aria-label="JP Car Rental">
          {words.map((word, index) => (
            <motion.span
              key={word}
              style={{ display: "inline-block", marginRight: "0.22em", overflow: "hidden" }}
              initial={
                reduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: "0.78em",
                      clipPath: "inset(100% 0% 0% 0%)",
                    }
              }
              animate={
                reduceMotion
                  ? undefined
                  : {
                      opacity: 1,
                      y: "0em",
                      clipPath: "inset(0% 0% 0% 0%)",
                    }
              }
              transition={{
                duration: 0.86,
                ease: premiumEase,
                delay: reduceMotion ? 0 : 0.12 + index * 0.09,
              }}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          className="hero-subline"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: premiumEase, delay: reduceMotion ? 0 : 0.5 }}
        >
          Clean machines, precise pricing, and a booking flow designed with premium restraint.
        </motion.p>

        <motion.div
          className="hero-ctas"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.74, ease: premiumEase, delay: reduceMotion ? 0 : 0.62 }}
        >
          <a href="#cars" onClick={scrollToFleet} className="hero-cta-main">
            Book now
          </a>
          <a href="/auth/sign-in" className="hero-cta-ghost">
            Sign in
          </a>
        </motion.div>
      </div>
    </motion.div>
  );
}
