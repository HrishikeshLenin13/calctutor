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
