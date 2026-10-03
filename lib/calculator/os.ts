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
