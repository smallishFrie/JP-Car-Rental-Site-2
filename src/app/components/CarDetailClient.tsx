"use client";

import Image from "next/image";
import { DayPicker, type DateRange } from "react-day-picker";
import { useEffect, useMemo, useState, useTransition } from "react";
import { getCountries, getCountryCallingCode, type CountryCode } from "libphonenumber-js";
import * as FlagIcons from "country-flag-icons/react/3x2";
import type { Car } from "@/app/data/cars";
import { beginCheckoutAction } from "@/app/cars/[id]/actions";
import CarSpecsRow from "./CarSpecsRow";
import CustomSelect from "./CustomSelect";

type CarDetailClientProps = {
  car: Car;
};

const dayRateFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

function differenceInDaysInclusive(range: DateRange | undefined) {
  if (!range?.from || !range.to) return 0;
  const start = new Date(range.from.getFullYear(), range.from.getMonth(), range.from.getDate()).getTime();
  const end = new Date(range.to.getFullYear(), range.to.getMonth(), range.to.getDate()).getTime();
  const days = Math.floor((end - start) / 86400000) + 1;
  return Math.max(0, days);
}

function atMidnight(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function normalizeRange(from: Date, to: Date): DateRange {
  const start = atMidnight(from);
  const end = atMidnight(to);
  return start <= end ? { from: start, to: end } : { from: end, to: start };
}

type EndpointEdit = "start" | "end" | null;

export default function CarDetailClient({ car }: CarDetailClientProps) {
  const [range, setRange] = useState<DateRange | undefined>();
  const [pendingEdit, setPendingEdit] = useState<EndpointEdit>(null);
  const [previewDate, setPreviewDate] = useState<Date | null>(null);
  const [blockedRangeFeedback, setBlockedRangeFeedback] = useState(false);
  const [pickupLocation, setPickupLocation] = useState("JP Main Office");
  const [dropoffLocation, setDropoffLocation] = useState("JP Main Office");
  const [customerName, setCustomerName] = useState("");
  const [phoneCountryIso, setPhoneCountryIso] = useState<CountryCode>("PH");
  const [customerPhone, setCustomerPhone] = useState("");
  const [driverLicenseNumber, setDriverLicenseNumber] = useState("");
  const [driverNotes, setDriverNotes] = useState("");
  const [feedback, setFeedback] = useState("");
  const [bookedRanges, setBookedRanges] = useState<Array<{ from: Date; to: Date }>>([]);
  const [isPending, startTransition] = useTransition();
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);
  const endMonth = useMemo(() => new Date(today.getFullYear() + 1, today.getMonth(), 1), [today]);
  const galleryImages = useMemo(() => {
    if (car.images.length > 0) return car.images;
    return [car.cardImage];
  }, [car.cardImage, car.images]);
  const phoneCountries = useMemo(() => getCountries(), []);

  const days = differenceInDaysInclusive(range);
  const total = days > 0 ? days * car.dayRate : 0;
  const phoneDialCode = useMemo(() => {
    try {
      return `+${getCountryCallingCode(phoneCountryIso)}`;
    } catch {
      return "+";
    }
  }, [phoneCountryIso]);
  const locationOptions = useMemo(
    () => [
      { value: "JP Main Office", label: "JP Main Office" },
      { value: "Airport Terminal", label: "Airport Terminal" },
      { value: "City Drop Point", label: "City Drop Point" },
    ],
    [],
  );
  const phoneCountryOptions = useMemo(() => {
    const options = phoneCountries.map((iso) => {
      const dialCode = `+${getCountryCallingCode(iso)}`;
      const Flag = (FlagIcons as Record<string, React.ComponentType<{ title?: string; className?: string }>>)[iso];
      return {
        value: iso,
        sortKey: dialCode,
        label: (
          <span className="phone-country-option">
            {Flag ? <Flag title={iso} className="phone-country-flag" /> : null}
            <span className="phone-country-dial">{dialCode}</span>
          </span>
        ),
      };
    });
    options.sort((a, b) => a.sortKey.localeCompare(b.sortKey, "en", { sensitivity: "base" }));
    const phIndex = options.findIndex((option) => option.value === "PH");
    if (phIndex > 0) {
      const [ph] = options.splice(phIndex, 1);
      options.unshift(ph);
    }
    return options.map((option) => ({
      value: option.value,
      label: option.label,
    }));
  }, [phoneCountries]);

  const summary = useMemo(() => {
    if (!range?.from || !range.to) return "Pickup and return dates";
    return `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`;
  }, [range]);

  const hasBlockedDatesInRange = (nextRange: DateRange) => {
    if (!nextRange.from || !nextRange.to) return false;
    const start = atMidnight(nextRange.from).getTime();
    const end = atMidnight(nextRange.to).getTime();
    const dayMs = 86400000;
    for (let current = start; current <= end; current += dayMs) {
      const day = new Date(current);
      if (day < today) return true;
      const isBooked = bookedRanges.some((booked) => {
        const from = atMidnight(booked.from).getTime();
        const to = atMidnight(booked.to).getTime();
        return current >= from && current <= to;
      });
      if (isBooked) return true;
    }
    return false;
  };

  // Range that gets displayed in the calendar. While the user is choosing a
  // new endpoint, this previews what their final selection would look like as
  // they hover, without committing it to state until they actually click.
  const displayedRange = useMemo<DateRange | undefined>(() => {
    if (!range?.from || !previewDate) return range;
    if (pendingEdit === "start" && range.to) {
      return normalizeRange(previewDate, range.to);
    }
    if (pendingEdit === "end") {
      return normalizeRange(range.from, previewDate);
    }
    if (!pendingEdit && !range.to) {
      return normalizeRange(range.from, previewDate);
    }
    return range;
  }, [range, pendingEdit, previewDate]);

  const clearFeedback = () => {
    setBlockedRangeFeedback(false);
    if (feedback) setFeedback("");
  };

  function handleDayClick(day: Date, modifiers: Record<string, boolean | undefined>) {
    if (modifiers.disabled) return;
    const target = atMidnight(day);
    const targetTime = target.getTime();
    setPreviewDate(null);

    // Adjusting an existing endpoint
    if (range?.from && range.to && pendingEdit) {
      const candidate =
        pendingEdit === "start" ? normalizeRange(target, range.to) : normalizeRange(range.from, target);
      if (hasBlockedDatesInRange(candidate)) {
        setBlockedRangeFeedback(true);
        return;
      }
      setRange(candidate);
      setPendingEdit(null);
      clearFeedback();
      return;
    }

    // Full range exists, no pending edit yet — clicking start/end arms that endpoint
    if (range?.from && range.to) {
      const fromTime = atMidnight(range.from).getTime();
      const toTime = atMidnight(range.to).getTime();
      if (targetTime === fromTime) {
        setPendingEdit("start");
        clearFeedback();
        return;
      }
      if (targetTime === toTime) {
        setPendingEdit("end");
        clearFeedback();
        return;
      }
      // Click outside the existing range — start a fresh selection
      setRange({ from: target, to: undefined });
      setPendingEdit(null);
      clearFeedback();
      return;
    }

    // Building a brand new range
    if (!range?.from) {
      setRange({ from: target, to: undefined });
      clearFeedback();
      return;
    }

    // We have `from` but no `to` — close out the range
    const fromTime = atMidnight(range.from).getTime();
    if (targetTime === fromTime) {
      setRange({ from: target, to: target });
      clearFeedback();
      return;
    }
    const candidate = normalizeRange(range.from, target);
    if (hasBlockedDatesInRange(candidate)) {
      setBlockedRangeFeedback(true);
      return;
    }
    setRange(candidate);
    clearFeedback();
  }

  function handleDayMouseEnter(day: Date, modifiers: Record<string, boolean | undefined>) {
    if (modifiers.disabled) {
      setPreviewDate(null);
      return;
    }
    if (!pendingEdit && range?.from && !range.to) {
      // Preview the range we'd make if the user clicks this day next.
      setPreviewDate(atMidnight(day));
      return;
    }
    if (pendingEdit) {
      setPreviewDate(atMidnight(day));
      return;
    }
    setPreviewDate(null);
  }

  function handleCalendarMouseLeave() {
    setPreviewDate(null);
  }

  function clearSelection() {
    setRange(undefined);
    setPendingEdit(null);
    setPreviewDate(null);
    setBlockedRangeFeedback(false);
  }

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const response = await fetch(`/api/cars/${car.id}/booked-dates`, { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as { ranges?: Array<{ startDate: string; endDate: string }> };
        if (!active) return;
        const ranges = (payload.ranges ?? [])
          .map((item) => {
            const from = new Date(item.startDate);
            const to = new Date(item.endDate);
            return Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) ? null : { from, to };
          })
          .filter((item): item is { from: Date; to: Date } => item !== null);
        setBookedRanges(ranges);
      } catch {
        // Ignore API errors in client booking UI.
      }
    })();
    return () => {
      active = false;
    };
  }, [car.id]);

  function handleProceed() {
    if (!range?.from || !range.to || days <= 0) {
      setFeedback("Please select a valid date range.");
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      setFeedback("Please complete all required booking details.");
      return;
    }
    const selectedFrom = range.from;

    startTransition(() => {
      void (async () => {
        const startDate = `${selectedFrom.getFullYear()}-${String(selectedFrom.getMonth() + 1).padStart(2, "0")}-${String(
          selectedFrom.getDate(),
        ).padStart(2, "0")}`;
        const formData = new FormData();
        formData.set("carId", car.id);
        formData.set("startDate", startDate);
        formData.set("rentalDays", String(days));
        formData.set("customerName", customerName);
        formData.set("customerPhone", `${phoneDialCode} ${customerPhone}`.trim());
        formData.set("pickupLocation", pickupLocation);
        formData.set("driverNotes", `Drop-off: ${dropoffLocation}${driverNotes.trim() ? ` | ${driverNotes.trim()}` : ""}`);
        if (driverLicenseNumber.trim()) {
          formData.set("driverLicenseNumber", driverLicenseNumber.trim());
        }
        const result = await beginCheckoutAction(formData);
        if (!result.ok) {
          setFeedback(result.message);
          if (result.redirectTo) window.location.href = result.redirectTo;
          return;
        }
        window.location.href = result.redirectTo;
      })();
    });
  }

  return (
    <div className="car-detail-page">
      <section className="car-detail-content">
        <article className="car-detail-main-column">
          <header className="car-detail-description">
            <p className="car-detail-eyebrow">Premium selection</p>
            <h1>{car.name}</h1>
            <p>{car.tagline}</p>
            <CarSpecsRow category={car.category} passengerCapacity={car.passengerCapacity} />
            <p>{car.description}</p>
            <div className="car-overview-grid">
              <p>
                <span>Transmission</span>
                <strong>{car.category}</strong>
              </p>
              <p>
                <span>Seats</span>
                <strong>{car.passengerCapacity ?? "N/A"} passengers</strong>
              </p>
              <p>
                <span>Daily rate</span>
                <strong>{dayRateFormatter.format(car.dayRate)}</strong>
              </p>
            </div>
          </header>

          <div className="car-detail-editorial-gallery">
            <div className="car-detail-gallery-stack" aria-label="Vehicle image gallery">
              {galleryImages.map((image, index) => (
                <div key={`${image}-${index}`} className="car-detail-stack-image">
                  <Image src={image} alt={`${car.name} gallery ${index + 1}`} width={1200} height={760} />
                </div>
              ))}
            </div>
          </div>
        </article>

        <aside className="booking-glass-panel" aria-label="Booking panel">
          <h2>Book this vehicle</h2>
          <p className="booking-subline">{summary}</p>

          <label className="booking-field">
            <span>Pickup location</span>
            <CustomSelect
              options={locationOptions}
              value={pickupLocation}
              onChange={setPickupLocation}
              optionsAriaLabel="Pickup locations"
              triggerClassName="booking-field-control"
            />
          </label>

          <div
            className="booking-calendar-shell"
            onMouseLeave={handleCalendarMouseLeave}
          >
            <DayPicker
              mode="range"
              selected={displayedRange}
              onSelect={() => {}}
              onDayClick={handleDayClick}
              onDayMouseEnter={handleDayMouseEnter}
              numberOfMonths={1}
              captionLayout="label"
              startMonth={today}
              endMonth={endMonth}
              disabled={[{ before: today }, ...bookedRanges]}
              className={[
                "bespoke-daypicker",
                pendingEdit === "start" ? "is-editing-start" : "",
                pendingEdit === "end" ? "is-editing-end" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            />
            <div className="booking-calendar-footer">
              <p className="booking-calendar-hint" aria-live="polite">
                {blockedRangeFeedback
                  ? "That range overlaps unavailable dates. Pick another day."
                  : pendingEdit === "start"
                    ? "Click any date to move your pickup."
                    : pendingEdit === "end"
                      ? "Click any date to move your return."
                      : range?.from && !range.to
                        ? "Now click your return date."
                        : range?.from && range.to
                          ? "Click the pickup or return date to move it."
                          : "Click your pickup date to begin."}
              </p>
              {range?.from ? (
                <button
                  type="button"
                  className="booking-calendar-clear"
                  onClick={clearSelection}
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>

          <label className="booking-field">
            <span>Full name</span>
            <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} />
          </label>

          <label className="booking-field">
            <span>Phone number</span>
            <div className="booking-phone-input-row">
              <CustomSelect
                options={phoneCountryOptions}
                value={phoneCountryIso}
                onChange={(value) => {
                  if ((phoneCountries as readonly string[]).includes(value)) {
                    setPhoneCountryIso(value as CountryCode);
                  }
                }}
                optionsAriaLabel="Phone country code"
                className="custom-select--phone-country"
                triggerClassName="booking-field-control"
              />
              <input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} />
            </div>
          </label>

          <label className="booking-field">
            <span>Drop-off location</span>
            <CustomSelect
              options={locationOptions}
              value={dropoffLocation}
              onChange={setDropoffLocation}
              optionsAriaLabel="Drop-off locations"
              triggerClassName="booking-field-control"
            />
          </label>

          <label className="booking-field">
            <span>Driver license no. (optional)</span>
            <input value={driverLicenseNumber} onChange={(event) => setDriverLicenseNumber(event.target.value)} />
          </label>

          <label className="booking-field">
            <span>Special requests</span>
            <textarea value={driverNotes} onChange={(event) => setDriverNotes(event.target.value)} rows={3} />
          </label>

          <div className="booking-pricing">
            <p>
              <span>Daily rate</span>
              <strong>{dayRateFormatter.format(car.dayRate)}</strong>
            </p>
            <p>
              <span>Selected days</span>
              <strong>{days || "-"}</strong>
            </p>
            <p>
              <span>Total</span>
              <strong>{days > 0 ? dayRateFormatter.format(total) : "--"}</strong>
            </p>
          </div>

          <button type="button" className="booking-cta" disabled={days === 0 || isPending} onClick={handleProceed}>
            {isPending ? "Preparing checkout..." : "Proceed to checkout"}
          </button>
          {feedback ? <p className="auth-message">{feedback}</p> : null}
        </aside>
      </section>
    </div>
  );
}
