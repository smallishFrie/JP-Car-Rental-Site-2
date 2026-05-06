import { notFound } from "next/navigation";
import CheckoutClient from "./CheckoutClient";
import { getCarById } from "@/lib/cars";
import type { BookingRecord } from "@/lib/booking-model";
import { createClient } from "@/lib/supabase/server";

type CheckoutPageProps = {
  params: Promise<{ bookingId: string }>;
};

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { bookingId } = await params;
  const id = String(bookingId ?? "").trim();
  if (!id) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: booking } = await supabase.from("bookings").select("*").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!booking) notFound();

  const row = booking as BookingRecord;
  const car = row.car_id ? await getCarById(row.car_id) : null;
  const carName = car?.name ?? row.car_display_name?.trim() ?? "Vehicle";

  return (
    <main className="car-page-main">
      <div className="car-page-shell">
        <CheckoutClient
          bookingId={id}
          carName={carName}
          startDate={String(row.start_date)}
          endDate={String(row.end_date)}
          totalPrice={Number(row.total_price)}
          customerName={String(row.customer_name)}
          customerEmail={String(row.customer_email ?? "") || null}
        />
      </div>
    </main>
  );
}
