"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function SiteNav() {
  const path = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const menuOpen = openPath === path;

  // Route changes can also come from browser history, so always clear the page lock.
  useEffect(() => {
    document.body.classList.remove("menu-open");
  }, [path]);

  function closeMenu() {
    setOpenPath(null);
    document.body.classList.remove("menu-open");
  }

  const toggleMenu = () => {
    const next = !menuOpen;
    setOpenPath(next ? path : null);
    document.body.classList.toggle("menu-open", next);
  };

  return (
    <header className="nav-shell">
      <nav className="nav">
        <Link href="/" className="brand" onClick={closeMenu}>
          <span className="brand-dot">●</span>
          <span>CalcTutor</span>
          <span className="beta-pill">TI-84 CE</span>
        </Link>
        <div className="nav-links" id="primary-navigation">
          <Link className={path === "/" ? "active" : ""} href="/" onClick={closeMenu}>
            Home
          </Link>
          <Link className={path.startsWith("/learn") ? "active" : ""} href="/learn" onClick={closeMenu}>
            Learn & Courses
          </Link>
          <Link className={path === "/calculator" ? "active" : ""} href="/calculator" onClick={closeMenu}>
            Calculator Mode
          </Link>
          <Link className={path === "/reviews" ? "active" : ""} href="/reviews" onClick={closeMenu}>
            Reviews
          </Link>
        </div>
        <Link href="/learn" className="nav-cta" onClick={closeMenu}>
          Start Tutor <span>→</span>
        </Link>
        <button
          className="mobile-menu"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={toggleMenu}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>
    </header>
  );
}
