"use client";

import { usePathname } from "next/navigation";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

type LayoutChromeProps = {
  children: React.ReactNode;
};

export default function LayoutChrome({ children }: LayoutChromeProps) {
  const pathname = usePathname();
  const showChrome = pathname === "/";

  return (
    <>
      {showChrome ? <SiteHeader /> : null}
      <div className="app-main">{children}</div>
      {showChrome ? <SiteFooter /> : null}
    </>
  );
}
