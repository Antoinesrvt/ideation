'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowUpRight, Download, FileText, ClipboardCopy } from 'lucide-react';
import { JOURNEY_STAGES } from '../constants';

interface DataOutput {
  id: string;
  name: string;
  content?: string;
  completed?: boolean;
}

interface DataOutputPanelProps {
  stageId?: string; // If provided, only show outputs for this stage
  onViewOutput?: (outputId: string) => void;
  onExportOutput?: (outputId: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function DataOutputPanel({
  stageId,
  onViewOutput,
  onExportOutput,
  className = '',
  style
}: DataOutputPanelProps) {
  // Get all data outputs from journey stages, or filter by stageId if provided
  const allOutputs = React.useMemo(() => {
    // Filter stages if stageId is provided
    const filteredStages = stageId 
      ? JOURNEY_STAGES.filter(stage => stage.id === stageId)
      : JOURNEY_STAGES;

    // Collect all outputs from the filtered stages
    return filteredStages.flatMap(stage => {
      // Make sure dataOutputs exists, provide empty array as fallback
      const outputs = stage.dataOutputs || [];
      // Return outputs with stage information
      return outputs.map(output => ({
        ...output,
        stageId: stage.id,
        stageTitle: stage.title,
        stageColor: stage.color,
        completed: Math.random() > 0.5 // Mock data - in real app would be from actual progress
      }));
    });
  }, [stageId]);

  // Group outputs by stage
  const outputsByStage = React.useMemo(() => {
    const grouped: Record<string, (DataOutput & { stageTitle: string, stageColor: string, stageId: string })[]> = {};
    
    allOutputs.forEach(output => {
      if (!grouped[output.stageId]) {
        grouped[output.stageId] = [];
      }
      grouped[output.stageId].push(output);
    });

    return grouped;
  }, [allOutputs]);

  // Handle output actions
  const handleViewOutput = (outputId: string) => {
    if (onViewOutput) {
      onViewOutput(outputId);
    }
  };

  const handleExportOutput = (outputId: string) => {
    if (onExportOutput) {
      onExportOutput(outputId);
    }
  };

  return (
    <Card className={`w-full shadow-sm ${className}`} style={style}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {stageId ? 'Données produites' : 'Toutes les données du projet'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          {Object.entries(outputsByStage).map(([stageKey, outputs]) => {
            // Get the first output to access stage info (they all have the same stage info)
            const stageInfo = outputs[0];
            
            return (
              <div key={stageKey} className="mb-6">
                <div 
                  className="text-sm font-medium mb-2 pb-1 border-b" 
                  style={{ borderColor: stageInfo.stageColor + '40' }} // Add transparency to color
                >
                  <span style={{ color: stageInfo.stageColor }}>{stageInfo.stageTitle}</span>
                </div>
                
                <div className="space-y-3">
                  {outputs.map((output, index) => (
                    <div 
                      key={output.id}
                      className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors animate-slide-right-in"
                      style={{ 
                        animationDelay: `${index * 0.1}s`,
                        animationFillMode: 'both'
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{output.name}</div>
                          {output.completed ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mt-1">
                              Complété
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 mt-1">
                              En cours
                            </Badge>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleViewOutput(output.id)}
                            disabled={!output.completed}
                            title={output.completed ? "Voir le détail" : "Pas encore complété"}
                          >
                            {output.completed ? (
                              <ArrowUpRight className="h-4 w-4" />
                            ) : (
                              <FileText className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleExportOutput(output.id)}
                            disabled={!output.completed}
                            title={output.completed ? "Exporter" : "Pas encore disponible"}
                          >
                            <Download className={`h-4 w-4 ${!output.completed ? 'text-gray-400' : ''}`} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 