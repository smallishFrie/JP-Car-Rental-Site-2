"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { attachPaymentReference } from "@/lib/bookings";
import { createXenditComponentsPaymentSession } from "@/lib/xendit";

type InitCheckoutComponentsResult =
  | { ok: true; nextUrl?: string; componentsSdkKey?: string }
  | { ok: false; message: string; redirectTo?: string };

export async function initCheckoutComponentsSessionAction(input: {
  bookingId: string;
  origin: string;
}): Promise<InitCheckoutComponentsResult> {
  try {
    const bookingId = String(input.bookingId ?? "").trim();
    const origin = String(input.origin ?? "").trim();
    if (!bookingId) throw new Error("Booking id is required.");

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return {
        ok: false,
        message: "Please sign in to continue.",
        redirectTo: `/auth/sign-in?returnTo=${encodeURIComponent(`/checkout/${bookingId}`)}`,
      };
    }

    const { data: booking, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .eq("user_id", user.id)
      .single();
    if (error || !booking) throw new Error(error?.message ?? "Booking not found.");

    if (String((booking as { payment_status?: string }).payment_status) === "paid") {
      return { ok: true, nextUrl: `/checkout/${bookingId}/result?outcome=success` };
    }

    const totalPrice = Number((booking as { total_price?: number }).total_price);
    if (!Number.isFinite(totalPrice) || totalPrice <= 0) throw new Error("Invalid booking price.");

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const requestedOrigin = origin || siteUrl;
    const normalizedOrigin = requestedOrigin.replace(/\/+$/, "");
    if (!normalizedOrigin.toLowerCase().startsWith("https://")) {
      return {
        ok: false,
        message: "Embedded checkout requires HTTPS. Please run on an HTTPS domain or tunnel.",
      };
    }

    const session = await createXenditComponentsPaymentSession({
      bookingId,
      amountPhp: totalPrice,
      customerName: String((booking as { customer_name?: string }).customer_name ?? ""),
      customerEmail: String((booking as { customer_email?: string | null }).customer_email ?? "") || undefined,
      customerPhone: String((booking as { customer_phone?: string }).customer_phone ?? "") || undefined,
      origins: [normalizedOrigin],
    });

    await attachPaymentReference(bookingId, session.paymentSessionId);
    await supabase
      .from("bookings")
      .update({
        payment_metadata: {
          ...((booking as { payment_metadata?: Record<string, unknown> | null }).payment_metadata ?? {}),
          components_session: session.raw,
        },
      })
      .eq("id", bookingId)
      .eq("user_id", user.id);

    revalidatePath(`/checkout/${bookingId}`);
    return { ok: true, componentsSdkKey: session.componentsSdkKey };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Failed to start payment." };
  }
}
