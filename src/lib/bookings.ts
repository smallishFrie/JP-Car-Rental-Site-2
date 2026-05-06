import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { BookingRecord, BookingStatus, RefundStatus } from "@/lib/booking-model";
import { computeDerivedStatus } from "@/lib/booking-model";

export type { BookingRecord, BookingStatus, RefundStatus } from "@/lib/booking-model";
export { computeDerivedStatus } from "@/lib/booking-model";

function toDateOnly(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) throw new Error("Invalid date value.");
  return parsed.toISOString().slice(0, 10);
}

export async function checkCarAvailability(carId: string, startDate: string, endDate: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("has_booking_overlap", {
    p_car_id: carId,
    p_start_date: toDateOnly(startDate),
    p_end_date: toDateOnly(endDate),
    p_exclude_booking_id: null,
  });
  if (error) throw new Error(error.message);
  return !Boolean(data);
}

export async function createPendingBooking(input: {
  userId: string;
  carId: string;
  carDisplayName: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  pickupLocation: string;
  driverLicenseNumber?: string;
  driverNotes?: string;
}): Promise<BookingRecord> {
  const supabase = await createClient();
  const payload = {
    user_id: input.userId,
    car_id: input.carId,
    car_display_name: input.carDisplayName.trim() || "Vehicle",
    start_date: toDateOnly(input.startDate),
    end_date: toDateOnly(input.endDate),
    total_price: input.totalPrice,
    status: "pending" as BookingStatus,
    customer_name: input.customerName.trim(),
    customer_phone: input.customerPhone.trim(),
    customer_email: input.customerEmail?.trim() || null,
    pickup_location: input.pickupLocation.trim(),
    driver_license_number: input.driverLicenseNumber?.trim() || null,
    driver_notes: input.driverNotes?.trim() || null,
    payment_provider: "xendit",
    payment_status: "unpaid",
  };

  const { data, error } = await supabase.from("bookings").insert(payload).select("*").single();
  if (error || !data) throw new Error(error?.message ?? "Failed to create booking.");
  return data as BookingRecord;
}

export async function attachPaymentReference(bookingId: string, paymentReference: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("bookings").update({ payment_reference: paymentReference }).eq("id", bookingId);
  if (error) throw new Error(error.message);
}

export async function setBookingPaid(input: {
  bookingId: string;
  paymentReference: string;
  paymentMetadata?: Record<string, unknown>;
}) {
  const supabase = createAdminClient();
  const { data: existing, error: fetchError } = await supabase.from("bookings").select("*").eq("id", input.bookingId).single();
  if (fetchError || !existing) throw new Error(fetchError?.message ?? "Booking not found.");

  const booking = existing as BookingRecord;
  const nextStatus = computeDerivedStatus({
    currentStatus: booking.status,
    paymentStatus: "paid",
    startDate: booking.start_date,
    endDate: booking.end_date,
  });

  const { data, error } = await supabase
    .from("bookings")
    .update({
      payment_status: "paid",
      payment_reference: input.paymentReference,
      payment_metadata: input.paymentMetadata ?? {},
      paid_at: new Date().toISOString(),
      status: nextStatus,
    })
    .eq("id", input.bookingId)
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to update booking payment.");
  return data as BookingRecord;
}

export async function syncDerivedStatusForBooking(bookingId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("bookings").select("*").eq("id", bookingId).single();
  if (error || !data) throw new Error(error?.message ?? "Booking not found.");

  const booking = data as BookingRecord;
  const nextStatus = computeDerivedStatus({
    currentStatus: booking.status,
    paymentStatus: booking.payment_status,
    startDate: booking.start_date,
    endDate: booking.end_date,
  });

  if (nextStatus === booking.status) {
    return booking;
  }

  const { data: updated, error: updateError } = await supabase
    .from("bookings")
    .update({ status: nextStatus })
    .eq("id", bookingId)
    .select("*")
    .single();

  if (updateError || !updated) throw new Error(updateError?.message ?? "Failed to sync booking status.");
  return updated as BookingRecord;
}

export async function syncStaleDerivedStatusesForAllBookings(): Promise<{ updated: number }> {
  const admin = createAdminClient();
  const { data: rows, error } = await admin.from("bookings").select("*").in("status", ["pending", "upcoming", "active"]);
  if (error) throw new Error(error.message);

  let updated = 0;
  for (const row of rows ?? []) {
    const booking = row as BookingRecord;
    const nextStatus = computeDerivedStatus({
      currentStatus: booking.status,
      paymentStatus: booking.payment_status,
      startDate: booking.start_date,
      endDate: booking.end_date,
    });

    if (nextStatus === booking.status) continue;

    const { data: updatedRow, error: updateError } = await admin
      .from("bookings")
      .update({ status: nextStatus })
      .eq("id", booking.id)
      .eq("status", booking.status)
      .select("id")
      .maybeSingle();
    if (updateError || !updatedRow) continue;
    updated += 1;
  }

  return { updated };
}

export async function listBookingsForAdmin() {
  await syncStaleDerivedStatusesForAllBookings();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*, car:cars(id,name,category)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Array<BookingRecord & { car: { id: string; name: string; category: string } | null }>;
}

export async function listBookingsForUser(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*, car:cars(id,name,category)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Array<BookingRecord & { car: { id: string; name: string; category: string } | null }>;
}

export async function cleanupExpiredPendingBookings() {
  const supabase = createAdminClient();
  const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const canceledAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "canceled", canceled_at: canceledAt, refund_status: "not_applicable" })
    .eq("status", "pending")
    .eq("payment_status", "unpaid")
    .lte("created_at", cutoff)
    .select("id");

  if (error) throw new Error(error.message);
  const rows = data ?? [];
  return { cleaned: rows.length, canceledIds: rows.map((row) => row.id) };
}

export async function confirmCancellationForAdmin(bookingId: string, refundAmountPhpInput: number) {
  const admin = createAdminClient();
  const amount = Number(Number(refundAmountPhpInput).toFixed(2));
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Refund amount must be a valid non-negative number.");
  }

  const { data: preRow, error: preErr } = await admin.from("bookings").select("*").eq("id", bookingId).maybeSingle();
  if (preErr) throw new Error(preErr.message);
  if (!preRow) throw new Error("Booking not found.");

  const pre = preRow as BookingRecord;
  if (pre.status === "canceled") return pre;
  if (pre.status !== "cancel_requested") throw new Error("Only cancel requested bookings can be confirmed.");
  if (amount > Number(pre.total_price)) throw new Error("Refund amount cannot exceed the booking total.");

  const refundStatus: RefundStatus = amount > 0 && pre.payment_status === "paid" ? "pending" : "not_applicable";
  const { data: updated, error } = await admin
    .from("bookings")
    .update({
      status: "canceled",
      canceled_at: new Date().toISOString(),
      refund_amount_php: amount,
      refund_status: refundStatus,
    })
    .eq("id", bookingId)
    .eq("status", "cancel_requested")
    .select("*")
    .single();

  if (error || !updated) throw new Error(error?.message ?? "Failed to confirm cancellation.");
  return updated as BookingRecord;
}
