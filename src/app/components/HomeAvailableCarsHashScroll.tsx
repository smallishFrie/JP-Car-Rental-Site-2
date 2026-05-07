"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";
import { AVAILABLE_CARS_HEADER_ID, scrollToAvailableCarsHeader } from "@/lib/scrollToAvailableCars";

export default function HomeAvailableCarsHashScroll() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (pathname !== "/") {
      return;
    }
    const apply = () => {
      if (window.location.hash !== `#${AVAILABLE_CARS_HEADER_ID}`) {
        return;
      }
      scrollToAvailableCarsHeader({ behavior: "auto", variant: "hash" });
    };

    apply();
    const id = window.requestAnimationFrame(() => window.requestAnimationFrame(apply));
    const late = window.setTimeout(apply, 120);
    return () => {
      window.cancelAnimationFrame(id);
      window.clearTimeout(late);
    };
  }, [pathname]);

  return null;
}
