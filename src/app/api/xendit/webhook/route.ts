import { NextRequest, NextResponse } from "next/server";
import { setBookingPaid } from "@/lib/bookings";
import { verifyXenditWebhookToken } from "@/lib/xendit";

export async function POST(request: NextRequest) {
  const callbackToken = request.headers.get("x-callback-token");
  if (!verifyXenditWebhookToken(callbackToken)) {
    return NextResponse.json({ error: "Invalid webhook token." }, { status: 401 });
  }

  const raw = (await request.json()) as Record<string, unknown>;
  const eventName = String(raw.event ?? "");

  if (eventName === "payment.capture") {
    const data = (raw.data ?? {}) as Record<string, unknown>;
    const bookingId = String(data.reference_id ?? "").trim();
    const paymentReference = String(data.payment_request_id ?? data.payment_id ?? "").trim();
    if (!bookingId || !paymentReference) {
      return NextResponse.json({ error: "Missing booking/payment reference." }, { status: 400 });
    }
    await setBookingPaid({ bookingId, paymentReference, paymentMetadata: raw });
    return NextResponse.json({ ok: true });
  }

  if (eventName === "payment_session.completed") {
    const data = (raw.data ?? {}) as Record<string, unknown>;
    const bookingId = String(data.reference_id ?? "").trim();
    const paymentReference = String(data.payment_id ?? data.payment_session_id ?? "").trim();
    if (!bookingId || !paymentReference) {
      return NextResponse.json({ error: "Missing booking/payment reference." }, { status: 400 });
    }
    await setBookingPaid({ bookingId, paymentReference, paymentMetadata: raw });
    return NextResponse.json({ ok: true });
  }

  if (String(raw.status ?? "") === "PAID") {
    const bookingId = String(raw.external_id ?? "").trim();
    const paymentReference = String(raw.id ?? "").trim();
    if (!bookingId || !paymentReference) {
      return NextResponse.json({ error: "Missing booking/payment reference." }, { status: 400 });
    }
    await setBookingPaid({ bookingId, paymentReference, paymentMetadata: raw });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
