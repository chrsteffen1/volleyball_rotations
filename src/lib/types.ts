export type Mode = "serve_receive" | "defense";

export type Role =
  | "setter"
  | "middle"
  | "right_side"
  | "outside1"
  | "outside2"
  | "libero";

export type CircleToken = {
  id: string;
  role: Role;
  label: string;
  color: string;
  x: number; // 0..1
  y: number; // 0..1 (0 top)
};

export type Attacker = {
  enabled: boolean;
  x: number;
  y: number;
};

export type Preset = Record<Role, [number, number]>;

export type DiagramData = {
  version: 1;
  circles: CircleToken[];
  attacker: Attacker;
  basePresets: {
    base1: Preset;
    base2: Preset;
  };
};

export type DiagramRow = {
  id: string;
  user_id: string;
  name: string;
  mode: Mode;
  rotation: number | null;
  data: DiagramData;
  created_at: string;
  updated_at: string;
};
