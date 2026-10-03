import {
  CalcError,
  type Angle,
  type Digits,
  type Env,
  type Notation,
  emptyEnv,
  evalGraph,
  formatTi,
  linReg,
  oneVarStats,
  readValue,
  run,
  solveTvm,
} from "./engine";

export type KeyId =
  | "y=" | "window" | "zoom" | "trace" | "graph"
  | "2nd" | "mode" | "del" | "up" | "down" | "left" | "right"
  | "alpha" | "xt" | "stat"
  | "math" | "apps" | "prgm" | "vars" | "clear"
  | "inv" | "sin" | "cos" | "tan" | "pow"
  | "sq" | "comma" | "lparen" | "rparen" | "div"
  | "log" | "n7" | "n8" | "n9" | "mul"
  | "ln" | "n4" | "n5" | "n6" | "sub"
  | "sto" | "n1" | "n2" | "n3" | "add"
  | "on" | "n0" | "dot" | "neg" | "enter";

export interface Item { label: string; action: string }
export interface Menu { id: string; tabs: { name: string; items: Item[] }[]; tab: number; index: number }
export interface Hist { expr: string; result: string }
export interface Program { name: string; lines: string[] }

export interface Os {
  screen: string;
  second: boolean;
  alpha: "off" | "once" | "lock";
  insert: boolean;
  rcl: boolean;
  entry: string;
  cursor: number;
  history: Hist[];
  stack: string[];
  recall: number;
  draft: string;
  origin: "home" | "yeq";
  angle: Angle;
  notation: Notation;
  digits: Digits;
  plot: "FUNC" | "PAR" | "POL" | "SEQ";
  connected: boolean;
  sequential: boolean;
  complex: "REAL" | "a+bi" | "re^θi";
  split: "FULL" | "HORIZ" | "G-T";
  vars: Record<string, number>;
  ans: number;
  lists: Record<string, number[]>;
  matrices: Env["matrices"];
  equations: [string, string, string];
  eqOn: [boolean, boolean, boolean];
  regEq: string;
  win: { xmin: number; xmax: number; xscl: number; ymin: number; ymax: number; yscl: number };
  tblStart: number;
  tblStep: number;
  tableOffset: number;
  grid: boolean;
  axes: boolean;
  plot1: boolean;
  draws: { kind: "h" | "v"; at: number }[];
  menu: Menu | null;
  error: string;
  errorIndex: number;
  modeRow: number;
  modeCol: number;
  listCol: number;
  listRow: number;
  listBuf: string;
  listEdit: boolean;
  yRow: number;
  yCursor: number;
  winRow: number;
  winBuf: string;
  winEdit: boolean;
  catalogQ: string;
  catalogI: number;
  trace: number | null;
  traceX: number | null;
  traceEq: number;
  bound: null | { kind: "zero" | "min" | "max" | "intersect"; phase: "left" | "right" | "guess"; left: number | null; right: number | null };
  mark: string;
  prompt: { kind: string; title: string; value: string } | null;
  results: { title: string; lines: string[]; top: number } | null;
  wizard: { kind: "1var" | "2var" | "lin" | "lina"; list: string; list2: string; field: number } | null;
  tvm: { n: string; i: string; pv: string; pmt: string; fv: string; py: string; cy: string; begin: boolean; cursor: number; edit: boolean };
  mat: "A" | "B" | "C";
  matRow: number;
  matCol: number;
  matBuf: string;
  matEdit: boolean;
  programs: Program[];
  editor: { index: number; row: number; buf: string; cursor: number } | null;
  formatRow: number;
  statRow: number;
}

const ALPHA: Partial<Record<KeyId, string>> = {
  math: "A", apps: "B", prgm: "C", inv: "D", sin: "E", cos: "F", tan: "G", pow: "H",
  sq: "I", comma: "J", lparen: "K", rparen: "L", div: "M", log: "N", n7: "O", n8: "P", n9: "Q", mul: "R",
  ln: "S", n4: "T", n5: "U", n6: "V", sub: "W", sto: "X", n1: "Y", n2: "Z", n3: "θ", add: "\"",
  n0: " ", dot: ":", neg: "?", enter: "solve(",
};
const PRIMARY: Partial<Record<KeyId, string>> = {
  n0: "0", n1: "1", n2: "2", n3: "3", n4: "4", n5: "5", n6: "6", n7: "7", n8: "8", n9: "9",
  dot: ".", add: "+", sub: "−", mul: "×", div: "÷", pow: "^", lparen: "(", rparen: ")", comma: ",",
  neg: "⁻", sin: "sin(", cos: "cos(", tan: "tan(", log: "log(", ln: "ln(", sq: "²", inv: "⁻¹", xt: "X", sto: "→",
};
const SECOND_TEXT: Partial<Record<KeyId, string>> = {
  sin: "sin⁻¹(", cos: "cos⁻¹(", tan: "tan⁻¹(", log: "10^(", ln: "e^(", sq: "√(", pow: "π", div: "e",
  comma: "ᴇ", neg: "Ans", n1: "L1", n2: "L2", n3: "L3", n4: "L4", n5: "L5", n6: "L6",
  lparen: "{", rparen: "}", mul: "[", sub: "]",
};
const ITEM_KEY: Partial<Record<KeyId, number>> = {
  n1: 1, n2: 2, n3: 3, n4: 4, n5: 5, n6: 6, n7: 7, n8: 8, n9: 9, n0: 10,
  math: 11, apps: 12, prgm: 13, inv: 14, sin: 15, cos: 16, tan: 17, pow: 18,
};

export const MODE_ROWS = [
  ["NORMAL", "SCI", "ENG"],
  ["FLOAT", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
  ["RADIAN", "DEGREE"],
  ["FUNC", "PAR", "POL", "SEQ"],
  ["CONNECTED", "DOT"],
  ["SEQUENTIAL", "SIMUL"],
  ["REAL", "a+bi", "re^θi"],
  ["FULL", "HORIZ", "G-T"],
];

const CATALOG: { label: string; action: string }[] = [
  "abs(", "Ans", "binomcdf(", "binompdf(", "ClrList ", "cos(", "cos⁻¹(", "det(", "e", "e^(", "fPart(",
  "fnInt(", "iPart(", "invNorm(", "ln(", "log(", "max(", "mean(", "median(", "min(", "nCr(", "nDeriv(",
  "normalcdf(", "normalpdf(", "nPr(", "π", "poissoncdf(", "poissonpdf(", "rand", "randInt(", "round(",
  "sin(", "sin⁻¹(", "solve(", "SortA(", "SortD(", "stdDev(", "sum(", "tan(", "tan⁻¹(", "³√(", "√(", "→",
].map((label) => ({ label, action: `paste:${label}` }));

export function createOs(): Os {
  const env = emptyEnv();
  return {
    screen: "boot", second: false, alpha: "off", insert: false, rcl: false,
    entry: "", cursor: 0, history: [], stack: [], recall: 0, draft: "", origin: "home",
    angle: "RADIAN", notation: "NORMAL", digits: "FLOAT", plot: "FUNC", connected: true, sequential: true,
    complex: "REAL", split: "FULL", vars: env.vars, ans: 0, lists: env.lists, matrices: env.matrices,
    equations: ["", "", ""], eqOn: [true, true, true], regEq: "",
    win: { xmin: -10, xmax: 10, xscl: 1, ymin: -10, ymax: 10, yscl: 1 },
    tblStart: 0, tblStep: 1, tableOffset: 0, grid: false, axes: true, plot1: false, draws: [],
    menu: null, error: "", errorIndex: 0, modeRow: 0, modeCol: 0,
    listCol: 0, listRow: 0, listBuf: "", listEdit: false, yRow: 1, yCursor: 0,
    winRow: 0, winBuf: "", winEdit: false, catalogQ: "", catalogI: 0,
    trace: null, traceX: null, traceEq: 0, bound: null, mark: "", prompt: null, results: null, wizard: null,
    tvm: { n: "0", i: "0", pv: "0", pmt: "0", fv: "0", py: "1", cy: "1", begin: false, cursor: 0, edit: false },
    mat: "A", matRow: 0, matCol: 0, matBuf: "", matEdit: false, programs: [], editor: null, formatRow: 0, statRow: 0,
  };
}

export function envOf(state: Os): Env {
  return {
    angle: state.angle, vars: state.vars, ans: state.ans, lists: state.lists, matrices: state.matrices,
    equations: state.equations, regEq: state.regEq,
  };
}

export function statusTokens(state: Os) {
  return [state.notation, state.digits === "FLOAT" ? "FLOAT" : String(state.digits), "AUTO", state.complex === "REAL" ? "REAL" : state.complex, state.angle, "MP"];
}

export function modeOn(state: Os, row: number, col: number) {
  if (row === 0) return ["NORMAL", "SCI", "ENG"][col] === state.notation;
  if (row === 1) return col === 0 ? state.digits === "FLOAT" : state.digits === col - 1;
  if (row === 2) return col === 0 ? state.angle === "RADIAN" : state.angle === "DEGREE";
  if (row === 3) return ["FUNC", "PAR", "POL", "SEQ"][col] === state.plot;
  if (row === 4) return col === 0 ? state.connected : !state.connected;
  if (row === 5) return col === 0 ? state.sequential : !state.sequential;
  if (row === 6) return ["REAL", "a+bi", "re^θi"][col] === state.complex;
  return ["FULL", "HORIZ", "G-T"][col] === state.split;
}

export function catalogView(state: Os) {
  const q = state.catalogQ.toLowerCase();
  const items = CATALOG.filter((item) => item.label.toLowerCase().includes(q));
  const index = Math.min(state.catalogI, Math.max(0, items.length - 1));
  return { items, index };
}

export function hydrate(raw: unknown): Os {
  const base = createOs();
  if (!raw || typeof raw !== "object") return base;
  const data = raw as Partial<Os>;
  if (data.screen === "boot") return base;
  const next: Os = { ...base, ...data, second: false, alpha: "off", rcl: false, menu: null, prompt: null };
  if (!next.lists?.L1 || !next.matrices?.A || !Array.isArray(next.equations)) return base;
  if (!["home", "off", "graph", "yeq"].includes(next.screen)) next.screen = "home";
  next.recall = next.stack?.length || 0;
  return next;
}

export function press(state: Os, key: KeyId): Os {
  if (state.screen === "off") return key === "on" ? { ...state, screen: "home", second: false, alpha: "off" } : state;
  if (state.screen === "boot") return { ...state, screen: "home", second: false, alpha: "off" };
  if (key === "2nd") return { ...state, second: !state.second, alpha: state.alpha === "once" ? "off" : state.alpha };
  if (key === "alpha") {
    if (state.second) return { ...state, second: false, alpha: "lock" };
    return { ...state, alpha: state.alpha === "off" ? "once" : "off" };
  }
  const second = state.second;
  const alpha = !second && state.alpha !== "off";
  const base: Os = { ...state, second: false, alpha: state.alpha === "lock" ? "lock" : "off" };
  if (alpha) return onAlpha(base, key);
  if (second) return onSecond(base, key);
  return onPrimary(base, key);
}

export function typeChar(state: Os, ch: string): Os {
  if (state.screen === "off") return state;
  if (state.screen === "boot") state = { ...state, screen: "home" };
  if (ch === "Enter") return press(state, "enter");
  if (ch === "Backspace") return backspace(state);
  if (ch === "Escape") return press({ ...state, second: false, alpha: state.alpha }, "clear");
  if (ch === "ArrowLeft") return press(state, "left");
  if (ch === "ArrowRight") return press(state, "right");
  if (ch === "ArrowUp") return press(state, "up");
  if (ch === "ArrowDown") return press(state, "down");
  if (ch === "Delete") return press(state, "del");
  if (ch === "*") return press(state, "mul");
  if (ch === "/") return press(state, "div");
  if (ch === "+") return press(state, "add");
  if (ch === "-") return typeInto(state, "−");
  if (ch === "^") return press(state, "pow");
  if (ch === "(") return press(state, "lparen");
  if (ch === ")") return press(state, "rparen");
  if (ch === ",") return press(state, "comma");
  if (ch === ".") return press(state, "dot");
  if (/^[0-9]$/.test(ch)) return press(state, `n${ch}` as KeyId);
  if (ch === "x" || ch === "X") return typeInto(state, "X");
  if (/^[A-Za-zθπ√°]|[⁻²]/.test(ch) || ch === "⁻") return typeInto(state, ch === "π" ? "π" : ch);
  return state;
}

function onAlpha(state: Os, key: KeyId): Os {
  if (state.screen === "tvm" && key === "enter") return solveField(state);
  if (state.rcl) {
    const letter = ALPHA[key];
    if (letter && /^[A-Zθ]$/.test(letter)) return typeInto({ ...state, rcl: false }, letter);
    return { ...state, rcl: false };
  }
  const text = ALPHA[key];
  if (!text) return state;
  if (state.screen === "catalog" && text.length === 1 && /[A-Z]/.test(text)) return jumpCatalog(state, text);
  return typeInto(state, text);
}

function onSecond(state: Os, key: KeyId): Os {
  if (key === "mode") return home(state);
  if (key === "on") return { ...state, screen: "off", trace: null };
  if (key === "del") return { ...state, insert: !state.insert };
  if (key === "enter") return state.screen === "home" ? recall(state, -1) : state;
  if (key === "y=") return { ...state, screen: "statplot" };
  if (key === "window") return { ...state, screen: "tblset", winRow: 0, winEdit: false, winBuf: "" };
  if (key === "zoom") return { ...state, screen: "format" };
  if (key === "trace") return openMenu(state, "calc");
  if (key === "graph") return { ...state, screen: "table" };
  if (key === "stat") return openMenu(state, "list");
  if (key === "math") return openMenu(state, "test");
  if (key === "apps") return openMenu(state, "angle");
  if (key === "prgm") return openMenu(state, "draw");
  if (key === "vars") return openMenu(state, "distr");
  if (key === "inv") return openMenu(state, "matrix");
  if (key === "add") return openMenu(state, "memory");
  if (key === "n0") return { ...state, screen: "catalog", catalogQ: "", catalogI: 0, origin: state.screen === "yeq" ? "yeq" : "home" };
  if (key === "xt") return { ...state, screen: "link" };
  if (key === "sto") return { ...state, rcl: true };
  const text = SECOND_TEXT[key];
  return text ? typeInto(state, text) : state;
}

function onPrimary(state: Os, key: KeyId): Os {
  if (state.screen === "error") return errorKey(state, key);
  if (state.rcl && key !== "clear") {
    if (key === "xt") return typeInto({ ...state, rcl: false }, "X");
    return { ...state, rcl: false };
  }
  if (state.screen === "menu") {
    const handled = menuKey(state, key);
    if (handled) return handled;
  }
  if (key === "on") return home(state);
  if (key === "clear") return onClear(state);
  if (key === "mode") return { ...state, screen: "mode", modeRow: 0, modeCol: 0 };
  if (key === "y=") return { ...state, screen: "yeq", yRow: 1, yCursor: state.equations[0].length };
  if (key === "window") return { ...state, screen: "window", winRow: 0, winEdit: false, winBuf: "" };
  if (key === "zoom") return openMenu(state, "zoom");
  if (key === "trace") return { ...state, screen: "graph", trace: state.trace ?? 47, traceX: null };
  if (key === "graph") return showGraph(state);
  if (key === "math") return openMenu(state, "math");
  if (key === "apps") return openMenu(state, "apps");
  if (key === "prgm") return openMenu(state, "prgm");
  if (key === "vars") return openMenu(state, "vars");
  if (key === "stat") return openMenu(state, "stat");
  return screenKey(state, key);
}

function screenKey(state: Os, key: KeyId): Os {
  switch (state.screen) {
    case "home": return homeKey(state, key);
    case "mode": return modeKey(state, key);
    case "yeq": return yeqKey(state, key);
    case "window": return windowKey(state, key);
    case "tblset": return tblKey(state, key);
    case "lists": return listKey(state, key);
    case "catalog": return catalogKey(state, key);
    case "graph": return graphKey(state, key);
    case "table": return tableKey(state, key);
    case "results": return resultKey(state, key);
    case "prompt": return promptKey(state, key);
    case "wizard": return wizardKey(state, key);
    case "tvm": return tvmKey(state, key);
    case "matrix": return matrixKey(state, key);
    case "editor": return editorKey(state, key);
    case "format": return toggleRow(state, key, "formatRow", 2, (row) => row === 0 ? { ...state, grid: !state.grid } : { ...state, axes: !state.axes });
    case "statplot": return toggleRow(state, key, "statRow", 1, () => ({ ...state, plot1: !state.plot1 }));
    case "link": return key === "enter" ? home(state) : state;
    default: return state;
  }
}

function home(state: Os): Os {
  return { ...state, screen: "home", menu: null, prompt: null, wizard: null, trace: null, rcl: false, bound: null, mark: "" };
}

function onClear(state: Os): Os {
  if (state.screen === "home") return state.entry ? { ...state, entry: "", cursor: 0, draft: "" } : state;
  if (state.screen === "yeq" && state.yRow > 0) {
    const equations = [...state.equations] as [string, string, string];
    if (!equations[state.yRow - 1]) return home(state);
    equations[state.yRow - 1] = "";
    return { ...state, equations, yCursor: 0 };
  }
  if (state.screen === "lists") return state.listEdit && state.listBuf ? { ...state, listBuf: "" } : deleteListCell(state);
  if (state.screen === "window" && state.winEdit) return { ...state, winBuf: "", winEdit: true };
  if (state.screen === "prompt" && state.prompt) return { ...state, prompt: { ...state.prompt, value: "" } };
  if (state.screen === "catalog" && state.catalogQ) return { ...state, catalogQ: state.catalogQ.slice(0, -1), catalogI: 0 };
  return home(state);
}

function homeKey(state: Os, key: KeyId): Os {
  if (key === "enter") return commitEntry(state);
  if (key === "del") return applyEntry(state, delAt(state.entry, state.cursor));
  if (key === "left") return { ...state, cursor: Math.max(0, state.cursor - 1) };
  if (key === "right") return { ...state, cursor: Math.min(state.entry.length, state.cursor + 1) };
  if (key === "up") return recall(state, -1);
  if (key === "down") return recall(state, 1);
  const text = PRIMARY[key];
  return text ? typeInto(state, text) : state;
}

function commitEntry(state: Os): Os {
  if (!state.entry.trim()) return state;
  if (state.entry.trim() === "ClrDraw") return finish(state, state.entry, "Done", envOf({ ...state, draws: [] }), { draws: [] });
  try {
    const result = run(state.entry, envOf(state), state.notation, state.digits);
    return finish(state, state.entry, result.text, result.env);
  } catch (error) {
    return fail(state, error instanceof CalcError ? error.kind : "ERROR");
  }
}

function finish(state: Os, expr: string, text: string, env: Env, extra: Partial<Os> = {}): Os {
  const stack = [...state.stack, expr].slice(-50);
  const history = [...state.history, { expr, result: text }].slice(-50);
  return absorb({ ...state, ...extra, stack, history, entry: "", cursor: 0, recall: stack.length, draft: "", screen: "home", rcl: false }, env);
}

function fail(state: Os, kind: string): Os {
  return { ...state, screen: "error", error: kind, errorIndex: 0 };
}

function errorKey(state: Os, key: KeyId): Os {
  if (key === "up" || key === "down") return { ...state, errorIndex: state.errorIndex ? 0 : 1 };
  if (key === "n1" || (key === "enter" && state.errorIndex === 0) || key === "clear") return { ...state, screen: "home", entry: "", cursor: 0, error: "" };
  if (key === "n2" || (key === "enter" && state.errorIndex === 1)) return { ...state, screen: "home", error: "" };
  return state;
}

function recall(state: Os, dir: -1 | 1): Os {
  if (!state.stack.length) return state;
  if (dir < 0) {
    const recall = state.recall === state.stack.length ? state.stack.length - 1 : Math.max(0, state.recall - 1);
    const entry = state.stack[recall];
    return { ...state, recall, draft: state.recall === state.stack.length ? state.entry : state.draft, entry, cursor: entry.length };
  }
  const recall = Math.min(state.stack.length, state.recall + 1);
  if (recall === state.stack.length) return { ...state, recall, entry: state.draft, cursor: state.draft.length };
  return { ...state, recall, entry: state.stack[recall], cursor: state.stack[recall].length };
}
