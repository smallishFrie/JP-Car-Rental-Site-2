"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { BookingRecord, RefundStatus } from "@/lib/booking-model";
import { formatBookingVehicleName } from "@/lib/booking-model";
import { cleanupExpiredSessionsAction, confirmCancellationAction } from "@/app/admin/actions";

type BookingWithCar = BookingRecord & { car: { id: string; name: string; category: string } | null };

const filterStatuses = ["pending", "upcoming", "active", "cancel_requested", "canceled"] as const;

const filterLabels: Record<(typeof filterStatuses)[number], string> = {
  pending: "Pending",
  upcoming: "Upcoming",
  active: "Active",
  cancel_requested: "Cancellation requested",
  canceled: "Canceled",
};

function deriveStatus(booking: BookingWithCar): (typeof filterStatuses)[number] | "completed" {
  if (booking.status === "canceled") return "canceled";
  if (booking.status === "cancel_requested") return "cancel_requested";
  if (booking.payment_status !== "paid") return "pending";

  const today = new Date().toISOString().slice(0, 10);
  if (today < booking.start_date) return "upcoming";
  if (today > booking.end_date) return "completed";
  return "active";
}

function toDate(value: string) {
  return new Date(value).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

const pipelineStatusLabels: Record<string, string> = {
  pending: "Pending",
  upcoming: "Upcoming",
  active: "Active",
  completed: "Completed",
  cancel_requested: "Cancellation requested",
  canceled: "Canceled",
};

function formatPipelineStatus(booking: BookingWithCar) {
  const status = deriveStatus(booking);
  return pipelineStatusLabels[status] ?? status;
}

function effectiveRefundStatus(booking: BookingWithCar): RefundStatus {
  const status = booking.refund_status;
  if (status === "pending" || status === "succeeded" || status === "failed" || status === "not_applicable") {
    return status;
  }
  return "none";
}

function refundStatusLabel(status: RefundStatus): string {
  switch (status) {
    case "pending":
      return "Refund pending";
    case "succeeded":
      return "Refund succeeded";
    case "failed":
      return "Refund failed";
    case "not_applicable":
      return "No refund for this cancellation";
    default:
      return "-";
  }
}

function suggestedRefundPhp(booking: BookingWithCar): number {
  if (booking.payment_status !== "paid" || !booking.payment_reference) return 0;

  const start = new Date(`${booking.start_date}T00:00:00.000Z`).getTime();
  if (Number.isNaN(start)) return 0;
  return start - Date.now() > 48 * 60 * 60 * 1000 ? Number(booking.total_price) : 0;
}

function CancellationConfirmPanel(props: {
  booking: BookingWithCar;
  disabled: boolean;
  onConfirm: (id: string, refundAmountPhp: number) => void;
}) {
  const { booking, disabled, onConfirm } = props;
  const defaultAmount = suggestedRefundPhp(booking);
  const [amountStr, setAmountStr] = useState(() => String(defaultAmount));

  return (
    <div className="admin-delete-confirm">
      <p>
        Enter a refund amount if needed, then confirm cancellation. Set to <strong>0</strong> if no refund applies.
      </p>
      {booking.cancellation_reason ? (
        <p>
          <strong>Customer reason:</strong> {booking.cancellation_reason}
        </p>
      ) : null}
      <label className="admin-refund-amount-label">
        Refund amount (PHP)
        <input
          type="number"
          min={0}
          step={0.01}
          value={amountStr}
          onChange={(event) => setAmountStr(event.target.value)}
          disabled={disabled}
          aria-label="Refund amount in PHP"
        />
      </label>
      <button
        type="button"
        className="admin-danger-button"
        disabled={disabled}
        onClick={() => {
          const parsed = Number(String(amountStr).trim());
          const amount = Number.isFinite(parsed) ? Number(parsed.toFixed(2)) : NaN;
          if (!Number.isFinite(amount) || amount < 0) return;
          onConfirm(booking.id, amount);
        }}
      >
        Confirm cancellation
      </button>
    </div>
  );
}

export default function AdminBookingManager({ initialBookings }: { initialBookings: BookingWithCar[] }) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<(typeof filterStatuses)[number]>("pending");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  const filteredBookings = useMemo(
    () =>
      initialBookings
        .filter((booking) => deriveStatus(booking) === selectedStatus)
        .sort((a, b) => a.start_date.localeCompare(b.start_date)),
    [initialBookings, selectedStatus],
  );

  function refreshAllBookings() {
    startTransition(() => {
      router.refresh();
      setMessage("Refreshing bookings...");
    });
  }

  function cleanupExpiredSessions() {
    startTransition(async () => {
      try {
        const result = await cleanupExpiredSessionsAction();
        setMessage(`Expired session cleanup finished. ${result.cleaned} booking(s) released.`);
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Failed to clean up expired sessions.");
      }
    });
  }

  function confirmCancellation(id: string, refundAmountPhp: number) {
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.set("id", id);
        fd.set("refundAmountPhp", String(refundAmountPhp));
        await confirmCancellationAction(fd);
        setMessage("Cancellation confirmed.");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Failed to confirm cancellation.");
      }
    });
  }

  return (
    <section className="admin-booking-shell">
      <h2>Bookings</h2>
      <p className="admin-empty">Pipeline is auto-computed using payment + booking dates.</p>
      <div className="admin-toolbar-actions">
        <button type="button" className="admin-tool-button" onClick={refreshAllBookings} disabled={isPending}>
          Refresh bookings
        </button>
        <button type="button" className="admin-tool-button" onClick={cleanupExpiredSessions} disabled={isPending}>
          Clean up expired sessions
        </button>
      </div>

      <section className="admin-card">
        <h3 className="admin-booking-manage-heading">Booking management</h3>
        <div className="booking-status-filters">
          {filterStatuses.map((status) => (
            <button
              key={status}
              type="button"
              className="admin-cancel-button"
              aria-current={selectedStatus === status ? "true" : undefined}
              onClick={() => setSelectedStatus(status)}
            >
              {filterLabels[status]}
            </button>
          ))}
        </div>
        {filteredBookings.length ? (
          <div className="booking-detail-grid">
            {filteredBookings.map((booking) => {
              const refundStatus = effectiveRefundStatus(booking);
              return (
                <article key={booking.id} className="booking-admin-item">
                  <p>
                    <strong>Status:</strong> {formatPipelineStatus(booking)}
                  </p>
                  <p>
                    <strong>Customer:</strong> {booking.customer_name}
                  </p>
                  <p>
                    <strong>Phone:</strong> {booking.customer_phone}
                  </p>
                  <p>
                    <strong>Email:</strong> {booking.customer_email || "N/A"}
                  </p>
                  <p>
                    <strong>Car:</strong> {formatBookingVehicleName(booking)}
                  </p>
                  <p>
                    <strong>Schedule:</strong> {toDate(booking.start_date)} - {toDate(booking.end_date)}
                  </p>
                  <p>
                    <strong>Payment:</strong> {booking.payment_status} ({booking.payment_reference || "No ref yet"})
                  </p>
                  {booking.driver_notes?.trim() ? (
                    <p>
                      <strong>Driver notes:</strong> {booking.driver_notes.trim()}
                    </p>
                  ) : null}
                  {(selectedStatus === "cancel_requested" || selectedStatus === "canceled") && (
                    <p>
                      <strong>Refund status:</strong> {refundStatusLabel(refundStatus)}
                      {booking.refund_amount_php != null && booking.refund_amount_php > 0 ? (
                        <span> (amount: {Number(booking.refund_amount_php).toFixed(2)} PHP)</span>
                      ) : null}
                    </p>
                  )}
                  {selectedStatus === "cancel_requested" ? (
                    <CancellationConfirmPanel booking={booking} disabled={isPending} onConfirm={confirmCancellation} />
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : (
          <p className="admin-empty">No {filterLabels[selectedStatus].toLowerCase()} bookings right now.</p>
        )}
      </section>

      {message ? <p className="booking-feedback">{message}</p> : null}
    </section>
  );
}
