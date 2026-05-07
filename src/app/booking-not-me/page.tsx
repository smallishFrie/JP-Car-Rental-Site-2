import Link from "next/link";
import BookingNotMeClient from "@/app/booking-not-me/BookingNotMeClient";

type PageProps = {
  searchParams: Promise<{ t?: string }>;
};

export default async function BookingNotMePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const token = String(sp.t ?? "").trim();

  return (
    <main className="car-page-main">
      <div className="car-page-shell">
        {token ? (
          <BookingNotMeClient token={token} />
        ) : (
          <section className="auth-panel">
            <h1 className="display-heading">Link not valid</h1>
            <p className="auth-copy">This page needs a secure link from your email. If something looks wrong, contact us from our website.</p>
            <p className="auth-link-row">
              <Link href="/">← Back to home</Link>
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
