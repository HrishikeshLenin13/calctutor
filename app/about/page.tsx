export default function About() {
  return (
    <main className="page-wrap">
      <h1 className="page-title">Follow the keys for the problem in front of you.</h1>
      <p className="page-intro">Type a class problem. CalcTutor presses the TI-84 Plus CE keys for that problem, one step at a time, and the screen is the calculator&apos;s own screen. The point is to see which key comes next when the lecture has already moved on.</p>
      <div className="about-grid">
        <section className="panel">
          <h2>What it walks through</h2>
          <p>Zeros, minimums, maximums, and intersections on the graph. Normal areas and inverse normal. One-variable statistics, linear regression, and binomial probabilities. Degree mode. A single home-screen calculation. If a sentence does not match one of those, it says so instead of inventing a key sequence.</p>
        </section>
        <section className="panel">
          <h2>Independent project</h2>
          <p>The keypad is here so the keystrokes can be practiced. The math runs locally. This is not a ROM, and it does not include Texas Instruments firmware.</p>
          <p><strong>CalcTutor is an independent educational project and is not affiliated with, endorsed by, or sponsored by Texas Instruments. TI-84 Plus CE is a trademark of Texas Instruments.</strong></p>
        </section>
      </div>
    </main>
  );
}
