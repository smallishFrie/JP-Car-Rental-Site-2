import Link from "next/link";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export default async function HomeContactStrip() {
  let isSignedIn = false;

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    isSignedIn = Boolean(data.user);
  }

  return (
    <section className="home-v2-contact" aria-labelledby="home-v2-contact-heading">
      <h2 className="home-v2-section-title" id="home-v2-contact-heading">
        Contact &amp; hours
      </h2>
      <div className="home-v2-contact-grid">
        <div className="home-v2-contact-card">
          <p className="home-v2-contact-label">Hours</p>
          <p className="home-v2-contact-body">
            Mon–Sat 8:00 a.m.–6:00 p.m. · Sunday by appointment. Pickup and return times are confirmed with each booking.
          </p>
        </div>
        <div className="home-v2-contact-card">
          <p className="home-v2-contact-label">After you book</p>
          <p className="home-v2-contact-body">
            Your confirmation email includes pickup instructions and the best way to reach us for that reservation.
          </p>
        </div>
        <div className="home-v2-contact-card">
          <p className="home-v2-contact-label">Account</p>
          <p className="home-v2-contact-body">Signed-in customers can review trips and messages in one place.</p>
          {!isSignedIn ? (
            <Link href="/auth/sign-in" className="home-v2-contact-link">
              Sign in
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
