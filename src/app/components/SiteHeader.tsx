"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

type SiteHeaderProps = {
  signedIn: boolean;
  isAdmin: boolean;
};

export default function SiteHeader({ signedIn, isAdmin }: SiteHeaderProps) {
  const [visible, setVisible] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 70);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      className={`site-header${visible ? " site-header-scrolled" : " site-header-hidden"}`}
      initial={false}
      animate={
        reduceMotion
          ? { y: visible ? 0 : -120, opacity: visible ? 1 : 0 }
          : {
              y: visible ? 0 : -120,
              opacity: visible ? 1 : 0,
              transition: {
                duration: visible ? 0.62 : 0.35,
                ease: [0.22, 1, 0.36, 1],
              },
            }
      }
    >
      <div className="site-header-inner">
        <div className="site-header-left">
          <Link href="/" className="site-brand">
            JP Car Rental
          </Link>
        </div>

        <nav className="site-nav site-nav-centered" aria-label="Primary">
          <Link href="/">Home</Link>
          <Link href="/#cars">Fleet</Link>
          <Link href="/terms">Terms</Link>
          {signedIn ? (
            <Link href="/account">Account</Link>
          ) : null}
          {isAdmin ? (
            <Link href="/admin">Admin</Link>
          ) : null}
        </nav>

        <div className="site-auth-links site-header-right">
          {!signedIn ? (
            <>
              <Link href="/auth/sign-in">Sign in</Link>
              <Link href="/auth/create-account" className="site-vip-link">
                Create account
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </motion.header>
  );
}
