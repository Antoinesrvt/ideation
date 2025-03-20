import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  LockIcon 
} from 'lucide-react';

// Define props for the timeline component
interface JourneyTimelineProps {
  stages: Array<{
    id: string;
    title: string;
    description: string;
    color: string;
    dependencies: string[];
    unlocks: string[];
  }>;
  activeStage: string | undefined;
  onStageSelect: (stageId: string) => void;
  progress: Record<string, number>;
  showConnections: boolean;
  toggleConnections: () => void;
  getStageStatus: (stageId: string) => 'available' | 'locked' | 'completed';
  getDependencyStatus: (fromStage: string, toStage: string) => 'fulfilled' | 'pending' | 'none';
}

export function JourneyTimeline({
  stages,
  activeStage,
  onStageSelect,
  progress,
  showConnections,
  toggleConnections,
  getStageStatus,
  getDependencyStatus
}: JourneyTimelineProps) {
  return (
    <div className="relative pb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Entrepreneurial Journey</h2>
      </div>
      
      <div className="flex items-center relative">
        {/* Draw the connection lines - always visible now */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full" style={{ position: 'absolute', zIndex: 1 }}>
            {stages.map((stage, index) => {
              if (index < stages.length - 1) {
                const nextStage = stages[index + 1];
                const status = getDependencyStatus(stage.id, nextStage.id);
                
                if (status !== 'none') {
                  return (
                    <line 
                      key={`${stage.id}-${nextStage.id}`}
                      x1={`${(index * 100) / (stages.length - 1) + 6}%`} 
                      y1="50%"
                      x2={`${((index + 1) * 100) / (stages.length - 1) - 6}%`}
                      y2="50%"
                      stroke={status === 'fulfilled' ? '#10B981' : '#F59E0B'}
                      strokeWidth="2"
                      strokeDasharray={status === 'pending' ? "5,5" : "none"}
                    />
                  );
                }
              }
              return null;
            })}
          </svg>
        </div>
        
        {/* Stage nodes */}
        <div className="w-full flex justify-between relative z-10">
          {stages.map((stage, index) => {
            const stageStatus = getStageStatus(stage.id);
            const isActive = activeStage === stage.id;
            const stageProgress = progress[stage.id] || 0;
            
            // Determine icon based on status
            const getStatusIcon = () => {
              if (stageProgress === 100) return <CheckCircle2 className="h-5 w-5 text-green-500" />;
              if (stageStatus === 'locked') return <LockIcon className="h-5 w-5 text-gray-400" />;
              return null;
            };
            
            return (
              <TooltipProvider key={stage.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`timeline-node flex flex-col items-center cursor-pointer transition-all ${
                        isActive ? 'scale-110' : 'hover:scale-105'
                      }`}
                      onClick={() => onStageSelect(stage.id)}
                    >
                      <div 
                        className={`w-14 h-14 rounded-full flex items-center justify-center border-4 ${
                          isActive 
                            ? 'border-[#7209B7] shadow-lg' 
                            : stageStatus === 'locked' 
                              ? 'border-gray-300 bg-gray-100 opacity-60' 
                              : 'border-gray-200 bg-white'
                        }`}
                        style={{ 
                          borderColor: isActive ? stage.color : stageStatus === 'locked' ? '#D1D5DB' : '#E5E7EB',
                          backgroundColor: stageStatus === 'locked' ? '#F3F4F6' : 'white'
                        }}
                      >
                        {getStatusIcon() || (
                          <span 
                            className="text-xl font-bold"
                            style={{ color: stageStatus === 'locked' ? '#9CA3AF' : stage.color }}
                          >
                            {index + 1}
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-2 text-center">
                        <div 
                          className={`font-medium text-sm ${
                            isActive 
                              ? 'text-gray-900' 
                              : stageStatus === 'locked' 
                                ? 'text-gray-400' 
                                : 'text-gray-600'
                          }`}
                        >
                          {stage.title}
                        </div>
                        
                        <div className="mt-1 w-16">
                          <Progress 
                            value={stageProgress} 
                            className="h-1.5 bg-gray-100" 
                            indicatorClassName="transition-all duration-500"
                            style={{ 
                              '--tw-gradient-from': `${stage.color}80`,
                              '--tw-gradient-to': stage.color
                            } as React.CSSProperties}
                          />
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="max-w-xs">
                      <p className="font-medium">{stage.title}</p>
                      <p className="text-sm text-gray-500">{stage.description}</p>
                      <div className="mt-2 text-xs">
                        <span className="text-gray-500">Progress: </span>
                        <span className="font-medium">{stageProgress}%</span>
                      </div>
                      
                      {stageStatus === 'locked' && (
                        <div className="mt-2 text-xs flex items-center text-amber-600">
                          <LockIcon className="h-3 w-3 mr-1" />
                          <span>Complete previous stages to unlock</span>
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </div>
      
      {/* Timeline legend - always visible now */}
      <div className="flex justify-end mt-6 text-xs text-gray-500 space-x-4">
        <div className="flex items-center">
          <div className="h-1 w-10 bg-green-500 mr-2"></div>
          <span>Satisfied Dependency</span>
        </div>
        <div className="flex items-center">
          <div className="h-1 w-10 bg-amber-500 border-dashed border-amber-500 mr-2 dashed-line"></div>
          <span>Pending Dependency</span>
        </div>
      </div>
    </div>
  );
} 