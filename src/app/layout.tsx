import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import LayoutChrome from "./components/LayoutChrome";
import "./globals.css";

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const displayFont = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "JP Car Rental",
    template: "%s · JP Car Rental",
  },
  description:
    "Book a premium rental car in minutes. Cinematic browsing, clear rates, and confident pickup scheduling.",
  openGraph: {
    title: "JP Car Rental",
    description:
      "Premium car rental experience with bold editorial design and frictionless booking.",
    type: "website",
    siteName: "JP Car Rental",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LayoutChrome>{children}</LayoutChrome>
      </body>
    </html>
  );
}
