export default function HomeTrustStrip() {
  return (
    <section className="home-v2-trust" aria-labelledby="home-v2-trust-heading">
      <h2 className="home-v2-section-title" id="home-v2-trust-heading">
        Why renters choose JP
      </h2>
      <div className="home-v2-trust-grid">
        <article className="home-v2-trust-card">
          <div className="home-v2-trust-icon" aria-hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <h3 className="home-v2-card-title">Simple online booking</h3>
          <p className="home-v2-card-text">Reserve from your phone or laptop with an account you can return to anytime.</p>
        </article>
        <article className="home-v2-trust-card">
          <div className="home-v2-trust-icon" aria-hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <h3 className="home-v2-card-title">Flexible pickup locations</h3>
          <p className="home-v2-card-text">Choose the spot that fits your trip—office, airport, or city drop point when you book.</p>
        </article>
        <article className="home-v2-trust-card">
          <div className="home-v2-trust-icon" aria-hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 6h13" />
              <path d="M8 12h13" />
              <path d="M8 18h13" />
              <path d="M3 6h.01" />
              <path d="M3 12h.01" />
              <path d="M3 18h.01" />
            </svg>
          </div>
          <h3 className="home-v2-card-title">Trip history in one place</h3>
          <p className="home-v2-card-text">Review confirmations, dates, and payment status whenever you need them.</p>
        </article>
      </div>
    </section>
  );
}
