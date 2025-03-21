'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';
import { JOURNEY_STAGES } from '../constants';

interface StageProgressTrackerProps {
  stageProgress: Record<string, number>;
  currentStageId?: string;
  onStageClick?: (stageId: string) => void;
  className?: string;
}

export function StageProgressTracker({
  stageProgress,
  currentStageId,
  onStageClick,
  className = ''
}: StageProgressTrackerProps) {
  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center">
          {JOURNEY_STAGES.map((stage, index) => {
            const progress = stageProgress[stage.id] || 0;
            const isComplete = progress === 100;
            const isCurrent = currentStageId === stage.id;
            
            // Determine status for styling
            let statusClass = "text-gray-400 border-gray-200";
            if (isComplete) {
              statusClass = "text-green-500 border-green-500";
            } else if (isCurrent) {
              statusClass = `border-2 text-${stage.color.replace('#', '')}`;
            }
            
            return (
              <React.Fragment key={stage.id}>
                {/* Stage circle with number or check */}
                <div 
                  className={`relative cursor-pointer flex items-center justify-center animate-slide-right-in`} 
                  style={{ 
                    animationDelay: `${index * 0.1}s`,
                    animationFillMode: 'both'
                  }}
                  onClick={() => onStageClick && onStageClick(stage.id)}
                >
                  <div 
                    className={`h-10 w-10 rounded-full border-2 flex items-center justify-center 
                    ${statusClass} ${isCurrent ? 'ring-2 ring-offset-2' : ''}`}
                    style={
                      isCurrent 
                        ? { borderColor: stage.color, color: stage.color } 
                        : {}
                    }
                  >
                    {isComplete ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  
                  {/* Stage tooltip on hover */}
                  <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-md p-2 w-48 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="font-medium text-sm">{stage.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{stage.description}</div>
                    <Progress value={progress} className="h-1 mt-2" />
                  </div>
                </div>
                
                {/* Connector line between stages */}
                {index < JOURNEY_STAGES.length - 1 && (
                  <div className="flex-1 mx-1 h-[2px] bg-gray-200 relative">
                    <div 
                      className="absolute top-0 left-0 h-full bg-green-500 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                    <ArrowRight className="absolute -top-[7px] right-0 h-4 w-4 text-gray-400" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
        
        {/* Current stage info */}
        {currentStageId && (
          <div className="mt-4 pt-3 border-t animate-slide-left-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">
                  {JOURNEY_STAGES.find(s => s.id === currentStageId)?.title}
                </div>
                <div className="text-sm text-gray-500">
                  {JOURNEY_STAGES.find(s => s.id === currentStageId)?.description}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">
                  {stageProgress[currentStageId] || 0}%
                </div>
                <div className="text-xs text-gray-500">complété</div>
              </div>
            </div>
            <Progress 
              value={stageProgress[currentStageId] || 0} 
              className="h-2 mt-2"
              style={{ 
                backgroundColor: 'rgba(0,0,0,0.05)',
                '--progress-color': JOURNEY_STAGES.find(s => s.id === currentStageId)?.color
              } as React.CSSProperties}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
} 