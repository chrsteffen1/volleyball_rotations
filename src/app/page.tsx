'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { ControlPanel } from '@/components/ControlPanel';
import { Court } from '@/components/Court';
import { Sidebar, SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { serveReceiveRotations, defensivePresets } from '@/lib/data';
import type { Player, Position } from '@/lib/types';

export default function Home() {
  const [activeRotationName, setActiveRotationName] = useState(serveReceiveRotations[0].name);
  const [players, setPlayers] = useState<Player[]>(serveReceiveRotations[0].players);
  const [mode, setMode] = useState<'serve-receive' | 'defense'>('serve-receive');

  const handleRotationChange = (name: string) => {
    const rotation = serveReceiveRotations.find(r => r.name === name);
    if (rotation) {
      setActiveRotationName(name);
      setPlayers(rotation.players);
      setMode('serve-receive');
    }
  };

  const handlePlayerMove = (playerId: string, newPosition: Position) => {
    setPlayers(currentPlayers =>
      currentPlayers.map(p =>
        p.id === playerId ? { ...p, position: newPosition } : p
      )
    );
  };
  
  const handleModeChange = (newMode: 'serve-receive' | 'defense') => {
    setMode(newMode);
    // When switching modes, reset to the base rotation positions to avoid confusion
    const rotation = serveReceiveRotations.find(r => r.name === activeRotationName);
    if (rotation) {
        setPlayers(rotation.players);
    }
  }

  const handlePresetApply = (name: string) => {
    const preset = defensivePresets.find(p => p.name === name);
    if (preset && mode === 'defense') {
      setPlayers(currentPlayers => 
        currentPlayers.map(player => {
          if (preset.positions[player.id]) {
            return { ...player, position: preset.positions[player.id] };
          }
          return player;
        })
      );
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar>
          <ControlPanel
            rotations={serveReceiveRotations}
            defensivePresets={defensivePresets}
            activeRotationName={activeRotationName}
            onRotationChange={handleRotationChange}
            mode={mode}
            onModeChange={handleModeChange}
            onPresetApply={handlePresetApply}
          />
        </Sidebar>
        <SidebarInset>
          <div className="flex flex-col h-full">
            <Header />
            <main className="flex-1 flex items-center justify-center p-4 lg:p-8 overflow-auto">
              <Court players={players} onPlayerMove={handlePlayerMove} />
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
