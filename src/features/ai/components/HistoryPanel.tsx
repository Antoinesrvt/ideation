import React from 'react';
import { 
  History, 
  X, 
  CheckCircle, 
  FileEdit, 
  Plus, 
  Trash, 
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type ChangeType = 'modified' | 'added' | 'removed' | 'default';

interface HistoryEvent {
  id: string;
  timestamp: Date;
  title: string;
  description: string;
  type: ChangeType;
  isActive?: boolean;
}

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onRevert: () => void;
  events: HistoryEvent[];
}

export function HistoryPanel({ isOpen, onClose, onRevert, events }: HistoryPanelProps) {
  if (!isOpen) return null;
  
  return (
    <div className="absolute top-20 right-8 w-[300px] bg-white rounded-md shadow-2xl flex flex-col transition-all duration-300 z-10 overflow-hidden">
      <div className="p-4 flex items-center justify-between border-b border-slate-100">
        <h3 className="font-semibold text-base flex items-center gap-2">
          <History className="w-5 h-5" />
          <span>Change History</span>
        </h3>
        <button 
          onClick={onClose}
          className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-all"
        >
          <X size={14} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="relative pl-8">
          {/* Timeline line */}
          <div className="absolute top-0 bottom-0 left-[10px] w-0.5 bg-slate-200"></div>
          
          {/* Timeline events */}
          {events.map((event) => (
            <div key={event.id} className="relative pb-6 last:pb-0">
              {/* Timeline dot */}
              <div className={`absolute top-0 left-[-30px] w-5 h-5 rounded-full bg-white border-2 z-10 ${
                event.type === 'modified' ? 'border-blue-500 bg-blue-50' : 
                event.type === 'added' ? 'border-green-500 bg-green-50' : 
                event.type === 'removed' ? 'border-red-500 bg-red-50' :
                event.isActive ? 'border-purple-500 bg-purple-500' : 'border-purple-500'
              }`} />
              
              <div className="mb-2">
                <div className="text-xs text-slate-500">
                  {event.timestamp.toLocaleString(undefined, { 
                    hour: 'numeric', 
                    minute: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                <div className="font-semibold text-sm">{event.title}</div>
              </div>
              
              <div className="text-sm text-slate-600">
                {event.description}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 border-t border-slate-100 flex justify-center">
        <Button 
          variant="outline" 
          onClick={onRevert}
          className="w-full flex items-center justify-center gap-2 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
        >
          <RotateCcw size={16} />
          <span>Revert to Previous Version</span>
        </Button>
      </div>
    </div>
  );
} 