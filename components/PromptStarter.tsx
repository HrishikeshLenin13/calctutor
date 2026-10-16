"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { interpret } from "@/lib/tutor/plan";
import styles from "./prompt-starter.module.css";

const SUGGESTIONS = [
  "Where does x² − 5x + 6 cross the x-axis?",
  "What is the highest point of −x² + 4x + 3?",
  "Could you find the area between z = 1 and z = 2?",
  "Can you get the average of 10, 20, 30, 40?",
];

export function PromptStarter() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const result = useMemo(() => prompt.trim() ? interpret(prompt) : null, [prompt]);
  const plan = result && !("error" in result) ? result : null;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (plan) router.push(`/tutor?problem=${encodeURIComponent(prompt.trim())}`);
  }

  return (
    <section className={styles.section} aria-labelledby="prompt-title">
      <div className={styles.intro}>
        <p className={styles.eyebrow}>A better way to ask</p>
        <h2 id="prompt-title">Say it your way.<br />See the plan first.</h2>
        <p>Use a full question, a shorthand expression, or the words you remember from class. CalcTutor shows what it understood before it starts the keystrokes.</p>
        <div className={styles.engineNote}><span aria-hidden="true">↳</span><span>Built around calculator methods, with a plain-language read-back—so you can correct the interpretation before practicing.</span></div>
      </div>

      <div className={styles.composer}>
        <form onSubmit={submit}>
          <label htmlFor="prompt-starter">What are you working on?</label>
          <textarea
            id="prompt-starter"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="For example: could you show me where this parabola crosses the x-axis? x² − 5x + 6"
            rows={3}
          />
          {plan ? (
            <div className={styles.readback} aria-live="polite">
              <span className={styles.check} aria-hidden="true">✓</span>
              <span><small>CalcTutor read this as</small><strong>{plan.readAs ?? plan.title}</strong></span>
            </div>
          ) : prompt.trim() && result && "error" in result ? (
            <p className={styles.feedback} role="status">{result.error}</p>
          ) : (
            <p className={styles.feedback}>Try a calculation, graph, zero, turning point, probability, or data set.</p>
          )}
          <button className={styles.submit} type="submit" disabled={!plan}>
            Build my guided steps <span aria-hidden="true">↗</span>
          </button>
        </form>

        <div className={styles.suggestions} aria-label="Try a sample question">
          <span>Try asking</span>
          {SUGGESTIONS.map((suggestion) => (
            <button key={suggestion} type="button" onClick={() => setPrompt(suggestion)}>{suggestion}</button>
          ))}
        </div>
      </div>
    </section>
  );
}
