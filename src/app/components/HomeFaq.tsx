"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useId, useState } from "react";
import RevealOnScroll from "./RevealOnScroll";

const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: "What should I bring on pickup day?",
    answer:
      "Bring your valid driver's license, one matching government ID, and any documents noted in your confirmation. Age and deposit requirements are shown before payment.",
  },
  {
    question: "Is the total shown before I pay?",
    answer:
      "Yes. Rates are displayed in PHP and the trip total recalculates when dates or options change. You approve the same amount you see at checkout.",
  },
  {
    question: "Can I edit or cancel after booking?",
    answer:
      "Open your account to review the reservation. Change and cancellation windows depend on the selected vehicle and dates, and are shown before you confirm.",
  },
  {
    question: "How are pickup locations selected?",
    answer:
      "Location options are tied to each car and schedule. You'll select or confirm pickup during booking, and Sunday handovers are arranged by appointment.",
  },
  {
    question: "What payment method do you use?",
    answer:
      "Payments are processed through Xendit on an encrypted checkout flow. Card details are never sent over chat or email.",
  },
  {
    question: "How do I get support after booking?",
    answer:
      "Use your account to check booking updates and messages. For urgent day-of-trip concerns, follow the direct support details in your confirmation email.",
  },
];

export default function HomeFaq() {
  const baseId = useId();
  const [openRows, setOpenRows] = useState<ReadonlySet<number>>(() => new Set());
  const reduce = useReducedMotion();

  function toggleRow(index: number) {
    setOpenRows((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  return (
    <section className="home-bottom-section home-faq" aria-labelledby="home-faq-heading">
      <RevealOnScroll>
        <h2 className="home-section-heading" id="home-faq-heading">
          Questions people ask before booking
        </h2>
        <div className="home-faq-list">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openRows.has(index);
            const triggerId = `${baseId}-t-${index}`;
            const panelId = `${baseId}-p-${index}`;
            return (
              <div
                key={item.question}
                className={`home-faq-item${isOpen ? " home-faq-item--open" : ""}`}
              >
                <button
                  type="button"
                  id={triggerId}
                  className="home-faq-trigger"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggleRow(index)}
                >
                  <span className="home-faq-trigger-label">{item.question}</span>
                </button>
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  aria-hidden={!isOpen}
                  className="home-faq-panel"
                  initial={false}
                  animate={{
                    height: isOpen ? "auto" : 0,
                    opacity: isOpen ? 1 : 0,
                  }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : {
                          height: { type: "tween", duration: 0.38, ease: [0.22, 1, 0.36, 1] },
                          opacity: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
                        }
                  }
                  style={{ overflow: "hidden" }}
                >
                  <div className="home-faq-panel-inner">
                    <p className="home-faq-answer">{item.answer}</p>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </RevealOnScroll>
    </section>
  );
}
