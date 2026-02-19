'use client';

import { useState, useRef, useEffect, type MouseEvent as ReactMouseEvent, type RefObject } from 'react';
import { cn } from '@/lib/utils';
import type { Player, Position, PlayerRole } from '@/lib/types';

const playerRoleColors: Record<PlayerRole, string> = {
  Setter: 'bg-accent text-accent-foreground',
  Outside: 'bg-primary text-primary-foreground',
  Middle: 'bg-chart-2 text-primary-foreground',
  'Right Side': 'bg-destructive text-destructive-foreground',
  Libero: 'bg-chart-4 text-primary-foreground',
};

interface PlayerCircleProps {
  player: Player;
  onPlayerMove: (position: Position) => void;
  courtRef: RefObject<HTMLDivElement>;
}

export function PlayerCircle({ player, onPlayerMove, courtRef }: PlayerCircleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const circleRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !courtRef.current || !circleRef.current) return;

      const courtRect = courtRef.current.getBoundingClientRect();
      
      let x = e.clientX - courtRect.left;
      let y = e.clientY - courtRect.top;

      x = Math.max(0, Math.min(x, courtRect.width));
      y = Math.max(0, Math.min(y, courtRect.height));
      
      const newPosition: Position = {
        x: (x / courtRect.width) * 100,
        y: (y / courtRect.height) * 100,
      };

      onPlayerMove(newPosition);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
    } else {
      document.body.style.cursor = 'default';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
    };
  }, [isDragging, onPlayerMove, courtRef]);

  return (
    <div
      ref={circleRef}
      onMouseDown={handleMouseDown}
      className={cn(
        'absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-bold text-lg select-none shadow-lg border-2 border-white/30 transition-all duration-150 ease-in-out',
        playerRoleColors[player.role],
        isDragging ? 'cursor-grabbing scale-110 z-10 shadow-2xl' : 'cursor-grab'
      )}
      style={{
        left: `${player.position.x}%`,
        top: `${player.position.y}%`,
        touchAction: 'none',
      }}
      aria-label={`Player ${player.label}, role ${player.role}`}
    >
      {player.label}
    </div>
  );
}
