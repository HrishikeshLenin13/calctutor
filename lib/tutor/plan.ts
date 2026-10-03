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
