"use client";

import { useEffect, useMemo, useState } from "react";

type Mode = "serve_receive" | "defense";

type Role =
  | "setter"
  | "middle"
  | "right_side"
  | "outside1"
  | "outside2"
  | "libero";

type CircleToken = {
  id: string;
  role: Role | "attacker";
  label: string;
  color: string;
  x: number; // 0..1
  y: number; // 0..1
};

const ROLE_ORDER: Role[] = ["setter", "middle", "right_side", "outside1", "outside2", "libero"];

const COLORS: Record<Role | "attacker", string> = {
  setter: "#a855f7",
  middle: "#f59e0b",
  right_side: "#ef4444",
  outside1: "#22c55e",
  outside2: "#22c55e",
  libero: "#3b82f6",
  attacker: "#fb7185",
};

const LABELS: Record<Role | "attacker", string> = {
  setter: "SETTER",
  middle: "MIDDLE",
  right_side: "RIGHT SIDE",
  outside1: "OUTSIDE",
  outside2: "OUTSIDE",
  libero: "LIBERO",
  attacker: "ATTACKER",
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

const uid = () => (typeof crypto !== "undefined" ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

function makeToken(role: Role | "attacker", x: number, y: number): CircleToken {
  return { id: uid(), role, label: LABELS[role], color: COLORS[role], x, y };
}

// Rough SR defaults (approximate to your screenshots; you’ll drag to refine)
const SR_DEFAULTS: Record<number, Array<[Role, number, number]>> = {
  1: [
    ["right_side", 0.12, 0.55],
    ["middle", 0.45, 0.55],
    ["outside1", 0.28, 0.82],
    ["libero", 0.50, 0.90],
    ["outside2", 0.70, 0.82],
    ["setter", 0.88, 0.85],
  ],
  2: [
    ["middle", 0.10, 0.45],
    ["outside1", 0.25, 0.60],
    ["outside2", 0.52, 0.65],
    ["libero", 0.75, 0.65],
    ["right_side", 0.50, 0.88],
    ["setter", 0.85, 0.25],
  ],
  3: [
    ["setter", 0.55, 0.25],
    ["middle", 0.85, 0.45],
    ["outside1", 0.25, 0.60],
    ["libero", 0.50, 0.72],
    ["outside2", 0.75, 0.62],
    ["right_side", 0.62, 0.90],
  ],
  4: [
    ["setter", 0.12, 0.28],
    ["middle", 0.20, 0.42],
    ["outside1", 0.30, 0.65],
    ["outside2", 0.52, 0.65],
    ["libero", 0.75, 0.65],
    ["right_side", 0.85, 0.90],
  ],
  5: [
    ["middle", 0.12, 0.35],
    ["setter", 0.35, 0.52],
    ["right_side", 0.88, 0.55],
    ["outside1", 0.30, 0.72],
    ["outside2", 0.52, 0.72],
    ["libero", 0.70, 0.75],
  ],
  6: [
    ["right_side", 0.72, 0.32],
    ["middle", 0.88, 0.42],
    ["setter", 0.65, 0.55],
    ["outside1", 0.25, 0.75],
    ["libero", 0.50, 0.80],
    ["outside2", 0.75, 0.75],
  ],
};

function defaultFor(mode: Mode, rotation: number) {
  if (mode === "serve_receive") {
    return (SR_DEFAULTS[rotation] ?? SR_DEFAULTS[1]).map(([r, x, y]) => makeToken(r, x, y));
  }
  // Defense defaults (basic; we’ll replace with real Base 1/2 once you send references)
  return [
    makeToken("setter", 0.55, 0.62),
    makeToken("middle", 0.50, 0.40),
    makeToken("right_side", 0.78, 0.72),
    makeToken("outside1", 0.22, 0.70),
    makeToken("outside2", 0.42, 0.58),
    makeToken("libero", 0.55, 0.88),
  ];
}

export default function Page() {
  const [mode, setMode] = useState<Mode>("serve_receive");
  const [rotation, setRotation] = useState(1);

  const [tokens, setTokens] = useState<CircleToken[]>(() => defaultFor("serve_receive", 1));
  const [showAttacker, setShowAttacker] = useState(false);
  const [attacker, setAttacker] = useState<CircleToken>(() => makeToken("attacker", 0.80, 0.18));

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const title = useMemo(() => {
    if (mode === "serve_receive") return `Rotation ${rotation}`;
    return "Defense";
  }, [mode, rotation]);

  // Reset layout when mode/rotation changes (since no saving)
  useEffect(() => {
    setSelectedId(null);
    setTokens(defaultFor(mode, rotation));
    if (mode === "defense") setShowAttacker(true);
    if (mode === "serve_receive") setShowAttacker(false);
  }, [mode, rotation]);

  // Delete key removes selected token (not attacker)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      if (!selectedId) return;
      if (selectedId === attacker.id) return;
      setTokens((t) => t.filter((x) => x.id !== selectedId));
      setSelectedId(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, attacker.id]);

  function addRole(role: Role) {
    setTokens((t) => [...t, makeToken(role, 0.5, 0.78)]);
  }

  function reset() {
    setSelectedId(null);
    setTokens(defaultFor(mode, rotation));
    if (mode === "defense") {
      setShowAttacker(true);
      setAttacker(makeToken("attacker", 0.80, 0.18));
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-950/60">
        <div className="flex items-baseline gap-3">
          <div className="font-semibold">VolleyRotations</div>
          <div className="text-sm text-neutral-300">{mode === "serve_receive" ? "Serve Receive" : "Defense"}</div>
          <div className="text-xs text-neutral-400 border border-neutral-800 rounded-full px-2 py-0.5">
            {title}
          </div>
        </div>
        <button
          onClick={reset}
          className="text-sm text-neutral-300 hover:text-white border border-neutral-800 rounded-xl px-3 py-1.5 bg-neutral-900/30"
        >
          Reset
        </button>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="w-[320px] max-w-[85vw] border-r border-neutral-800 bg-neutral-950/40 p-4 space-y-4 overflow-y-auto">
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-neutral-400">Mode</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode("serve_receive")}
                className={`rounded-xl border px-3 py-2 text-sm ${
                  mode === "serve_receive"
                    ? "border-white bg-white text-black"
                    : "border-neutral-800 bg-neutral-900/30 text-neutral-200"
                }`}
              >
                Serve Receive
              </button>
              <button
                onClick={() => setMode("defense")}
                className={`rounded-xl border px-3 py-2 text-sm ${
                  mode === "defense"
                    ? "border-white bg-white text-black"
                    : "border-neutral-800 bg-neutral-900/30 text-neutral-200"
                }`}
              >
                Defense
              </button>
            </div>
          </div>

          {mode === "serve_receive" && (
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wide text-neutral-400">Rotation</div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRotation(r)}
                    className={`rounded-xl border px-3 py-2 text-sm ${
                      rotation === r
                        ? "border-white bg-white text-black"
                        : "border-neutral-800 bg-neutral-900/30 text-neutral-200"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-neutral-400">Add circles</div>
            <div className="grid grid-cols-2 gap-2">
              {ROLE_ORDER.map((role) => (
                <button
                  key={role}
                  onClick={() => addRole(role)}
                  className="rounded-xl border border-neutral-800 bg-neutral-900/30 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-900/60"
                >
                  {role.replace("_", " ").toUpperCase()}
                </button>
              ))}
            </div>
            <div className="text-xs text-neutral-400">
              Select a circle and press <span className="text-neutral-200">Delete</span> to remove it.
            </div>
          </div>

          {mode === "defense" && (
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wide text-neutral-400">Defense</div>
              <label className="flex items-center gap-2 text-sm text-neutral-200">
                <input
                  type="checkbox"
                  checked={showAttacker}
                  onChange={(e) => setShowAttacker(e.target.checked)}
                />
                Show attacker
              </label>

              {/* Base 1 / Base 2 intentionally omitted until you provide references */}
              <div className="text-xs text-neutral-400">
                Base presets will be added once you provide the defensive reference positions.
              </div>
            </div>
          )}
        </aside>

        <main className="flex-1 min-w-0 p-4">
          <Court
            tokens={tokens}
            setTokens={setTokens}
            showAttacker={showAttacker}
            attacker={attacker}
            setAttacker={setAttacker}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            headerText={mode === "serve_receive" ? `THIS IS ROTATION ${rotation}` : `THIS IS DEFENSE`}
          />
        </main>
      </div>
    </div>
  );
}

function Court({
  tokens,
  setTokens,
  showAttacker,
  attacker,
  setAttacker,
  selectedId,
  setSelectedId,
  headerText,
}: {
  tokens: CircleToken[];
  setTokens: React.Dispatch<React.SetStateAction<CircleToken[]>>;
  showAttacker: boolean;
  attacker: CircleToken;
  setAttacker: React.Dispatch<React.SetStateAction<CircleToken>>;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  headerText: string;
}) {
  const [drag, setDrag] = useState<
    | null
    | { kind: "token"; id: string; pointerId: number }
    | { kind: "attacker"; pointerId: number }
  >(null);

  function getXY(e: React.PointerEvent, el: HTMLDivElement) {
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    return { x: clamp01(x), y: clamp01(y) };
  }

  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="w-full max-w-3xl aspect-[3/4] rounded-2xl border border-neutral-800 overflow-hidden relative">
        <GridBackground />

        {/* Title like your screenshots */}
        <div className="absolute top-6 left-0 right-0 text-center font-extrabold tracking-tight text-2xl sm:text-3xl">
          <span className="text-white">{headerText.split(" ").slice(0, 2).join(" ")}</span>{" "}
          <span className="text-yellow-400">{headerText.split(" ").slice(2).join(" ")}</span>
        </div>

        <div className="absolute inset-0 p-5 pt-20">
          <div className="absolute inset-5">
            <svg viewBox="0 0 1000 1300" className="absolute inset-0 w-full h-full">
              <rect x="40" y="40" width="920" height="1220" fill="none" stroke="white" strokeWidth="8" />
              <line x1="40" y1="600" x2="960" y2="600" stroke="white" strokeWidth="8" />
              <line x1="40" y1="900" x2="960" y2="900" stroke="white" strokeWidth="6" opacity="0.9" />
            </svg>

            <div
              className="absolute inset-0"
              onPointerMove={(e) => {
                if (!drag) return;
                const { x, y } = getXY(e, e.currentTarget);
                if (drag.kind === "attacker") {
                  setAttacker((a) => ({ ...a, x, y }));
                } else {
                  setTokens((t) => t.map((c) => (c.id === drag.id ? { ...c, x, y } : c)));
                }
              }}
              onPointerUp={(e) => {
                if (!drag) return;
                e.currentTarget.releasePointerCapture(drag.pointerId);
                setDrag(null);
              }}
              onPointerCancel={(e) => {
                if (!drag) return;
                e.currentTarget.releasePointerCapture(drag.pointerId);
                setDrag(null);
              }}
              onPointerDown={() => {
                // clicking empty space deselects
                setSelectedId(null);
              }}
            >
              {showAttacker && (
                <Token
                  token={attacker}
                  selected={selectedId === attacker.id}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setSelectedId(attacker.id);
                    e.currentTarget.parentElement!.setPointerCapture(e.pointerId);
                    setDrag({ kind: "attacker", pointerId: e.pointerId });
                  }}
                />
              )}

              {tokens.map((t) => (
                <Token
                  key={t.id}
                  token={t}
                  selected={selectedId === t.id}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setSelectedId(t.id);
                    e.currentTarget.parentElement!.setPointerCapture(e.pointerId);
                    setDrag({ kind: "token", id: t.id, pointerId: e.pointerId });
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GridBackground() {
  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundColor: "rgb(10,10,10)",
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 24px), repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 24px)",
      }}
    />
  );
}

function Token({
  token,
  selected,
  onPointerDown,
}: {
  token: CircleToken;
  selected: boolean;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
}) {
  const size = 46;
  return (
    <div
      onPointerDown={onPointerDown}
      className="absolute select-none touch-none"
      style={{
        left: `calc(${(token.x * 100).toFixed(4)}% - ${size / 2}px)`,
        top: `calc(${(token.y * 100).toFixed(4)}% - ${size / 2}px)`,
      }}
    >
      <div
        className={`grid place-items-center rounded-full border ${selected ? "border-white" : "border-black/40"} shadow`}
        style={{
          width: size,
          height: size,
          background: token.color,
          transform: selected ? "scale(1.06)" : "scale(1)",
        }}
      />
      <div className="mt-1 text-[11px] font-semibold text-center" style={{ color: token.color }}>
        {token.label}
      </div>
    </div>
  );
}
