import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowRight, RefreshCcw, Check, XCircle, ArrowUpRight } from 'lucide-react';

interface DependencyMatrixProps {
  stages: Array<{
    id: string;
    title: string;
    tools: string[];
    color: string;
    dependencies: string[];
    unlocks: string[];
  }>;
  completion: Record<string, number>;
}

export function DependencyMatrix({ stages, completion }: DependencyMatrixProps) {
  // Extract all tools across all stages for matrix rows/columns
  const allTools = stages.flatMap(stage => 
    stage.tools.map(tool => ({
      id: tool,
      name: getToolName(tool),
      stageId: stage.id,
      stageTitle: stage.title,
      stageColor: stage.color,
      completion: completion[stage.id] || 0
    }))
  );
  
  // Helper function to get a readable tool name
  function getToolName(toolId: string): string {
    const toolNames: Record<string, string> = {
      'business-model': 'Business Model',
      'product-design': 'Product Definition',
      'market': 'Market Research',
      'validation': 'Validation',
      'team': 'Team Structure',
      'financials': 'Financial Projections',
      'brand': 'Brand Identity',
      'documents': 'Documentation',
    };
    return toolNames[toolId] || toolId.replace('-', ' ');
  }
  
  // Helper to get dependency type between tools
  function getDependencyType(fromTool: typeof allTools[0], toTool: typeof allTools[0]): 'dependency' | 'iteration' | 'none' {
    // If tools are in same stage, they likely inform each other
    if (fromTool.stageId === toTool.stageId) {
      return 'iteration';
    }
    
    const fromStage = stages.find(s => s.id === fromTool.stageId);
    const toStage = stages.find(s => s.id === toTool.stageId);
    
    if (!fromStage || !toStage) return 'none';
    
    // If to-stage depends on from-stage, there's a dependency
    if (toStage.dependencies.includes(fromStage.id)) {
      return 'dependency';
    }
    
    // If from-stage depends on to-stage, it's an iterative process
    if (fromStage.dependencies.includes(toStage.id)) {
      return 'iteration';
    }
    
    return 'none';
  }
  
  // Get visual indicator for a dependency type
  function getDependencyIndicator(type: 'dependency' | 'iteration' | 'none', fromCompletion: number) {
    switch (type) {
      case 'dependency':
        return (
          <div className="flex justify-center" title="Feeds into">
            <ArrowRight 
              className={`h-4 w-4 ${fromCompletion >= 70 ? 'text-green-500' : 'text-amber-500'}`} 
            />
          </div>
        );
      case 'iteration':
        return (
          <div className="flex justify-center" title="Iterates with">
            <RefreshCcw className="h-4 w-4 text-blue-500" />
          </div>
        );
      case 'none':
      default:
        return <div className="text-center text-gray-300">-</div>;
    }
  }
  
  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Dependency Matrix</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th scope="col" className="p-4 border-r-2 border-gray-200">
                    Tool / Depends on →
                  </th>
                  {allTools.map(tool => (
                    <th 
                      key={`header-${tool.id}`} 
                      scope="col" 
                      className="p-4 text-center"
                      style={{ borderBottom: `2px solid ${tool.stageColor}` }}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="cursor-help">
                            <div className="font-medium whitespace-nowrap">{tool.name}</div>
                            <div className="text-xs mt-1 text-gray-500">{tool.stageTitle}</div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div>
                            <div className="font-bold">{tool.name}</div>
                            <div className="text-sm">Stage: {tool.stageTitle}</div>
                            <div className="text-sm">Completion: {tool.completion}%</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allTools.map(rowTool => (
                  <tr key={`row-${rowTool.id}`} className="bg-white border-b hover:bg-gray-50">
                    <th 
                      scope="row" 
                      className="p-4 font-medium text-gray-900 whitespace-nowrap border-r-2 border-gray-200"
                      style={{ borderLeft: `4px solid ${rowTool.stageColor}` }}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="cursor-help">
                            <div>{rowTool.name}</div>
                            <div className="text-xs text-gray-500">{rowTool.stageTitle}</div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div>
                            <div className="font-bold">{rowTool.name}</div>
                            <div className="text-sm">Stage: {rowTool.stageTitle}</div>
                            <div className="text-sm">Completion: {rowTool.completion}%</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </th>
                    {allTools.map(colTool => {
                      if (rowTool.id === colTool.id) {
                        // Same tool, show a dash
                        return (
                          <td key={`cell-${rowTool.id}-${colTool.id}`} className="p-4 bg-gray-50 text-center">
                            -
                          </td>
                        );
                      }
                      
                      const dependencyType = getDependencyType(colTool, rowTool);
                      
                      return (
                        <td 
                          key={`cell-${rowTool.id}-${colTool.id}`} 
                          className="p-4 text-center"
                        >
                          <Tooltip>
                            <TooltipTrigger>
                              {getDependencyIndicator(dependencyType, colTool.completion)}
                            </TooltipTrigger>
                            <TooltipContent>
                              {dependencyType === 'dependency' && (
                                <div className="text-sm">
                                  <strong>{colTool.name}</strong> feeds into <strong>{rowTool.name}</strong>
                                  <div className="text-xs mt-1">
                                    {colTool.completion >= 70 
                                      ? '✅ Dependency satisfied' 
                                      : '⚠️ Dependency not fully satisfied'}
                                  </div>
                                </div>
                              )}
                              
                              {dependencyType === 'iteration' && (
                                <div className="text-sm">
                                  <strong>{colTool.name}</strong> and <strong>{rowTool.name}</strong> inform each other
                                </div>
                              )}
                              
                              {dependencyType === 'none' && (
                                <div className="text-sm">
                                  No direct dependency relationship
                                </div>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p className="mb-2">Legend:</p>
            <div className="flex space-x-6">
              <div className="flex items-center">
                <ArrowRight className="h-4 w-4 text-green-500 mr-2" />
                <span>Feeds into (satisfied)</span>
              </div>
              <div className="flex items-center">
                <ArrowRight className="h-4 w-4 text-amber-500 mr-2" />
                <span>Feeds into (pending)</span>
              </div>
              <div className="flex items-center">
                <RefreshCcw className="h-4 w-4 text-blue-500 mr-2" />
                <span>Iterates with</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
} 