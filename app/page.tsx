import Link from "next/link";
import { CalcWorkspace } from "@/components/CalcWorkspace";
import styles from "./home.module.css";

const lessons = [
  { number: "01", title: "Find a zero", prompt: "x² − 5x + 6 = 0", route: "/learn/find-zeros" },
  { number: "02", title: "Measure a normal area", prompt: "P(1 < Z < 2)", route: "/tutor/normal-probability" },
  { number: "03", title: "Read a data set", prompt: "1-Var Stats · L1", route: "/learn/one-var-stats" },
];

export default function Home() {
  return (
    <main className={styles.home}>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroCopy}>
          <p className={styles.kicker}><span className={styles.statusDot} /> Learn the calculator, not just the answer</p>
          <h1 id="hero-title">The right key<br />changes everything.</h1>
          <p className={styles.intro}>
            Practice real TI-84 workflows one button at a time. Follow a guided solve, then take the keys yourself.
          </p>
          <div className={styles.actions}>
            <Link href="/learn" className={styles.primary}>Explore lessons <span aria-hidden="true">↗</span></Link>
            <Link href="/calculator" className={styles.secondary}>Open the calculator</Link>
          </div>
          <p className={styles.caption}>A study tool for algebra, statistics, and calculus.</p>
        </div>
        <div className={styles.deviceColumn}>
          <div className={styles.deviceMeta}><span>Interactive study calculator</span><span>TI-84 Plus CE</span></div>
          <div className={styles.deviceStage}>
            <div className={styles.deviceShadow} aria-hidden="true" />
            <div className={styles.deviceFrame}><CalcWorkspace embed /></div>
          </div>
          <p className={styles.deviceNote}>Try a key. The display responds to the same calculator state used in lessons.</p>
        </div>
        <a className={styles.scrollCue} href="#how-it-works"><span />See how practice works</a>
      </section>

      <section id="how-it-works" className={styles.method} aria-labelledby="method-title">
        <header className={styles.sectionHeading}>
          <p className={styles.kicker}>From prompt to practice</p>
          <h2 id="method-title">Make the steps<br />make sense.</h2>
          <p>CalcTutor turns a math question into a calculator workflow you can understand, repeat, and eventually do on your own.</p>
        </header>
        <ol className={styles.steps}>
          <li><span className={styles.stepIndex}>01</span><div><h3>Start with the problem</h3><p>Write it the way you would ask a teacher. The tutor identifies a supported calculator method and shows how it read your prompt.</p></div><span className={styles.stepMark} aria-hidden="true">⌕</span></li>
          <li><span className={styles.stepIndex}>02</span><div><h3>Follow the key sequence</h3><p>Watch each menu and key in order. The display changes as the lesson advances, so the sequence stays connected to the result.</p></div><span className={styles.stepMark} aria-hidden="true">⌘</span></li>
          <li><span className={styles.stepIndex}>03</span><div><h3>Take your turn</h3><p>Switch to practice and press the highlighted key yourself. A wrong turn keeps your place and tells you what to look for.</p></div><span className={styles.stepMark} aria-hidden="true">↗</span></li>
        </ol>
      </section>

      <section className={styles.lessonSection} aria-labelledby="lesson-title">
        <div className={styles.lessonHead}>
          <div><p className={styles.kicker}>A few places to begin</p><h2 id="lesson-title">Useful moves,<br />carefully taught.</h2></div>
          <Link href="/learn" className={styles.textLink}>Browse all lessons <span aria-hidden="true">↗</span></Link>
        </div>
        <div className={styles.lessonList}>
          {lessons.map((lesson) => (
            <Link href={lesson.route} key={lesson.number} className={styles.lessonRow}>
              <span className={styles.lessonNumber}>{lesson.number}</span>
              <span className={styles.lessonName}>{lesson.title}</span>
              <code>{lesson.prompt}</code>
              <span className={styles.rowArrow} aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.endNote}>
        <p>Built for the moment the class moves on<br />and you are still finding the key.</p>
        <Link href="/tutor" className={styles.primary}>Practice a problem <span aria-hidden="true">↗</span></Link>
      </section>
    </main>
  );
}
