const steps = [
  {
    n: "1",
    title: "Choose your vehicle and dates",
    text: "Browse the fleet, open a car you like, and select pickup and return on the calendar.",
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
    title: "Confirm your details",
    text: "Review the rate, location, and trip notes before you head to checkout.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    ),
  },
  {
    n: "3",
    title: "Pick up and go",
    text: "Arrive at your chosen location with your booking confirmation and hit the road.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    ),
  },
] as const;

export default function HomeHowItWorks() {
  return (
    <section className="home-v2-steps" aria-labelledby="home-v2-steps-heading">
      <h2 className="home-v2-section-title" id="home-v2-steps-heading">
        How it works
      </h2>
      <ol className="home-v2-steps-grid">
        {steps.map((step) => (
          <li key={step.n} className="home-v2-step">
            <span className="home-v2-step-badge" aria-hidden>
              {step.n}
            </span>
            <div className="home-v2-step-icon" aria-hidden>
              {step.icon}
            </div>
            <h3 className="home-v2-step-title">{step.title}</h3>
            <p className="home-v2-step-text">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
