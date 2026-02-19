import { DiagramData, Mode, Preset, Role } from "./types";

const COLORS: Record<Role, string> = {
  setter: "#a855f7",
  middle: "#f59e0b",
  right_side: "#ef4444",
  outside1: "#22c55e",
  outside2: "#22c55e",
  libero: "#3b82f6",
};

const LABELS: Record<Role, string> = {
  setter: "SETTER",
  middle: "MIDDLE",
  right_side: "RIGHT SIDE",
  outside1: "OUTSIDE",
  outside2: "OUTSIDE",
  libero: "LIBERO",
};

// Helpers
const id = () => crypto.randomUUID();

export function createRoleToken(role: Role, x: number, y: number) {
  return {
    id: id(),
    role,
    label: LABELS[role],
    color: COLORS[role],
    x,
    y,
  };
}

export function defaultPresets(): { base1: Preset; base2: Preset } {
  // Normalized coordinates (0..1) inside the court rect.
  // y close to 1 = deep on our side; y close to 0 = near opponent side.
  const base1: Preset = {
    setter: [0.55, 0.62],
    middle: [0.50, 0.40],
    right_side: [0.78, 0.72],
    outside1: [0.22, 0.70],
    outside2: [0.38, 0.58],
    libero: [0.55, 0.88],
  };

  // A “shifted” style: libero shades toward left/middle; left defender drops a bit.
  const base2: Preset = {
    setter: [0.58, 0.58],
    middle: [0.52, 0.38],
    right_side: [0.82, 0.70],
    outside1: [0.18, 0.78],
    outside2: [0.42, 0.56],
    libero: [0.45, 0.90],
  };

  return { base1, base2 };
}

export function defaultDiagram(mode: Mode, rotation: number | null): DiagramData {
  const presets = defaultPresets();

  // Rough SR “shape” variants per rotation; these are approximations you can tweak.
  // (You’ll drag them into place and save.)
  const srLayouts: Record<number, Array<[Role, number, number]>> = {
    1: [
      ["right_side", 0.12, 0.55],
      ["middle", 0.45, 0.55],
      ["outside1", 0.28, 0.82],
      ["libero", 0.50, 0.90],
      ["outside2", 0.70, 0.82],
      ["setter", 0.88, 0.85],
    ],
    2: [
      ["setter", 0.85, 0.25],
      ["middle", 0.10, 0.45],
      ["outside1", 0.25, 0.60],
      ["outside2", 0.52, 0.65],
      ["libero", 0.75, 0.65],
      ["right_side", 0.50, 0.88],
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

  const circles =
    mode === "serve_receive"
      ? (srLayouts[rotation ?? 1] ?? srLayouts[1]).map(([r, x, y]) =>
          createRoleToken(r, x, y)
        )
      : (Object.entries(presets.base1) as Array<[Role, [number, number).map(
          ([r, [x, y]]) => createRoleToken(r, x, y)
        );

  return {
    version: 1,
    circles,
    attacker: { enabled: mode === "defense", x: 0.80, y: 0.18 },
    basePresets: presets,
  };
}
]]>