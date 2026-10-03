export class CalcError extends Error {
  kind: string;
  constructor(kind: string) {
    super(kind);
    this.kind = kind;
  }
}

export type Notation = "NORMAL" | "SCI" | "ENG";
export type Digits = "FLOAT" | number;
export type Angle = "RADIAN" | "DEGREE";

export interface Env {
  angle: Angle;
  vars: Record<string, number>;
  ans: number;
  lists: Record<string, number[]>;
  matrices: Record<"A" | "B" | "C", number[][]>;
  equations: [string, string, string];
  regEq: string;
  bindX?: number;
}

export function emptyEnv(): Env {
  return {
    angle: "RADIAN",
    vars: {},
    ans: 0,
    lists: { L1: [], L2: [], L3: [], L4: [], L5: [], L6: [] },
    matrices: {
      A: [[1, 0], [0, 1]],
      B: [[0, 0], [0, 0]],
      C: [[0, 0], [0, 0]],
    },
    equations: ["", "", ""],
    regEq: "",
  };
}

const FUNCS = [
  "poissoncdf", "poissonpdf", "binomcdf", "binompdf", "normalcdf", "normalpdf", "invNorm",
  "sin⁻¹", "cos⁻¹", "tan⁻¹", "stdDev", "median", "nDeriv", "fnInt", "solve", "round",
  "fPart", "iPart", "nCr", "nPr", "mean", "sqrt", "abs", "sin", "cos", "tan", "log", "ln",
  "sum", "det", "randInt", "rand", "max", "min", "³√", "√",
].sort((a, b) => b.length - a.length);

export function formatTi(n: number, notation: Notation = "NORMAL", digits: Digits = "FLOAT"): string {
  if (!Number.isFinite(n)) throw new CalcError("DOMAIN");
  if (n === 0) return digits === "FLOAT" || notation !== "NORMAL" ? "0" : (0).toFixed(digits);
  const sign = n < 0 ? "⁻" : "";
  const a = Math.abs(Number(n.toPrecision(12)));
  if (notation === "SCI") return sign + sci(a, digits, true);
  if (notation === "ENG") return sign + eng(a, digits);
  if (digits !== "FLOAT") {
    if (a >= 1e10 || a < 10 ** -(digits + 1)) return sign + sci(a, digits, true);
    return sign + a.toFixed(digits);
  }
  if (a >= 1e10 || a < 1e-4) return sign + sci(a, "FLOAT", true);
  let text = a.toPrecision(10);
  if (/e/i.test(text)) return sign + sci(a, "FLOAT", true);
  if (text.includes(".")) text = text.replace(/0+$/, "").replace(/\.$/, "");
  return sign + text;
}

function sci(a: number, digits: Digits, force: boolean) {
  const exp = Math.floor(Math.log10(a));
  const mant = a / 10 ** exp;
  return mantissa(mant, digits) + expString(exp, force);
}

function eng(a: number, digits: Digits) {
  let exp = Math.floor(Math.log10(a) / 3) * 3;
  let mant = a / 10 ** exp;
  if (mant >= 1000) {
    mant /= 1000;
    exp += 3;
  }
  return mantissa(mant, digits) + expString(exp, true);
}

function mantissa(value: number, digits: Digits) {
  const places = digits === "FLOAT" ? 9 : digits;
  const text = value.toFixed(places);
  return digits === "FLOAT" ? text.replace(/0+$/, "").replace(/\.$/, "") : text;
}

function expString(exp: number, force: boolean) {
  if (exp === 0 && !force) return "";
  return exp < 0 ? `ᴇ⁻${Math.abs(exp)}` : `ᴇ${exp}`;
}

export function toFraction(n: number): string | null {
  if (!Number.isFinite(n)) return null;
  const sign = n < 0 ? "⁻" : "";
  const x = Math.abs(n);
  let h0 = 0;
  let h1 = 1;
  let k0 = 1;
  let k1 = 0;
  let rest = x;
  for (let step = 0; step < 24; step++) {
    const whole = Math.floor(rest);
    const h2 = whole * h1 + h0;
    const k2 = whole * k1 + k0;
    if (k2 > 10000) break;
    h0 = h1;
    k0 = k1;
    h1 = h2;
    k1 = k2;
    if (Math.abs(x - h1 / k1) < 1e-10) break;
    const frac = rest - whole;
    if (frac < 1e-12) break;
    rest = 1 / frac;
  }
  if (!k1 || Math.abs(x - h1 / k1) > 1e-8) return null;
  return k1 === 1 ? sign + String(h1) : `${sign}${h1}/${k1}`;
}

export interface RunResult {
  text: string;
  env: Env;
  done?: boolean;
}

export function run(source: string, env: Env, notation: Notation = "NORMAL", digits: Digits = "FLOAT"): RunResult {
  const expr = source.trim();
  if (!expr) throw new CalcError("SYNTAX");
  const next = cloneEnv(env);
  const sorted = expr.match(/^Sort([AD])\((L[1-6])\)$/);
  if (sorted) {
    const values = [...(next.lists[sorted[2]] || [])].sort((a, b) => a - b);
    next.lists[sorted[2]] = sorted[1] === "A" ? values : values.reverse();
    return { text: "Done", env: next, done: true };
  }
  const cleared = expr.match(/^ClrList ((?:L[1-6],)*L[1-6])$/);
  if (cleared) {
    for (const name of cleared[1].split(",")) next.lists[name] = [];
    return { text: "Done", env: next, done: true };
  }
  if (expr === "SetUpEditor") return { text: "Done", env: next, done: true };

  const stored = splitStore(expr);
  if (stored) {
    const value = evaluate(stored.value, next);
    if (typeof value !== "number") throw new CalcError("DATA TYPE");
    for (const name of stored.names) {
      if (!/^([A-Z]|θ)$/.test(name)) throw new CalcError("SYNTAX");
      next.vars[name] = value;
    }
    next.ans = value;
    return { text: formatTi(value, notation, digits), env: next };
  }

  const frac = /►Frac\s*$/.test(expr);
  const value = evaluate(frac ? expr.replace(/►Frac\s*$/, "") : expr, next);
  if (typeof value !== "number") return { text: formatMatrix(value), env: next };
  next.ans = value;
  if (frac) {
    const pretty = toFraction(value);
    if (!pretty) throw new CalcError("DOMAIN");
    return { text: pretty, env: next };
  }
  return { text: formatTi(value, notation, digits), env: next };
}

export function formatWith(n: number, notation: Notation, digits: Digits) {
  return formatTi(n, notation, digits);
}

function splitStore(expr: string) {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (ch === "(" || ch === "{") depth++;
    else if (ch === ")" || ch === "}") depth = Math.max(0, depth - 1);
    else if (ch === "→" && depth === 0) {
      parts.push(expr.slice(start, i).trim());
      start = i + 1;
    }
  }
  if (!parts.length) return null;
  parts.push(expr.slice(start).trim());
  if (parts.some((part) => !part)) throw new CalcError("SYNTAX");
  return { value: parts[0], names: parts.slice(1) };
}
