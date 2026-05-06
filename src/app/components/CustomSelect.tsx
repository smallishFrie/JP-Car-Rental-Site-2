"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";

export type CustomSelectOption = {
  value: string;
  label: ReactNode;
};

type CustomSelectProps = {
  options: CustomSelectOption[];
  value: string;
  onChange: (value: string) => void;
  optionsAriaLabel: string;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
};

export default function CustomSelect({
  options,
  value,
  onChange,
  optionsAriaLabel,
  placeholder = "Select",
  className,
  triggerClassName,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const fieldRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();
  const uid = useId();
  const listId = `${uid}-options`;

  const selectedLabel = useMemo(() => {
    const selected = options.find((option) => option.value === value);
    return selected?.label ?? placeholder;
  }, [options, placeholder, value]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!fieldRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  return (
    <div className={`custom-select-field${className ? ` ${className}` : ""}`} ref={fieldRef}>
      <button
        type="button"
        ref={triggerRef}
        className={`custom-select-trigger${triggerClassName ? ` ${triggerClassName}` : ""}`}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{selectedLabel}</span>
        <span className={`custom-select-chevron${open ? " custom-select-chevron-open" : ""}`} aria-hidden>
          ▾
        </span>
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            className="custom-select-dropdown"
            id={listId}
            role="listbox"
            aria-label={optionsAriaLabel}
            initial={reduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === value}
                className={`custom-select-option${option.value === value ? " custom-select-option-active" : ""}`}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
