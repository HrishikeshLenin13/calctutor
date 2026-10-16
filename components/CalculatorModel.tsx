"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { CalcWorkspace } from "@/components/CalcWorkspace";
import { createOs, press, type KeyId, type Os } from "@/lib/calculator/os";
import styles from "./calculator-model.module.css";

const Scene = dynamic(() => import("./CalculatorModelScene").then((module) => module.CalculatorModelScene), {
  ssr: false,
  loading: () => <div className={styles.loading}><CalcWorkspace embed /></div>,
});

const KEYBOARD_KEYS: Record<string, KeyId> = {
  Enter: "enter", Escape: "clear", Backspace: "del", "(": "lparen", ")": "rparen",
  "+": "add", "-": "sub", "*": "mul", "/": "div", ".": "dot", "^": "pow",
  "0": "n0", "1": "n1", "2": "n2", "3": "n3", "4": "n4", "5": "n5",
  "6": "n6", "7": "n7", "8": "n8", "9": "n9",
  ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
};

export function CalculatorModel() {
  const [os, setOs] = useState<Os>(createOs);
  const [rotation, setRotation] = useState<[number, number]>([0.08, -0.13]);
  const hit = useCallback((key: KeyId) => setOs((current) => press(current, key)), []);

  function trackPointer(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    setRotation([0.08 + y * 0.14, -0.13 + x * 0.22]);
  }

  function resetView() {
    setRotation([0.08, -0.13]);
  }

  function handleKeyboard(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const key = KEYBOARD_KEYS[event.key];
    if (!key) return;
    event.preventDefault();
    hit(key);
  }

  return (
    <div
      className={styles.viewer}
      role="application"
      aria-label="Interactive three-dimensional TI-84 Plus CE study calculator"
      tabIndex={0}
      onKeyDown={handleKeyboard}
      onPointerMove={trackPointer}
      onPointerLeave={resetView}
    >
      <Scene os={os} onPress={hit} rotation={rotation} />
      <details className={styles.accessibleControls}>
        <summary>Open the accessible keypad</summary>
        <CalcWorkspace os={os} onPress={hit} embed />
      </details>
    </div>
  );
}
