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

function adapt(input: string): string {
  const small: Record<string, string> = {
    zero: "0", one: "1", two: "2", three: "3", four: "4", five: "5", six: "6", seven: "7", eight: "8", nine: "9",
    ten: "10", eleven: "11", twelve: "12", thirteen: "13", fourteen: "14", fifteen: "15", sixteen: "16", seventeen: "17", eighteen: "18", nineteen: "19",
    twenty: "20", thirty: "30", forty: "40", fifty: "50", sixty: "60", seventy: "70", eighty: "80", ninety: "90", hundred: "100",
  };
  let s = input.trim()
    .replace(/[’']/g, "")
    .replace(/[×✕⋅]/g, "*")
    .replace(/÷/g, "/")
    .replace(/[–—−]/g, "-")
    .replace(/²/g, "^2")
    .replace(/³(?!√)/g, "^3")
    .replace(/\bpi\b/gi, "π")
    .replace(/(\d),(\d{3})(?!\d)/g, "$1$2");
  s = s.replace(/^(?:please\s+)?(?:can you |could you |would you )?(?:please\s+)?(?:help me |show me |tell me |give me |i need(?: to)? |i want(?: to)? )?/i, "");
  s = s.replace(/^(?:what(?: is|s)?|whats|calculate|compute|evaluate|figure out|work out)\s+/i, "");
  s = s.replace(/^(?:solve|find|determine)\s+(?:for\s+x\s*)?(?::\s*)?/i, "");
  s = s.replace(/\?+$/g, "").trim();
  s = s.replace(/\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)\b/gi, (word) => small[word.toLowerCase()] || word);
  s = s.replace(/\btwo\s*[- ]?var\b/gi, "2-var");
  s = s.replace(/(\d+(?:\.\d+)?)\s*[x*]\s*10\s*\^\s*\(?\s*(-?\d+)\s*\)?/gi, "$1ᴇ$2");
  s = s.replace(/(\d+(?:\.\d+)?)\s*(?:%|percent)\s+of\s+(\d+(?:\.\d+)?)/gi, "($1/100)*$2");
  s = s.replace(/\bfactorial of\s+(\d+(?:\.\d+)?)/gi, "$1!");
  s = s.replace(/(\d+(?:\.\d+)?)\s+factorial\b/gi, "$1!");
  s = s.replace(/(\d+(?:\.\d+)?)\s*(?:choose|c)\s+(\d+(?:\.\d+)?)/gi, "nCr($1,$2)");
  s = s.replace(/\bcombinations? of\s+(\d+(?:\.\d+)?)\s+(?:and\s+)?(\d+(?:\.\d+)?)/gi, "nCr($1,$2)");
  s = s.replace(/(\d+(?:\.\d+)?)\s+(?:permute|permutation of)\s+(\d+(?:\.\d+)?)/gi, "nPr($1,$2)");
  s = s.replace(/\bpermutations? of\s+(\d+(?:\.\d+)?)\s+(?:and\s+)?(\d+(?:\.\d+)?)/gi, "nPr($1,$2)");
  s = s.replace(/\b(sin|cos|tan|log|ln)\s+of\s+/gi, "$1(");
  s = s.replace(/\b(?:arc\s*sin|arcsin|asin|sine inverse|sin inverse)(?:\s+of)?\b/gi, "sin⁻¹(");
  s = s.replace(/\b(?:arc\s*cos|arccos|acos|cosine inverse|cos inverse)(?:\s+of)?\b/gi, "cos⁻¹(");
  s = s.replace(/\b(?:arc\s*tan|arctan|atan|tangent inverse|tan inverse)(?:\s+of)?\b/gi, "tan⁻¹(");
  s = s.replace(/\b(?:cube|cubed) roots? of\b/gi, "³√(");
  s = s.replace(/\bsquare roots? of\b/gi, "√(");
  s = s.replace(/\bsqrt of\b/gi, "√(");
  s = s.replace(/\babsolute value of\b/gi, "abs(");
  s = s.replace(/\babs of\b/gi, "abs(");
  s = s.replace(/\bnatural logs? of\b/gi, "ln(");
  s = s.replace(/\bln of\b/gi, "ln(");
  s = s.replace(/\blog(?:arithm)?s? of\b/gi, "log(");
  s = s.replace(/\be to the(?: power(?: of)?)?\s+/gi, "e^(");
  s = s.replace(/\b10 to the(?: power(?: of)?)?\s+/gi, "10^(");
  s = s.replace(/\bto the power of\b/gi, "^");
  s = s.replace(/\braised to\b/gi, "^");
  s = s.replace(/\bto the\b/gi, "^");
  s = s.replace(/(\d+(?:\.\d+)?)\s+over\s+(\d+(?:\.\d+)?)/gi, "($1)/($2)");
  s = s.replace(/\bdivided by\b/gi, "/");
  s = s.replace(/\bmultiplied by\b/gi, "*");
  s = s.replace(/\btimes\b/gi, "*");
  s = s.replace(/\bplus\b/gi, "+");
  s = s.replace(/\bminus\b/gi, "-");
  s = s.replace(/\bsquared\b/gi, "^2");
  s = s.replace(/\bcubed\b/gi, "^3");
  s = s.replace(/\bhalf of\b/gi, "(1/2)*");
  s = s.replace(/\bdouble\b/gi, "2*");
  s = s.replace(/\btriple\b/gi, "3*");
  s = s.replace(/\b(?:is equal to|equals)\b/gi, "=");
  s = s.replace(/\b(?:as a|to a|into a|in) fraction\b/gi, "►Frac");
  if (/\b(?:average|mean|stats|data|numbers|scores|deviation|median)\b/i.test(s) || (s.match(/-?\d+(?:\.\d+)?/g) || []).length >= 3) {
    s = s.replace(/(\d+(?:\.\d+)?)\s+and\s+(?=\d)/gi, "$1, ");
  }
  s = s.replace(/[;|]/g, ",");
  let open = 0;
  for (const ch of s) {
    if (ch === "(") open++;
    else if (ch === ")") open = Math.max(0, open - 1);
  }
  while (open-- > 0) s += ")";
  return s.replace(/\s+/g, " ").trim();
}

function equationExpr(text: string): string | null {
  let depth = 0;
  let at = -1;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    else if (ch === "=" && depth === 0) {
      if (at >= 0) return null;
      at = i;
    }
  }
  if (at < 0) return null;
  const lhs = text.slice(0, at).trim();
  const rhs = text.slice(at + 1).trim();
  if (!lhs || !rhs || !/x/i.test(lhs + rhs)) return null;
  if (/^(?:y|f\(x\))$/i.test(lhs.replace(/\s+/g, ""))) return null;
  if (/^0$/.test(rhs.replace(/\s+/g, ""))) return lhs;
  return `(${lhs})-(${rhs})`;
}

function exprKeys(raw: string): { keys: Stroke[]; source: string } | null {
  const prepared = raw.trim()
    .replace(/x(\d)(?!\d)/gi, "x^$1")
    .replace(/\b(sin⁻¹|cos⁻¹|tan⁻¹|sin|cos|tan|log|ln|abs|nCr|nPr)\s+(?![(])/gi, "$1(");
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
    const take = (token: string, typed: Stroke[], written: string) => {
      keys.push(...typed);
      source += written;
      i += token.length;
    };
    if (rest.startsWith("sin⁻¹(")) { take("sin⁻¹(", [stroke("2nd", "2nd"), stroke("sin", "sin")], "sin⁻¹("); continue; }
    if (rest.startsWith("cos⁻¹(")) { take("cos⁻¹(", [stroke("2nd", "2nd"), stroke("cos", "cos")], "cos⁻¹("); continue; }
    if (rest.startsWith("tan⁻¹(")) { take("tan⁻¹(", [stroke("2nd", "2nd"), stroke("tan", "tan")], "tan⁻¹("); continue; }
    if (lower.startsWith("10^(")) { take("10^(", [stroke("2nd", "2nd"), stroke("log", "log")], "10^("); continue; }
    if (lower.startsWith("e^(")) { take("e^(", [stroke("2nd", "2nd"), stroke("ln", "ln")], "e^("); continue; }
    if (rest.startsWith("³√(")) { take("³√(", [stroke("math", "math"), stroke("n3", "3")], "³√("); continue; }
    if (lower.startsWith("ncr(")) { take(rest.slice(0, 4), [stroke("math", "math"), stroke("right", "right"), stroke("right", "right"), stroke("n4", "4")], "nCr("); continue; }
    if (lower.startsWith("npr(")) { take(rest.slice(0, 4), [stroke("math", "math"), stroke("right", "right"), stroke("right", "right"), stroke("n3", "3")], "nPr("); continue; }
    if (lower.startsWith("abs(")) { take("abs(", [stroke("math", "math"), stroke("right", "right"), stroke("n1", "1")], "abs("); continue; }
    if (rest.startsWith("►Frac")) { take("►Frac", [stroke("math", "math"), stroke("n1", "1")], "►Frac"); continue; }
    if (lower.startsWith("sin(")) { keys.push(stroke("sin", "sin")); source += "sin("; i += 4; continue; }
    if (lower.startsWith("cos(")) { keys.push(stroke("cos", "cos")); source += "cos("; i += 4; continue; }
    if (lower.startsWith("tan(")) { keys.push(stroke("tan", "tan")); source += "tan("; i += 4; continue; }
    if (lower.startsWith("log(")) { keys.push(stroke("log", "log")); source += "log("; i += 4; continue; }
    if (lower.startsWith("ln(")) { keys.push(stroke("ln", "ln")); source += "ln("; i += 3; continue; }
    if (lower.startsWith("√(")) { keys.push(stroke("2nd", "2nd"), stroke("sq", "√")); source += "√("; i += 2; continue; }
    if (s[i] === "π") { keys.push(stroke("2nd", "2nd"), stroke("pow", "π")); source += "π"; i++; continue; }
    if (s[i] === "°") { keys.push(stroke("2nd", "2nd"), stroke("apps", "apps"), stroke("n1", "1")); source += "°"; i++; continue; }
    if (s[i] === "!") { keys.push(stroke("math", "math"), stroke("right", "right"), stroke("right", "right"), stroke("n5", "5")); source += "!"; i++; continue; }
    if (s[i] === "ᴇ") { keys.push(stroke("2nd", "2nd"), stroke("comma", "EE")); source += "ᴇ"; i++; continue; }
    if (s[i] === "³") { keys.push(stroke("math", "math"), stroke("n2", "2")); source += "³"; i++; continue; }
    if (lower.startsWith("e") && (s[i + 1] === undefined || "+-−×÷*/^)!,".includes(s[i + 1]) || s[i + 1] === "►")) { keys.push(stroke("2nd", "2nd"), stroke("div", "e")); source += "e"; i++; continue; }
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

function zeroPlan(text: string, raw: string): Interpret {
  const typed = exprKeys(raw);
  if (!typed) return { error: `I can graph polynomials and the usual functions. ${EXAMPLES}` };
  try { evalGraph(typed.source, 0, emptyEnv()); } catch { return { error: `That equation does not evaluate. ${EXAMPLES}` }; }
  const roots = rootsOf(typed.source);
  if (!roots.length) return { error: "I don't see a sign change between −10 and 10, so ZStandard will not find a zero. Try an equation that crosses the x-axis in that window." };
  const extra = roots.length > 1 ? ` There ${roots.length === 2 ? "is another zero" : "are other zeros"} near ${roots.slice(1).map((root) => formatTi(root)).join(" and ")}. Run zero again with the left bound past this one.` : "";
  return {
    title: "Find a zero",
    problem: text,
    steps: [
      ...graphSetup(raw, "Y1"),
      ...calcAsk("zero", roots[0], "zero"),
      { title: "Read the zero", why: `Y should be 0, or as close as the pixel allows. X is the zero.${extra}`, keys: [] },
    ],
  };
}

function extremePlan(text: string, raw: string, kind: "min" | "max"): Interpret {
  const typed = exprKeys(raw);
  if (!typed) return { error: `Write the function after minimum or maximum. ${EXAMPLES}` };
  const spot = extremeOf(typed.source, kind);
  if (!spot) return { error: `I can't see a ${kind === "min" ? "minimum" : "maximum"} inside the standard window.` };
  const word = kind === "min" ? "minimum" : "maximum";
  return {
    title: `Find a ${word}`,
    problem: text,
    steps: [
      ...graphSetup(raw, "Y1"),
      ...calcAsk(kind, spot.x, word),
      { title: `Read the ${word}`, why: "X is where it happens. Y is the value. That is the number a question usually wants when it says minimum or maximum value.", keys: [] },
    ],
  };
}

function intersectPlan(text: string, left: string, right: string): Interpret {
  const a = exprKeys(left);
  const b = exprKeys(right);
  if (!a || !b) return { error: "Write both equations, like intersection of x+1 and x^2." };
  const crosses: number[] = [];
  let prev: number | null = null;
  let prevX = -10;
  for (let i = 0; i <= 200; i++) {
    const x = -10 + (i * 20) / 200;
    const y1 = evalGraph(a.source, x, emptyEnv());
    const y2 = evalGraph(b.source, x, emptyEnv());
    if (y1 === null || y2 === null) { prev = null; continue; }
    const diff = y1 - y2;
    if (prev !== null && prev * diff <= 0) {
      const root = prevX + (x - prevX) * (Math.abs(prev) / (Math.abs(prev) + Math.abs(diff) || 1));
      if (!crosses.length || Math.abs(crosses[crosses.length - 1] - root) > 0.2) crosses.push(root);
    }
    prev = diff;
    prevX = x;
  }
  const target = crosses.find((x) => x > -9.2 && x < 9.2);
  if (target === undefined) return { error: "Those two graphs don't meet inside the standard window." };
  return {
    title: "Find an intersection",
    problem: text,
    steps: [
      ...graphSetup(left, "both", right),
      ...calcAsk("intersect", target, "intersect"),
      { title: "Read the point", why: `X and Y are the same on both graphs. That point is the intersection.${crosses.length > 1 ? ` Another one is near x = ${formatTi(crosses.find((x) => Math.abs(x - target) > 0.2) || crosses[1])}. Run intersect again with the left bound past this x.` : ""}`, keys: [] },
    ],
  };
}

function tailKeys(value: number, which: "lower" | "upper"): Stroke[] {
  const edge = which === "lower"
    ? [stroke("neg", "(−)"), stroke("n1", "1"), stroke("2nd", "2nd"), stroke("comma", "EE"), stroke("n9", "9"), stroke("n9", "9")]
    : [stroke("n1", "1"), stroke("2nd", "2nd"), stroke("comma", "EE"), stroke("n9", "9"), stroke("n9", "9")];
  return which === "lower" ? [...edge, stroke("comma", ","), ...numberKeys(value)] : [...numberKeys(value), stroke("comma", ","), ...edge];
}

function normalPlan(text: string, lower: number | null, upper: number | null, mean: number, sd: number): Interpret {
  if (lower === null && upper === null) return { error: `Say the bounds. ${EXAMPLES}` };
  const keys = [stroke("2nd", "2nd"), stroke("vars", "vars"), stroke("n2", "2")];
  if (lower === null) keys.push(...tailKeys(upper as number, "lower"));
  else if (upper === null) keys.push(...tailKeys(lower, "upper"));
  else keys.push(...numberKeys(lower), stroke("comma", ","), ...numberKeys(upper));
  keys.push(stroke("comma", ","), ...numberKeys(mean), stroke("comma", ","), ...numberKeys(sd), stroke("rparen", ")"), stroke("enter", "enter"));
  const where = lower === null ? `below ${upper}` : upper === null ? `above ${lower}` : `between ${lower} and ${upper}`;
  return {
    title: "Normal probability",
    problem: text,
    steps: [
      wake(),
      {
        title: "Open normalcdf(",
        why: "Area under a normal curve is normalcdf(, in the DISTR menu. That menu is 2nd, then vars. normalcdf( is option 2. pdf draws the curve; cdf gives the area.",
        keys,
      },
      {
        title: "Read the area",
        why: `The arguments are lower, upper, mean, standard deviation. This one is the area ${where}, mean ${mean}, standard deviation ${sd}. A probability is the area, already a decimal. Multiply by 100 only if the question asks for a percent.`,
        keys: [],
      },
    ],
  };
}

function invPlan(text: string, area: number, mean: number, sd: number): Interpret {
  if (!(area > 0 && area < 1)) return { error: "invNorm needs an area between 0 and 1. A 95th percentile is area 0.95." };
  return {
    title: "Inverse normal",
    problem: text,
    steps: [
      wake(),
      {
        title: "Open invNorm(",
        why: "When the question gives the area and asks for the cutoff, use invNorm(, option 3 in DISTR (2nd, vars). It is the reverse of normalcdf(.",
        keys: [stroke("2nd", "2nd"), stroke("vars", "vars"), stroke("n3", "3"), ...numberKeys(area), stroke("comma", ","), ...numberKeys(mean), stroke("comma", ","), ...numberKeys(sd), stroke("rparen", ")"), stroke("enter", "enter")],
      },
      { title: "Read the cutoff", why: "The result is the value with that area to its left. For a standard normal percentile, that value is the z-score.", keys: [] },
    ],
  };
}

function listEntry(values: number[], column: "L1" | "L2"): Beat {
  const keys: Stroke[] = [];
  values.forEach((value) => keys.push(...numberKeys(value), stroke("enter", "enter")));
  return {
    title: column === "L1" ? "Type the data into L1" : "Type the y-values into L2",
    why: column === "L1"
      ? "Each number, then enter. Enter commits the cell and moves down. The blank row under the last value is normal."
      : "Arrow up to row 1 before leaving L1, then right into L2. Right stays on the same row, so starting lower would pad L2 with zeros.",
    keys,
  };
}

function statsPlan(text: string, values: number[]): Interpret {
  if (values.length < 2) return { error: "1-Var Stats needs at least two numbers." };
  return {
    title: "One-variable statistics",
    problem: text,
    steps: [
      wake(),
      { title: "Open the list editor", why: "stat, then 1:Edit. L1 is the first column. This is where the data lives; the home screen is the wrong place for a list.", keys: [stroke("stat", "stat"), stroke("n1", "1")] },
      listEntry(values, "L1"),
      { title: "Quit to the home screen", why: "2nd, then mode, is quit. The list stays in memory. Quit does not clear L1.", keys: [stroke("2nd", "2nd"), stroke("mode", "mode")] },
      { title: "Choose 1-Var Stats", why: "stat, then the right arrow, opens CALC. 1-Var Stats is option 1.", keys: [stroke("stat", "stat"), stroke("right", "right"), stroke("n1", "1")] },
      { title: "Move to Calculate", why: "The cursor starts on the list name. Down moves to Calculate. Enter runs it. x̄ is the mean. Sx is the sample standard deviation.", keys: [stroke("down", "down"), stroke("enter", "enter")] },
    ],
  };
}

function regressionPlan(text: string, pairs: [number, number][]): Interpret {
  if (pairs.length < 2) return { error: "Regression needs at least two points, written like (1, 2) (2, 4)." };
  const xs = pairs.map((pair) => pair[0]);
  const ys = pairs.map((pair) => pair[1]);
  const up = repeat("up", "up", xs.length);
  return {
    title: "Linear regression",
    problem: text,
    steps: [
      wake(),
      { title: "Open the list editor", why: "stat, then 1:Edit. Paired data goes in L1 and L2, x beside y.", keys: [stroke("stat", "stat"), stroke("n1", "1")] },
      listEntry(xs, "L1"),
      { title: "Move to the top of L2", why: "You are sitting on the blank row under L1. Up returns to the first row. Right moves to L2 without changing the row.", keys: [...up, stroke("right", "right")] },
      listEntry(ys, "L2"),
      { title: "Choose LinReg(ax+b)", why: "2nd mode quits. stat, right arrow, opens CALC. LinReg(ax+b) is option 4. Option 3 is Med-Med, a different fit. a is the slope and b is the intercept.", keys: [stroke("2nd", "2nd"), stroke("mode", "mode"), stroke("stat", "stat"), stroke("right", "right"), stroke("n4", "4")] },
      { title: "Move to Calculate", why: "Down twice passes Xlist and Ylist. Enter runs it on L1 and L2. Read a, b, and r.", keys: [stroke("down", "down"), stroke("down", "down"), stroke("enter", "enter")] },
    ],
  };
}

function poissonPlan(text: string, lambda: number, x: number, cdf: boolean): Interpret {
  if (!(lambda > 0) || !(x >= 0)) return { error: "Poisson needs a mean above 0 and a count x." };
  return {
    title: cdf ? "poissoncdf" : "poissonpdf",
    problem: text,
    steps: [
      wake(),
      {
        title: cdf ? "Paste poissoncdf(" : "Paste poissonpdf(",
        why: cdf
          ? "2nd, vars opens DISTR. poissoncdf( is letter D, the vars key. The arguments are the mean, then x."
          : "2nd, vars opens DISTR. poissonpdf( is letter C, the prgm key. The arguments are the mean, then x.",
        keys: [stroke("2nd", "2nd"), stroke("vars", "vars"), stroke(cdf ? "inv" : "prgm", cdf ? "inv" : "prgm"), ...numberKeys(lambda), stroke("comma", ","), ...numberKeys(x), stroke("rparen", ")"), stroke("enter", "enter")],
      },
      { title: "Read the probability", why: "The result is a probability between 0 and 1.", keys: [] },
    ],
  };
}

function twoVarPlan(text: string, pairs: [number, number][]): Interpret {
  if (pairs.length < 2) return { error: "2-Var Stats needs at least two points, written like (1, 2) (2, 4)." };
  const xs = pairs.map((pair) => pair[0]);
  const ys = pairs.map((pair) => pair[1]);
  const up = repeat("up", "up", xs.length);
  return {
    title: "Two-variable statistics",
    problem: text,
    steps: [
      wake(),
      { title: "Open the list editor", why: "stat, then 1:Edit. Paired data goes in L1 and L2.", keys: [stroke("stat", "stat"), stroke("n1", "1")] },
      listEntry(xs, "L1"),
      { title: "Move to the top of L2", why: "Up returns to the first row. Right moves into L2 on that same row.", keys: [...up, stroke("right", "right")] },
      listEntry(ys, "L2"),
      { title: "Choose 2-Var Stats", why: "2nd mode quits. stat, right arrow, opens CALC. 2-Var Stats is option 2.", keys: [stroke("2nd", "2nd"), stroke("mode", "mode"), stroke("stat", "stat"), stroke("right", "right"), stroke("n2", "2")] },
      { title: "Move to Calculate", why: "Down twice passes the two list names. Enter runs it. x̄ and ȳ are the two means.", keys: [stroke("down", "down"), stroke("down", "down"), stroke("enter", "enter")] },
    ],
  };
}

function binomialPlan(text: string, n: number, p: number, x: number, cdf: boolean): Interpret {
  if (!(n >= 0) || !(p >= 0 && p <= 1) || !(x >= 0)) return { error: "Binomial needs n trials, probability p between 0 and 1, and x successes." };
  return {
    title: cdf ? "Binomial cumulative probability" : "Binomial probability",
    problem: text,
    steps: [
      wake(),
      {
        title: cdf ? "Open binomcdf(" : "Open binompdf(",
        why: cdf
          ? "2nd, vars opens DISTR. binomcdf( is letter B. B is printed on the apps key, so press apps. It adds the probabilities from 0 through x."
          : "2nd, vars opens DISTR. binompdf( is letter A, not option 4. A is printed on the math key, so press math. The arguments are n, p, x.",
        keys: [stroke("2nd", "2nd"), stroke("vars", "vars"), stroke(cdf ? "apps" : "math", cdf ? "apps" : "math"), ...numberKeys(n), stroke("comma", ","), ...numberKeys(p), stroke("comma", ","), ...numberKeys(x), stroke("rparen", ")"), stroke("enter", "enter")],
      },
      { title: "Read the probability", why: "The result is a probability between 0 and 1.", keys: [] },
    ],
  };
}

function degreePlan(text: string, fn: "sin" | "cos" | "tan", degrees: number): Interpret {
  const name = { sin: "sin", cos: "cos", tan: "tan" }[fn];
  return {
    title: `${name} in degree mode`,
    problem: text,
    steps: [
      wake(),
      { title: "Open mode", why: "The status bar says RADIAN until you change it. Trig in degrees is wrong while that word is showing.", keys: [stroke("mode", "mode")] },
      { title: "Select DEGREE", why: "Down twice reaches the third row, RADIAN and DEGREE. Right highlights DEGREE. Enter sets it. The highlight is the setting; you still have to press enter.", keys: [stroke("down", "down"), stroke("down", "down"), stroke("right", "right"), stroke("enter", "enter")] },
      { title: "Quit", why: "2nd mode is quit. The status bar should now say DEGREE.", keys: [stroke("2nd", "2nd"), stroke("mode", "mode")] },
      { title: `Enter ${name}(${degrees})`, why: "The function key types the name and the opening parenthesis. Close it, then enter.", keys: [stroke(fn, name), ...numberKeys(degrees), stroke("rparen", ")"), stroke("enter", "enter")] },
    ],
  };
}

function homePlan(text: string, raw: string): Interpret {
  const typed = exprKeys(raw);
  if (!typed) return { error: `I don't recognize that as a calculator problem. ${EXAMPLES}` };
  try {
    run(typed.source, emptyEnv());
  } catch {
    return { error: `That expression is not one I can type on this keypad. ${EXAMPLES}` };
  }
  return {
    title: "Home screen",
    problem: text,
    steps: [
      wake(),
      { title: "Type it on the home screen", why: "The home screen is for a single calculation. X,T,θ,n types X. The negative key, (−), is different from subtract.", keys: [...typed.keys, stroke("enter", "enter")] },
      { title: "Read the result", why: "The answer is right-aligned under the expression. 2nd, (−) recalls Ans if the next line needs it.", keys: [] },
    ],
  };
}

function tablePlan(text: string, raw: string): Interpret {
  const typed = exprKeys(raw);
  if (!typed) return { error: "Write the equation after table, like table of 2x+1." };
  return {
    title: "Table of values",
    problem: text,
    steps: [
      wake(),
      { title: "Enter Y1", why: "The table reads Y1. It does not read the home screen.", keys: [stroke("y=", "y="), ...typed.keys] },
      { title: "Open the table", why: "2nd, then graph, is TABLE. The x-values start at TblStart, which is 0 until you change it in TBLSET (2nd, window).", keys: [stroke("2nd", "2nd"), stroke("graph", "graph")] },
      { title: "Read the rows", why: "Each row is an x and the Y1 that goes with it. Up and down scroll.", keys: [] },
    ],
  };
}

function graphOnly(text: string, raw: string): Interpret {
  const typed = exprKeys(raw);
  if (!typed) return { error: "Type the equation too, like y = 2x + 1." };
  return {
    title: "Graph",
    problem: text,
    steps: [
      ...graphSetup(raw, "Y1"),
      { title: "Look at the graph", why: "That curve is Y1. The window is the standard one, x and y from −10 to 10.", keys: [] },
    ],
  };
}

const LEXICON: [string, string[]][] = [
  ["zero", ["zero", "zeros", "root", "roots", "xintercept", "xintercepts"]],
  ["min", ["minimum", "minima", "min"]],
  ["max", ["maximum", "maxima", "max"]],
  ["vertex", ["vertex", "vertices"]],
  ["intersect", ["intersect", "intersection", "intersects", "crossing", "cross"]],
  ["stats", ["average", "mean", "median", "stdev", "deviation", "statistics", "stats", "avg", "std"]],
  ["reg", ["regression", "linreg", "bestfit", "trendline", "trend"]],
  ["binom", ["binomial", "binom", "binompdf", "binomcdf"]],
  ["inv", ["invnorm", "percentile", "cutoff"]],
  ["normal", ["normal", "normalcdf", "probability", "between", "below", "above", "less", "greater", "under"]],
  ["degree", ["degree", "degrees", "degres", "deg"]],
  ["radian", ["radian", "radians"]],
  ["table", ["table"]],
  ["graph", ["graph", "sketch", "plot"]],
  ["sin", ["sin", "sine"]],
  ["cos", ["cos", "cosine"]],
  ["tan", ["tan", "tangent"]],
];

const EXACT = new Map<string, string>();
for (const [canon, words] of LEXICON) for (const word of words) EXACT.set(word, canon);

function distance(a: string, b: string) {
  const rows = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) rows[i][0] = i;
  for (let j = 0; j <= b.length; j++) rows[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + cost);
    }
  }
  return rows[a.length][b.length];
}

const SKIP = new Set(["the", "and", "for", "you", "how", "are", "was", "not", "but", "can", "has", "had", "than", "then", "that", "this", "with", "from", "your", "have", "just", "like", "into", "over", "also", "only", "some", "them", "very", "when", "what", "will", "here", "more", "most", "much", "such", "each", "even", "well", "were", "been", "they", "does", "where", "find", "show", "type", "its", "its", "out", "all", "any", "our", "now", "one", "two"]);

function closest(word: string) {
  const known = EXACT.get(word);
  if (known) return { canon: known, written: word };
  if (word.length < 3 || SKIP.has(word)) return null;
  const limit = word.length >= 6 ? 2 : 1;
  let best: { canon: string; written: string } | null = null;
  let bestD = limit + 1;
  for (const [canon, words] of LEXICON) {
    for (const written of words) {
      if (Math.abs(written.length - word.length) > limit) continue;
      const score = distance(word, written);
      if (score < bestD) { best = { canon, written }; bestD = score; }
    }
  }
  return bestD <= limit ? best : null;
}

function hear(input: string) {
  const hits = new Set<string>();
  const text = input.toLowerCase()
    .replace(/[’']/g, "")
    .replace(/\bsquare\s+roots?\b/g, " sqrt ")
    .replace(/\bthen\b/g, "than")
    .replace(/\bx-intercepts?\b/g, " xintercept ")
    .replace(/\b(sin|cos|tan)(\d)/g, "$1 $2")
    .split(/([^a-z0-9]+)/)
    .map((part) => {
      if (!/^[a-z]/.test(part)) return part;
      const found = closest(part);
      if (!found) return part;
      hits.add(found.canon);
      return found.written;
    })
    .join("");
  return { text: text.replace(/\s+/g, " ").trim(), hits };
}

function tag(plan: Interpret, readAs: string): Interpret {
  if ("error" in plan) return plan;
  return { ...plan, readAs };
}

function chunksOf(text: string) {
  const stripped = text
    .replace(/\b(zero|root|roots|minimum|maximum|min|max|vertex|intersect|intersection|graph|plot|table|find|the|of|for|a|an|what|is|whats|please|can|you|how|do|i|solve|equation|function|where|does|equal|equals)\b/gi, " ")
    .replace(/y\s*=/gi, " ")
    .replace(/f\s*\(\s*x\s*\)\s*=/gi, " ")
    .replace(/=\s*0\b/g, " ");
  return stripped.split(/\b(?:and|with)\b/i)
    .map((part) => part.replace(/[^0-9xX+\-*/^().,π√°]/g, ""))
    .map((part) => part.replace(/^[+*/^.,]+|[+*/^.,]+$/g, ""))
    .filter((part) => /[0-9xπ√]/i.test(part) && exprKeys(part));
}

function grab(text: string, pattern: RegExp) {
  const match = text.match(pattern);
  return match ? Number(match[1]) : null;
}

function numbersIn(text: string) {
  const tail = text.replace(/^.*?\b(?:of|for|:)\s+/i, "");
  const source = (tail === text ? text : tail).replace(/\b1\s*[- ]?\s*var\b/gi, " ");
  return [...source.matchAll(/-?\d+(?:\.\d+)?/g)].map((match) => Number(match[0]));
}

export function interpret(input: string): Interpret {
  const original = input.trim().replace(/\s+/g, " ");
  if (!original) return { error: "Type a problem." };
  const adapted = adapt(original);
  const { text, hits } = hear(adapted);
  const has = (name: string) => hits.has(name);
  const mean = grab(text, /(?:mean|μ|mu|average)\s*(?:=|of|is)?\s*(-?\d+(?:\.\d+)?)/) ?? 0;
  const sd = grab(text, /(?:sd|std|sigma|deviation)\s*(?:=|of|is)?\s*(-?\d+(?:\.\d+)?)/) ?? 1;

  if (has("binom") || /\bn\s*=/.test(text) && /\bp\s*=/.test(text)) {
    const n = grab(text, /\bn\s*=\s*(-?\d+(?:\.\d+)?)/) ?? grab(text, /(\d+(?:\.\d+)?)\s+trials/);
    const p = grab(text, /\bp\s*=\s*(-?\d+(?:\.\d+)?)/) ?? grab(text, /(?:probability|p)\s*(?:=|of)?\s*(-?\d+(?:\.\d+)?)/);
    const x = grab(text, /\bx\s*=\s*(-?\d+(?:\.\d+)?)/) ?? grab(text, /exactly\s+(-?\d+(?:\.\d+)?)/) ?? grab(text, /at most\s+(-?\d+(?:\.\d+)?)/);
    const nums = numbersIn(text);
    const prob = p ?? nums.find((value) => value > 0 && value < 1) ?? null;
    const whole = nums.filter((value) => value !== prob && value >= 1);
    const trials = n ?? whole[0] ?? null;
    const success = x ?? whole[1] ?? null;
    if (trials !== null && prob !== null && success !== null) {
      const cdf = /cdf|at most/.test(text);
      return tag(binomialPlan(original, trials, prob, success, cdf), cdf ? `binomcdf(${trials}, ${prob}, ${success})` : `binompdf(${trials}, ${prob}, ${success})`);
    }
  }

  if (/poisson/.test(text)) {
    const nums = numbersIn(text);
    const lambda = grab(text, /(?:lambda|λ|mean|mu|μ)\s*=?\s*(-?\d+(?:\.\d+)?)/) ?? nums[0] ?? null;
    const count = grab(text, /\bx\s*=\s*(-?\d+(?:\.\d+)?)/) ?? nums.find((value) => value !== lambda) ?? null;
    if (lambda !== null && count !== null) {
      const cdf = /cdf|at most/.test(text);
      return tag(poissonPlan(original, lambda, count, cdf), cdf ? `poissoncdf(${lambda}, ${count})` : `poissonpdf(${lambda}, ${count})`);
    }
  }

  if (has("inv") || /z-?score/.test(text)) {
    const percent = grab(text, /(\d+(?:\.\d+)?)\s*(?:st|nd|rd|th)?\s*percentile/) ?? grab(text, /percentile\s*(?:=|of|is)?\s*(\d+(?:\.\d+)?)/);
    const area = percent !== null && percent > 1 ? percent / 100 : percent !== null ? percent : grab(text, /(0?\.\d+)/);
    if (area !== null) return tag(invPlan(original, area, mean, sd), `invNorm(${area})`);
  }

  const pairs = [...adapted.matchAll(/\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/g)].map((match) => [Number(match[1]), Number(match[2])] as [number, number]);
  if (pairs.length >= 2 && /2\s*[- ]?var|two variable/.test(text)) return tag(twoVarPlan(original, pairs), `2-Var Stats of ${pairs.length} points`);
  if (pairs.length >= 2 && (has("reg") || !has("zero") && !has("normal") && !has("min") && !has("max"))) {
    return tag(regressionPlan(original, pairs), `Line through ${pairs.length} points`);
  }

  const areaWords = has("normal") || /p\s*\(|\bz\s*[<>=]|less than|greater than|below|above|left of|right of|between|from\s+-?\d/.test(text);
  if (areaWords && !has("zero") && !has("min") && !has("max") && !/x\s*\^|y\s*=/.test(text)) {
    const between = text.match(/between\s+(?:z\s*=\s*)?(-?\d+(?:\.\d+)?)\s+and\s+(?:z\s*=\s*)?(-?\d+(?:\.\d+)?)/) || text.match(/from\s+(-?\d+(?:\.\d+)?)\s+to\s+(-?\d+(?:\.\d+)?)/);
    const band = text.match(/p\s*\(\s*(-?\d+(?:\.\d+)?)\s*<\s*[zx]\s*<\s*(-?\d+(?:\.\d+)?)\s*\)/);
    if (between) return tag(normalPlan(original, Number(between[1]), Number(between[2]), mean, sd), `Area from ${between[1]} to ${between[2]}`);
    if (band) return tag(normalPlan(original, Number(band[1]), Number(band[2]), mean, sd), `Area from ${band[1]} to ${band[2]}`);
    const left = text.match(/(?:less than|below|under|to the left of|<)\s*(?:z\s*=\s*)?(-?\d+(?:\.\d+)?)/);
    const right = text.match(/(?:greater than|above|more than|to the right of|>)\s*(?:z\s*=\s*)?(-?\d+(?:\.\d+)?)/);
    if (left) return tag(normalPlan(original, null, Number(left[1]), mean, sd), `Area below ${left[1]}`);
    if (right) return tag(normalPlan(original, Number(right[1]), null, mean, sd), `Area above ${right[1]}`);
  }

  const trig = text.match(/\b(sin|cos|tan)\s*\(?\s*(-?\d+(?:\.\d+)?)/);
  if (trig && !/⁻¹/.test(text) && !has("radian") && !/π/.test(adapted)) {
    return tag(degreePlan(original, trig[1] as "sin" | "cos" | "tan", Number(trig[2])), `${trig[1]} ${trig[2]} degrees`);
  }

  const yMatch = adapted.match(/^(?:y|f\s*\(\s*x\s*\))\s*=\s*(.+)$/i);
  if (yMatch && !has("zero") && !has("min") && !has("max") && !has("vertex")) {
    const body = yMatch[1];
    if (has("table")) return tag(tablePlan(original, body), `Table of ${body}`);
    if (has("graph") || !rootsOf(exprKeys(body)?.source || "").length) return tag(graphOnly(original, body), `Graph ${body}`);
    return tag(zeroPlan(original, body), `Zero of ${body}`);
  }

  const solved = equationExpr(adapted);
  if (solved && !has("graph") && !has("table") && !has("min") && !has("max") && !has("intersect")) {
    const plan = zeroPlan(original, solved);
    if (!("error" in plan)) return tag(plan, `Zero of ${solved}`);
  }

  const parts = chunksOf(text);
  if (has("intersect") && parts.length >= 2) return tag(intersectPlan(original, parts[0], parts[1]), `Intersection of ${parts[0]} and ${parts[1]}`);
  if ((has("min") || has("max") || has("vertex")) && parts[0]) {
    const kind = has("min") ? "min" : has("max") ? "max" : (extremeOf(exprKeys(parts[0])?.source || parts[0], "min") ? "min" : "max");
    return tag(extremePlan(original, parts[0], kind), `${kind === "min" ? "Minimum" : "Maximum"} of ${parts[0]}`);
  }
  if ((has("zero") || /=\s*0\b/.test(text)) && parts[0]) return tag(zeroPlan(original, parts[0].replace(/=\s*0$/, "")), `Zero of ${parts[0]}`);
  if (has("table") && parts[0]) return tag(tablePlan(original, parts[0]), `Table of ${parts[0]}`);
  if (has("graph") && parts[0]) return tag(graphOnly(original, parts[0]), `Graph ${parts[0]}`);

  const bareList = /^-?\d+(?:\.\d+)?(?:\s*(?:,|\s)\s*-?\d+(?:\.\d+)?)+$/.test(original.trim());
  if ((has("stats") || bareList) && !/[+*/^]/.test(text) && !/x/i.test(adapted)) {
    const values = numbersIn(adapted);
    if (values.length >= 2) return tag(statsPlan(original, values), `1-Var Stats of ${values.join(", ")}`);
  }

  if (parts[0] && /x/i.test(parts[0]) && !has("sin") && !has("cos") && !has("tan")) {
    const source = exprKeys(parts[0])?.source || parts[0];
    if (rootsOf(source).length) return tag(zeroPlan(original, parts[0]), `Zero of ${parts[0]}`);
    return tag(graphOnly(original, parts[0]), `Graph ${parts[0]}`);
  }

  const spokenList = adapted.replace(/^(?:data|numbers|values|scores|list)\s*(?:is|are|:)?\s*/i, "");
  const listOk = /^-?\d+(?:\.\d+)?(?:\s*(?:,|\s)\s*-?\d+(?:\.\d+)?)+$/.test(spokenList.trim());
  if ((has("stats") || listOk || bareList) && !/[+*/^]/.test(text) && !/x/i.test(spokenList)) {
    const values = numbersIn(listOk ? spokenList : adapted);
    if (values.length >= 2) return tag(statsPlan(original, values), `1-Var Stats of ${values.join(", ")}`);
  }

  const candidate = adapted.replace(/^(?:the|a|an)\s+/i, "");
  const typed = exprKeys(candidate);
  if (typed && !/x/i.test(typed.source)) {
    const degree = /sin|cos|tan/.test(typed.source) && !/π/.test(typed.source) && !has("radian");
    const env = emptyEnv();
    if (degree) env.angle = "DEGREE";
    try {
      run(typed.source, env);
      if (degree) {
        return tag({
          title: "Degree mode",
          problem: original,
          steps: [
            wake(),
            { title: "Open mode", why: "The status bar says RADIAN until you change it. A degree answer is wrong while that word is showing.", keys: [stroke("mode", "mode")] },
            { title: "Select DEGREE", why: "Down twice reaches RADIAN and DEGREE. Right highlights DEGREE. Enter sets it.", keys: [stroke("down", "down"), stroke("down", "down"), stroke("right", "right"), stroke("enter", "enter")] },
            { title: "Quit", why: "2nd mode is quit. The status bar should now say DEGREE.", keys: [stroke("2nd", "2nd"), stroke("mode", "mode")] },
            { title: "Type it on the home screen", why: "The function key, or the math menu, types the operation. Close the parentheses, then enter.", keys: [...typed.keys, stroke("enter", "enter")] },
            { title: "Read the result", why: "The answer is right-aligned under the expression.", keys: [] },
          ],
        }, candidate);
      }
      return tag(homePlan(original, candidate), candidate);
    } catch {
      /* fall through */
    }
  }
  return { error: "Add the math too. An equation, a list, a root, or an area all work, in any wording." };
}

export function rehearsal(plan: Plan): Os {
  return plan.steps.flatMap((step) => step.keys).reduce((state, key) => press(state, key.id), createOs());
}

export function screenNote(state: Os) {
  if (state.screen === "error") return state.error;
  if (state.results) return [state.results.title, ...state.results.lines].join("\n");
  const last = state.history.at(-1);
  if (last && state.screen === "home") return `${last.expr}\n${last.result}`;
  if (state.mark && state.traceX !== null) {
    const y = evalGraph(state.equations[0], state.traceX, { angle: state.angle, vars: state.vars, ans: state.ans, lists: state.lists, matrices: state.matrices, equations: state.equations, regEq: state.regEq });
    return `${state.mark}\nX=${formatTi(state.traceX, state.notation, state.digits)}  Y=${y === null ? "" : formatTi(y, state.notation, state.digits)}`;
  }
  if (state.screen === "table") return "Table";
  return "";
}
