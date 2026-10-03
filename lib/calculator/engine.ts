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

function bind(env: Env, variable: string, value: number): Env {
  const name = variable.trim();
  if (!/^([A-Z]|θ|X)$/.test(name)) throw new CalcError("SYNTAX");
  return { ...env, vars: { ...env.vars, [name]: value }, bindX: name === "X" ? value : env.bindX };
}
function asNumber(value: number | number[][]) {
  if (typeof value !== "number") throw new CalcError("DATA TYPE");
  return value;
}
function readList(arg: string, env: Env) {
  const name = arg.trim();
  if (/^L[1-6]$/.test(name)) return env.lists[name] || [];
  const value = evaluate(name, env);
  if (typeof value === "number") throw new CalcError("DATA TYPE");
  return value[0] || [];
}

function dispatch(fn: string, args: number[], angle: Angle): number {
  const need = (count: number) => {
    if (args.length !== count) throw new CalcError("ARGUMENT");
  };
  if (fn === "sin") return need(1), Math.sin(toRad(args[0], angle));
  if (fn === "cos") return need(1), Math.cos(toRad(args[0], angle));
  if (fn === "tan") {
    need(1);
    const rad = toRad(args[0], angle);
    if (Math.abs(Math.cos(rad)) < 1e-12) throw new CalcError("DOMAIN");
    return Math.tan(rad);
  }
  if (fn === "sin⁻¹" || fn === "cos⁻¹" || fn === "tan⁻¹") {
    need(1);
    if (fn !== "tan⁻¹" && (args[0] < -1 || args[0] > 1)) throw new CalcError("DOMAIN");
    const rad = fn === "sin⁻¹" ? Math.asin(args[0]) : fn === "cos⁻¹" ? Math.acos(args[0]) : Math.atan(args[0]);
    return angle === "DEGREE" ? (rad * 180) / Math.PI : rad;
  }
  if (fn === "log" || fn === "ln") {
    need(1);
    if (args[0] <= 0) throw new CalcError("DOMAIN");
    return fn === "log" ? Math.log10(args[0]) : Math.log(args[0]);
  }
  if (fn === "√" || fn === "sqrt") {
    need(1);
    if (args[0] < 0) throw new CalcError("DOMAIN");
    return Math.sqrt(args[0]);
  }
  if (fn === "³√") return need(1), Math.cbrt(args[0]);
  if (fn === "abs") return need(1), Math.abs(args[0]);
  if (fn === "min") return args.length ? Math.min(...args) : (() => { throw new CalcError("ARGUMENT"); })();
  if (fn === "max") return args.length ? Math.max(...args) : (() => { throw new CalcError("ARGUMENT"); })();
  if (fn === "round") {
    if (!args.length || args.length > 2) throw new CalcError("ARGUMENT");
    const places = args.length === 2 ? Math.max(0, Math.min(9, Math.trunc(args[1]))) : 0;
    return Number(args[0].toFixed(places));
  }
  if (fn === "iPart") return need(1), Math.trunc(args[0]);
  if (fn === "fPart") return need(1), args[0] - Math.trunc(args[0]);
  if (fn === "nCr") return need(2), combination(args[0], args[1]);
  if (fn === "nPr") return need(2), permutation(args[0], args[1]);
  if (fn === "rand") return Math.random();
  if (fn === "randInt") {
    need(2);
    const low = Math.ceil(args[0]);
    const high = Math.floor(args[1]);
    if (high < low) throw new CalcError("DOMAIN");
    return low + Math.floor(Math.random() * (high - low + 1));
  }
  if (fn === "normalpdf") {
    const [x, mu, sigma] = pad(args, 1);
    return normalPdf(x, mu, sigma);
  }
  if (fn === "normalcdf") {
    if (args.length !== 2 && args.length !== 4) throw new CalcError("ARGUMENT");
    const mu = args.length === 4 ? args[2] : 0;
    const sigma = args.length === 4 ? args[3] : 1;
    return normalCdf(args[1], mu, sigma) - normalCdf(args[0], mu, sigma);
  }
  if (fn === "invNorm") {
    const [p, mu, sigma] = pad(args, 1);
    return invNorm(p, mu, sigma);
  }
  if (fn === "binompdf") return need(3), binomPmf(args[0], args[1], args[2]);
  if (fn === "binomcdf") {
    need(3);
    let total = 0;
    for (let k = 0; k <= args[2]; k++) total += binomPmf(args[0], args[1], k);
    return total;
  }
  if (fn === "poissonpdf") return need(2), poissonPmf(args[0], args[1]);
  if (fn === "poissoncdf") {
    need(2);
    let total = 0;
    for (let k = 0; k <= args[1]; k++) total += poissonPmf(args[0], k);
    return total;
  }
  throw new CalcError("SYNTAX");
}

function pad(args: number[], n: number): [number, number, number] {
  if (args.length === n) return [args[0], 0, 1];
  if (args.length === n + 2) return [args[0], args[1], args[2]];
  throw new CalcError("ARGUMENT");
}
function toRad(value: number, angle: Angle) {
  return angle === "DEGREE" ? (value * Math.PI) / 180 : value;
}

function addValues(a: number | number[][], b: number | number[][]) {
  if (typeof a === "number" && typeof b === "number") return a + b;
  if (typeof a !== "number" && typeof b !== "number") return map2(a, b, (x, y) => x + y);
  throw new CalcError("DATA TYPE");
}
function subValues(a: number | number[][], b: number | number[][]) {
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a !== "number" && typeof b !== "number") return map2(a, b, (x, y) => x - y);
  throw new CalcError("DATA TYPE");
}
function mulValues(a: number | number[][], b: number | number[][]) {
  if (typeof a === "number" && typeof b === "number") return a * b;
  if (typeof a === "number" && typeof b !== "number") return b.map((row) => row.map((cell) => cell * a));
  if (typeof a !== "number" && typeof b === "number") return a.map((row) => row.map((cell) => cell * b));
  return multiplyMatrices(a as number[][], b as number[][]);
}
function divValues(a: number | number[][], b: number | number[][]) {
  if (typeof a !== "number" || typeof b !== "number") throw new CalcError("DATA TYPE");
  if (b === 0) throw new CalcError("DIVIDE BY 0");
  return a / b;
}
function factorial(n: number) {
  if (n < 0 || !isInt(n) || n > 170) throw new CalcError("DOMAIN");
  let value = 1;
  for (let i = 2; i <= Math.round(n); i++) value *= i;
  return value;
}
function combination(n: number, r: number) {
  if (!isInt(n) || !isInt(r) || n < 0 || r < 0 || r > n) throw new CalcError("DOMAIN");
  return permutation(n, r) / factorial(r);
}
function permutation(n: number, r: number) {
  if (!isInt(n) || !isInt(r) || n < 0 || r < 0 || r > n) throw new CalcError("DOMAIN");
  let value = 1;
  for (let i = 0; i < r; i++) value *= n - i;
  return value;
}
function isInt(n: number) {
  return Math.abs(n - Math.round(n)) < 1e-9;
}
function binomPmf(n: number, p: number, k: number) {
  if (!isInt(n) || !isInt(k) || n < 0 || k < 0 || k > n || p < 0 || p > 1) throw new CalcError("DOMAIN");
  let coeff = 1;
  const rr = Math.min(k, n - k);
  for (let i = 1; i <= rr; i++) coeff = (coeff * (n - rr + i)) / i;
  return coeff * p ** k * (1 - p) ** (n - k);
}
function poissonPmf(mu: number, k: number) {
  if (mu < 0 || !isInt(k) || k < 0) throw new CalcError("DOMAIN");
  let value = Math.exp(-mu);
  for (let i = 1; i <= k; i++) value *= mu / i;
  return value;
}

export function normalPdf(x: number, mu = 0, sigma = 1) {
  if (!(sigma > 0)) throw new CalcError("DOMAIN");
  return Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI));
}
export function normalCdf(x: number, mu = 0, sigma = 1) {
  if (!(sigma > 0)) throw new CalcError("DOMAIN");
  const z = (x - mu) / sigma;
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p = 1 - d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z >= 0 ? p : 1 - p;
}
export function invNorm(p: number, mu = 0, sigma = 1) {
  if (p <= 0 || p >= 1 || sigma <= 0) throw new CalcError("DOMAIN");
  const a = [-39.6968302866538, 220.946098424521, -275.928510446969, 138.357751867269, -30.6647980661472, 2.50662827745924];
  const b = [-54.4760987982241, 161.585836858041, -155.698979859887, 66.8013118877197, -13.2806815528857];
  const c = [-0.00778489400243029, -0.322396458041136, -2.40075827716184, -2.54973253934373, 4.37466414146497, 2.93816398269878];
  const d = [0.00778469570904146, 0.32246712907004, 2.445134137143, 3.75440866190742];
  let x: number;
  if (p < 0.02425) {
    const q = Math.sqrt(-2 * Math.log(p));
    x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p > 1 - 0.02425) {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else {
    const q = p - 0.5;
    const r = q * q;
    x = ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  return mu + sigma * x;
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
function sampleSd(values: number[]) {
  if (values.length < 2) throw new CalcError("DIVIDE BY 0");
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / (values.length - 1));
}

export interface OneVar {
  n: number;
  mean: number;
  sum: number;
  sumSq: number;
  sx: number | null;
  ox: number;
  min: number;
  q1: number;
  med: number;
  q3: number;
  max: number;
}

export function oneVarStats(values: number[]): OneVar {
  if (!values.length) throw new CalcError("INVALID DIM");
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / values.length;
  const ss = values.reduce((a, b) => a + (b - mean) ** 2, 0);
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const lower = sorted.slice(0, mid);
  const upper = sorted.slice(sorted.length % 2 ? mid + 1 : mid);
  return {
    n: values.length,
    mean,
    sum,
    sumSq: values.reduce((a, b) => a + b * b, 0),
    sx: values.length > 1 ? Math.sqrt(ss / (values.length - 1)) : null,
    ox: Math.sqrt(ss / values.length),
    min: sorted[0],
    q1: median(lower.length ? lower : [sorted[0]]),
    med: median(sorted),
    q3: median(upper.length ? upper : [sorted.at(-1)!]),
    max: sorted.at(-1)!,
  };
}

export function linReg(xs: number[], ys: number[]) {
  if (xs.length !== ys.length || xs.length < 2) throw new CalcError("DIM MISMATCH");
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  for (let i = 0; i < n; i++) {
    sxx += (xs[i] - mx) ** 2;
    syy += (ys[i] - my) ** 2;
    sxy += (xs[i] - mx) * (ys[i] - my);
  }
  if (sxx === 0) throw new CalcError("DOMAIN");
  const slope = sxy / sxx;
  const intercept = my - slope * mx;
  const r = syy === 0 ? (slope === 0 ? 1 : 0) : sxy / Math.sqrt(sxx * syy);
  return { slope, intercept, r, r2: r * r };
}

export interface TvmInput {
  n: number;
  iPct: number;
  pv: number;
  pmt: number;
  fv: number;
  py: number;
  cy: number;
  begin: boolean;
}
