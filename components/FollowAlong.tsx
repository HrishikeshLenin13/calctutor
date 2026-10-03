"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalcWorkspace } from "@/components/CalcWorkspace";
import { createOs, press, type KeyId, type Os } from "@/lib/calculator/os";
import { interpret, screenNote, type Plan } from "@/lib/tutor/plan";
import styles from "./follow.module.css";

const EXAMPLES = [
  ["Zero", "Find the zero of x^2 - 5x + 6"],
  ["Average", "average of 2, 4, 6, 8, 10"],
  ["Area", "area between 1 and 2"],
] as const;

export function FollowAlong({ initial = "" }: { initial?: string }) {
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

  const flat = useMemo(
    () => (plan ? plan.steps.flatMap((step, stepIndex) => step.keys.map((key) => ({ ...key, stepIndex }))) : []),
    [plan],
  );
  const done = Boolean(plan) && cursor >= flat.length;
  const stepIndex = !plan ? 0 : done ? plan.steps.length - 1 : flat[cursor].stepIndex;
  const step = plan?.steps[stepIndex];
  const next = !done ? flat[cursor] : undefined;

  const advance = useCallback((id?: KeyId) => {
    if (!next) return;
    if (id && id !== next.id) {
      setNote(`Press ${next.name}.`);
      setPlaying(false);
      return;
    }
    setNote("");
    setOs((current) => press(current, next.id));
    const following = flat[cursor + 1];
    if (!following) setPlaying(false);
    else if (mode === "press" && following.stepIndex !== next.stepIndex) setPlaying(false);
    setCursor((value) => value + 1);
  }, [next, cursor, flat, mode]);

  useEffect(() => {
    if (!playing || !next || mode !== "watch") return;
    const arrow = next.id === "left" || next.id === "right" || next.id === "up" || next.id === "down";
    const stepStart = cursor > 0 && flat[cursor - 1].stepIndex !== next.stepIndex;
    const timer = window.setTimeout(() => advance(), (arrow ? 320 : 720) + (stepStart ? 1100 : 0));
    return () => window.clearTimeout(timer);
  }, [playing, next, advance, mode, cursor, flat]);

  function begin(raw: string, nextMode = mode) {
    const nextPlan = interpret(raw);
    setText(raw);
    setMode(nextMode);
    setCursor(0);
    setOs(createOs());
    setNote("");
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
    if (mode === "watch") return;
    if (!next) {
      setOs((current) => press(current, id));
      return;
    }
    advance(id);
  }

  const result = done ? screenNote(os) : "";

  return (
    <div className={styles.page}>
      <form className={styles.ask} onSubmit={(event) => { event.preventDefault(); begin(text); }}>
        <label htmlFor="problem">Type the problem. Spelling can be off.</label>
        <div className={styles.row}>
          <input id="problem" value={text} onChange={(event) => setText(event.target.value)} placeholder="zero of x^2 - 5x + 6" autoComplete="off" />
          <button type="submit">Go</button>
        </div>
      </form>
      <div className={styles.examples}>
        {EXAMPLES.map(([label, example]) => (
          <button type="button" key={label} onClick={() => begin(example)}>{label}</button>
        ))}
      </div>
      {note && !plan && <p className={styles.miss}>{note}</p>}

      <div className={styles.work}>
        <section className={styles.sheet}>
          <div className={styles.modes} role="group" aria-label="How to follow">
            <button type="button" className={mode === "watch" ? styles.on : ""} onClick={() => { setMode("watch"); if (plan && !done) setPlaying(true); }}>Watch</button>
            <button type="button" className={mode === "press" ? styles.on : ""} onClick={() => { setMode("press"); setPlaying(false); }}>You press</button>
          </div>
          {!plan && <p>Watch plays every key slowly. You press means you press the one that glows.</p>}
          {plan && step && (
            <>
              <p className={styles.count}>{plan.readAs || plan.title}</p>
              <h1>{done ? "Answer" : step.title}</h1>
              <p>{done ? "Same keys as class. Watch again, or switch to You press and do it yourself." : step.why}</p>
              {!done && next && <p className={styles.now}>{mode === "watch" ? "Watch" : "Press"} {next.name}</p>}
              {note && <p className={styles.miss}>{note}</p>}
              {done && result && <pre className={styles.result}>{result}</pre>}
              <div className={styles.actions}>
                {mode === "watch" && !done && <button type="button" className={styles.solid} onClick={() => setPlaying((value) => !value)}>{playing ? "Pause" : "Play"}</button>}
                <button type="button" onClick={() => begin(plan.problem)}>Start over</button>
              </div>
            </>
          )}
        </section>
        {!plan ? (
          <CalcWorkspace embed os={idle} onPress={(id) => setIdle((current) => press(current, id))} />
        ) : (
          <CalcWorkspace embed os={os} highlight={mode === "press" ? next?.id ?? null : next?.id ?? null} onPress={onPress} />
        )}
      </div>
    </div>
  );
}
