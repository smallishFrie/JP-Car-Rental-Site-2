import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { BookingRecord } from "@/lib/booking-model";

type PageProps = {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<{ outcome?: string }>;
};

export default async function CheckoutResultPage({ params, searchParams }: PageProps) {
  const { bookingId } = await params;
  const id = String(bookingId ?? "").trim();
  if (!id) notFound();

  const { outcome } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: booking } = await supabase.from("bookings").select("*").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!booking) notFound();
  const row = booking as BookingRecord;

  return (
    <main className="car-page-main">
      <div className="car-page-shell">
        <section className="auth-panel">
          <h1>{outcome === "success" ? "Payment successful" : "Checkout update"}</h1>
          <p className="auth-copy">Booking #{row.id}</p>
          <p className="auth-message">
            Status: <strong>{row.payment_status}</strong>
          </p>
          <p className="auth-link-row">
            <Link href="/account/bookings">Go to my bookings</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
