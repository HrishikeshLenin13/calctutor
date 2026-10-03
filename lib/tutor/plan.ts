import { evalGraph, emptyEnv, formatTi, run } from "../calculator/engine";
import { createOs, press, type KeyId, type Os } from "../calculator/os";

export interface Stroke {
  id: KeyId;
  name: string;
}

export interface Beat {
  title: string;
  why: string;
  keys: Stroke[];
}

export interface Plan {
  title: string;
  problem: string;
  readAs?: string;
  steps: Beat[];
}

export type Interpret = Plan | { error: string };

const DIGIT: Record<string, KeyId> = {
  "0": "n0", "1": "n1", "2": "n2", "3": "n3", "4": "n4",
  "5": "n5", "6": "n6", "7": "n7", "8": "n8", "9": "n9",
};

const EXAMPLES = "Find the zero of x^2 - 5x + 6, the maximum of -x^2 + 4x, the area between z = 1 and z = 2, 1-Var Stats of 2, 4, 6, 8, or sin(30°).";

function stroke(id: KeyId, name: string): Stroke {
  return { id, name };
}

function repeat(id: KeyId, name: string, count: number): Stroke[] {
  return Array.from({ length: Math.max(0, count) }, () => stroke(id, name));
}

function numberKeys(value: number): Stroke[] {
  const text = String(value);
  const keys: Stroke[] = [];
  let i = 0;
  if (text[0] === "-") {
    keys.push(stroke("neg", "(−)"));
    i = 1;
  }
  for (; i < text.length; i++) {
    const ch = text[i];
    if (ch === ".") keys.push(stroke("dot", "."));
    else if (DIGIT[ch]) keys.push(stroke(DIGIT[ch], ch));
    else return [];
  }
  return keys;
}

function exprKeys(raw: string): { keys: Stroke[]; source: string } | null {
  const prepared = raw.trim()
    .replace(/\bsquare root of\s*/gi, "√(")
    .replace(/\bsquared\b/gi, "^2")
    .replace(/\bcubed\b/gi, "^3")
    .replace(/\bplus\b/gi, "+")
    .replace(/\bminus\b/gi, "-")
    .replace(/\btimes\b/gi, "*")
    .replace(/\bdivided by\b/gi, "/")
    .replace(/\bto the\b/gi, "^")
    .replace(/x(\d)(?!\d)/gi, "x^$1")
    .replace(/\b(sin|cos|tan|log|ln)\s+(?![(])/gi, "$1(");
  const s = prepared.replace(/\s+/g, "").replace(/×/g, "*").replace(/÷/g, "/").replace(/–|—|−/g, "-").replace(/\*\*/g, "^").replace(/pi/gi, "π").replace(/sqrt\(/gi, "√(");
  if (!s) return null;
  const keys: Stroke[] = [];
  let source = "";
  let i = 0;
  const prev = () => source.at(-1) || "";
  const unary = () => !source || "+-−×÷*/^(,".includes(prev());

  while (i < s.length) {
    const rest = s.slice(i);
    const lower = rest.toLowerCase();
    if (lower.startsWith("sin(")) { keys.push(stroke("sin", "sin")); source += "sin("; i += 4; continue; }
    if (lower.startsWith("cos(")) { keys.push(stroke("cos", "cos")); source += "cos("; i += 4; continue; }
    if (lower.startsWith("tan(")) { keys.push(stroke("tan", "tan")); source += "tan("; i += 4; continue; }
    if (lower.startsWith("log(")) { keys.push(stroke("log", "log")); source += "log("; i += 4; continue; }
    if (lower.startsWith("ln(")) { keys.push(stroke("ln", "ln")); source += "ln("; i += 3; continue; }
    if (lower.startsWith("√(")) { keys.push(stroke("2nd", "2nd"), stroke("sq", "√")); source += "√("; i += 2; continue; }
    if (s[i] === "π") { keys.push(stroke("2nd", "2nd"), stroke("pow", "π")); source += "π"; i++; continue; }
    if (s[i] === "°") { keys.push(stroke("2nd", "2nd"), stroke("apps", "apps"), stroke("n1", "1")); source += "°"; i++; continue; }
    if (s[i] === "x" || s[i] === "X") { keys.push(stroke("xt", "X,T,θ,n")); source += "X"; i++; continue; }
    if (s[i] === "(") { keys.push(stroke("lparen", "(")); source += "("; i++; continue; }
    if (s[i] === ")") { keys.push(stroke("rparen", ")")); source += ")"; i++; continue; }
    if (s[i] === ",") { keys.push(stroke("comma", ",")); source += ","; i++; continue; }
    if (s[i] === "+") { keys.push(stroke("add", "+")); source += "+"; i++; continue; }
    if (s[i] === "*") { keys.push(stroke("mul", "×")); source += "×"; i++; continue; }
    if (s[i] === "/") { keys.push(stroke("div", "÷")); source += "÷"; i++; continue; }
    if (s[i] === "^") {
      if (s[i + 1] === "2" && !/\d/.test(s[i + 2] || "")) {
        keys.push(stroke("sq", "x²"));
        source += "²";
        i += 2;
        continue;
      }
      keys.push(stroke("pow", "^"));
      source += "^";
      i++;
      continue;
    }
    if (s[i] === "-" || s[i] === "⁻") {
      if (unary()) {
        keys.push(stroke("neg", "(−)"));
        source += "⁻";
      } else {
        keys.push(stroke("sub", "−"));
        source += "−";
      }
      i++;
      continue;
    }
    const num = rest.match(/^(?:\d+\.?\d*|\.\d+)/);
    if (num) {
      for (const ch of num[0]) keys.push(ch === "." ? stroke("dot", ".") : stroke(DIGIT[ch], ch));
      source += num[0];
      i += num[0].length;
      continue;
    }
    return null;
  }
  if (!source) return null;
  let open = 0;
  for (const ch of source) {
    if (ch === "(") open++;
    else if (ch === ")") open = Math.max(0, open - 1);
  }
  while (open > 0) {
    keys.push(stroke("rparen", ")"));
    source += ")";
    open--;
  }
  return { keys, source };
}

function wake(): Beat {
  return { title: "Leave the startup screen", why: "Any key leaves RAM Cleared. Press on, the same key you press when the calculator has been sitting closed.", keys: [stroke("on", "on")] };
}

function indexFor(x: number) {
  return Math.max(0, Math.min(94, Math.round(((x - -10) / 20) * 94)));
}

function move(from: number, to: number): Stroke[] {
  const count = to - from;
  return repeat(count > 0 ? "right" : "left", count > 0 ? "right" : "left", Math.abs(count));
}

function bracket(target: number) {
  const at = indexFor(target);
  let left = indexFor(target - 1);
  let right = indexFor(target + 0.8);
  if (left >= at) left = Math.max(0, at - 4);
  if (right <= at) right = Math.min(94, at + 4);
  if (right - left < 3) right = Math.min(94, left + 4);
  return { left, right, at };
}

function rootsOf(source: string) {
  const found: number[] = [];
  let prevY: number | null = null;
  let prevX = -10;
  for (let i = 0; i <= 200; i++) {
    const x = -10 + (i * 20) / 200;
    const y = evalGraph(source, x, emptyEnv());
    if (y !== null && prevY !== null && prevY * y <= 0) {
      const root = prevX + (x - prevX) * (Math.abs(prevY) / (Math.abs(prevY) + Math.abs(y) || 1));
      if (!found.length || Math.abs(found[found.length - 1] - root) > 0.2) found.push(root);
    }
    if (y !== null) { prevY = y; prevX = x; }
  }
  return found.filter((root) => root > -9.4 && root < 9.4);
}

function extremeOf(source: string, kind: "min" | "max") {
  let best: { x: number; y: number } | null = null;
  let prev: number | null = null;
  let prev2: number | null = null;
  let prevX = -10;
  for (let i = 0; i <= 200; i++) {
    const x = -10 + (i * 20) / 200;
    const y = evalGraph(source, x, emptyEnv());
    if (y === null) { prev2 = prev; prev = null; continue; }
    const local = prev !== null && prev2 !== null && (kind === "min" ? prev < prev2 && prev < y : prev > prev2 && prev > y);
    if (local && prev !== null && (!best || (kind === "min" ? prev < best.y : prev > best.y))) best = { x: prevX, y: prev };
    prev2 = prev; prev = y; prevX = x;
  }
  return best && best.x > -9.2 && best.x < 9.2 ? best : null;
}

function graphSetup(source: string, which: "Y1" | "both", second?: string): Beat[] {
  const typed = exprKeys(source);
  if (!typed) return [];
  const steps: Beat[] = [
    wake(),
    { title: "Open Y=", why: "The graph uses the equation in Y1, not the home screen. Y= is the top-left key.", keys: [stroke("y=", "y="), ...typed.keys] },
  ];
  if (which === "both" && second) {
    const other = exprKeys(second);
    if (!other) return [];
    steps.push({ title: "Enter the second equation", why: "Enter moves to Y2. Intersection compares Y1 and Y2.", keys: [stroke("enter", "enter"), ...other.keys] });
  }
  steps.push({
    title: "Set the standard window and graph",
    why: "Zoom, then 6, is ZStandard: x and y both run from −10 to 10. That is the window classes start from. The graph draws as soon as you press 6.",
    keys: [stroke("zoom", "zoom"), stroke("n6", "6")],
  });
  return steps;
}

function calcAsk(kind: "zero" | "min" | "max" | "intersect", target: number, label: string): Beat[] {
  const spot = bracket(target);
  const item = { zero: ["n2", "2"], min: ["n3", "3"], max: ["n4", "4"], intersect: ["n5", "5"] }[kind] as [KeyId, string];
  return [
    {
      title: "Open the calculate menu",
      why: `On the graph, 2nd then trace opens CALCULATE. ${label} is option ${item[1]}. The cursor starts in the middle of the screen.`,
      keys: [stroke("2nd", "2nd"), stroke("trace", "trace"), stroke(item[0], item[1])],
    },
    {
      title: "Set the left bound",
      why: "The calculator will not guess the whole screen. Move the cursor to the left of the answer, then press enter. A bound line stays there.",
      keys: [...move(47, spot.left), stroke("enter", "enter")],
    },
    {
      title: "Set the right bound",
      why: "Move to the right of the answer and press enter. The value you want has to sit strictly between the two bounds.",
      keys: [...move(spot.left, spot.right), stroke("enter", "enter")],
    },
    {
      title: "Place the guess",
      why: "The guess tells the calculator where to look between the bounds. Move close to the answer and press enter. X and Y appear at the bottom of the graph.",
      keys: [...move(spot.right, spot.at), stroke("enter", "enter")],
    },
  ];
}
