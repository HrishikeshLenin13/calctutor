"use client";

import { useEffect, useRef, useState } from "react";
import { evalGraph, formatTi } from "@/lib/calculator/engine";
import {
  MODE_ROWS,
  catalogView,
  createOs,
  envOf,
  hydrate,
  modeOn,
  press,
  statusTokens,
  tracePoint,
  typeChar,
  type KeyId,
  type Os,
} from "@/lib/calculator/os";
import styles from "./ti84.module.css";

const STORAGE_KEY = "calcTutor.standaloneCalculatorState";
const COLORS = ["#2162c4", "#d23a2f", "#1f8a42"];

export function CalcWorkspace({
  os: controlled,
  onPress,
  highlight = null,
  embed = false,
}: {
  os?: Os;
  onPress?: (id: KeyId) => void;
  highlight?: KeyId | null;
  embed?: boolean;
} = {}) {
  const [local, setLocal] = useState(createOs);
  const [ready, setReady] = useState(false);
  const deviceRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const os = controlled ?? local;
  const standalone = controlled === undefined;

  useEffect(() => {
    if (!standalone) return;
    const frame = requestAnimationFrame(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setLocal(hydrate(JSON.parse(saved)));
      } catch { /* keep the cleared startup screen */ }
      setReady(true);
      deviceRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [standalone]);
  useEffect(() => {
    if (!standalone || !ready) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(os)); } catch { /* storage can be unavailable */ }
  }, [os, ready, standalone]);
  useEffect(() => {
    sheetRef.current?.scrollTo(0, sheetRef.current.scrollHeight);
  }, [os.history, os.entry, os.screen]);

  function hit(id: KeyId) {
    if (onPress) onPress(id);
    else setLocal((current) => press(current, id));
  }
  function onKeyDown(event: React.KeyboardEvent) {
    if (!standalone) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === "Tab") return;
    if (event.key === " ") { event.preventDefault(); return; }
    if (event.key.length === 1 || ["Enter", "Backspace", "Escape", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Delete"].includes(event.key)) {
      event.preventDefault();
      setLocal((current) => typeChar(current, event.key));
    }
  }

  return (
    <div className={embed ? `${styles.stage} ${styles.embed}` : styles.stage}>
      <div className={styles.device} ref={deviceRef} tabIndex={0} onKeyDown={onKeyDown} role="application" aria-label="TI-84 Plus CE study calculator">
        <header className={styles.top}>
          <div className={styles.brand}><Mark />TEXAS INSTRUMENTS</div>
          <div className={styles.model}>TI-84 Plus CE</div>
        </header>
        <div className={styles.gasket}>
          <div className={styles.lcd}>
            {os.screen === "off" ? <div className={styles.off} /> : (
              <>
                <div className={styles.status}>
                  {statusTokens(os).map((token) => <span key={token}>{token}</span>)}
                  <Battery />
                </div>
                <Screen os={os} sheetRef={sheetRef} />
              </>
            )}
          </div>
        </div>
        <div className={styles.pad}>
          <div className={styles.row5}>
            <Key id="y=" face="y=" second="statplot" alpha="f1" tone="soft" top="green" label="y equals" onPress={hit} held={false} highlight={highlight} />
            <Key id="window" face="window" second="tblset" alpha="f2" tone="soft" top="green" label="window" onPress={hit} held={false} highlight={highlight} />
            <Key id="zoom" face="zoom" second="format" alpha="f3" tone="soft" top="green" label="zoom" onPress={hit} held={false} highlight={highlight} />
            <Key id="trace" face="trace" second="calc" alpha="f4" tone="soft" top="green" label="trace" onPress={hit} held={false} highlight={highlight} />
            <Key id="graph" face="graph" second="table" alpha="f5" tone="soft" top="green" label="graph" onPress={hit} held={false} highlight={highlight} />
          </div>
          <div className={styles.upper}>
            <div>
              <div className={styles.row3}>
                <Key id="2nd" face="2nd" tone="blueKey" label="second" onPress={hit} held={os.second} highlight={highlight} />
                <Key id="mode" face="mode" second="quit" tone="black" label="mode" onPress={hit} held={false} highlight={highlight} />
                <Key id="del" face="del" second="ins" tone="black" label="delete" onPress={hit} held={false} highlight={highlight} />
              </div>
              <div className={styles.row3}>
                <Key id="alpha" face="alpha" second="A-lock" tone="greenKey" label="alpha" onPress={hit} held={os.alpha !== "off"} highlight={highlight} />
                <Key id="xt" face="X,T,θ,n" second="link" tone="black" small label="X, T, theta, n" onPress={hit} held={false} highlight={highlight} />
                <Key id="stat" face="stat" second="list" tone="black" label="stat" onPress={hit} held={false} highlight={highlight} />
              </div>
            </div>
            <Dpad onPress={hit} highlight={highlight} />
          </div>
          <div className={styles.row5}>
            <Key id="math" face="math" second="test" alpha="A" tone="black" label="math" onPress={hit} held={false} highlight={highlight} />
            <Key id="apps" face="apps" second="angle" alpha="B" tone="black" label="apps" onPress={hit} held={false} highlight={highlight} />
            <Key id="prgm" face="prgm" second="draw" alpha="C" tone="black" label="program" onPress={hit} held={false} highlight={highlight} />
            <Key id="vars" face="vars" second="distr" tone="black" label="variables" onPress={hit} held={false} highlight={highlight} />
            <Key id="clear" face="clear" tone="black" label="clear" onPress={hit} held={false} highlight={highlight} />
          </div>
          <div className={styles.row5}>
            <Key id="inv" face={<>x<span className={styles.sup}>⁻¹</span></>} second="matrix" alpha="D" tone="black" label="reciprocal" onPress={hit} held={false} highlight={highlight} />
            <Key id="sin" face="sin" second="sin⁻¹" alpha="E" tone="black" label="sine" onPress={hit} held={false} highlight={highlight} />
            <Key id="cos" face="cos" second="cos⁻¹" alpha="F" tone="black" label="cosine" onPress={hit} held={false} highlight={highlight} />
            <Key id="tan" face="tan" second="tan⁻¹" alpha="G" tone="black" label="tangent" onPress={hit} held={false} highlight={highlight} />
            <Key id="pow" face="^" second="π" alpha="H" tone="gray" label="power" onPress={hit} held={false} highlight={highlight} />
          </div>
          <div className={styles.row5}>
            <Key id="sq" face={<>x<span className={styles.sup}>²</span></>} second="√" alpha="I" tone="black" label="square" onPress={hit} held={false} highlight={highlight} />
            <Key id="comma" face="," second="EE" alpha="J" tone="black" label="comma" onPress={hit} held={false} highlight={highlight} />
            <Key id="lparen" face="(" second="{" alpha="K" tone="black" label="left parenthesis" onPress={hit} held={false} highlight={highlight} />
            <Key id="rparen" face=")" second="}" alpha="L" tone="black" label="right parenthesis" onPress={hit} held={false} highlight={highlight} />
            <Key id="div" face="÷" second="e" alpha="M" tone="gray" label="divide" onPress={hit} held={false} highlight={highlight} />
          </div>
          <div className={styles.row5}>
            <Key id="log" face="log" second={<>10<span className={styles.sup}>ˣ</span></>} alpha="N" tone="black" label="log" onPress={hit} held={false} highlight={highlight} />
            <Key id="n7" face="7" second="u" alpha="O" tone="white" num label="7" onPress={hit} held={false} highlight={highlight} />
            <Key id="n8" face="8" second="v" alpha="P" tone="white" num label="8" onPress={hit} held={false} highlight={highlight} />
            <Key id="n9" face="9" second="w" alpha="Q" tone="white" num label="9" onPress={hit} held={false} highlight={highlight} />
            <Key id="mul" face="×" second="[" alpha="R" tone="gray" label="multiply" onPress={hit} held={false} highlight={highlight} />
          </div>
          <div className={styles.row5}>
            <Key id="ln" face="ln" second={<>e<span className={styles.sup}>ˣ</span></>} alpha="S" tone="black" label="natural log" onPress={hit} held={false} highlight={highlight} />
            <Key id="n4" face="4" second="L4" alpha="T" tone="white" num label="4" onPress={hit} held={false} highlight={highlight} />
            <Key id="n5" face="5" second="L5" alpha="U" tone="white" num label="5" onPress={hit} held={false} highlight={highlight} />
            <Key id="n6" face="6" second="L6" alpha="V" tone="white" num label="6" onPress={hit} held={false} highlight={highlight} />
            <Key id="sub" face="−" second="]" alpha="W" tone="gray" label="subtract" onPress={hit} held={false} highlight={highlight} />
          </div>
          <div className={styles.row5}>
            <Key id="sto" face="sto→" second="rcl" alpha="X" tone="black" label="store" onPress={hit} held={false} highlight={highlight} />
            <Key id="n1" face="1" second="L1" alpha="Y" tone="white" num label="1" onPress={hit} held={false} highlight={highlight} />
            <Key id="n2" face="2" second="L2" alpha="Z" tone="white" num label="2" onPress={hit} held={false} highlight={highlight} />
            <Key id="n3" face="3" second="L3" alpha="θ" tone="white" num label="3" onPress={hit} held={false} highlight={highlight} />
            <Key id="add" face="+" second="mem" alpha="“" tone="gray" label="add" onPress={hit} held={false} highlight={highlight} />
          </div>
          <div className={styles.row5}>
            <Key id="on" face="on" second="off" tone="black" label="on" onPress={hit} held={false} highlight={highlight} />
            <Key id="n0" face="0" second="catalog" tone="white" num label="0" onPress={hit} held={false} highlight={highlight} />
            <Key id="dot" face="." second="i" tone="white" num label="decimal" onPress={hit} held={false} highlight={highlight} />
            <Key id="neg" face="(−)" second="ans" tone="white" label="negative" onPress={hit} held={false} highlight={highlight} />
            <Key id="enter" face="enter" second="entry" alpha="solve" tone="enter" label="enter" onPress={hit} held={false} highlight={highlight} />
          </div>
        </div>
      </div>
      {!embed && <p className={styles.caption}>
        Independent study calculator for classroom key practice. Not affiliated with Texas Instruments.{" "}
        <button className={styles.reset} type="button" onClick={() => setLocal(createOs())}>Reset RAM</button>
      </p>}
    </div>
  );
}

function Screen({ os, sheetRef }: { os: Os; sheetRef: React.RefObject<HTMLDivElement | null> }) {
  if (os.screen === "boot") {
    return <div className={styles.boot}><i className={styles.bootCaret} /><p>TI-84 Plus CE</p><p>5.7.2.0016</p><p className={styles.ram}>RAM Cleared</p></div>;
  }
  if (os.screen === "graph" && os.plot === "FUNC") return <Graph os={os} />;
  return (
    <div className={styles.sheet} ref={sheetRef}>
      {os.screen === "home" && <Home os={os} />}
      {os.screen === "mode" && <Mode os={os} />}
      {os.screen === "error" && <ErrorScreen os={os} />}
      {os.screen === "menu" && os.menu && <MenuScreen os={os} />}
      {os.screen === "catalog" && <Catalog os={os} />}
      {os.screen === "yeq" && <Yeq os={os} />}
      {os.screen === "window" && <Fields title="WINDOW" rows={["Xmin", "Xmax", "Xscl", "Ymin", "Ymax", "Yscl"]} values={[os.win.xmin, os.win.xmax, os.win.xscl, os.win.ymin, os.win.ymax, os.win.yscl]} row={os.winRow} editing={os.winEdit} buffer={os.winBuf} os={os} />}
      {os.screen === "tblset" && <Fields title="TABLE SETUP" rows={["TblStart", "ΔTbl"]} values={[os.tblStart, os.tblStep]} row={os.winRow > 0 ? 1 : 0} editing={os.winEdit} buffer={os.winBuf} os={os} />}
      {os.screen === "lists" && <Lists os={os} />}
      {os.screen === "table" && <Table os={os} />}
      {os.screen === "results" && os.results && <Results os={os} />}
      {os.screen === "wizard" && os.wizard && <Wizard os={os} />}
      {os.screen === "prompt" && os.prompt && <div><div>{os.prompt.title}</div><Caret text={os.prompt.value} cursor={os.prompt.value.length} os={os} /></div>}
      {os.screen === "tvm" && <Tvm os={os} />}
      {os.screen === "matrix" && <Matrix os={os} />}
      {os.screen === "editor" && os.editor && <Editor os={os} />}
      {os.screen === "format" && <ToggleList os={os} title="FORMAT" rows={[os.grid ? "GridOn" : "GridOff", os.axes ? "AxesOn" : "AxesOff"]} row={os.formatRow} />}
      {os.screen === "statplot" && <StatPlot os={os} />}
      {os.screen === "link" && <div><div className={styles.menuTitle}>Link</div><div>Waiting...</div><div>No connection</div></div>}
    </div>
  );
}

function Home({ os }: { os: Os }) {
  return <>
    {os.rcl && <div>Rcl</div>}
    {os.history.map((item, index) => <div key={`${item.expr}-${index}`}><div>{item.expr}</div>{item.result.split("\n").map((line) => <div className={styles.res} key={line}>{line}</div>)}</div>)}
    <div><Caret text={os.entry} cursor={os.cursor} os={os} /></div>
  </>;
}

function Caret({ text, cursor, os }: { text: string; cursor: number; os: Os }) {
  if (os.insert) return <>{text.slice(0, cursor)}<span className={styles.insert}>_</span>{text.slice(cursor)}</>;
  const ch = text[cursor] ?? "";
  const tone = os.second ? styles.cursor2 : os.alpha !== "off" ? styles.cursorA : "";
  const shown = ch || (os.second ? "↑" : os.alpha === "lock" ? "a" : os.alpha === "once" ? "A" : "");
  return <>{text.slice(0, cursor)}<span className={`${styles.cursor} ${tone}`}>{shown}</span>{ch ? text.slice(cursor + 1) : null}</>;
}

function Mode({ os }: { os: Os }) {
  return <div>{MODE_ROWS.map((row, r) => <div key={row.join()}>{row.map((label, c) => {
    const selected = modeOn(os, r, c);
    const focused = os.modeRow === r && os.modeCol === c;
    return <span key={label} className={`${styles.choice} ${selected ? styles.on : ""}`}>{focused ? "▸" : " "}{label} </span>;
  })}</div>)}</div>;
}

function ErrorScreen({ os }: { os: Os }) {
  return <div><div>ERR:{os.error}</div><div className={styles.ram}> </div><div className={os.errorIndex === 0 ? styles.on : ""}>1:Quit</div><div className={os.errorIndex === 1 ? styles.on : ""}>2:Goto</div></div>;
}

function MenuScreen({ os }: { os: Os }) {
  const menu = os.menu;
  if (!menu) return null;
  const tab = menu.tabs[menu.tab];
  const start = Math.max(0, Math.min(menu.index - 7, tab.items.length - 8));
  return <div>
    {menu.tabs.length > 1 ? <div className={styles.tabs}>{menu.tabs.map((item, index) => <span key={item.name} className={index === menu.tab ? styles.tabOn : ""}>{item.name}</span>)}</div> : <div className={styles.menuTitle}>{tab.name}</div>}
    {tab.items.slice(start, start + 8).map((item, offset) => {
      const index = start + offset;
      return <div key={item.label} className={index === menu.index ? styles.on : styles.item}>{marker(index)}:{item.label}</div>;
    })}
    {start + 8 < tab.items.length && <div className={styles.more}>▼</div>}
  </div>;
}

function Catalog({ os }: { os: Os }) {
  const { items, index } = catalogView(os);
  const start = Math.max(0, Math.min(index - 7, items.length - 8));
  return <div>
    <div className={styles.menuTitle}>CATALOG {os.catalogQ}</div>
    {items.slice(start, start + 8).map((item, offset) => <div key={item.label} className={start + offset === index ? styles.on : ""}>{item.label}</div>)}
  </div>;
}

function Yeq({ os }: { os: Os }) {
  return <div>
    <div className={os.yRow === 0 ? styles.on : ""}>Plot1:{os.plot1 ? "On" : "Off"}</div>
    {os.equations.map((equation, index) => <div key={index}>{os.eqOn[index] ? "\\" : " "}Y{index + 1}={os.yRow === index + 1 ? <Caret text={equation} cursor={os.yCursor} os={os} /> : equation}</div>)}
  </div>;
}

function Fields({ title, rows, values, row, editing, buffer, os }: { title: string; rows: string[]; values: number[]; row: number; editing: boolean; buffer: string; os: Os }) {
  return <div className={styles.mono}><div className={styles.menuTitle}>{title}</div>{rows.map((label, index) => <div key={label} className={index === row ? styles.on : ""}>{label}={index === row && editing ? buffer : formatTi(values[index] ?? 0, os.notation, os.digits)}</div>)}</div>;
}

function Lists({ os }: { os: Os }) {
  const start = Math.max(0, Math.min(os.listCol - 1, 3));
  const cols = [0, 1, 2].map((offset) => start + offset);
  const rowStart = Math.max(0, os.listRow - 6);
  return <div className={styles.mono}>
    <div>{cols.map((col) => <span key={col} style={{ display: "inline-block", width: "7ch" }}>L{col + 1}</span>)}</div>
    {Array.from({ length: 7 }, (_, offset) => rowStart + offset).map((row) => <div key={row}>{cols.map((col) => {
      const list = os.lists[`L${col + 1}`] || [];
      const active = os.listCol === col && os.listRow === row;
      const text = active && os.listEdit ? os.listBuf : list[row] === undefined ? "" : formatTi(list[row], os.notation, os.digits);
      return <span key={col} className={active ? styles.on : ""} style={{ display: "inline-block", width: "7ch" }}>{text || (active ? "█" : "")}</span>;
    })}</div>)}
  </div>;
}

function Table({ os }: { os: Os }) {
  const env = envOf(os);
  const shown = os.equations.map((equation, index) => equation.trim() && os.eqOn[index] ? index : -1).filter((index) => index >= 0);
  const cols = shown.length ? shown : [0];
  return <div className={styles.mono}>
    <div>X{cols.map((index) => <span key={index}>    Y{index + 1}</span>)}</div>
    {Array.from({ length: 7 }, (_, row) => {
      const x = os.tblStart + (os.tableOffset + row) * os.tblStep;
      return <div key={row}>{formatTi(x, os.notation, os.digits)}{cols.map((index) => {
        const y = evalGraph(os.equations[index], x, env);
        return <span key={index}>  {y === null ? "" : formatTi(y, os.notation, os.digits)}</span>;
      })}</div>;
    })}
  </div>;
}

function Results({ os }: { os: Os }) {
  const results = os.results;
  if (!results) return null;
  return <div><div className={styles.resultTitle}>{results.title}</div>{results.lines.slice(results.top, results.top + 8).map((line) => <div key={line}>{line}</div>)}</div>;
}

function Wizard({ os }: { os: Os }) {
  const wizard = os.wizard;
  if (!wizard) return null;
  const names = { "1var": "1-Var Stats", "2var": "2-Var Stats", lin: "LinReg(ax+b)", lina: "LinReg(a+bx)" };
  const calculate = wizard.kind === "1var" ? 1 : 2;
  return <div>
    <div className={styles.menuTitle}>{names[wizard.kind]}</div>
    <div className={wizard.field === 0 ? styles.on : ""}>List:{wizard.list}</div>
    {wizard.kind !== "1var" && <div className={wizard.field === 1 ? styles.on : ""}>{wizard.kind === "2var" ? "Ylist" : "Ylist"}:{wizard.list2}</div>}
    <div className={wizard.field === calculate ? styles.on : ""}>Calculate</div>
  </div>;
}

function Tvm({ os }: { os: Os }) {
  const rows: [string, string][] = [["N", os.tvm.n], ["I%", os.tvm.i], ["PV", os.tvm.pv], ["PMT", os.tvm.pmt], ["FV", os.tvm.fv], ["P/Y", os.tvm.py], ["C/Y", os.tvm.cy]];
  return <div className={styles.mono}>
    {rows.map(([label, value], index) => <div key={label} className={os.tvm.cursor === index ? styles.on : ""}>{label}={value}{os.tvm.cursor === index && os.alpha !== "off" ? "  solve" : ""}</div>)}
    <div className={os.tvm.cursor === 7 ? styles.on : ""}>PMT:{os.tvm.begin ? "BEGIN" : "END"}</div>
  </div>;
}

function Matrix({ os }: { os: Os }) {
  const matrix = os.matrices[os.mat];
  return <div className={styles.mono}><div>[{os.mat}] {matrix.length}×{matrix[0]?.length || 0}</div>{matrix.map((row, r) => <div key={r}>{row.map((cell, c) => {
    const active = os.matRow === r && os.matCol === c;
    return <span key={c} className={active ? styles.on : ""} style={{ display: "inline-block", width: "8ch" }}>{active && os.matEdit ? os.matBuf : formatTi(cell)}</span>;
  })}</div>)}</div>;
}

function Editor({ os }: { os: Os }) {
  const editor = os.editor;
  const program = editor ? os.programs[editor.index] : undefined;
  if (!editor || !program) return null;
  return <div><div className={styles.menuTitle}>PROGRAM:{program.name}</div>{program.lines.map((line, index) => <div key={index}>:{index === editor.row ? <Caret text={editor.buf} cursor={editor.cursor} os={os} /> : line}</div>)}</div>;
}

function ToggleList({ title, rows, row }: { os: Os; title: string; rows: string[]; row: number }) {
  return <div><div className={styles.menuTitle}>{title}</div>{rows.map((label, index) => <div key={label} className={index === row ? styles.on : ""}>{label}</div>)}</div>;
}

function StatPlot({ os }: { os: Os }) {
  return <div><div className={styles.menuTitle}>STAT PLOT</div><div className={styles.on}>Plot1:{os.plot1 ? "On" : "Off"}</div><div>Type: Scatter</div><div>Xlist:L1</div><div>Ylist:L2</div></div>;
}

function Graph({ os }: { os: Os }) {
  const width = 320;
  const height = 188;
  const { xmin, xmax, ymin, ymax, xscl, yscl } = os.win;
  const xSpan = xmax - xmin || 1;
  const ySpan = ymax - ymin || 1;
  const X = (x: number) => ((x - xmin) / xSpan) * width;
  const Y = (y: number) => (1 - (y - ymin) / ySpan) * height;
  const point = tracePoint(os);
  return <div className={styles.graphWrap}>
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Graph">
      {os.grid && gridLines(xmin, xmax, ymin, ymax, xscl, yscl).map((line) => <line key={line.key} x1={X(line.x1)} y1={Y(line.y1)} x2={X(line.x2)} y2={Y(line.y2)} stroke="#d9d9d6" strokeWidth="1" />)}
      {os.axes && <>
        <line x1={X(0)} y1={0} x2={X(0)} y2={height} stroke="#222" strokeWidth="1" />
        <line x1={0} y1={Y(0)} x2={width} y2={Y(0)} stroke="#222" strokeWidth="1" />
      </>}
      {os.draws.map((draw, index) => draw.kind === "h"
        ? <line key={index} x1={0} x2={width} y1={Y(draw.at)} y2={Y(draw.at)} stroke="#7a4e12" strokeWidth="1.4" />
        : <line key={index} y1={0} y2={height} x1={X(draw.at)} x2={X(draw.at)} stroke="#7a4e12" strokeWidth="1.4" />)}
      {os.equations.map((equation, index) => equation.trim() && os.eqOn[index] ? <Curve key={equation + index} os={os} index={index} X={X} Y={Y} color={COLORS[index]} /> : null)}
      {os.bound?.left !== null && os.bound?.left !== undefined && <line x1={X(os.bound.left)} x2={X(os.bound.left)} y1={0} y2={height} stroke="#111" strokeDasharray="3 3" strokeWidth="1" />}
      {os.bound?.right !== null && os.bound?.right !== undefined && <line x1={X(os.bound.right)} x2={X(os.bound.right)} y1={0} y2={height} stroke="#111" strokeDasharray="3 3" strokeWidth="1" />}
      {os.plot1 && os.lists.L1.map((x, index) => {
        const y = os.lists.L2[index];
        if (y === undefined) return null;
        return <rect key={index} x={X(x) - 2.2} y={Y(y) - 2.2} width="4.4" height="4.4" fill="#222" />;
      })}
      {point && <circle cx={X(point.x)} cy={point.y === null ? -10 : Y(point.y)} r="3.2" fill="none" stroke="#111" strokeWidth="1.4" />}
    </svg>
    {(point || os.bound || os.mark) && <div className={styles.readout}><span>{os.bound ? (os.bound.phase === "left" ? "Left Bound?" : os.bound.phase === "right" ? "Right Bound?" : "Guess?") : os.mark || `${point?.name}=${os.equations[os.traceEq] || ""}`}</span>{point && <span>X={formatTi(point.x, os.notation, os.digits)} Y={point.y === null ? "" : formatTi(point.y, os.notation, os.digits)}</span>}</div>}
  </div>;
}

function Curve({ os, index, X, Y, color }: { os: Os; index: number; X: (x: number) => number; Y: (y: number) => number; color: string }) {
  const env = envOf(os);
  const span = os.win.ymax - os.win.ymin || 1;
  let d = "";
  let pen = false;
  let previous: number | null = null;
  for (let step = 0; step <= 180; step++) {
    const x = os.win.xmin + (step * (os.win.xmax - os.win.xmin)) / 180;
    const y = evalGraph(os.equations[index], x, env);
    if (y === null || Math.abs(y) > span * 8 || (previous !== null && Math.abs(y - previous) > span * 4)) {
      pen = false;
      previous = y;
      continue;
    }
    d += `${pen ? "L" : "M"}${X(x).toFixed(2)} ${Y(y).toFixed(2)} `;
    pen = os.connected;
    previous = y;
  }
  if (!os.connected) {
    const dots = [];
    for (let step = 0; step <= 94; step++) {
      const x = os.win.xmin + (step * (os.win.xmax - os.win.xmin)) / 94;
      const y = evalGraph(os.equations[index], x, env);
      if (y !== null) dots.push(<circle key={step} cx={X(x)} cy={Y(y)} r="1.5" fill={color} />);
    }
    return <>{dots}</>;
  }
  return <path d={d} fill="none" stroke={color} strokeWidth="1.6" />;
}

function gridLines(xmin: number, xmax: number, ymin: number, ymax: number, xscl: number, yscl: number) {
  const lines: { key: string; x1: number; y1: number; x2: number; y2: number }[] = [];
  if (xscl > 0) for (let x = Math.ceil(xmin / xscl) * xscl; x <= xmax; x += xscl) lines.push({ key: `x${x}`, x1: x, y1: ymin, x2: x, y2: ymax });
  if (yscl > 0) for (let y = Math.ceil(ymin / yscl) * yscl; y <= ymax; y += yscl) lines.push({ key: `y${y}`, x1: xmin, y1: y, x2: xmax, y2: y });
  return lines.slice(0, 80);
}

function marker(index: number) {
  const number = index + 1;
  if (number < 10) return String(number);
  if (number === 10) return "0";
  return String.fromCharCode(64 + number - 10);
}
