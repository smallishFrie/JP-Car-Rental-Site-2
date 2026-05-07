"use client";

import { useState, useTransition } from "react";
import { submitBookingNotMeAction } from "@/app/booking-not-me/actions";

export default function BookingNotMeClient(props: { token: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <section className="auth-panel" style={{ maxWidth: 520 }}>
      <header style={{ marginBottom: "1.25rem" }}>
        <h1 className="display-heading">Don’t recognize this booking?</h1>
        <p className="auth-copy">
          If you didn’t make a reservation with JP Car Rental, use the button below. We’ll automatically secure the booking where
          possible and notify our team.
        </p>
      </header>

      <div className="auth-form">
        {done ? (
          <p className="auth-message" role="status">
            {message}
          </p>
        ) : (
          <>
            <p className="auth-copy" style={{ marginBottom: "1rem" }}>
              Only continue if this reservation was not made by you or anyone you trust on your device.
            </p>
            <button
              type="button"
              className="auth-primary"
              disabled={isPending}
              onClick={() => {
                setMessage(null);
                startTransition(() => {
                  void (async () => {
                    const res = await submitBookingNotMeAction(props.token);
                    setMessage(res.message);
                    setDone(res.ok);
                  })();
                });
              }}
            >
              {isPending ? "Working…" : "This wasn’t me — secure this booking"}
            </button>
            {message && !done ? (
              <p className="auth-message" role="alert">
                {message}
              </p>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
