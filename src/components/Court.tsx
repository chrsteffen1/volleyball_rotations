'use client';

import { useRef } from 'react';
import type { Player, Position } from '@/lib/types';
import { PlayerCircle } from './PlayerCircle';
import { cn } from '@/lib/utils';

interface CourtProps {
    players: Player[];
    onPlayerMove: (playerId: string, newPosition: Position) => void;
}

export function Court({ players, onPlayerMove }: CourtProps) {
  const courtRef = useRef<HTMLDivElement>(null);

  const gridStyle = {
    backgroundImage: `
      repeating-linear-gradient(hsl(var(--border) / 0.05) 0 1px, transparent 1px 100%),
      repeating-linear-gradient(90deg, hsl(var(--border) / 0.05) 0 1px, transparent 1px 100%)
    `,
    backgroundSize: '2.5rem 2.5rem',
  };

  return (
    <div className="w-full max-w-[70vh] aspect-[1/1]">
        <div
        ref={courtRef}
        className="relative h-full w-full bg-card rounded-lg shadow-2xl border-2 border-white/10 overflow-hidden"
        style={gridStyle}
        >
        {/* Court Lines */}
        <div className="absolute top-1/3 left-0 w-full h-0.5 bg-white/30" aria-hidden="true" /> {/* 3m line */}
        
        {/* Players */}
        {players.map(player => (
            <PlayerCircle 
            key={player.id}
            player={player}
            onPlayerMove={(pos) => onPlayerMove(player.id, pos)}
            courtRef={courtRef}
            />
        ))}
        </div>
    </div>
  );
}
