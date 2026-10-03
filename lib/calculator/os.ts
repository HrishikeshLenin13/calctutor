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

function modeKey(state: Os, key: KeyId): Os {
  if (key !== "left" && key !== "right" && key !== "up" && key !== "down" && key !== "enter") return state;
  let { modeRow, modeCol } = state;
  const cols = MODE_ROWS[modeRow].length;
  if (key === "left") modeCol = (modeCol + cols - 1) % cols;
  if (key === "right") modeCol = (modeCol + 1) % cols;
  if (key === "up" || key === "down") {
    modeRow = (modeRow + (key === "down" ? 1 : 7)) % 8;
    modeCol = Math.min(modeCol, MODE_ROWS[modeRow].length - 1);
  }
  const next = { ...state, modeRow, modeCol };
  if (key !== "enter") return next;
  if (modeRow === 0) return { ...next, notation: MODE_ROWS[0][modeCol] as Notation };
  if (modeRow === 1) return { ...next, digits: modeCol === 0 ? "FLOAT" : modeCol - 1 };
  if (modeRow === 2) return { ...next, angle: modeCol === 0 ? "RADIAN" : "DEGREE" };
  if (modeRow === 3) return { ...next, plot: MODE_ROWS[3][modeCol] as Os["plot"] };
  if (modeRow === 4) return { ...next, connected: modeCol === 0 };
  if (modeRow === 5) return { ...next, sequential: modeCol === 0 };
  if (modeRow === 6) return { ...next, complex: MODE_ROWS[6][modeCol] as Os["complex"] };
  return { ...next, split: MODE_ROWS[7][modeCol] as Os["split"] };
}

function yeqKey(state: Os, key: KeyId): Os {
  if (key === "up") return { ...state, yRow: Math.max(0, state.yRow - 1), yCursor: state.yRow <= 1 ? 0 : state.equations[state.yRow - 2].length };
  if (key === "down") return { ...state, yRow: Math.min(3, state.yRow + 1), yCursor: state.yRow >= 3 ? state.yCursor : state.equations[Math.min(2, state.yRow)].length };
  if (key === "left" && state.yRow === 0) return { ...state, plot1: !state.plot1 };
  if (state.yRow === 0) return state;
  const index = state.yRow - 1;
  const current = state.equations[index];
  if (key === "left") return { ...state, yCursor: Math.max(0, state.yCursor - 1) };
  if (key === "right") return { ...state, yCursor: Math.min(current.length, state.yCursor + 1) };
  if (key === "del") {
    const edit = delAt(current, state.yCursor);
    const equations = [...state.equations] as [string, string, string];
    equations[index] = edit.buf;
    return { ...state, equations, yCursor: edit.cursor };
  }
  if (key === "enter") return { ...state, yRow: Math.min(3, state.yRow + 1), yCursor: state.equations[Math.min(2, state.yRow)].length };
  const text = PRIMARY[key];
  return text ? typeInto(state, text) : state;
}

function windowKey(state: Os, key: KeyId): Os {
  if (key === "up" || key === "down" || key === "enter") {
    const saved = commitWindow(state);
    const row = key === "up" ? (state.winRow + 5) % 6 : (state.winRow + 1) % 6;
    return { ...saved, winRow: row, winEdit: false, winBuf: "" };
  }
  if (key === "left" || key === "right" || key === "del") {
    const buf = state.winEdit ? state.winBuf : formatTi(winValue(state));
    const cursor = state.winEdit ? state.winBuf.length : buf.length;
    if (key === "del") return { ...state, winEdit: true, winBuf: delAt(buf, cursor).buf };
    return { ...state, winEdit: true, winBuf: buf };
  }
  const text = PRIMARY[key];
  return text ? typeInto(state, text) : state;
}

function tblKey(state: Os, key: KeyId): Os {
  const which = state.winRow > 0 ? "step" : "start";
  if (key === "up" || key === "down" || key === "enter") {
    const saved = commitTbl(state);
    return { ...saved, winRow: which === "start" ? 1 : 0, winEdit: false, winBuf: "" };
  }
  const text = PRIMARY[key];
  return text ? typeInto(state, text) : state;
}

function listKey(state: Os, key: KeyId): Os {
  if (key === "left" || key === "right" || key === "up" || key === "down" || key === "enter") {
    const saved = commitList(state);
    let { listCol, listRow } = saved;
    if (key === "left") listCol = Math.max(0, listCol - 1);
    if (key === "right") listCol = Math.min(5, listCol + 1);
    if (key === "up") listRow = Math.max(0, listRow - 1);
    if (key === "down" || key === "enter") listRow += 1;
    return { ...saved, listCol, listRow, listEdit: false, listBuf: "" };
  }
  if (key === "del" && !state.listEdit) return deleteListCell(state);
  const text = PRIMARY[key];
  return text ? typeInto(state, text) : state;
}

function catalogKey(state: Os, key: KeyId): Os {
  const { items, index } = catalogView(state);
  if (key === "up") return { ...state, catalogI: Math.max(0, index - 1) };
  if (key === "down") return { ...state, catalogI: Math.min(items.length - 1, index + 1) };
  if (key === "enter" && items[index]) return paste(state, items[index].action.slice(6));
  if (key === "del") return { ...state, catalogQ: state.catalogQ.slice(0, -1), catalogI: 0 };
  return state;
}

function graphKey(state: Os, key: KeyId): Os {
  if (state.plot !== "FUNC") return state;
  if (state.bound && key === "enter") return commitBound(state);
  if (key === "left" || key === "right" || key === "up" || key === "down") {
    let trace = state.trace ?? 47;
    let traceEq = state.traceEq;
    if (key === "left") trace = Math.max(0, (state.traceX !== null ? xToIndex(state, state.traceX) : trace) - 1);
    if (key === "right") trace = Math.min(94, (state.traceX !== null ? xToIndex(state, state.traceX) : trace) + 1);
    if (key === "up") traceEq = Math.max(0, traceEq - 1);
    if (key === "down") traceEq = Math.min(2, traceEq + 1);
    return { ...state, screen: "graph", trace, traceEq, traceX: null };
  }
  return state;
}

function tableKey(state: Os, key: KeyId): Os {
  if (key === "up") return { ...state, tableOffset: state.tableOffset - 1 };
  if (key === "down") return { ...state, tableOffset: state.tableOffset + 1 };
  return state;
}

function resultKey(state: Os, key: KeyId): Os {
  if (!state.results) return home(state);
  if (key === "up") return { ...state, results: { ...state.results, top: Math.max(0, state.results.top - 1) } };
  if (key === "down") return { ...state, results: { ...state.results, top: state.results.top + 1 } };
  if (key === "enter") return home(state);
  return state;
}

function promptKey(state: Os, key: KeyId): Os {
  if (!state.prompt) return state;
  if (key === "enter") return finishPrompt(state);
  if (key === "del") return { ...state, prompt: { ...state.prompt, value: state.prompt.value.slice(0, -1) } };
  const text = PRIMARY[key];
  return text ? typeInto(state, text) : state;
}

function wizardKey(state: Os, key: KeyId): Os {
  if (!state.wizard) return state;
  const fields = state.wizard.kind === "1var" ? 2 : 3;
  if (key === "up") return { ...state, wizard: { ...state.wizard, field: (state.wizard.field + fields - 1) % fields } };
  if (key === "down") return { ...state, wizard: { ...state.wizard, field: (state.wizard.field + 1) % fields } };
  if (key === "left" || key === "right") return cycleWizardList(state, key === "right" ? 1 : -1);
  if (key === "enter") {
    if (state.wizard.field === fields - 1) return runWizard(state);
    return { ...state, wizard: { ...state.wizard, field: state.wizard.field + 1 } };
  }
  return state;
}

function tvmKey(state: Os, key: KeyId): Os {
  if (key === "up" || key === "down" || key === "enter") {
    const saved = commitTvm(state);
    const cursor = key === "up" ? (state.tvm.cursor + 7) % 8 : (state.tvm.cursor + 1) % 8;
    if (cursor === 7 && key !== "up") return { ...saved, tvm: { ...saved.tvm, cursor, begin: key === "enter" ? !saved.tvm.begin : saved.tvm.begin, edit: false } };
    return { ...saved, tvm: { ...saved.tvm, cursor, edit: false } };
  }
  if (state.tvm.cursor === 7 && (key === "left" || key === "right")) return { ...state, tvm: { ...state.tvm, begin: !state.tvm.begin } };
  const text = PRIMARY[key];
  return text ? typeInto(state, text) : state;
}

function matrixKey(state: Os, key: KeyId): Os {
  const matrix = state.matrices[state.mat];
  if (key === "left" || key === "right" || key === "up" || key === "down" || key === "enter") {
    const saved = commitMatrix(state);
    const rows = saved.matrices[saved.mat].length;
    const cols = saved.matrices[saved.mat][0].length;
    let { matRow, matCol } = saved;
    if (key === "left") matCol = Math.max(0, matCol - 1);
    if (key === "right") matCol = Math.min(cols - 1, matCol + 1);
    if (key === "up") matRow = Math.max(0, matRow - 1);
    if (key === "down" || key === "enter") matRow = Math.min(rows - 1, matRow + (key === "enter" && matCol < cols - 1 ? 0 : 1));
    if (key === "enter" && state.matCol < cols - 1) matCol = state.matCol + 1;
    return { ...saved, matRow, matCol, matEdit: false, matBuf: "" };
  }
  const text = PRIMARY[key];
  return text && matrix ? typeInto(state, text) : state;
}

function editorKey(state: Os, key: KeyId): Os {
  if (!state.editor) return state;
  const program = state.programs[state.editor.index];
  if (!program) return home(state);
  if (key === "enter") {
    const lines = program.lines.slice();
    lines[state.editor.row] = state.editor.buf;
    if (state.editor.row === lines.length - 1) lines.push("");
    const programs = state.programs.slice();
    programs[state.editor.index] = { ...program, lines };
    const row = Math.min(lines.length - 1, state.editor.row + 1);
    return { ...state, programs, editor: { ...state.editor, row, buf: lines[row], cursor: lines[row].length } };
  }
  if (key === "up" || key === "down") {
    const lines = program.lines.slice();
    lines[state.editor.row] = state.editor.buf;
    const programs = state.programs.slice();
    programs[state.editor.index] = { ...program, lines };
    const row = Math.max(0, Math.min(lines.length - 1, state.editor.row + (key === "down" ? 1 : -1)));
    return { ...state, programs, editor: { ...state.editor, row, buf: lines[row], cursor: lines[row].length } };
  }
  if (key === "left") return { ...state, editor: { ...state.editor, cursor: Math.max(0, state.editor.cursor - 1) } };
  if (key === "right") return { ...state, editor: { ...state.editor, cursor: Math.min(state.editor.buf.length, state.editor.cursor + 1) } };
  if (key === "del") {
    const edit = delAt(state.editor.buf, state.editor.cursor);
    return { ...state, editor: { ...state.editor, buf: edit.buf, cursor: edit.cursor } };
  }
  const text = PRIMARY[key];
  return text ? typeInto(state, text) : state;
}

function toggleRow(state: Os, key: KeyId, field: "formatRow" | "statRow", count: number, toggle: (row: number) => Os): Os {
  const row = state[field];
  if (key === "up") return { ...state, [field]: (row + count - 1) % count };
  if (key === "down") return { ...state, [field]: (row + 1) % count };
  if (key === "enter" || key === "left" || key === "right") return toggle(row);
  return state;
}

function menuKey(state: Os, key: KeyId): Os | null {
  if (!state.menu) return null;
  const tab = state.menu.tabs[state.menu.tab];
  if (key === "up") return { ...state, menu: { ...state.menu, index: (state.menu.index + tab.items.length - 1) % tab.items.length } };
  if (key === "down") return { ...state, menu: { ...state.menu, index: (state.menu.index + 1) % tab.items.length } };
  if ((key === "left" || key === "right") && state.menu.tabs.length > 1) {
    const tabIndex = (state.menu.tab + (key === "right" ? 1 : state.menu.tabs.length - 1)) % state.menu.tabs.length;
    return { ...state, menu: { ...state.menu, tab: tabIndex, index: 0 } };
  }
  if (key === "enter") return activate(state, tab.items[state.menu.index]?.action || "");
  const item = ITEM_KEY[key];
  if (item && tab.items[item - 1]) return activate(state, tab.items[item - 1].action);
  return null;
}

function openMenu(state: Os, id: string): Os {
  const origin = state.screen === "yeq" ? "yeq" : "home";
  return { ...state, screen: "menu", origin, menu: buildMenu(state, id) };
}

function buildMenu(state: Os, id: string): Menu {
  const tabs = MENUS(state)[id] || [{ name: id.toUpperCase(), items: [] }];
  return { id, tabs, tab: 0, index: 0 };
}

function MENUS(state: Os): Record<string, { name: string; items: Item[] }[]> {
  const paste = (label: string, text = label) => ({ label, action: `paste:${text}` });
  return {
    math: [
      { name: "MATH", items: [paste("►Frac", "►Frac"), paste("³", "³"), paste("³√("), paste("nDeriv("), paste("fnInt("), paste("solve(")] },
      { name: "NUM", items: [paste("abs("), paste("round("), paste("iPart("), paste("fPart("), paste("min("), paste("max(")] },
      { name: "PRB", items: [paste("rand", "rand"), paste("randInt("), paste("nPr("), paste("nCr("), paste("!", "!")] },
    ],
    test: [{ name: "TEST", items: ["=", "≠", ">", "≥", "<", "≤"].map((token) => paste(token)) }],
    angle: [{ name: "ANGLE", items: [paste("°", "°")] }],
    stat: [
      { name: "EDIT", items: [{ label: "Edit...", action: "go:lists" }, paste("SortA("), paste("SortD("), paste("ClrList "), { label: "SetUpEditor", action: "paste:SetUpEditor" }] },
      { name: "CALC", items: [
        { label: "1-Var Stats", action: "wiz:1var" },
        { label: "2-Var Stats", action: "wiz:2var" },
        { label: "Med-Med", action: "gap:Med-Med" },
        { label: "LinReg(ax+b)", action: "wiz:lin" },
        { label: "QuadReg", action: "gap:QuadReg" },
        { label: "CubicReg", action: "gap:CubicReg" },
        { label: "QuartReg", action: "gap:QuartReg" },
        { label: "LinReg(a+bx)", action: "wiz:lina" },
      ] },
    ],
    list: [
      { name: "NAMES", items: ["L1", "L2", "L3", "L4", "L5", "L6"].map((name) => paste(name)) },
      { name: "OPS", items: [paste("SortA("), paste("SortD("), paste("ClrList ")] },
      { name: "MATH", items: [paste("sum("), paste("mean("), paste("median("), paste("stdDev(")] },
    ],
    distr: [{ name: "DISTR", items: [
      paste("normalpdf("), paste("normalcdf("), paste("invNorm("),
      { label: "invT(", action: "gap:invT(" },
      { label: "tpdf(", action: "gap:tpdf(" },
      { label: "tcdf(", action: "gap:tcdf(" },
      { label: "χ²pdf(", action: "gap:χ²pdf(" },
      { label: "χ²cdf(", action: "gap:χ²cdf(" },
      { label: "Fpdf(", action: "gap:Fpdf(" },
      { label: "Fcdf(", action: "gap:Fcdf(" },
      paste("binompdf("), paste("binomcdf("), paste("poissonpdf("), paste("poissoncdf("),
    ] }],
    vars: [{ name: "VARS", items: [paste("Y1"), paste("Y2"), paste("Y3"), paste("RegEQ"), paste("X")] }],
    apps: [{ name: "APPS", items: [{ label: "Finance...", action: "go:tvm" }] }],
    prgm: [{ name: "EXEC", items: [...state.programs.map((program, index) => ({ label: program.name, action: `runprog:${index}` })), { label: "New", action: "prog:new" }] }],
    zoom: [{ name: "ZOOM", items: ["ZBox", "Zoom In", "Zoom Out", "ZDecimal", "ZSquare", "ZStandard", "ZTrig", "ZInteger", "ZoomStat"].map((label, index) => ({ label, action: `zoom:${["box", "in", "out", "decimal", "square", "standard", "trig", "integer", "stat"][index]}` })) }],
    calc: [{ name: "CALCULATE", items: [{ label: "value", action: "calc:value" }, { label: "zero", action: "calc:zero" }, { label: "minimum", action: "calc:min" }, { label: "maximum", action: "calc:max" }, { label: "intersect", action: "calc:intersect" }] }],
    draw: [{ name: "DRAW", items: [{ label: "ClrDraw", action: "cmd:clrdraw" }, { label: "Horizontal", action: "ask:h" }, { label: "Vertical", action: "ask:v" }] }],
    matrix: [
      { name: "NAMES", items: [paste("[A]"), paste("[B]"), paste("[C]")] },
      { name: "MATH", items: [paste("det(")] },
      { name: "EDIT", items: ["A", "B", "C"].map((name) => ({ label: `[${name}]`, action: `mat:${name}` })) },
    ],
    memory: [{ name: "MEM", items: [{ label: "About", action: "go:about" }, { label: "Reset RAM", action: "cmd:reset" }] }],
  };
}

function activate(state: Os, action: string): Os {
  if (!action) return state;
  if (action.startsWith("paste:")) return paste(state, action.slice(6));
  if (action.startsWith("go:")) {
    const screen = action.slice(3);
    if (screen === "lists") return { ...state, screen: "lists", menu: null, listEdit: false };
    if (screen === "tvm") return { ...state, screen: "tvm", menu: null };
    if (screen === "about") return { ...state, screen: "results", menu: null, results: { title: "About", lines: ["TI-84 Plus CE", "5.7.2.0016", "", "Study calculator", "Local math engine"], top: 0 } };
    return { ...state, screen, menu: null };
  }
  if (action.startsWith("gap:")) return showResults(state, action.slice(4), ["Listed here so the menu", "numbers match class.", "LinReg(ax+b) is 4.", "binompdf( is A."]);
  if (action.startsWith("wiz:")) {
    const kind = action.slice(4) as NonNullable<Os["wizard"]>["kind"];
    return { ...state, screen: "wizard", menu: null, wizard: { kind, list: "L1", list2: "L2", field: 0 } };
  }
  if (action.startsWith("zoom:")) return applyZoom(state, action.slice(5));
  if (action.startsWith("calc:")) return startCalc(state, action.slice(5));
  if (action === "cmd:clrdraw") return { ...state, draws: [], screen: "graph", menu: null };
  if (action === "cmd:reset") return createOs();
  if (action === "ask:h" || action === "ask:v") return { ...state, screen: "prompt", menu: null, prompt: { kind: action.slice(4), title: action.endsWith("h") ? "Y=" : "X=", value: "" } };
  if (action.startsWith("mat:")) return { ...state, screen: "matrix", menu: null, mat: action.slice(4) as "A" | "B" | "C", matRow: 0, matCol: 0, matEdit: false };
  if (action === "prog:new") {
    const programs = [...state.programs, { name: `PRGM${state.programs.length + 1}`, lines: [""] }];
    return { ...state, programs, screen: "editor", menu: null, editor: { index: programs.length - 1, row: 0, buf: "", cursor: 0 } };
  }
  if (action.startsWith("runprog:")) return runProgram(state, Number(action.slice(8)));
  return state;
}

function paste(state: Os, text: string): Os {
  const screen = state.origin === "yeq" ? "yeq" : "home";
  return typeInto({ ...state, screen, menu: null, catalogQ: "" }, text);
}

function jumpCatalog(state: Os, letter: string): Os {
  const q = (state.catalogQ + letter).toLowerCase();
  return { ...state, catalogQ: q, catalogI: 0 };
}

function typeInto(state: Os, text: string): Os {
  if (state.screen === "home") {
    const edit = ins(state.entry, state.cursor, text, state.insert);
    return { ...state, entry: edit.buf, cursor: edit.cursor, recall: state.stack.length, draft: edit.buf };
  }
  if (state.screen === "yeq" && state.yRow > 0) {
    const equations = [...state.equations] as [string, string, string];
    const edit = ins(equations[state.yRow - 1], state.yCursor, text, true);
    equations[state.yRow - 1] = edit.buf;
    return { ...state, equations, yCursor: edit.cursor };
  }
  if (state.screen === "window" || state.screen === "tblset") {
    const buf = state.winEdit ? state.winBuf + text : text;
    return { ...state, winEdit: true, winBuf: buf };
  }
  if (state.screen === "lists") return { ...state, listEdit: true, listBuf: state.listEdit ? state.listBuf + text : text };
  if (state.screen === "matrix") return { ...state, matEdit: true, matBuf: state.matEdit ? state.matBuf + text : text };
  if (state.screen === "prompt" && state.prompt) return { ...state, prompt: { ...state.prompt, value: state.prompt.value + text } };
  if (state.screen === "tvm" && state.tvm.cursor < 7) {
    const key = TVM_KEYS[state.tvm.cursor];
    const current = state.tvm.edit ? state.tvm[key] + text : text;
    return { ...state, tvm: { ...state.tvm, [key]: current, edit: true } };
  }
  if (state.screen === "editor" && state.editor) {
    const edit = ins(state.editor.buf, state.editor.cursor, text, true);
    return { ...state, editor: { ...state.editor, buf: edit.buf, cursor: edit.cursor } };
  }
  if (state.screen === "catalog" && /[A-Za-z]/.test(text)) return jumpCatalog(state, text.toUpperCase());
  return state;
}

const TVM_KEYS = ["n", "i", "pv", "pmt", "fv", "py", "cy"] as const;

function backspace(state: Os): Os {
  if (state.screen === "home") return applyEntry(state, delBefore(state.entry, state.cursor));
  if (state.screen === "yeq" && state.yRow > 0) return yeqKey({ ...state, yCursor: Math.max(0, state.yCursor) }, "del");
  if (state.screen === "prompt" && state.prompt) return { ...state, prompt: { ...state.prompt, value: state.prompt.value.slice(0, -1) } };
  if (state.screen === "lists" && state.listEdit) return { ...state, listBuf: state.listBuf.slice(0, -1) };
  if (state.screen === "window" && state.winEdit) return { ...state, winBuf: state.winBuf.slice(0, -1) };
  if (state.screen === "editor" && state.editor) return editorKey(state, "del");
  return press(state, "del");
}

function ins(buf: string, cursor: number, text: string, insert: boolean) {
  if (insert || cursor >= buf.length) return { buf: buf.slice(0, cursor) + text + buf.slice(cursor), cursor: cursor + text.length };
  return { buf: buf.slice(0, cursor) + text + buf.slice(cursor + 1), cursor: cursor + text.length };
}
function delAt(buf: string, cursor: number) {
  if (cursor < buf.length) return { buf: buf.slice(0, cursor) + buf.slice(cursor + 1), cursor };
  return delBefore(buf, cursor);
}
function delBefore(buf: string, cursor: number) {
  if (cursor <= 0) return { buf, cursor };
  return { buf: buf.slice(0, cursor - 1) + buf.slice(cursor), cursor: cursor - 1 };
}
function applyEntry(state: Os, edit: { buf: string; cursor: number }) {
  return { ...state, entry: edit.buf, cursor: edit.cursor, draft: edit.buf, recall: state.stack.length };
}

function winValue(state: Os) {
  return [state.win.xmin, state.win.xmax, state.win.xscl, state.win.ymin, state.win.ymax, state.win.yscl][state.winRow];
}
function commitWindow(state: Os) {
  if (!state.winEdit || !state.winBuf.trim()) return state;
  try {
    const value = readValue(state.winBuf, envOf(state));
    const keys = ["xmin", "xmax", "xscl", "ymin", "ymax", "yscl"] as const;
    return { ...state, win: { ...state.win, [keys[state.winRow]]: value }, winEdit: false };
  } catch (error) {
    return fail(state, error instanceof CalcError ? error.kind : "ERROR");
  }
}
function commitTbl(state: Os) {
  if (!state.winEdit || !state.winBuf.trim()) return state;
  try {
    const value = readValue(state.winBuf, envOf(state));
    return state.winRow > 0 ? { ...state, tblStep: value || 1, winEdit: false } : { ...state, tblStart: value, winEdit: false };
  } catch (error) {
    return fail(state, error instanceof CalcError ? error.kind : "ERROR");
  }
}
function commitList(state: Os) {
  if (!state.listEdit) return state;
  const name = `L${state.listCol + 1}`;
  const list = [...(state.lists[name] || [])];
  if (!state.listBuf.trim()) return { ...state, listEdit: false, listBuf: "" };
  try {
    const value = readValue(state.listBuf, envOf(state));
    while (list.length < state.listRow) list.push(0);
    list[state.listRow] = value;
    return { ...state, lists: { ...state.lists, [name]: list }, listEdit: false, listBuf: "" };
  } catch (error) {
    return fail(state, error instanceof CalcError ? error.kind : "ERROR");
  }
}
function deleteListCell(state: Os) {
  const name = `L${state.listCol + 1}`;
  const list = [...(state.lists[name] || [])];
  if (state.listRow >= list.length) return state;
  list.splice(state.listRow, 1);
  return { ...state, lists: { ...state.lists, [name]: list } };
}
function commitMatrix(state: Os) {
  if (!state.matEdit || !state.matBuf.trim()) return { ...state, matEdit: false };
  try {
    const value = readValue(state.matBuf, envOf(state));
    const matrix = state.matrices[state.mat].map((row) => [...row]);
    if (matrix[state.matRow]) matrix[state.matRow][state.matCol] = value;
    return { ...state, matrices: { ...state.matrices, [state.mat]: matrix }, matEdit: false, matBuf: "" };
  } catch (error) {
    return fail(state, error instanceof CalcError ? error.kind : "ERROR");
  }
}
function commitTvm(state: Os) {
  if (!state.tvm.edit || state.tvm.cursor > 6) return { ...state, tvm: { ...state.tvm, edit: false } };
  const key = TVM_KEYS[state.tvm.cursor];
  try {
    readValue(state.tvm[key] || "0", envOf(state));
    return { ...state, tvm: { ...state.tvm, edit: false } };
  } catch (error) {
    return fail(state, error instanceof CalcError ? error.kind : "ERROR");
  }
}

function cycleWizardList(state: Os, dir: number): Os {
  if (!state.wizard) return state;
  const names = ["L1", "L2", "L3", "L4", "L5", "L6"];
  const field = state.wizard.kind === "1var" ? "list" : state.wizard.field === 0 ? "list" : "list2";
  if (state.wizard.field > 1) return state;
  const current = names.indexOf(state.wizard[field]);
  const next = names[(current + dir + names.length) % names.length];
  return { ...state, wizard: { ...state.wizard, [field]: next } };
}

function runWizard(state: Os): Os {
  if (!state.wizard) return state;
  try {
    const x = state.lists[state.wizard.list] || [];
    const y = state.lists[state.wizard.list2] || [];
    if (state.wizard.kind === "1var") {
      const stats = oneVarStats(x);
      const line = (label: string, value: number | null) => `${label}=${value === null ? "" : formatTi(value, state.notation, state.digits)}`;
      return showResults(state, "1-Var Stats", [line("x̄", stats.mean), line("Σx", stats.sum), line("Σx²", stats.sumSq), line("Sx", stats.sx), line("σx", stats.ox), line("n", stats.n), line("minX", stats.min), line("Q1", stats.q1), line("Med", stats.med), line("Q3", stats.q3), line("maxX", stats.max)]);
    }
    if (x.length !== y.length || x.length < 2) return fail(state, "DIM MISMATCH");
    if (state.wizard.kind === "2var") {
      const xs = oneVarStats(x);
      const ys = oneVarStats(y);
      const line = (label: string, value: number | null) => `${label}=${value === null ? "" : formatTi(value, state.notation, state.digits)}`;
      return showResults(state, "2-Var Stats", [line("x̄", xs.mean), line("ȳ", ys.mean), line("Σx", xs.sum), line("Σy", ys.sum), line("Sx", xs.sx), line("Sy", ys.sx), line("n", xs.n)]);
    }
    const fit = linReg(x, y);
    const regEq = fit.intercept < 0 && state.wizard.kind === "lin"
      ? `${formatTi(fit.slope)}X−${formatTi(Math.abs(fit.intercept))}`
      : state.wizard.kind === "lin"
        ? `${formatTi(fit.slope)}X+${formatTi(fit.intercept)}`
        : `${formatTi(fit.intercept)}+${formatTi(fit.slope)}X`;
    const a = state.wizard.kind === "lin" ? fit.slope : fit.intercept;
    const b = state.wizard.kind === "lin" ? fit.intercept : fit.slope;
    return showResults({ ...state, regEq }, state.wizard.kind === "lin" ? "LinReg(ax+b)" : "LinReg(a+bx)", [
      state.wizard.kind === "lin" ? "y=ax+b" : "y=a+bx",
      `a=${formatTi(a, state.notation, state.digits)}`,
      `b=${formatTi(b, state.notation, state.digits)}`,
      `r²=${formatTi(fit.r2, state.notation, state.digits)}`,
      `r=${formatTi(fit.r, state.notation, state.digits)}`,
      "RegEQ stored",
    ]);
  } catch (error) {
    return fail(state, error instanceof CalcError ? error.kind : "ERROR");
  }
}
