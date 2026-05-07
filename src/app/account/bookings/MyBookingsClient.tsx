"use client";

import { useState, useTransition } from "react";
import type { BookingRecord } from "@/lib/booking-model";
import { formatBookingVehicleName } from "@/lib/booking-model";
import { cancelPendingBookingAction, requestCancellationAction } from "@/app/account/bookings/actions";

type BookingWithCar = BookingRecord & { car: { id: string; name: string; category: string } | null };

function toDate(value: string) {
  return new Date(value).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

function getActionKind(booking: BookingWithCar) {
  if (booking.status === "pending" && booking.payment_status === "unpaid") {
    return "cancel";
  }
  if (booking.status === "cancel_requested") {
    return "requested";
  }
  if (booking.status === "upcoming") {
    return "request";
  }
  return "none";
}

export default function MyBookingsClient({ initialBookings }: { initialBookings: BookingWithCar[] }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [cancelReasonById, setCancelReasonById] = useState<Record<string, string>>({});

  function cancelPendingBooking(id: string) {
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.set("id", id);
        await cancelPendingBookingAction(fd);
        setBookings((current) =>
          current.map((booking) => (booking.id === id ? { ...booking, status: "canceled", canceled_at: new Date().toISOString() } : booking)),
        );
        setMessage("Booking canceled.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Failed to cancel booking.");
      }
    });
  }

  function requestCancellation(id: string) {
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.set("id", id);
        const reason = cancelReasonById[id]?.trim();
        if (reason) {
          fd.set("cancellationReason", reason);
        }
        await requestCancellationAction(fd);
        setBookings((current) => current.map((booking) => (booking.id === id ? { ...booking, status: "cancel_requested" } : booking)));
        setMessage("Cancellation requested. Admin has been notified.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Failed to request cancellation.");
      }
    });
  }

  return (
    <section className="auth-panel account-bookings-panel">
      <h1 className="display-heading">My bookings</h1>
      <p className="auth-copy account-bookings-policy">
        <strong>Cancellations and refunds:</strong> Cancellations at least 48 hours before pickup may be eligible for a full refund; within 48
        hours a fee may apply. See our{" "}
        <a href="/terms#cancellation" className="account-bookings-policy-link">
          terms (section 6)
        </a>{" "}
        for details.
      </p>
      {!bookings.length ? <p className="auth-copy account-bookings-empty">No bookings yet.</p> : null}
      {message ? <p className="auth-message">{message}</p> : null}
      <ul className="account-bookings-list">
        {bookings.map((booking) => {
          const actionKind = getActionKind(booking);
          return (
            <li key={booking.id} className="account-bookings-item">
              <strong className="account-bookings-vehicle">{formatBookingVehicleName(booking)}</strong>
              <span className="auth-copy account-bookings-date">
                {toDate(booking.start_date)} – {toDate(booking.end_date)}
              </span>
              <span className="auth-copy account-bookings-meta">
                Status: {booking.status} · Payment: {booking.payment_status}
              </span>
              {actionKind === "cancel" ? (
                <button
                  type="button"
                  className="auth-primary account-bookings-action"
                  disabled={isPending}
                  onClick={() => cancelPendingBooking(booking.id)}
                >
                  Cancel booking
                </button>
              ) : null}
              {actionKind === "request" ? (
                <div className="account-bookings-request">
                  <label className="booking-field">
                    <span>Reason (optional)</span>
                    <textarea
                      rows={2}
                      value={cancelReasonById[booking.id] ?? ""}
                      onChange={(e) =>
                        setCancelReasonById((prev) => ({
                          ...prev,
                          [booking.id]: e.target.value,
                        }))
                      }
                      placeholder="Tell us why you need to cancel"
                      disabled={isPending}
                    />
                  </label>
                  <button
                    type="button"
                    className="hero-cta-ghost account-bookings-action-secondary"
                    disabled={isPending}
                    onClick={() => requestCancellation(booking.id)}
                  >
                    Request cancellation
                  </button>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
