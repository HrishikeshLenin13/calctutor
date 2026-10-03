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

export function evaluate(source: string, env: Env): number | number[][] {
  const s = source.replace(/RegEQ|Y[123]/g, (token) => {
    const body = token === "RegEQ" ? env.regEq : env.equations[Number(token[1]) - 1];
    return body ? `(${body})` : token;
  });
  let i = 0;
  const value = parseComparison();
  skip();
  if (i < s.length) throw new CalcError("SYNTAX");
  return value;

  function skip() {
    while (s[i] === " ") i++;
  }
  function parseComparison(): number | number[][] {
    const left = parseAdd();
    skip();
    const op = ["≠", "≥", "≤", "="].find((token) => s.startsWith(token, i)) || (s[i] === ">" || s[i] === "<" ? s[i] : "");
    if (!op) return left;
    if (typeof left !== "number") throw new CalcError("DATA TYPE");
    i += op.length;
    const right = parseAdd();
    if (typeof right !== "number") throw new CalcError("DATA TYPE");
    const pass = op === "=" ? left === right : op === "≠" ? left !== right : op === ">" ? left > right : op === "≥" ? left >= right : op === "<" ? left < right : left <= right;
    return pass ? 1 : 0;
  }
  function parseAdd(): number | number[][] {
    let left = parseMul();
    while (true) {
      skip();
      if (s[i] !== "+" && s[i] !== "−" && s[i] !== "-") break;
      const op = s[i++];
      const right = parseMul();
      left = op === "+" ? addValues(left, right) : subValues(left, right);
    }
    return left;
  }
  function parseMul(): number | number[][] {
    let left = parseUnary();
    while (true) {
      skip();
      if (s[i] === "×" || s[i] === "*") {
        i++;
        left = mulValues(left, parseUnary());
        continue;
      }
      if (s[i] === "÷" || s[i] === "/") {
        i++;
        left = divValues(left, parseUnary());
        continue;
      }
      if (startsAtom()) {
        left = mulValues(left, parseUnary());
        continue;
      }
      break;
    }
    return left;
  }
  function startsAtom() {
    const ch = s[i];
    if (!ch || "⁺⁻−+×÷/*^,)]}=≠≥≤<>!²³°".includes(ch)) return false;
    return /[0-9.(π√³[{A-Za-zθ]/.test(ch) || FUNCS.some((name) => s.startsWith(name, i));
  }
  function parseUnary(): number | number[][] {
    skip();
    if (s[i] === "⁻" || s[i] === "−" || s[i] === "-") {
      i++;
      const value = parseUnary();
      if (typeof value !== "number") throw new CalcError("DATA TYPE");
      return -value;
    }
    if (s[i] === "+") {
      i++;
      return parseUnary();
    }
    return parsePower();
  }
  function parsePower(): number | number[][] {
    const base = parsePostfix();
    skip();
    if (s[i] !== "^") return base;
    i++;
    const exp = parseUnary();
    if (typeof base !== "number" || typeof exp !== "number") throw new CalcError("DATA TYPE");
    const value = base ** exp;
    if (!Number.isFinite(value)) throw new CalcError("DOMAIN");
    return value;
  }
  function parsePostfix(): number | number[][] {
    let value = parseAtom();
    while (true) {
      if (s[i] === "!") {
        if (typeof value !== "number") throw new CalcError("DATA TYPE");
        i++;
        value = factorial(value);
      } else if (s[i] === "²") {
        if (typeof value !== "number") throw new CalcError("DATA TYPE");
        i++;
        value *= value;
      } else if (s[i] === "³") {
        if (typeof value !== "number") throw new CalcError("DATA TYPE");
        i++;
        value = value ** 3;
      } else if (s.startsWith("⁻¹", i)) {
        i += 2;
        value = typeof value === "number" ? (value === 0 ? (() => { throw new CalcError("DIVIDE BY 0"); })() : 1 / value) : invertMatrix(value);
      } else if (s[i] === "°") {
        if (typeof value !== "number") throw new CalcError("DATA TYPE");
        i++;
        value = env.angle === "RADIAN" ? (value * Math.PI) / 180 : value;
      } else break;
    }
    return value;
  }
  function parseAtom(): number | number[][] {
    skip();
    const start = i;
    if (s[i] === "(") {
      i++;
      const inner = parseComparison();
      skip();
      if (s[i++] !== ")") throw new CalcError("SYNTAX");
      return inner;
    }
    if (s[i] === "{") return parseBrace();
    const num = readNumber();
    if (num !== null) return num;
    if (s.startsWith("π", i)) {
      i += 1;
      return Math.PI;
    }
    if (s[i] === "[" && "ABC".includes(s[i + 1] || "") && s[i + 2] === "]") {
      const name = s[i + 1] as "A" | "B" | "C";
      i += 3;
      return env.matrices[name].map((row) => [...row]);
    }
    const fn = FUNCS.find((name) => s.startsWith(name, i));
    if (fn) {
      i += fn.length;
      skip();
      if (s[i] !== "(") {
        if (fn === "rand") return Math.random();
        throw new CalcError("SYNTAX");
      }
      i++;
      return call(fn, readArgs());
    }
    if (s.startsWith("Ans", i)) {
      i += 3;
      return env.ans;
    }
    if (/^L[1-6]/.test(s.slice(i, i + 2))) {
      const name = s.slice(i, i + 2);
      i += 2;
      if (s[i] !== "(") throw new CalcError("DATA TYPE");
      i++;
      const index = parseComparison();
      skip();
      if (s[i++] !== ")" || typeof index !== "number") throw new CalcError("SYNTAX");
      const list = env.lists[name] || [];
      const at = Math.round(index) - 1;
      if (at < 0 || at >= list.length) throw new CalcError("INVALID DIM");
      return list[at];
    }
    if (s[i] === "X" && env.bindX !== undefined) {
      i++;
      return env.bindX;
    }
    if (s[i] === "e") {
      i++;
      return Math.E;
    }
    if (s[i] === "i") throw new CalcError("NONREAL ANS");
    if (s[i] && /^[A-Zθ]$/.test(s[i])) return env.vars[s[i++]] ?? 0;
    if (i === start) throw new CalcError("SYNTAX");
    throw new CalcError("SYNTAX");
  }
  function readNumber() {
    const match = s.slice(i).match(/^(?:\d+\.?\d*|\.\d+)(?:(?:ᴇ|[Ee])[⁻−+\-]?\d+)?/);
    if (!match) return null;
    i += match[0].length;
    const value = Number(match[0].replace(/ᴇ|[Ee]/, "e").replace(/⁻|−/g, "-"));
    if (!Number.isFinite(value)) throw new CalcError("DOMAIN");
    return value;
  }
  function readArgs() {
    const args: string[] = [];
    let depth = 1;
    let start = i;
    for (; i < s.length; i++) {
      if (s[i] === "(" || s[i] === "{") depth++;
      else if (s[i] === ")" || s[i] === "}") {
        depth--;
        if (depth === 0) {
          args.push(s.slice(start, i).trim());
          i++;
          return args.filter((arg, index) => arg.length > 0 || index > 0);
        }
      } else if (s[i] === "," && depth === 1) {
        args.push(s.slice(start, i).trim());
        start = i + 1;
      }
    }
    throw new CalcError("SYNTAX");
  }
  function parseBrace(): number[][] {
    i++;
    const values: number[] = [];
    skip();
    if (s[i] === "}") {
      i++;
      return [values];
    }
    while (true) {
      const item = parseComparison();
      if (typeof item !== "number") throw new CalcError("DATA TYPE");
      values.push(item);
      skip();
      if (s[i] === ",") {
        i++;
        continue;
      }
      if (s[i] === "}") {
        i++;
        return [values];
      }
      throw new CalcError("SYNTAX");
    }
  }
  function call(fn: string, args: string[]): number | number[][] {
    if (fn === "nDeriv" || fn === "fnInt" || fn === "solve") return calculus(fn, args);
    if (fn === "sum" || fn === "mean" || fn === "median" || fn === "stdDev") return listCall(fn, args[0] || "");
    if (fn === "det") {
      const matrix = evaluate(args[0] || "", env);
      if (typeof matrix === "number") throw new CalcError("DATA TYPE");
      return determinant(matrix);
    }
    const values = args.map((arg) => {
      const item = evaluate(arg, env);
      if (typeof item !== "number") throw new CalcError("DATA TYPE");
      return item;
    });
    return dispatch(fn, values, env.angle);
  }
  function calculus(fn: string, args: string[]) {
    if (fn === "nDeriv") {
      if (args.length < 3) throw new CalcError("ARGUMENT");
      const at = asNumber(evaluate(args[2], env));
      const sample = (x: number) => asNumber(evaluate(args[0], bind(env, args[1], x)));
      return (sample(at + 1e-4) - sample(at - 1e-4)) / 2e-4;
    }
    if (fn === "fnInt") {
      if (args.length < 4) throw new CalcError("ARGUMENT");
      const a = asNumber(evaluate(args[2], env));
      const b = asNumber(evaluate(args[3], env));
      const n = 80;
      const h = (b - a) / n;
      const sample = (x: number) => asNumber(evaluate(args[0], bind(env, args[1], x)));
      let total = sample(a) + sample(b);
      for (let step = 1; step < n; step++) total += (step % 2 ? 4 : 2) * sample(a + step * h);
      return (total * h) / 3;
    }
    if (args.length < 3) throw new CalcError("ARGUMENT");
    let x = asNumber(evaluate(args[2], env));
    const sample = (value: number) => asNumber(evaluate(args[0], bind(env, args[1], value)));
    for (let step = 0; step < 40; step++) {
      const y = sample(x);
      if (Math.abs(y) < 1e-9) return x;
      const slope = (sample(x + 1e-5) - sample(x - 1e-5)) / 2e-5;
      if (!Number.isFinite(slope) || Math.abs(slope) < 1e-12) break;
      const next = x - y / slope;
      if (Math.abs(next - x) < 1e-10) return next;
      x = next;
    }
    if (Math.abs(sample(x)) > 1e-6) throw new CalcError("NO SIGN CHNG");
    return x;
  }
  function listCall(fn: string, arg: string) {
    const list = readList(arg, env);
    if (!list.length) throw new CalcError("INVALID DIM");
    if (fn === "sum") return list.reduce((a, b) => a + b, 0);
    if (fn === "mean") return list.reduce((a, b) => a + b, 0) / list.length;
    if (fn === "median") return median(list);
    return sampleSd(list);
  }
}
