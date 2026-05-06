"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { XenditComponents } from "xendit-components-web";
import { initCheckoutComponentsSessionAction } from "./actions";

export default function CheckoutClient(props: {
  bookingId: string;
  carName: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  customerName: string;
  customerEmail?: string | null;
}) {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [componentsSdkKey, setComponentsSdkKey] = useState<string | null>(null);
  const componentsRef = useRef<{ submit?: () => void } | null>(null);
  const [isReadyToSubmit, setIsReadyToSubmit] = useState(false);
  const [isHttps, setIsHttps] = useState<boolean | null>(null);

  const formattedTotal = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(props.totalPrice);
  const payButtonLabel = useMemo(() => {
    if (!componentsSdkKey) return message ? "Payment unavailable" : "Loading...";
    if (isPending) return "Processing...";
    return "Pay now";
  }, [componentsSdkKey, isPending, message]);

  useEffect(() => {
    const https = window.location.protocol === "https:";
    queueMicrotask(() => setIsHttps(https));
    if (!https) return;

    let cancelled = false;
    startTransition(() => {
      void (async () => {
        setMessage("");
        const result = await initCheckoutComponentsSessionAction({
          bookingId: props.bookingId,
          origin: window.location.origin,
        });
        if (cancelled) return;
        if (!result.ok) {
          setMessage(result.message);
          if (result.redirectTo) window.location.href = result.redirectTo;
          return;
        }
        if (result.nextUrl) {
          window.location.href = result.nextUrl;
          return;
        }
        if (result.componentsSdkKey) setComponentsSdkKey(result.componentsSdkKey);
      })();
    });

    return () => {
      cancelled = true;
    };
  }, [props.bookingId]);

  useEffect(() => {
    if (!componentsSdkKey) return;

    let mounted = true;
    void (async () => {
      try {
        const components = new XenditComponents({ componentsSdkKey });
        componentsRef.current = components;
        const picker = components.createChannelPickerComponent();
        const container = document.getElementById("xendit-components-container");
        if (!container) return;
        container.replaceChildren(picker);

        components.addEventListener("submission-ready", () => mounted && setIsReadyToSubmit(true));
        components.addEventListener("submission-not-ready", () => mounted && setIsReadyToSubmit(false));
        components.addEventListener("session-complete", () => {
          window.location.href = `/checkout/${props.bookingId}/result?outcome=success`;
        });
        components.addEventListener("session-expired-or-canceled", () => {
          window.location.href = `/checkout/${props.bookingId}/result?outcome=canceled`;
        });
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Failed to initialize payment.");
      }
    })();

    return () => {
      mounted = false;
    };
  }, [componentsSdkKey, props.bookingId]);

  return (
    <section className="auth-panel">
      <h1>Checkout</h1>
      <p className="auth-copy">Complete payment securely via Xendit.</p>

      <section className="auth-message">
        <p><strong>Car:</strong> {props.carName}</p>
        <p><strong>Rental dates:</strong> {props.startDate} - {props.endDate}</p>
        <p><strong>Total:</strong> {formattedTotal}</p>
        <p><strong>Customer:</strong> {props.customerName}{props.customerEmail ? ` (${props.customerEmail})` : ""}</p>
      </section>

      {isHttps === false ? <p className="auth-message">Embedded checkout requires HTTPS. Use an HTTPS domain or tunnel.</p> : null}
      {isHttps === true && !componentsSdkKey && !message ? <p className="auth-message">Loading secure payment...</p> : null}
      {componentsSdkKey ? <div id="xendit-components-container" /> : null}

      <button
        type="button"
        className="booking-cta"
        disabled={isPending || isHttps !== true || !componentsSdkKey || !isReadyToSubmit}
        onClick={() => {
          setMessage("");
          try {
            componentsRef.current?.submit?.();
          } catch (error) {
            setMessage(error instanceof Error ? error.message : "Unable to submit payment.");
          }
        }}
      >
        {payButtonLabel}
      </button>

      {message ? <p className="auth-message">{message}</p> : null}
    </section>
  );
}
