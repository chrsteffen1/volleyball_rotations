'use client';

import { useEffect, useMemo, useState } from "react";
import { Mode, DiagramData, DiagramRow, Role } from "@/lib/types";
import { defaultDiagram, createRoleToken } from "@/lib/data";

type Active = {
  diagramId: string | null;
  name: string | null;
};

const ROLE_ORDER: Role[] = ["setter", "middle", "right_side", "outside1", "outside2", "libero"];

export default function Home() {
  const [ready, setReady] = useState(false);

  const [mode, setMode] = useState<Mode>("serve_receive");
  const [rotation, setRotation] = useState<number>(1);

  const [active, setActive] = useState<Active>({ diagramId: null, name: null });
  const [data, setData] = useState<DiagramData>(() => defaultDiagram("serve_receive", 1));

  const [loadOpen, setLoadOpen] = useState(false);
  const [loadList, setLoadList] = useState<DiagramRow[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  const title = useMemo(() => {
    if (mode === "serve_receive") return `Serve Receive • Rotation ${rotation}`;
    return "Defense";
  }, [mode, rotation]);

  useEffect(() => {
    setReady(true);
  }, []);

  // When mode/rotation changes, reset to defaults (unless user loads a saved diagram)
  useEffect(() => {
    setActive({ diagramId: null, name: null });
    setData(defaultDiagram(mode, mode === "serve_receive" ? rotation : null));
  }, [mode, rotation]);

  function addRole(role: Role) {
    // Place near bottom center on our side by default
    const token = createRoleToken(role, 0.5, 0.75);
    setData((d) => ({ ...d, circles: [...d.circles, token] }));
  }

  function resetDefault() {
    setActive({ diagramId: null, name: null });
    setData(defaultDiagram(mode, mode === "serve_receive" ? rotation : null));
  }

  function applyBase(which: "base1" | "base2") {
    const preset = data.basePresets[which];
    setData((d) => ({
      ...d,
      circles: d.circles.map((c) => {
        const p = preset[c.role];
        if (!p) return c;
        return { ...c, x: p[0], y: p[1] };
      }),
    }));
  }

  async function openLoad() {
    setStatus("Loading diagrams is not supported.");
    setLoadList([]);
    setLoadOpen(true);
  }

  async function doSave() {
    setStatus("Saving is not supported.");
  }

  async function doSaveAs() {
    setStatus("Saving is not supported.");
  }

  async function doDelete() {
    setStatus("Deleting is not supported.");
  }

  function loadDiagram(row: DiagramRow) {
    // This function will not be called as loadList is always empty
  }

  if (!ready) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-950/60">
        <div className="flex items-baseline gap-3">
          <div className="font-semibold">VolleyRotations</div>
          <div className="text-sm text-neutral-300">{title}</div>
          {active.name && (
            <div className="text-xs text-neutral-400 border border-neutral-800 rounded-full px-2 py-0.5">
              {active.name}
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Left Panel */}
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
            <div className="text-xs uppercase tracking-wide text-neutral-400">Add roles</div>
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
              Tip: you can delete a circle by selecting it on the court and pressing Delete.
            </div>
          </div>

          {mode === "defense" && (
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wide text-neutral-400">Defense tools</div>
              <label className="flex items-center gap-2 text-sm text-neutral-200">
                <input
                  type="checkbox"
                  checked={data.attacker.enabled}
                  onChange={(e) =>
                    setData((d) => ({ ...d, attacker: { ...d.attacker, enabled: e.target.checked } }))
                  }
                />
                Show attacker
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => applyBase("base1")}
                  className="rounded-xl border border-neutral-800 bg-neutral-900/30 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-900/60"
                >
                  Base 1
                </button>
                <button
                  onClick={() => applyBase("base2")}
                  className="rounded-xl border border-neutral-800 bg-neutral-900/30 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-900/60"
                >
                  Base 2
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-neutral-400">Actions</div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={doSave} className="rounded-xl bg-white text-black px-3 py-2 text-sm font-medium">
                Save
              </button>
              <button
                onClick={doSaveAs}
                className="rounded-xl border border-neutral-800 bg-neutral-900/30 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-900/60"
              >
                Save As
              </button>
              <button
                onClick={openLoad}
                className="rounded-xl border border-neutral-800 bg-neutral-900/30 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-900/60"
              >
                Load
              </button>
              <button
                onClick={resetDefault}
                className="rounded-xl border border-neutral-800 bg-neutral-900/30 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-900/60"
              >
                New
              </button>
              <button
                onClick={doDelete}
                disabled={!active.diagramId}
                className="col-span-2 rounded-xl border border-neutral-800 bg-neutral-900/30 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-900/60 disabled:opacity-40"
              >
                Delete
              </button>
            </div>
            {status && <div className="text-sm text-neutral-300">{status}</div>}
          </div>
        </aside>

        {/* Canvas */}
        <main className="flex-1 min-w-0 p-4">
          <CourtEditor data={data} setData={setData} />
        </main>
      </div>

      {loadOpen && (
        <div className="fixed inset-0 bg-black/70 grid place-items-center p-4">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Load diagram</div>
              <button onClick={() => setLoadOpen(false)} className="text-neutral-300 hover:text-white">
                ✕
              </button>
            </div>

            <div className="mt-3 max-h-[60vh] overflow-y-auto divide-y divide-neutral-800 border border-neutral-800 rounded-xl">
              {loadList.length === 0 ? (
                <div className="p-4 text-sm text-neutral-300">No saved diagrams for this mode/rotation yet.</div>
              ) : (
                loadList.map((row) => (
                  <button
                    key={row.id}
                    onClick={() => loadDiagram(row)}
                    className="w-full text-left p-3 hover:bg-neutral-900/50"
                  >
                    <div className="font-medium">{row.name}</div>
                    <div className="text-xs text-neutral-400">
                      Updated {new Date(row.updated_at).toLocaleString()}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Court editor below (kept in same file for easy copy/paste) */

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function CourtEditor({
  data,
  setData,
}: {
  data: DiagramData;
  setData: React.Dispatch<React.SetStateAction<DiagramData>>;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Delete key to remove selected circle
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (!activeId) return;
        setData((d) => ({ ...d, circles: d.circles.filter((c) => c.id !== activeId) }));
        setActiveId(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeId, setData]);

  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="w-full max-w-3xl aspect-[3/4] rounded-2xl border border-neutral-800 overflow-hidden relative">
        <GridBackground />
        <CourtCanvas
          data={data}
          activeId={activeId}
          setActiveId={setActiveId}
          onMoveCircle={(id, x, y) =>
            setData((d) => ({
              ...d,
              circles: d.circles.map((c) => (c.id === id ? { ...c, x: clamp01(x), y: clamp01(y) } : c)),
            }))
          }
          onMoveAttacker={(x, y) =>
            setData((d) => ({ ...d, attacker: { ...d.attacker, x: clamp01(x), y: clamp01(y) } }))
          }
        />
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

function CourtCanvas({
  data,
  activeId,
  setActiveId,
  onMoveCircle,
  onMoveAttacker,
}: {
  data: DiagramData;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  onMoveCircle: (id: string, x: number, y: number) => void;
  onMoveAttacker: (x: number, y: number) => void;
}) {
  const [drag, setDrag] = useState<
    | null
    | { kind: "circle"; id: string; pointerId: number }
    | { kind: "attacker"; pointerId: number }
  >(null);

  function getXY(e: React.PointerEvent, el: HTMLDivElement) {
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    return { x: clamp01(x), y: clamp01(y) };
  }

  return (
    <div className="absolute inset-0 p-5">
      <div className="absolute inset-5">
        {/* Court lines */}
        <svg viewBox="0 0 1000 1300" className="absolute inset-0 w-full h-full">
          {/* outer */}
          <rect x="40" y="40" width="920" height="1220" fill="none" stroke="white" strokeWidth="8" />
          {/* net (middle-ish) */}
          <line x1="40" y1="600" x2="960" y2="600" stroke="white" strokeWidth="8" />
          {/* 3m-ish line on our side */}
          <line x1="40" y1="900" x2="960" y2="900" stroke="white" strokeWidth="6" opacity="0.9" />
        </svg>

        {/* Tokens layer */}
        <div
          className="absolute inset-0"
          onPointerMove={(e) => {
            if (!drag) return;
            const el = e.currentTarget as HTMLDivElement;
            const { x, y } = getXY(e, el);
            if (drag.kind === "circle") onMoveCircle(drag.id, x, y);
            if (drag.kind === "attacker") onMoveAttacker(x, y);
          }}
          onPointerUp={(e) => {
            if (!drag) return;
            (e.currentTarget as HTMLDivElement).releasePointerCapture(drag.pointerId);
            setDrag(null);
          }}
          onPointerCancel={(e) => {
            if (!drag) return;
            (e.currentTarget as HTMLDivElement).releasePointerCapture(drag.pointerId);
            setDrag(null);
          }}
        >
          {data.attacker.enabled && (
            <Token
              id="attacker"
              label="ATTACKER"
              color="#fb7185"
              x={data.attacker.x}
              y={data.attacker.y}
              selected={activeId === "attacker"}
              onPointerDown={(e) => {
                setActiveId("attacker");
                const el = e.currentTarget.parentElement as HTMLDivElement;
                el.setPointerCapture(e.pointerId);
                setDrag({ kind: "attacker", pointerId: e.pointerId });
              }}
            />
          )}

          {data.circles.map((c) => (
            <Token
              key={c.id}
              id={c.id}
              label={c.label}
              color={c.color}
              x={c.x}
              y={c.y}
              selected={activeId === c.id}
              onPointerDown={(e) => {
                setActiveId(c.id);
                const el = e.currentTarget.parentElement as HTMLDivElement;
                el.setPointerCapture(e.pointerId);
                setDrag({ kind: "circle", id: c.id, pointerId: e.pointerId });
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Token({
  id,
  label,
  color,
  x,
  y,
  selected,
  onPointerDown,
}: {
  id: string;
  label: string;
  color: string;
  x: number;
  y: number;
  selected: boolean;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
}) {
  const size = 46; // px token diameter
  return (
    <div
      onPointerDown={onPointerDown}
      className="absolute select-none touch-none"
      style={{
        left: `calc(${(x * 100).toFixed(4)}% - ${size / 2}px)`,
        top: `calc(${(y * 100).toFixed(4)}% - ${size / 2}px)`,
      }}
      aria-label={id}
    >
      <div
        className={`grid place-items-center rounded-full border ${
          selected ? "border-white" : "border-black/40"
        } shadow`}
        style={{
          width: size,
          height: size,
          background: color,
          transform: selected ? "scale(1.05)" : "scale(1)",
        }}
      />
      <div className="mt-1 text-[11px] font-semibold text-center" style={{ color }}>
        {label}
      </div>
    </div>
  );
}