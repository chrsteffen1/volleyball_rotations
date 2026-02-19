'use client'

import {
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import type { Rotation, DefensivePreset } from '@/lib/types';

type ControlPanelProps = {
  rotations: Rotation[];
  defensivePresets: DefensivePreset[];
  activeRotationName: string;
  onRotationChange: (name: string) => void;
  mode: 'serve-receive' | 'defense';
  onModeChange: (mode: 'serve-receive' | 'defense') => void;
  onPresetApply: (name: string) => void;
};

export function ControlPanel({ 
    rotations, 
    defensivePresets,
    activeRotationName, 
    onRotationChange, 
    mode, 
    onModeChange, 
    onPresetApply 
}: ControlPanelProps) {
  return (
    <>
      <SidebarHeader>
        <h2 className="text-xl font-semibold px-2">Controls</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Serve Receive</SidebarGroupLabel>
          <SidebarGroupContent>
             <Select value={activeRotationName} onValueChange={onRotationChange}>
                <SelectTrigger>
                    <SelectValue placeholder="Select Rotation" />
                </SelectTrigger>
                <SelectContent>
                    {rotations.map(rot => (
                        <SelectItem key={rot.name} value={rot.name}>{rot.name}</SelectItem>
                    ))}
                </SelectContent>
             </Select>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Mode</SidebarGroupLabel>
          <SidebarGroupContent className="flex items-center space-x-2">
             <Label htmlFor="mode-switch" className={mode === 'serve-receive' ? 'text-foreground' : 'text-muted-foreground'}>Serve Receive</Label>
             <Switch 
                id="mode-switch" 
                checked={mode === 'defense'}
                onCheckedChange={(checked) => onModeChange(checked ? 'defense' : 'serve-receive')}
                aria-label="Toggle between Serve Receive and Defense mode"
             />
             <Label htmlFor="mode-switch" className={mode === 'defense' ? 'text-foreground' : 'text-muted-foreground'}>Defense</Label>
          </SidebarGroupContent>
        </SidebarGroup>
        {mode === 'defense' && (
          <SidebarGroup>
            <SidebarGroupLabel>Defensive Presets</SidebarGroupLabel>
            <SidebarGroupContent className="grid grid-cols-2 gap-2">
              {defensivePresets.map(preset => (
                <Button key={preset.name} variant="outline" onClick={() => onPresetApply(preset.name)}>
                    {preset.name}
                </Button>
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </>
  );
}
