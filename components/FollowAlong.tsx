"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalcWorkspace } from "@/components/CalcWorkspace";
import { createOs, press, type KeyId, type Os } from "@/lib/calculator/os";
import { interpret, screenNote, type Plan } from "@/lib/tutor/plan";
import { markLessonComplete } from "@/lib/progress";
import styles from "./follow.module.css";

const EXAMPLES = [
  ["Zero", "Find the zero of x^2 - 5x + 6"],
  ["Extrema", "maximum of -x^2 + 4x + 3"],
  ["Intersection", "intersection of 2x + 1 and x^2 - 2"],
  ["Normal Area", "area between z = 1 and z = 2"],
  ["invNorm", "invNorm(0.95)"],
  ["1-Var Stats", "1-Var Stats of 10, 20, 30, 40"],
  ["LinReg", "LinReg for (1,2) (2,5) (3,7)"],
  ["Trig Mode", "sin(30°)"],
] as const;

export function FollowAlong({
  initial = "",
  lessonSlug,
}: {
  initial?: string;
  lessonSlug?: string;
}) {
  const [text, setText] = useState(initial);
  const [mode, setMode] = useState<"watch" | "press">("watch");
  const [plan, setPlan] = useState<Plan | null>(() => {
    if (!initial) return null;
    const result = interpret(initial);
    return "error" in result ? null : result;
  });
  const [os, setOs] = useState<Os>(createOs);
  const [cursor, setCursor] = useState(0);
  const [note, setNote] = useState("");
  const [playing, setPlaying] = useState(() => Boolean(initial) && !("error" in interpret(initial)));
  const [idle, setIdle] = useState<Os>(createOs);
  const [showHint, setShowHint] = useState(false);

  const flat = useMemo(
    () => (plan ? plan.steps.flatMap((step, stepIndex) => step.keys.map((key) => ({ ...key, stepIndex }))) : []),
    [plan],
  );
  const done = Boolean(plan) && cursor >= flat.length;
  const stepIndex = !plan ? 0 : done ? plan.steps.length - 1 : flat[cursor].stepIndex;
  const step = plan?.steps[stepIndex];
  const next = !done ? flat[cursor] : undefined;

  useEffect(() => {
    if (done && lessonSlug) {
      markLessonComplete(lessonSlug, true);
    }
  }, [done, lessonSlug]);

  const advance = useCallback(
    (id?: KeyId) => {
      if (!next) return;
      if (id && id !== next.id) {
        setNote(`Incorrect key pressed. You need to press [ ${next.name} ]. Look for the glowing gold key!`);
        setPlaying(false);
        return;
      }
      setNote("");
      setShowHint(false);
      setOs((current) => press(current, next.id));
      const following = flat[cursor + 1];
      if (!following) setPlaying(false);
      setCursor((value) => value + 1);
    },
    [next, cursor, flat],
  );

  useEffect(() => {
    if (!playing || !next || mode !== "watch") return;
    const arrow = next.id === "left" || next.id === "right" || next.id === "up" || next.id === "down";
    const stepStart = cursor > 0 && flat[cursor - 1].stepIndex !== next.stepIndex;
    const timer = window.setTimeout(() => advance(), (arrow ? 360 : 750) + (stepStart ? 1100 : 0));
    return () => window.clearTimeout(timer);
  }, [playing, next, advance, mode, cursor, flat]);

  function begin(raw: string, nextMode = mode) {
    const nextPlan = interpret(raw);
    setText(raw);
    setMode(nextMode);
    setCursor(0);
    setOs(createOs());
    setNote("");
    setShowHint(false);
    if ("error" in nextPlan) {
      setPlan(null);
      setPlaying(false);
      setNote(nextPlan.error);
      return;
    }
    setPlan(nextPlan);
    setPlaying(nextMode === "watch");
  }

  function onPress(id: KeyId) {
    if (mode === "watch") {
      setNote("Switch to 'You Press' mode to interactively press the calculator keys yourself.");
      return;
    }
    if (!next) {
      setOs((current) => press(current, id));
      return;
    }
    advance(id);
  }

  const result = done ? screenNote(os) : "";

  return (
    <div className={styles.page}>
      <form
        className={`${styles.ask} glass-card`}
        onSubmit={(event) => {
          event.preventDefault();
          begin(text);
        }}
      >
        <label htmlFor="problem" className={styles.label}>
          Type any TI-84 math problem or function name:
        </label>
        <div className={styles.row}>
          <input
            id="problem"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="e.g. zero of x^2 - 5x + 6, invNorm(0.95), 1-Var Stats 10,20,30"
            autoComplete="off"
            className={styles.input}
          />
          <button type="submit" className="button button-primary">
            Build Guided Lesson
          </button>
        </div>
      </form>

      <div className={styles.examples}>
        <span className={styles.exampleTitle}>Quick Examples:</span>
        {EXAMPLES.map(([label, example]) => (
          <button
            type="button"
            key={label}
            className={styles.examplePill}
            onClick={() => begin(example)}
          >
            {label}
          </button>
        ))}
      </div>

      {note && !plan && <div className={styles.errorBanner}>{note}</div>}

      <div className={styles.work}>
        <section className={`${styles.sheet} glass-card`}>
          <div className={styles.modes} role="group" aria-label="How to follow">
            <button
              type="button"
              className={mode === "watch" ? styles.on : ""}
              onClick={() => {
                setMode("watch");
                if (plan && !done) setPlaying(true);
              }}
            >
              ▶ Watch Demonstration
            </button>
            <button
              type="button"
              className={mode === "press" ? styles.on : ""}
              onClick={() => {
                setMode("press");
                setPlaying(false);
              }}
            >
              🎯 You Press (Interactive)
            </button>
          </div>

          {!plan && (
            <div className={styles.emptyState}>
              <h3>Select or type a math problem above</h3>
              <p>
                CalcTutor generates an interactive TI-84 keystroke sequence.
                Choose <strong>Watch</strong> for an automated demo or <strong>You Press</strong> to operate the calculator keys step-by-step.
              </p>
            </div>
          )}

          {plan && step && (
            <div className={styles.stepContainer}>
              <div className={styles.progressHeader}>
                <span className={styles.count}>{plan.readAs || plan.title}</span>
                <span className={styles.stepBadge}>
                  Step {done ? plan.steps.length : stepIndex + 1} of {plan.steps.length}
                </span>
              </div>

              {/* Progress bar */}
              <div className={styles.progressBarTrack}>
                <div
                  className={styles.progressBarFill}
                  style={{
                    width: `${((done ? plan.steps.length : stepIndex + 1) / plan.steps.length) * 100}%`,
                  }}
                />
              </div>

              <h2 className={styles.stepTitle}>{done ? "🎉 Task Complete!" : step.title}</h2>
              <p className={styles.stepWhy}>{done ? "You have successfully executed the full TI-84 sequence." : step.why}</p>

              {!done && next && (
                <div className={styles.nextKeyBox}>
                  <span>Target Action:</span>
                  <strong>{mode === "watch" ? "Watching" : "Press Key"}: [ {next.name} ]</strong>
                </div>
              )}

              {note && <div className={styles.miss}>{note}</div>}

              {done && result && (
                <div className={styles.resultBox}>
                  <div className={styles.resultTitle}>Final Calculator Output</div>
                  <pre className={styles.resultContent}>{result}</pre>
                </div>
              )}

              <div className={styles.actions}>
                {mode === "watch" && !done && (
                  <button
                    type="button"
                    className="button button-primary"
                    onClick={() => setPlaying((value) => !value)}
                  >
                    {playing ? "Pause Simulation" : "Resume Playback"}
                  </button>
                )}
                {!done && mode === "press" && (
                  <button
                    type="button"
                    className="button button-quiet"
                    onClick={() => setShowHint((prev) => !prev)}
                  >
                    {showHint ? "Hide Hint" : "Need a Hint?"}
                  </button>
                )}
                <button
                  type="button"
                  className="button button-quiet"
                  onClick={() => begin(plan.problem)}
                >
                  Restart Lesson
                </button>
              </div>

              {showHint && next && (
                <div className={styles.hintBox}>
                  💡 <strong>Hint:</strong> Look for key <strong>[{next.name}]</strong> glowing gold on the calculator keypad. If it has a 2nd label above it, press the blue <strong>2nd</strong> key first!
                </div>
              )}
            </div>
          )}
        </section>

        <div className={styles.calcContainer}>
          {!plan ? (
            <CalcWorkspace
              embed
              os={idle}
              onPress={(id) => setIdle((current) => press(current, id))}
            />
          ) : (
            <CalcWorkspace
              embed
              os={os}
              highlight={next?.id ?? null}
              onPress={onPress}
            />
          )}
        </div>
      </div>
    </div>
  );
}
