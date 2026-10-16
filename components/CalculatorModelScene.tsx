"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import { CanvasTexture, SRGBColorSpace } from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { statusTokens, type KeyId, type Os } from "@/lib/calculator/os";
import styles from "./calculator-model.module.css";

type Tone = "soft" | "dark" | "blue" | "green" | "gray" | "white";
type KeyDefinition = { id: KeyId; face: string; secondary?: string; tone: Tone; width?: number; height?: number };

type SceneProps = { os: Os; onPress: (key: KeyId) => void; rotation: [number, number] };

const KEY_ROWS: { y: number; keys: KeyDefinition[] }[] = [
  { y: 0.94, keys: [
    { id: "y=", face: "y=", secondary: "statplot", tone: "soft" }, { id: "window", face: "window", secondary: "tblset", tone: "soft" },
    { id: "zoom", face: "zoom", secondary: "format", tone: "soft" }, { id: "trace", face: "trace", secondary: "calc", tone: "soft" },
    { id: "graph", face: "graph", secondary: "table", tone: "soft" },
  ] },
  { y: 0.35, keys: [
    { id: "2nd", face: "2nd", tone: "blue" }, { id: "mode", face: "mode", secondary: "quit", tone: "dark" },
    { id: "del", face: "del", secondary: "ins", tone: "dark" },
  ] },
  { y: -0.23, keys: [
    { id: "alpha", face: "alpha", secondary: "A-lock", tone: "green" }, { id: "xt", face: "X,T,θ,n", secondary: "link", tone: "dark" },
    { id: "stat", face: "stat", secondary: "list", tone: "dark" },
  ] },
  { y: -0.91, keys: [
    { id: "math", face: "math", secondary: "test", tone: "dark" }, { id: "apps", face: "apps", secondary: "angle", tone: "dark" },
    { id: "prgm", face: "prgm", secondary: "draw", tone: "dark" }, { id: "vars", face: "vars", secondary: "distr", tone: "dark" },
    { id: "clear", face: "clear", tone: "dark" },
  ] },
  { y: -1.55, keys: [
    { id: "inv", face: "x⁻¹", secondary: "matrix", tone: "dark" }, { id: "sin", face: "sin", secondary: "sin⁻¹", tone: "dark" },
    { id: "cos", face: "cos", secondary: "cos⁻¹", tone: "dark" }, { id: "tan", face: "tan", secondary: "tan⁻¹", tone: "dark" },
    { id: "pow", face: "^", secondary: "π", tone: "gray" },
  ] },
  { y: -2.19, keys: [
    { id: "sq", face: "x²", secondary: "√", tone: "dark" }, { id: "comma", face: ",", secondary: "EE", tone: "dark" },
    { id: "lparen", face: "(", secondary: "{", tone: "dark" }, { id: "rparen", face: ")", secondary: "}", tone: "dark" },
    { id: "div", face: "÷", secondary: "e", tone: "gray" },
  ] },
  { y: -2.83, keys: [
    { id: "log", face: "log", secondary: "10ˣ", tone: "dark" }, { id: "n7", face: "7", secondary: "u", tone: "white" },
    { id: "n8", face: "8", secondary: "v", tone: "white" }, { id: "n9", face: "9", secondary: "w", tone: "white" },
    { id: "mul", face: "×", secondary: "[", tone: "gray" },
  ] },
  { y: -3.47, keys: [
    { id: "ln", face: "ln", secondary: "eˣ", tone: "dark" }, { id: "n4", face: "4", secondary: "L4", tone: "white" },
    { id: "n5", face: "5", secondary: "L5", tone: "white" }, { id: "n6", face: "6", secondary: "L6", tone: "white" },
    { id: "sub", face: "−", secondary: "]", tone: "gray" },
  ] },
  { y: -4.11, keys: [
    { id: "sto", face: "sto→", secondary: "rcl", tone: "dark" }, { id: "n1", face: "1", secondary: "L1", tone: "white" },
    { id: "n2", face: "2", secondary: "L2", tone: "white" }, { id: "n3", face: "3", secondary: "L3", tone: "white" },
    { id: "add", face: "+", secondary: "mem", tone: "gray" },
  ] },
  { y: -4.75, keys: [
    { id: "on", face: "on", secondary: "off", tone: "dark" }, { id: "n0", face: "0", secondary: "catalog", tone: "white" },
    { id: "dot", face: ".", secondary: "i", tone: "white" }, { id: "neg", face: "(−)", secondary: "ans", tone: "white" },
    { id: "enter", face: "enter", secondary: "solve", tone: "soft" },
  ] },
];

const X_POSITIONS = [-1.66, -0.83, 0, 0.83, 1.66];
const DPAD_KEYS: (KeyDefinition & { position: [number, number, number] })[] = [
  { id: "up", face: "⌃", tone: "soft", width: 0.5, height: 0.76, position: [1.26, 0.52, 0.37] },
  { id: "down", face: "⌄", tone: "soft", width: 0.5, height: 0.76, position: [1.26, -0.28, 0.37] },
  { id: "left", face: "‹", tone: "soft", width: 0.5, height: 0.76, position: [0.86, 0.12, 0.37] },
  { id: "right", face: "›", tone: "soft", width: 0.5, height: 0.76, position: [1.66, 0.12, 0.37] },
];
const KEY_GEOMETRY = new RoundedBoxGeometry(0.68, 0.39, 0.15, 4, 0.055);
const BODY_GEOMETRY = new RoundedBoxGeometry(4.86, 10.36, 0.52, 8, 0.24);
const FACE_GEOMETRY = new RoundedBoxGeometry(4.74, 10.22, 0.17, 8, 0.2);
const BEZEL_GEOMETRY = new RoundedBoxGeometry(3.84, 2.92, 0.12, 8, 0.12);
const TONES: Record<Tone, { fill: string; text: string; secondary: string }> = {
  soft: { fill: "#d6d7d2", text: "#252827", secondary: "#377741" },
  dark: { fill: "#25292a", text: "#f4f4f0", secondary: "#6cc259" },
  blue: { fill: "#318fc4", text: "#ffffff", secondary: "#d9ecf5" },
  green: { fill: "#7ebc4f", text: "#13200f", secondary: "#315b24" },
  gray: { fill: "#c5c7c2", text: "#171a19", secondary: "#477648" },
  white: { fill: "#f0f0ec", text: "#161817", secondary: "#397943" },
};

export function CalculatorModelScene({ os, onPress, rotation }: SceneProps) {
  return (
    <Canvas
      className={styles.canvas}
      dpr={[1, 1.6]}
      frameloop="demand"
      camera={{ position: [0, 0, 21], fov: 30, near: 0.1, far: 80 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      fallback={<div className={styles.webglFallback}><p>Interactive 3D is unavailable in this browser.</p><a href="/calculator">Open the study calculator</a></div>}
    >
      <ambientLight intensity={1.05} />
      <directionalLight position={[-5, 8, 9]} intensity={2.2} />
      <directionalLight position={[5, 2, 4]} intensity={0.75} color="#dce5ff" />
      <Calculator os={os} onPress={onPress} rotation={rotation} />
    </Canvas>
  );
}

function Calculator({ os, onPress, rotation }: SceneProps) {
  const screenTexture = useScreenTexture(os);
  const [hot, setHot] = useState<KeyId | null>(null);

  return (
    <group rotation={[rotation[0], rotation[1], 0.015]} scale={0.96}>
      <mesh geometry={BODY_GEOMETRY} position={[0, 0, -0.12]} castShadow receiveShadow>
        <meshStandardMaterial color="#aeb2ae" metalness={0.55} roughness={0.34} />
      </mesh>
      <mesh geometry={FACE_GEOMETRY} position={[0, 0, 0.18]} castShadow receiveShadow>
        <meshStandardMaterial color="#171a1b" metalness={0.2} roughness={0.42} />
      </mesh>
      <mesh geometry={BEZEL_GEOMETRY} position={[0, 3.16, 0.31]} castShadow>
        <meshStandardMaterial color="#090b0b" metalness={0.08} roughness={0.28} />
      </mesh>
      <mesh position={[0, 3.16, 0.378]}>
        <planeGeometry args={[3.6, 2.68]} />
        <meshBasicMaterial map={screenTexture} toneMapped={false} />
      </mesh>
      <BrandPlate />
      <Screws />
      {KEY_ROWS.map((row) => row.keys.map((key, index) => (
        <KeyCap
          key={key.id}
          definition={key}
          position={[X_POSITIONS[index], row.y, 0.36]}
          active={hot === key.id}
          onPress={onPress}
          onHover={setHot}
        />
      )))}
      <DPad onPress={onPress} onHover={setHot} hot={hot} />
      <mesh position={[-2.31, 0.08, 0.015]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, 0.045, 32]} />
        <meshStandardMaterial color="#4d5251" metalness={0.6} roughness={0.33} />
      </mesh>
    </group>
  );
}

function KeyCap({ definition, position, active, onPress, onHover }: {
  definition: KeyDefinition;
  position: [number, number, number];
  active: boolean;
  onPress: (key: KeyId) => void;
  onHover: (key: KeyId | null) => void;
}) {
  const texture = useMemo(() => makeKeyTexture(definition), [definition]);
  const tone = TONES[definition.tone];
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <group
      position={position}
      onClick={(event) => { event.stopPropagation(); onPress(definition.id); }}
      onPointerOver={(event) => { event.stopPropagation(); onHover(definition.id); document.body.style.cursor = "pointer"; }}
      onPointerOut={(event) => { event.stopPropagation(); onHover(null); document.body.style.cursor = ""; }}
    >
      <mesh geometry={KEY_GEOMETRY} scale={[definition.width ?? 1, definition.height ?? 1, 1]} castShadow receiveShadow position={[0, active ? 0.035 : 0, active ? 0.025 : 0]}>
        <meshStandardMaterial color={active ? (definition.tone === "white" ? "#ffffff" : "#e4e6e0") : tone.fill} metalness={definition.tone === "dark" ? 0.12 : 0.04} roughness={0.3} />
      </mesh>
      <mesh position={[0, active ? 0.035 : 0, 0.082]}>
        <planeGeometry args={[0.57 * (definition.width ?? 1), 0.28 * (definition.height ?? 1)]} />
        <meshBasicMaterial map={texture} transparent toneMapped={false} />
      </mesh>
      {active && <mesh position={[0, 0, 0.094]}>
        <planeGeometry args={[0.68, 0.39]} />
        <meshBasicMaterial color="#3158d8" transparent opacity={0.16} depthWrite={false} />
      </mesh>}
    </group>
  );
}

function DPad({ onPress, onHover, hot }: { onPress: (key: KeyId) => void; onHover: (key: KeyId | null) => void; hot: KeyId | null }) {
  return <>
    <mesh position={[1.26, 0.12, 0.28]} castShadow>
      <cylinderGeometry args={[0.62, 0.62, 0.16, 48]} />
      <meshStandardMaterial color="#c2c5bf" metalness={0.22} roughness={0.4} />
    </mesh>
    {DPAD_KEYS.map((arrow) => <KeyCap key={arrow.id} definition={arrow} position={arrow.position} active={hot === arrow.id} onPress={onPress} onHover={onHover} />)}
    <mesh position={[1.26, 0.12, 0.4]}>
      <cylinderGeometry args={[0.19, 0.19, 0.12, 32]} />
      <meshStandardMaterial color="#161a1b" metalness={0.18} roughness={0.32} />
    </mesh>
  </>;
}

function BrandPlate() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024; canvas.height = 128;
    const context = canvas.getContext("2d")!;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#d7d9d3";
    context.font = "600 35px Arial, sans-serif";
    context.textAlign = "left"; context.fillText("✦  TEXAS INSTRUMENTS", 18, 82);
    context.font = "700 50px Arial, sans-serif";
    context.textAlign = "right"; context.fillText("TI-84 Plus CE", 1000, 82);
    const map = new CanvasTexture(canvas); map.colorSpace = SRGBColorSpace; return map;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return <mesh position={[0, 4.72, 0.275]}><planeGeometry args={[4.12, 0.38]} /><meshBasicMaterial map={texture} transparent toneMapped={false} /></mesh>;
}

function Screws() {
  const points: [number, number][] = [[-2.18, 4.82], [2.18, 4.82], [-2.18, -4.9], [2.18, -4.9]];
  return <>
    {points.map(([x, y]) => <group key={`${x}:${y}`} position={[x, y, 0.275]}>
      <mesh><cylinderGeometry args={[0.06, 0.06, 0.025, 24]} /><meshStandardMaterial color="#737875" metalness={0.72} roughness={0.3} /></mesh>
      <mesh rotation={[0, 0, 0.7]}><boxGeometry args={[0.07, 0.012, 0.028]} /><meshBasicMaterial color="#252929" /></mesh>
    </group>)}
  </>;
}

function useScreenTexture(os: Os) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas"); canvas.width = 1024; canvas.height = 768;
    const map = new CanvasTexture(canvas); map.colorSpace = SRGBColorSpace; return map;
  }, []);
  useEffect(() => {
    const canvas = texture.image as HTMLCanvasElement;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.fillStyle = "#fafbf8"; context.fillRect(0, 0, 1024, 768);
    context.fillStyle = "#171a1a"; context.fillRect(0, 0, 1024, 44);
    context.fillStyle = "#151817"; context.font = "700 22px ui-monospace, Menlo, monospace";
    context.textBaseline = "middle"; context.textAlign = "left";
    const tokens = statusTokens(os).join("   "); context.fillText(tokens, 22, 22);
    context.fillStyle = "#499d49"; context.fillRect(962, 13, 38, 18); context.fillStyle = "#e9f4e4"; context.fillRect(966, 17, 28, 10);
    context.fillStyle = "#111413"; context.textBaseline = "top"; context.textAlign = "left";
    context.font = "28px ui-monospace, Menlo, monospace";
    if (os.screen === "boot") {
      context.textAlign = "center"; context.font = "34px Arial, sans-serif";
      context.fillText("TI-84 Plus CE", 512, 255); context.fillText("5.7.2.0016", 512, 310); context.fillText("RAM Cleared", 512, 435);
    } else if (os.screen === "off") {
      context.fillStyle = "#252725"; context.fillRect(0, 44, 1024, 724);
    } else if (os.results) {
      context.font = "700 29px ui-monospace, Menlo, monospace"; context.fillText(os.results.title, 24, 82);
      context.font = "28px ui-monospace, Menlo, monospace";
      os.results.lines.slice(0, 15).forEach((line, index) => context.fillText(line.slice(0, 54), 24, 138 + index * 38));
    } else if (os.menu) {
      context.font = "700 28px ui-monospace, Menlo, monospace"; context.fillText(os.menu.id.toUpperCase(), 24, 82);
      const items = os.menu.tabs[os.menu.tab]?.items ?? [];
      context.font = "27px ui-monospace, Menlo, monospace";
      items.slice(0, 12).forEach((item, index) => {
        context.fillStyle = index === os.menu?.index ? "#151817" : "#fafbf8";
        if (index === os.menu?.index) context.fillRect(17, 124 + index * 45, 982, 42);
        context.fillStyle = index === os.menu?.index ? "#fafbf8" : "#151817";
        context.fillText(`${index + 1}  ${item.label}`, 28, 132 + index * 45);
      });
    } else {
      let y = 92;
      for (const entry of os.history.slice(-8)) {
        context.textAlign = "left"; context.fillStyle = "#141817"; context.font = "27px ui-monospace, Menlo, monospace";
        context.fillText(entry.expr.slice(0, 54), 24, y); y += 38;
        context.textAlign = "right"; context.fillText(entry.result.split("\n")[0].slice(0, 54), 995, y); y += 48;
      }
      context.textAlign = "left"; context.fillStyle = "#141817"; context.font = "30px ui-monospace, Menlo, monospace";
      context.fillText(os.entry.slice(0, 54), 24, Math.min(y, 705));
    }
    // Three.js must re-upload this canvas when calculator state changes.
    // eslint-disable-next-line react-hooks/immutability
    texture.needsUpdate = true;
  }, [os, texture]);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

function makeKeyTexture(key: KeyDefinition) {
  const canvas = document.createElement("canvas");
  canvas.width = 256; canvas.height = 128;
  const context = canvas.getContext("2d")!;
  const colors = TONES[key.tone];
  if (key.secondary) {
    context.fillStyle = colors.secondary; context.font = "600 17px Arial, sans-serif";
    context.textAlign = "center"; context.textBaseline = "top"; context.fillText(key.secondary, 128, 6, 240);
  }
  context.fillStyle = colors.text;
  context.font = `650 ${key.face.length > 5 ? 30 : 40}px Arial, sans-serif`;
  context.textAlign = "center"; context.textBaseline = "middle"; context.fillText(key.face, 128, 78, 240);
  const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace; return texture;
}
