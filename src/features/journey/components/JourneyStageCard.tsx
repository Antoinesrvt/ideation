import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  ChevronRight, 
  AlertCircle, 
  CheckCircle,
  BarChart2, 
  FileCode, 
  Grid, 
  PieChart, 
  UserPlus, 
  Palette,
  FileText,
  ArrowRight,
  Lock,
  UnlockKeyhole
} from 'lucide-react';
import { ActiveSection } from '@/components/project/ProjectWorkspace';

interface ToolInfo {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface JourneyStageCardProps {
  title: string;
  description: string;
  progress: number;
  tools: string[];
  stageIndex: number;
  accentColor: string;
  onToolSelect: (toolId: string) => void;
  recommendedFirst: string;
  status?: 'available' | 'locked' | 'completed';
  isHighlighted?: boolean;
  onHover?: (hovered: boolean) => void;
  dependencies?: string[];
  unlocks?: string[];
  allStages?: Array<{
    id: string;
    title: string;
    color: string;
  }>;
  delayIndex?: number;
}

export function JourneyStageCard({
  title,
  description,
  progress,
  tools,
  stageIndex,
  accentColor,
  onToolSelect,
  recommendedFirst,
  status = 'available',
  isHighlighted = false,
  onHover,
  dependencies = [],
  unlocks = [],
  allStages = [],
  delayIndex = 0
}: JourneyStageCardProps) {
  // Map tool IDs to tool info objects with icons
  const getToolInfo = (toolId: string): ToolInfo => {
    const toolMap: Record<string, ToolInfo> = {
      'business-model': {
        id: 'business-model',
        name: 'Business Model',
        icon: <Grid className="h-4 w-4" />
      },
      'product-design': {
        id: 'product-design',
        name: 'Product Definition',
        icon: <FileCode className="h-4 w-4" />
      },
      'market': {
        id: 'market',
        name: 'Market Research',
        icon: <PieChart className="h-4 w-4" />
      },
      'validation': {
        id: 'validation',
        name: 'Validation',
        icon: <CheckCircle className="h-4 w-4" />
      },
      'team': {
        id: 'team',
        name: 'Team Structure',
        icon: <UserPlus className="h-4 w-4" />
      },
      'financials': {
        id: 'financials',
        name: 'Financials',
        icon: <BarChart2 className="h-4 w-4" />
      },
      'brand': {
        id: 'brand',
        name: 'Brand Identity',
        icon: <Palette className="h-4 w-4" />
      },
      'documents': {
        id: 'documents',
        name: 'Documents',
        icon: <FileText className="h-4 w-4" />
      }
    };
    
    return toolMap[toolId] || {
      id: toolId,
      name: toolId.replace('-', ' '),
      icon: <ChevronRight className="h-4 w-4" />
    };
  };
  
  // Get tool infos for this stage
  const toolInfos = tools.map(getToolInfo);
  
  // Get status indicator
  const getStatusIndicator = () => {
    if (progress === 100) {
      return (
        <div className="p-1 rounded-full bg-green-50">
          <CheckCircle className="h-5 w-5 text-green-500" />
        </div>
      );
    } else if (status === 'locked') {
      return (
        <div className="p-1 rounded-full bg-gray-100">
          <Lock className="h-5 w-5 text-gray-400" />
        </div>
      );
    } else if (progress === 0) {
      return (
        <div className="p-1 rounded-full bg-gray-100">
          <AlertCircle className="h-5 w-5 text-gray-400" />
        </div>
      );
    } else {
      return (
        <div 
          className="h-7 w-7 rounded-full bg-white border-2 flex items-center justify-center text-sm font-medium"
          style={{ borderColor: accentColor, color: accentColor }}
        >
          {stageIndex}
        </div>
      );
    }
  };
  
  // Get dependency names
  const getDependencyNames = () => {
    return dependencies.map(depId => {
      const stage = allStages?.find(s => s.id === depId);
      return {
        id: depId,
        name: stage?.title || depId,
        color: stage?.color || '#CCCCCC'
      };
    });
  };
  
  // Get unlocked stage names
  const getUnlockedStageNames = () => {
    return unlocks.map(unlockId => {
      const stage = allStages?.find(s => s.id === unlockId);
      return {
        id: unlockId,
        name: stage?.title || unlockId,
        color: stage?.color || '#CCCCCC'
      };
    });
  };
  
  return (
    <TooltipProvider>
      <Card 
        className={`
          relative overflow-hidden border-2 transition-all animate-slide-right-in
          ${isHighlighted ? 'shadow-lg scale-[1.02]' : 'hover:border-gray-300'}
          ${status === 'locked' ? 'opacity-75 grayscale' : ''}
        `}
        style={{ 
          animationDelay: `${delayIndex * 0.1}s`,
          animationFillMode: 'both'
        }}
        onMouseEnter={() => onHover && onHover(true)}
        onMouseLeave={() => onHover && onHover(false)}
      >
        {/* Left accent border */}
        <div 
          className="absolute left-0 top-0 w-1 h-full" 
          style={{ backgroundColor: accentColor }}
        />
        
        {/* Top status badge */}
        <div className="absolute top-2 right-2">
          {status === 'locked' && (
            <Badge variant="outline" className="bg-gray-100 border-gray-300 text-gray-600">
              <Lock className="h-3 w-3 mr-1" /> Locked
            </Badge>
          )}
          {status === 'completed' && (
            <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
              <CheckCircle className="h-3 w-3 mr-1" /> Completed
            </Badge>
          )}
        </div>
        
        {/* Dependency badges */}
        {dependencies.length > 0 && (
          <div className="absolute -top-3 left-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  variant="outline" 
                  className={`bg-white ${status === 'locked' ? 'border-red-200 text-red-700' : 'border-blue-200 text-blue-700'}`}
                >
                  Requires {dependencies.length} {dependencies.length === 1 ? 'Stage' : 'Stages'}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm">
                  <strong>Prerequisites:</strong>
                  <ul className="mt-1 space-y-1">
                    {getDependencyNames().map(dep => (
                      <li key={dep.id} className="flex items-center">
                        <div 
                          className="w-2 h-2 rounded-full mr-2" 
                          style={{ backgroundColor: dep.color }}
                        />
                        {dep.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
        
        {/* Unlocks badges */}
        {unlocks.length > 0 && (
          <div className="absolute -bottom-3 right-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  variant="outline" 
                  className="bg-white border-green-200 text-green-700"
                >
                  Unlocks {unlocks.length} {unlocks.length === 1 ? 'Stage' : 'Stages'}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm">
                  <strong>Unlocks:</strong>
                  <ul className="mt-1 space-y-1">
                    {getUnlockedStageNames().map(unlock => (
                      <li key={unlock.id} className="flex items-center">
                        <div 
                          className="w-2 h-2 rounded-full mr-2" 
                          style={{ backgroundColor: unlock.color }}
                        />
                        {unlock.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
        
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center mb-1">
                {getStatusIndicator()}
                <h3 
                  className="ml-2 font-semibold text-lg" 
                  style={{ color: progress > 0 ? accentColor : 'inherit' }}
                >
                  {title}
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {description}
              </p>
            </div>
          </div>
          
          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">Progress</span>
              <span className="text-xs font-medium" style={{ color: accentColor }}>
                {progress}%
              </span>
            </div>
            <Progress 
              value={progress} 
              className="h-1.5 bg-gray-100" 
              indicatorClassName="transition-all duration-500"
              style={{ 
                '--tw-gradient-from': `${accentColor}80`,
                '--tw-gradient-to': accentColor
              } as React.CSSProperties}
            />
          </div>
          
          {/* Tools */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tools & Activities
            </h4>
            {toolInfos.map((tool) => (
              <Button
                key={tool.id}
                variant="ghost"
                size="sm"
                className={`w-full justify-start text-left text-gray-700 hover:text-black hover:bg-gray-100 gap-2 ${
                  tool.id === recommendedFirst ? 'bg-gray-50 font-medium' : ''
                }`}
                onClick={() => onToolSelect(tool.id)}
                disabled={status === 'locked'}
              >
                {tool.icon}
                <span>{tool.name}</span>
                {tool.id === recommendedFirst && (
                  <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                    Recommended
                  </span>
                )}
              </Button>
            ))}
            
            {status === 'locked' && (
              <div className="text-center pt-2 pb-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-500 text-xs"
                  disabled
                >
                  <Lock className="h-3 w-3 mr-1" />
                  Complete prerequisites to unlock
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
} 