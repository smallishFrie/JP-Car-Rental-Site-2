"use client";

import { usePathname } from "next/navigation";
import type { SiteHeaderSession } from "@/types/site-header-session";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

type LayoutChromeProps = {
  children: React.ReactNode;
  headerSession: SiteHeaderSession;
};

export default function LayoutChrome({ children, headerSession }: LayoutChromeProps) {
  const pathname = usePathname();
  const showChrome =
    (pathname === "/" ||
      pathname.startsWith("/cars") ||
      pathname.startsWith("/account") ||
      pathname.startsWith("/auth") ||
      pathname.startsWith("/terms") ||
      pathname.startsWith("/privacy") ||
      pathname.startsWith("/booking-not-me")) &&
    !pathname.startsWith("/checkout") &&
    !pathname.startsWith("/admin");

  return (
    <>
      {showChrome ? <SiteHeader signedIn={headerSession.signedIn} isAdmin={headerSession.isAdmin} /> : null}
      <div className="app-main">{children}</div>
      {showChrome ? <SiteFooter signedIn={headerSession.signedIn} /> : null}
    </>
  );
}
