import React from 'react';
import { Shield } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface SafeModeToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function SafeModeToggle({ enabled, onToggle }: SafeModeToggleProps) {
  return (
    <div className="flex items-center justify-between mb-6 p-4 rounded-lg bg-white shadow-sm border border-slate-100">
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-blue-500" />
        <div>
          <div className="font-medium">Safe Preview Mode</div>
          <div className="text-sm text-slate-500">
            View changes without modifying project state
          </div>
        </div>
      </div>
      <div className="flex items-center">
        {enabled && (
          <div className="flex items-center mr-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
            <span className="text-xs text-blue-500 font-medium">Active</span>
          </div>
        )}
        <Switch 
          checked={enabled} 
          onCheckedChange={onToggle} 
          className="data-[state=checked]:bg-blue-500"
        />
      </div>
    </div>
  );
} 