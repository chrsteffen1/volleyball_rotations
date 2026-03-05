"use client";

import { useEffect, useMemo, useState } from "react";

type Mode = "serve_receive" | "defense";
type AttackFrom = "outside" | "middle" | "right";

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

// ✅ stable IDs so tokens animate instead of popping
const STABLE_IDS: Record<Role, string> = {
  setter: "setter",
  middle: "middle",
  right_side: "right_side",
  outside1: "outside1",
  outside2: "outside2",
  libero: "libero",
};
const ATTACKER_ID = "attacker";

const COLORS: Record<Role | "attacker", string> = {
  setter: "#a855f7",
  middle: "#f59e0b",
  right_side: "#ef4444",
  outside1: "#22c55e",
  outside2: "#14b8a6",
  libero: "#3b82f6",
  attacker: "#fb7185",
};

const LABELS: Record<Role | "attacker", string> = {
  setter: "SETTER",
  middle: "MIDDLE",
  right_side: "RIGHT SIDE",
  outside1: "OUTSIDE1",
  outside2: "OUTSIDE2",
  libero: "LIBERO",
  attacker: "ATTACKER",
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

// Net position in normalized coordinates (matches SVG net line y=600 in viewBox height=1300)
const NET_Y = 600 / 1300; // ~0.4615
const OUR_MIN_Y = NET_Y + 0.02;

function clampOurY(y: number) {
  return Math.max(OUR_MIN_Y, Math.min(1, y));
}
function clampAttackerY(y: number) {
  return Math.max(0, Math.min(NET_Y - 0.02, y));
}

function makeToken(
  role: Role | "attacker",
  x: number,
  y: number,
  forcedId?: string
): CircleToken {
  return {
    id: forcedId ?? `${Date.now()}-${Math.random()}`,
    role,
    label: LABELS[role],
    color: COLORS[role],
    x,
    y,
  };
}

// -------------------- Serve Receive Defaults --------------------

// Rough SR defaults (tweak using the coordinate readout)
const SR_DEFAULTS: Record<number, Array<[Role, number, number]>> = {
  1: [
    ["right_side", 0.075, 0.60],
    ["middle", 0.15, 0.65],
    ["outside1", 0.70, 0.78],
    ["libero", 0.50, 0.88],
    ["outside2", 0.28, 0.78],
    ["setter", 0.88, 0.82],
  ],
  2: [
    ["middle", 0.070, 0.54],
    ["outside1", 0.21, 0.75],
    ["outside2", 0.50, 0.81],
    ["libero", 0.75, 0.81],
    ["right_side", 0.08, 0.90],
    ["setter", 0.75, 0.50],
  ],
  3: [
    ["setter", 0.7500, 0.5023],
    ["middle", 0.9289, 0.6480],
    ["outside1", 0.2116, 0.7576],
    ["libero", 0.4764, 0.8255],
    ["outside2", 0.7475, 0.8218],
    ["right_side", 0.6520, 0.9351],
  ],
  4: [
    ["setter", 0.0919, 0.5111],
    ["middle", 0.1086, 0.5917],
    ["outside1", 0.4690, 0.8163],
    ["outside2", 0.2187, 0.7588],
    ["libero", 0.7670, 0.8162],
    ["right_side", 0.8859, 0.9159],
  ],
  5: [
    ["middle", 0.12, 0.54],
    ["setter", 0.35, 0.62],
    ["right_side", 0.9205, 0.6510],
    ["outside1", 0.5014, 0.8242],
    ["outside2", 0.1972, 0.7683],
    ["libero", 0.7806, 0.8219],
  ],
  6: [
    ["right_side", 0.7216, 0.5079],
    ["middle", 0.9233, 0.6465],
    ["setter", 0.6993, 0.5790],
    ["outside1", 0.7846, 0.8164],
    ["libero", 0.4923, 0.8242],
    ["outside2", 0.2125, 0.7666],
  ],
};

// -------------------- Defense Presets --------------------

type XY = { x: number; y: number };
type DefensePreset = {
  players: Record<Role, XY>;
  attacker: XY;
};

function mirrorDefensePreset(p: DefensePreset): DefensePreset {
  const players = {} as Record<Role, XY>;
  (Object.keys(p.players) as Role[]).forEach((r) => {
    players[r] = { x: 1 - p.players[r].x, y: p.players[r].y };
  });
  return {
    players,
    attacker: { x: 1 - p.attacker.x, y: p.attacker.y },
  };
}

/** Base 1 (same regardless of attack direction) */
const BASE1_PRESET: DefensePreset = {
  players: {
    right_side: { x: 0.6412, y: 0.4960 },
    middle: { x: 0.4997, y: 0.4941 },
    outside1: { x: 0.3496, y: 0.4967 },
    outside2: { x: 0.1571, y: 0.7267 },
    libero: { x: 0.5234, y: 0.8706 },
    setter: { x: 0.8589, y: 0.7282 },
  },
  // You can tweak this later. It's above the net and centered.
  attacker: { x: 0.50, y: 0.4300 },
};

/** Base 2 when the attack is coming from OUTSIDE */
const BASE2_OUTSIDE_PRESET: DefensePreset = {
  players: {
    right_side: { x: 0.8869, y: 0.4888 },
    middle: { x: 0.8079, y: 0.4898 },
    outside1: { x: 0.2738, y: 0.6239 },
    outside2: { x: 0.2279, y: 0.7949 },
    libero: { x: 0.4392, y: 0.8556 },
    setter: { x: 0.9155, y: 0.7791 },
  },
  attacker: { x: 0.8879, y: 0.4306 },
};

/** Base 2 when the attack is coming from RIGHT (mirrored from OUTSIDE) */
const BASE2_RIGHT_PRESET: DefensePreset = {
  players: {
    right_side: { x:0.7629, y: 0.6239 },
    middle: { x:0.1854, y:0.4935 },
    outside1: { x:0.0983, y:0.4928 },
    outside2: { x:0.0811, y:0.7780 },
    libero: { x:0.6533, y:0.8461 },
    setter: { x:0.7645, y:0.7711 },
  },
  attacker: { x:0.1070, y:0.4270 },
};
/**
 * Base 2 when the attack is coming from MIDDLE.
 * Placeholder for now (you can adjust later). Includes attacker.
 */
const BASE2_MIDDLE_PRESET: DefensePreset = {
  players: {
    right_side: { x: 0.60, y: 0.49 },
    middle: { x: 0.50, y: 0.49 },
    outside1: { x: 0.40, y: 0.49 },
    outside2: { x: 0.16, y: 0.76 },
    libero: { x: 0.50, y: 0.86 },
    setter: { x: 0.86, y: 0.74 },
  },
  attacker: { x: 0.50, y: 0.4300 },
};

function getBase2Preset(attackFrom: AttackFrom): DefensePreset {
  if (attackFrom === "outside") return BASE2_OUTSIDE_PRESET;
  if (attackFrom === "right") return BASE2_RIGHT_PRESET;
  return BASE2_MIDDLE_PRESET;
}

function defaultFor(mode: Mode, rotation: number) {
  if (mode === "serve_receive") {
    return (SR_DEFAULTS[rotation] ?? SR_DEFAULTS[1]).map(([r, x, y]) =>
      makeToken(r, x, clampOurY(y), STABLE_IDS[r])
    );
  }

  // Defense defaults: start in Base 1
  return (Object.keys(BASE1_PRESET.players) as Role[]).map((r) =>
    makeToken(r, BASE1_PRESET.players[r].x, clampOurY(BASE1_PRESET.players[r].y), STABLE_IDS[r])
  );
}

export default function Page() {
  const [mode, setMode] = useState<Mode>("serve_receive");
  const [rotation, setRotation] = useState(1);
  const [attackFrom, setAttackFrom] = useState<AttackFrom>("outside");

  // Highlight states (what’s “selected”)
  const [defenseBase, setDefenseBase] = useState<"base1" | "base2">("base1");

  // ✅ mobile arrows (must live in Page)
  const nextRotation = () => setRotation((r) => (r === 6 ? 1 : r + 1));
  const prevRotation = () => setRotation((r) => (r === 1 ? 6 : r - 1));

  const [tokens, setTokens] = useState<CircleToken[]>(() => defaultFor("serve_receive", 1));
  const [showAttacker, setShowAttacker] = useState(false);
  const [attacker, setAttacker] = useState<CircleToken>(() =>
    makeToken("attacker", 0.50, clampAttackerY(0.43), ATTACKER_ID)
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const title = useMemo(() => {
    if (mode === "serve_receive") return `Rotation ${rotation}`;
    return "Defense";
  }, [mode, rotation]);

  const selectedToken = useMemo(() => {
    if (!selectedId) return null;
    if (showAttacker && selectedId === attacker.id) return attacker;
    return tokens.find((t) => t.id === selectedId) ?? null;
  }, [selectedId, showAttacker, attacker, tokens]);

  // ✅ Update tokens on mode/rotation change so they SLIDE (instead of remount)
  useEffect(() => {
    setSelectedId(null);

    const next = defaultFor(mode, rotation);

    setTokens((prev) => {
      if (!prev.length) return next;

      const byId = new Map(next.map((t) => [t.id, t]));
      const updated = prev.map((p) => {
        const n = byId.get(p.id);
        if (!n) return { ...p, y: clampOurY(p.y) };
        return { ...p, x: n.x, y: n.y, color: n.color, label: n.label, role: n.role };
      });

      const existing = new Set(updated.map((u) => u.id));
      for (const n of next) if (!existing.has(n.id)) updated.push(n);

      return updated;
    });

    if (mode === "defense") {
      setShowAttacker(true);
      setDefenseBase("base1");
      // Set attacker to base1 attacker spot by default
      setAttacker((a) => ({
        ...a,
        x: BASE1_PRESET.attacker.x,
        y: clampAttackerY(BASE1_PRESET.attacker.y),
      }));
    } else {
      setShowAttacker(false);
    }
  }, [mode, rotation]);

  function applyPreset(preset: DefensePreset) {
    setTokens((prev) =>
      prev.map((p) => {
        const role = p.role as Role;
        const spot = preset.players[role];
        if (!spot) return p;
        return { ...p, x: spot.x, y: clampOurY(spot.y) };
      })
    );

    if (showAttacker) {
      setAttacker((a) => ({
        ...a,
        x: preset.attacker.x,
        y: clampAttackerY(preset.attacker.y),
      }));
    }
  }

  function applyDefenseBase(base: "base1" | "base2") {
    if (mode !== "defense") return;

    setDefenseBase(base);

    const preset = base === "base1" ? BASE1_PRESET : getBase2Preset(attackFrom);
    applyPreset(preset);
  }

  // If you switch attack direction while Base 2 is selected, re-apply Base 2 automatically
  useEffect(() => {
    if (mode !== "defense") return;
    if (defenseBase !== "base2") return;
    applyPreset(getBase2Preset(attackFrom));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attackFrom]);

  function reset() {
    setSelectedId(null);
    setTokens(defaultFor(mode, rotation));
    if (mode === "defense") {
      setShowAttacker(true);
      setDefenseBase("base1");
      setAttacker(makeToken("attacker", BASE1_PRESET.attacker.x, clampAttackerY(BASE1_PRESET.attacker.y), ATTACKER_ID));
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-950/60">
        <div className="flex items-baseline gap-3">
          <div className="font-semibold">VolleyRotations</div>
          <div className="text-sm text-neutral-300">
            {mode === "serve_receive" ? "Serve Receive" : "Defense"}
          </div>
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
        {/* Desktop sidebar only */}
        <aside className="hidden md:block w-[320px] border-r border-neutral-800 bg-neutral-950/40 p-4 space-y-4 overflow-y-auto">
        
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

          {/* Defense controls (desktop) */}
          {mode === "defense" && (
            <div className="space-y-3">
              <div className="text-xs uppercase tracking-wide text-neutral-400">Defense</div>

              <label className="flex items-center gap-2 text-sm text-neutral-200">
                <input
                  type="checkbox"
                  checked={showAttacker}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setShowAttacker(checked);
                    if (checked) {
                      // snap attacker to whichever base is currently selected
                      const p = defenseBase === "base1" ? BASE1_PRESET : getBase2Preset(attackFrom);
                      setAttacker(makeToken("attacker", p.attacker.x, clampAttackerY(p.attacker.y), ATTACKER_ID));
                    }
                  }}
                />
                Show attacker
              </label>

              <div className="space-y-2">
                <div className="text-xs uppercase tracking-wide text-neutral-400">Attack from</div>
                <div className="grid grid-cols-3 gap-2">
                  {(["outside", "middle", "right"] as AttackFrom[]).map((a) => (
                    <button
                      key={a}
                      onClick={() => setAttackFrom(a)}
                      className={`rounded-xl border px-2 py-2 text-sm ${
                        attackFrom === a
                          ? "border-white bg-white text-black"
                          : "border-neutral-800 bg-neutral-900/30 text-neutral-200"
                      }`}
                    >
                      {a.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => applyDefenseBase("base1")}
                  className={`rounded-xl border px-3 py-2 text-sm ${
                    defenseBase === "base1"
                      ? "border-white bg-white text-black"
                      : "border-neutral-800 bg-neutral-900/30 text-neutral-200 hover:bg-neutral-900/60"
                  }`}
                >
                  Base 1
                </button>
                <button
                  onClick={() => applyDefenseBase("base2")}
                  className={`rounded-xl border px-3 py-2 text-sm ${
                    defenseBase === "base2"
                      ? "border-white bg-white text-black"
                      : "border-neutral-800 bg-neutral-900/30 text-neutral-200 hover:bg-neutral-900/60"
                  }`}
                >
                  Base 2
                </button>
              </div>

              <div className="text-xs text-neutral-400">
                Base 1 is constant. Base 2 changes with attack direction.
              </div>
            </div>
          )}

          {/* Coordinate readout (desktop) */}
          {false && (
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-neutral-400">Selected</div>

            {!selectedToken ? (
              <div className="text-sm text-neutral-300">Click a circle to see its coordinates.</div>
            ) : (
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium" style={{ color: selectedToken.color }}>
                    {selectedToken.label}
                  </div>
                  <button
                    className="text-xs text-neutral-300 hover:text-white"
                    onClick={() =>
                      navigator.clipboard.writeText(
                        `x:${selectedToken.x.toFixed(4)}, y:${selectedToken.y.toFixed(4)}`
                      )
                    }
                  >
                    Copy
                  </button>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg border border-neutral-800 bg-neutral-950 px-2 py-1">
                    <div className="text-[11px] text-neutral-400">x (0–1)</div>
                    <div className="font-mono">{selectedToken.x.toFixed(4)}</div>
                  </div>
                  <div className="rounded-lg border border-neutral-800 bg-neutral-950 px-2 py-1">
                    <div className="text-[11px] text-neutral-400">y (0–1)</div>
                    <div className="font-mono">{selectedToken.y.toFixed(4)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          )}
        </aside>

        <main className="flex-1 min-w-0 p-4 pb-24 md:pb-4">
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

      {/* Mobile controls */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-neutral-800 bg-neutral-950/95 backdrop-blur px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          {/* Mode toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode("serve_receive")}
              className={`rounded-xl border px-3 py-2 text-sm ${
                mode === "serve_receive"
                  ? "border-white bg-white text-black"
                  : "border-neutral-800 bg-neutral-900/40 text-neutral-200"
              }`}
            >
              SR
            </button>
            <button
              onClick={() => setMode("defense")}
              className={`rounded-xl border px-3 py-2 text-sm ${
                mode === "defense"
                  ? "border-white bg-white text-black"
                  : "border-neutral-800 bg-neutral-900/40 text-neutral-200"
              }`}
            >
              DEF
            </button>
          </div>

          {mode === "serve_receive" ? (
            <div className="flex items-center gap-2">
              <button
                onClick={prevRotation}
                className="rounded-xl border border-neutral-800 bg-neutral-900/40 px-3 py-2 text-sm text-neutral-200"
                aria-label="Previous rotation"
              >
                ←
              </button>

              <div className="min-w-[95px] text-center text-sm text-neutral-200">
                Rot <span className="font-semibold">{rotation}</span>
              </div>

              <button
                onClick={nextRotation}
                className="rounded-xl border border-neutral-800 bg-neutral-900/40 px-3 py-2 text-sm text-neutral-200"
                aria-label="Next rotation"
              >
                →
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <select
                value={attackFrom}
                onChange={(e) => setAttackFrom(e.target.value as AttackFrom)}
                className="rounded-xl border border-neutral-800 bg-neutral-900/40 px-2 py-2 text-sm text-neutral-200"
              >
                <option value="outside">OUT</option>
                <option value="middle">MID</option>
                <option value="right">RS</option>
              </select>

              <button
                onClick={() => applyDefenseBase("base1")}
                className={`rounded-xl border px-3 py-2 text-sm ${
                  defenseBase === "base1"
                    ? "border-white bg-white text-black"
                    : "border-neutral-800 bg-neutral-900/40 text-neutral-200"
                }`}
              >
                B1
              </button>
              <button
                onClick={() => applyDefenseBase("base2")}
                className={`rounded-xl border px-3 py-2 text-sm ${
                  defenseBase === "base2"
                    ? "border-white bg-white text-black"
                    : "border-neutral-800 bg-neutral-900/40 text-neutral-200"
                }`}
              >
                B2
              </button>
            </div>
          )}
        </div>
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
                  setAttacker((a) => ({ ...a, x: clamp01(x), y: clampAttackerY(y) }));
                } else {
                  setTokens((t) =>
                    t.map((c) =>
                      c.id === drag.id ? { ...c, x: clamp01(x), y: clampOurY(y) } : c
                    )
                  );
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
              onPointerDown={() => setSelectedId(null)}
            >
              {showAttacker && (
                <Token
                  token={attacker}
                  selected={selectedId === attacker.id}
                  isDragging={drag?.kind === "attacker"}
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
                  isDragging={drag?.kind === "token" && drag.id === t.id}
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
  isDragging,
  onPointerDown,
}: {
  token: CircleToken;
  selected: boolean;
  isDragging: boolean;
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
        // ✅ slow slide for presets/rotation; instant while dragging
        transition: isDragging
          ? "none"
          : "left 600ms ease-in-out, top 600ms ease-in-out, transform 150ms ease",
      }}
    >
      <div
        className={`grid place-items-center rounded-full border ${
          selected ? "border-white" : "border-black/40"
        } shadow`}
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