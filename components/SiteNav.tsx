"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function SiteNav() {
  const path = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
    document.body.classList.remove("menu-open");
  }, [path]);

  const toggleMenu = () => {
    setMenuOpen((prev) => {
      const next = !prev;
      if (next) {
        document.body.classList.add("menu-open");
      } else {
        document.body.classList.remove("menu-open");
      }
      return next;
    });
  };

  return (
    <header className="nav-shell">
      <nav className="nav">
        <Link href="/" className="brand">
          <span className="brand-dot">●</span>
          <span>CalcTutor</span>
          <span className="beta-pill">TI-84 CE</span>
        </Link>
        <div className="nav-links">
          <Link className={path === "/" ? "active" : ""} href="/">
            Home
          </Link>
          <Link className={path.startsWith("/learn") ? "active" : ""} href="/learn">
            Learn & Courses
          </Link>
          <Link className={path === "/calculator" ? "active" : ""} href="/calculator">
            Calculator Mode
          </Link>
          <Link className={path === "/reviews" ? "active" : ""} href="/reviews">
            Reviews
          </Link>
        </div>
        <Link href="/learn" className="nav-cta">
          Start Tutor <span>→</span>
        </Link>
        <button
          className="mobile-menu"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={toggleMenu}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>
    </header>
  );
}
