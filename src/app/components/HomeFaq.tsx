"use client";

import { useId, useState } from "react";

const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: "What do I need to bring at pickup?",
    answer:
      "A valid driver’s license, a matching ID, and proof of insurance for the rental period. Minimum age and deposit rules are confirmed during checkout.",
  },
  {
    question: "How does pricing work?",
    answer:
      "Rates shown are per day in PHP. Your total updates when you choose pickup and return dates. Taxes or location fees, if any, are summarized before you pay.",
  },
  {
    question: "Can I change or cancel a booking?",
    answer:
      "Use your account to review upcoming trips. Change and cancellation rules depend on the vehicle and dates you selected—see our terms for cancellation windows.",
  },
  {
    question: "Where can I pick up the car?",
    answer:
      "Pickup options depend on the vehicle and availability. You’ll choose or confirm a location as part of booking. Sunday pickups may be by appointment.",
  },
  {
    question: "How do I pay?",
    answer: "Checkout is handled through our payment partner (Xendit). You’ll complete payment on a secure flow after you confirm trip details.",
  },
  {
    question: "What if I need help after I book?",
    answer:
      "Sign in and open Account to see booking status. For urgent pickup-day issues, use the contact details on your confirmation email.",
  },
];

export default function HomeFaq() {
  const baseId = useId();
  const [openRows, setOpenRows] = useState<ReadonlySet<number>>(() => new Set());

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
    <section className="home-v2-faq" aria-labelledby="home-v2-faq-heading">
      <h2 className="home-v2-section-title" id="home-v2-faq-heading">
        Frequently asked questions
      </h2>
      <div className="home-v2-faq-list">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openRows.has(index);
          const triggerId = `${baseId}-t-${index}`;
          const panelId = `${baseId}-p-${index}`;
          return (
            <div key={item.question} className={`home-v2-faq-item${isOpen ? " home-v2-faq-item--open" : ""}`}>
              <button
                type="button"
                id={triggerId}
                className="home-v2-faq-trigger"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggleRow(index)}
              >
                <span>{item.question}</span>
              </button>
              <div id={panelId} role="region" aria-labelledby={triggerId} className="home-v2-faq-panel" hidden={!isOpen}>
                <p className="home-v2-faq-answer">{item.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
