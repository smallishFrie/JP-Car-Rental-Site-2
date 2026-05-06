"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  revealListContainerVariants,
  revealListItemVariants,
  revealReducedItem,
  revealReducedStaggerContainer,
} from "@/lib/motion";

const steps = [
  {
    n: "1",
    kicker: "Shortlist",
    title: "Lock in the right car",
    text: "Filter by trip style, compare rates quickly, and pick exact pickup/return dates in one flow.",
    meta: "Usually 2-3 minutes",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
        <circle cx="7" cy="17" r="2" />
        <path d="M9 17h6" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    ),
  },
  {
    n: "2",
    kicker: "Review",
    title: "Approve trip details",
    text: "Double-check location, policy notes, and final total before continuing to secure payment.",
    meta: "No hidden add-ons",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    ),
  },
  {
    n: "3",
    kicker: "Pickup",
    title: "Show up and drive out",
    text: "Bring your confirmation and ID, complete handover, then head out with everything documented.",
    meta: "Confirmation sent instantly",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    ),
  },
] as const;

export default function HomeHowItWorks() {
  const reduce = useReducedMotion();
  const item = reduce ? revealReducedItem : revealListItemVariants;
  const listContainer = reduce ? revealReducedStaggerContainer : revealListContainerVariants;

  return (
    <section className="home-steps" aria-labelledby="home-steps-heading">
      <motion.div
        className="home-steps-reveal"
        initial={reduce ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, amount: 0.12, margin: "0px 0px -5% 0px" }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.09, delayChildren: 0.06 } },
        }}
      >
        <motion.h2 className="home-steps-heading" id="home-steps-heading" variants={item}>
          From shortlist to steering wheel
        </motion.h2>
        <motion.p className="home-steps-lede" variants={item}>
          Built for quick decisions: clear pricing upfront, fewer back-and-forth messages, and a pickup flow that stays predictable.
        </motion.p>
        <motion.ol className="home-steps-grid" variants={listContainer}>
          {steps.map((step) => (
            <motion.li key={step.n} className="home-step" variants={item}>
              <span className="home-step-badge" aria-hidden>
                {step.n}
              </span>
              <div className="home-step-icon" aria-hidden>
                {step.icon}
              </div>
              <p className="home-step-kicker">{step.kicker}</p>
              <h3 className="home-step-title">{step.title}</h3>
              <p className="home-step-text">{step.text}</p>
              <p className="home-step-meta">{step.meta}</p>
            </motion.li>
          ))}
        </motion.ol>
      </motion.div>
    </section>
  );
}
