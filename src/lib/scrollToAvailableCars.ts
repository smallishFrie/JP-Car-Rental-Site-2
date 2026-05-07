export const AVAILABLE_CARS_HEADER_ID = "available-cars-header";

const BOOK_NOW_TOP_INSET_PX = 20;

const HASH_TOP_INSET_REM = 2;

function hashTopInsetPx(): number {
  const remPx = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  const rem = Number.isFinite(remPx) && remPx > 0 ? remPx : 16;
  return HASH_TOP_INSET_REM * rem;
}

export type ScrollToAvailableCarsVariant = "bookNow" | "hash";

export function scrollToAvailableCarsHeader(options?: {
  behavior?: ScrollBehavior;
  variant?: ScrollToAvailableCarsVariant;
}) {
  if (typeof document === "undefined") {
    return;
  }
  const carsHeader = document.getElementById(AVAILABLE_CARS_HEADER_ID);
  if (!(carsHeader instanceof HTMLElement)) {
    return;
  }
  const topInsetPx = options?.variant === "hash" ? hashTopInsetPx() : BOOK_NOW_TOP_INSET_PX;
  const targetTop = carsHeader.getBoundingClientRect().top + window.scrollY - topInsetPx;
  window.scrollTo({ top: Math.max(0, targetTop), behavior: options?.behavior ?? "smooth" });
}
