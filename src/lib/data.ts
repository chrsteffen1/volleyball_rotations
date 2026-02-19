import type { Player, Rotation, DefensivePreset, PlayerRole } from './types';

const PLAYERS: Omit<Player, 'position'>[] = [
  { id: 's', role: 'Setter', label: 'S' },
  { id: 'oh1', role: 'Outside', label: 'H1' },
  { id: 'mb1', role: 'Middle', label: 'M1' },
  { id: 'rs', role: 'Right Side', label: 'RS' },
  { id: 'oh2', role: 'Outside', label: 'H2' },
  { id: 'l', role: 'Libero', label: 'L' },
];

const createRotation = (name: string, positions: Record<string, { x: number; y: number }>): Rotation => ({
  name,
  players: PLAYERS.map(p => ({
    ...p,
    position: positions[p.id] || { x: 50, y: 50 },
  })),
});

export const serveReceiveRotations: Rotation[] = [
  createRotation('Rotation 1', {
    s: { x: 85, y: 85 },
    oh1: { x: 15, y: 15 },
    mb1: { x: 50, y: 15 },
    rs: { x: 85, y: 15 },
    oh2: { x: 15, y: 70 },
    l: { x: 50, y: 80 },
  }),
  createRotation('Rotation 2', {
    l: { x: 15, y: 15 },
    s: { x: 85, y: 70 },
    oh1: { x: 15, y: 70 },
    mb1: { x: 50, y: 15 },
    rs: { x: 85, y: 15 },
    oh2: { x: 50, y: 80 },
  }),
  createRotation('Rotation 3', {
    oh2: { x: 15, y: 15 },
    l: { x: 50, y: 15 },
    s: { x: 85, y: 85 },
    oh1: { x: 15, y: 70 },
    mb1: { x: 50, y: 80 },
    rs: { x: 85, y: 70 },
  }),
  createRotation('Rotation 4', {
    rs: { x: 15, y: 15 },
    oh2: { x: 50, y: 15 },
    l: { x: 85, y: 15 },
    s: { x: 15, y: 85 },
    oh1: { x: 50, y: 80 },
    mb1: { x: 85, y: 70 },
  }),
  createRotation('Rotation 5', {
    mb1: { x: 15, y: 15 },
    rs: { x: 50, y: 15 },
    oh2: { x: 85, y: 15 },
    l: { x: 50, y: 80 },
    s: { x: 15, y: 70 },
    oh1: { x: 85, y: 70 },
  }),
  createRotation('Rotation 6', {
    oh1: { x: 15, y: 15 },
    mb1: { x: 50, y: 15 },
    rs: { x: 85, y: 15 },
    oh2: { x: 50, y: 80 },
    l: { x: 85, y: 70 },
    s: { x: 15, y: 85 },
  }),
];

export const defensivePresets: DefensivePreset[] = [
    {
        name: 'Base 1',
        positions: {
            l: { x: 50, y: 80 },
            oh1: { x: 15, y: 85 },
            oh2: { x: 15, y: 85 }, // Example: may vary based on front row player
            s: { x: 85, y: 85 },
            rs: { x: 85, y: 85 },
        }
    },
    {
        name: 'Base 2',
        positions: {
            l: { x: 50, y: 70 },
            oh1: { x: 10, y: 90 },
            oh2: { x: 10, y: 90 },
            s: { x: 90, y: 90 },
            rs: { x: 90, y: 90 },
        }
    }
];
