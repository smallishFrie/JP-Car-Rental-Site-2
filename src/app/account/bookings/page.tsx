import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listBookingsForUser } from "@/lib/bookings";

export default async function MyBookingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?returnTo=/account/bookings");
  }

  const bookings = await listBookingsForUser(user.id);

  return (
    <main className="car-page-main">
      <div className="car-page-shell">
        <section className="auth-panel" style={{ maxWidth: "100%" }}>
          <h1>My bookings</h1>
          {bookings.length === 0 ? (
            <p className="auth-copy">
              No bookings yet. <Link href="/#cars">Browse cars</Link>.
            </p>
          ) : (
            <div className="booking-pricing">
              {bookings.map((booking) => (
                <p key={booking.id}>
                  <span>
                    {booking.car?.name ?? booking.car_display_name ?? "Vehicle"} ({booking.start_date} - {booking.end_date})
                  </span>
                  <strong>{booking.status}</strong>
                </p>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
