"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteNav() {
  const path = usePathname();
  const follow = path === "/" || path.startsWith("/tutor");
  return (
    <header className="nav-shell">
      <nav className="nav">
        <Link href="/" className="brand"><span>CalcTutor</span></Link>
        <div className="nav-links">
          <Link className={follow ? "active" : ""} href="/">Follow along</Link>
          <Link className={path === "/calculator" ? "active" : ""} href="/calculator">Calculator</Link>
          <Link className={path === "/about" ? "active" : ""} href="/about">About</Link>
        </div>
        <button className="mobile-menu" aria-label="Open navigation" onClick={() => document.body.classList.toggle("menu-open")}>Menu</button>
      </nav>
    </header>
  );
}
