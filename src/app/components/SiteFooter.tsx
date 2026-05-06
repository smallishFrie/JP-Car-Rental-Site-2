import Link from "next/link";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export default async function SiteFooter() {
  const year = new Date().getFullYear();
  let isSignedIn = false;

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    isSignedIn = Boolean(data.user);
  }

  return (
    <footer className="site-footer" aria-label="Site footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <p className="site-footer-title">JP Car Rental</p>
          <p className="site-footer-tagline">Simple booking, clear rates, and cleaner trip management.</p>
        </div>

        <div className="site-footer-columns">
          <div className="site-footer-block">
            <p className="site-footer-heading">Browse</p>
            <ul className="site-footer-links">
              <li>
                <Link href="/#cars">Fleet</Link>
              </li>
              {!isSignedIn ? (
                <li>
                  <Link href="/auth/sign-in">Sign in</Link>
                </li>
              ) : null}
              <li>
                <Link href="/auth/create-account">Create account</Link>
              </li>
              <li>
                <Link href="/privacy-policy">Privacy policy</Link>
              </li>
              <li>
                <Link href="/terms-of-service">Terms of service</Link>
              </li>
            </ul>
          </div>

          <div className="site-footer-block">
            <p className="site-footer-heading">Schedule</p>
            <p className="site-footer-text">
              Monday to Saturday, 8:00 a.m. to 6:00 p.m. Sunday pickups are available by request and confirmed per booking.
            </p>
          </div>

          <div className="site-footer-block">
            <p className="site-footer-heading">Support</p>
            <p className="site-footer-text">
              Driver&apos;s license and policy requirements are reviewed during checkout before payment confirmation.
            </p>
            <p className="site-footer-text site-footer-note">Need help with an active booking? Open your account and submit an update request.</p>
          </div>
        </div>

        <p className="site-footer-copy">&copy; {year} JP Car Rental. All rights reserved.</p>
      </div>
    </footer>
  );
}
