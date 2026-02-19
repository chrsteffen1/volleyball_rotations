export type PlayerRole = 'Setter' | 'Outside' | 'Middle' | 'Right Side' | 'Libero';

export type Position = {
  x: number;
  y: number;
};

export type Player = {
  id: string;
  role: PlayerRole;
  label: string;
  position: Position;
};

export type Rotation = {
  name: string;
  players: Player[];
};

export type DefensivePreset = {
  name: string;
  // A record of player IDs to their new positions
  positions: Record<string, Position>;
};
