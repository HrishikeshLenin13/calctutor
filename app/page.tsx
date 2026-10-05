"use client";

import Link from "next/link";
import { CalcWorkspace } from "@/components/CalcWorkspace";
import { useState } from "react";

export default function Home() {
  const [tilt, setTilt] = useState({ x: 10, y: -8 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({
      x: -y / 16,
      y: x / 16,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 10, y: -8 });
  };

  return (
    <main className="wrap">
      {/* Hero Section */}
      <section className="hero-3d">
        <div className="hero-copy">
          <div className="pill-badge">
            <span>●</span> Interactive TI-84 Plus CE Tutor
          </div>
          <h1 className="hero-title">
            Learn your TI-84. <br />
            <span className="gradient-text">Don't just press buttons.</span>
          </h1>
          <p className="hero-lede">
            Master exact key sequences, sub-menus, window settings, and mathematical concepts for Algebra, AP Statistics, Calculus, and SAT test prep with real-time interactive keypress guidance.
          </p>

          <div className="hero-actions">
            <Link href="/learn" className="button button-primary">
              Start Learning <span>→</span>
            </Link>
            <Link href="/calculator" className="button button-quiet">
              Open Standalone Calculator
            </Link>
          </div>
        </div>

        {/* 3D Floating Calculator Hero Mockup */}
        <div
          className="hero-stage-3d"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className="stage-glow" />
          <div
            className="hero-calc-wrapper"
            style={{
              transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transformStyle: "preserve-3d",
              transition: "transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <CalcWorkspace embed />
          </div>
        </div>
      </section>

      {/* Feature Bento Section */}
      <section className="features-section">
        <h2 className="section-title">Why Students Choose CalcTutor</h2>
        <div className="bento-grid">
          <div className="bento-card glass-card card-3d">
            <div className="bento-icon">🎯</div>
            <h3>Interactive Keystroke Guidance</h3>
            <p>
              Don't watch static 10-minute video tutorials. CalcTutor glows the exact buttons to press and validates your actions step-by-step.
            </p>
          </div>

          <div className="bento-card glass-card card-3d">
            <div className="bento-icon">📊</div>
            <h3>Natural Problem Parser</h3>
            <p>
              Type class problems in plain English like <em>"find zero of x^2 - 5x + 6"</em> or <em>"area between z=1 and z=2"</em>. CalcTutor compiles them into exact TI-84 key sequences.
            </p>
          </div>

          <div className="bento-card glass-card card-3d">
            <div className="bento-icon">⚡</div>
            <h3>Full TI-84 Plus CE Hardware Engine</h3>
            <p>
              Math runs completely offline in your browser. Graphing, STAT 1-Var/2-Var, LinReg, DISTR normalcdf/invNorm, and TVM Finance all build real internal state.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
