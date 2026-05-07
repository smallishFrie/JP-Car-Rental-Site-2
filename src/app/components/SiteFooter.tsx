import Link from "next/link";

type SiteFooterProps = {
  signedIn: boolean;
};

export default function SiteFooter({ signedIn }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <p className="site-footer-brand">JP CAR RENTAL</p>

        <div className="site-footer-grid">
          <div>
            <h2>Navigate</h2>
            <ul>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/#cars">Fleet</Link>
              </li>
              <li>
                <Link href="/cars/civic-sport">Book</Link>
              </li>
              {signedIn ? (
                <li>
                  <Link href="/account">Account</Link>
                </li>
              ) : null}
            </ul>
          </div>
          <div>
            <h2>Company</h2>
            <ul>
              <li>
                <Link href="/terms">Terms</Link>
              </li>
              <li>
                <Link href="/privacy">Privacy</Link>
              </li>
              <li>
                <a href="mailto:bookings@jpcarental.com">bookings@jpcarental.com</a>
              </li>
            </ul>
          </div>
          <div>
            <h2>Visit</h2>
            <ul>
              <li>JP Main Office</li>
              <li>Airport Terminal</li>
              <li>City Drop Point</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
