"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { signInWithEmail, signUpWithEmail } from "@/app/auth/actions";

type AuthFormCardProps = {
  mode: "sign-in" | "create-account";
  message?: string;
  safeReturnTo: string;
};

export default function AuthFormCard({ mode, message, safeReturnTo }: AuthFormCardProps) {
  const reduceMotion = useReducedMotion();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isCreate = mode === "create-account";
  const formAction = isCreate ? signUpWithEmail : signInWithEmail;
  const panelTitle = isCreate ? "Create account" : "Sign in";
  const panelCopy = isCreate
    ? "Set up your account to manage bookings and payments."
    : "Access your bookings and proceed to checkout.";
  const submitLabel = isCreate ? "Create account" : "Sign in";

  return (
    <main className="car-page-main auth-page-main">
      <div className="car-page-shell auth-page-shell">
        <div className="auth-page-centered">
          <p className="auth-back-link">
            <Link href={safeReturnTo}>Back to site</Link>
          </p>
          <motion.section
            className="auth-panel auth-panel-polished"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1>{panelTitle}</h1>
            <p className="auth-copy">{panelCopy}</p>
            {message ? <p className="auth-message">{message}</p> : null}

            <form action={formAction} className="auth-form-stack">
              <input type="hidden" name="returnPath" value={isCreate ? "/auth/create-account" : "/auth/sign-in"} />
              <input type="hidden" name="redirectTo" value={safeReturnTo} />
              <label>
                <span>Email</span>
                <input type="email" name="email" required />
              </label>

              <label>
                <span>Password</span>
                <div className="auth-password-shell">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    minLength={6}
                    autoComplete={isCreate ? "new-password" : "current-password"}
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>

              {isCreate ? (
                <label>
                  <span>Confirm password</span>
                  <div className="auth-password-shell">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setShowConfirmPassword((current) => !current)}
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </label>
              ) : null}

              <button type="submit" className="booking-cta">
                {submitLabel}
              </button>
            </form>

            <p className="auth-link-row">
              {isCreate ? "Already have an account? " : "New here? "}
              <Link href={isCreate ? `/auth/sign-in?returnTo=${encodeURIComponent(safeReturnTo)}` : `/auth/create-account?returnTo=${encodeURIComponent(safeReturnTo)}`}>
                {isCreate ? "Sign in" : "Create account"}
              </Link>
            </p>
          </motion.section>
        </div>
      </div>
    </main>
  );
}
