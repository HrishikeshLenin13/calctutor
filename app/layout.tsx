import type { Metadata } from "next";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CalcTutor — Interactive TI-84 Plus CE Tutor & Study Calculator",
  description: "Learn how to use your TI-84 Plus CE for algebra, calculus, statistics, graphing, and standardized tests with interactive keypress step-by-step guidance.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteNav />
        {children}
        <footer className="site-footer">
          <div className="footer-inner">
            <Link className="brand" href="/">
              <span className="brand-dot">●</span>
              <span>CalcTutor</span>
            </Link>
            <p>
              CalcTutor is an independent educational tool built for studying TI-84 Plus CE calculator workflows.
              It is not affiliated with, endorsed by, or sponsored by Texas Instruments Incorporated.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
