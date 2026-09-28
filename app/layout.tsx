import type { Metadata } from "next";
import { DM_Mono, Inter } from "next/font/google";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SkipLink } from "@/components/layout/SkipLink";
import "./globals.css";

/*
 * The typefaces science.nasa.gov uses, both open source (SIL OFL).
 * next/font downloads them at build time and serves them from this origin,
 * so visitors never contact Google and the CSP keeps `font-src 'self'`.
 * It also sizes the fallback font to match, so text doesn't shift on load.
 */
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-dm-mono" });

export const metadata: Metadata = {
  title: {
    default: "APOD Explorer",
    template: "%s | APOD Explorer",
  },
  description: "Browse NASA's Astronomy Picture of the Day from the past year.",
};

const MAIN_ID = "main";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${dmMono.variable}`}>
      <body className="flex min-h-screen flex-col bg-surface font-sans text-neutral-100 antialiased">
        <SkipLink targetId={MAIN_ID} />
        <SiteHeader />
        <main id={MAIN_ID} tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
