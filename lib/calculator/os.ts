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
