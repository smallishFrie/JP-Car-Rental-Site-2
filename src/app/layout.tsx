import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AppMotionShell from "@/app/components/AppMotionShell";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "JP Car Rental | Minimal Modern Booking",
    template: "%s | JP Car Rental",
  },
  description:
    "Minimal-modern car rental booking with transparent pricing, streamlined checkout, and clear trip management.",
  openGraph: {
    title: "JP Car Rental",
    description:
      "Smart and modern car rental booking with clear pricing and flexible pickup.",
    siteName: "JP Car Rental",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="app-body flex min-h-full flex-col">
        <AppMotionShell>{children}</AppMotionShell>
      </body>
    </html>
  );
}
