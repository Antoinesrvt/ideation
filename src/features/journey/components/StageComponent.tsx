import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'  
import { 
  ChevronRight, 
  HomeIcon, 
  ArrowLeft, 
  CheckCircle, 
  Circle, 
  Calendar, 
  Clock, 
  ArrowRight, 
  FileText, 
  Zap,
  List,
  BarChart,
  CheckSquare,
  Flag,
  Info,
  ExternalLink,
  Users,
  AlertCircle,
  Lightbulb,
  ChevronDown,
  Target,
  UploadCloud,
  Download,
  Link2
} from 'lucide-react'
import { DataOutputPanel } from './DataOutputPanel'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { JOURNEY_STAGES } from '../constants'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

// Type definitions
interface ValidationCriterion {
  id: string;
  name: string;
  threshold: number;
  description?: string;
  tip?: string;
}

interface DataOutputDefinition {
  id: string;
  name: string;
}

interface JourneyStage {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  tools: string[];
  recommendedFirst: string;
  color: string;
  dependencies: string[];
  unlocks: string[];
  validationCriteria: ValidationCriterion[];
  dataOutputs: DataOutputDefinition[];
}

interface BreadcrumbProps {
  stages: typeof JOURNEY_STAGES;
  currentStageId: string;
  onNavigate: (stageId?: string) => void;
}

interface StageProgressCircleProps {
  progress: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}

interface ToolCardProps {
  tool: string;
  toolProgress: Record<string, number>;
  stageId: string;
  stageColor: string;
  isRecommended: boolean;
  dependencies?: string[];
  dependentTools?: string[];
  onClick: (stageId: string, toolId: string) => void;
  animationDelay: number;
}

interface ValidationCriterionItemProps {
  criterion: ValidationCriterion;
  progress?: number;
  stageColor: string;
  animationDelay: number;
  relatedTools?: string[];
}

interface DataOutput {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  stageId: string;
  createdAt: string;
}

interface DataOutputItemProps {
  output: DataOutput;
  onView: (outputId: string) => void;
  stageColor: string;
  animationDelay: number;
}

interface JourneyPositionIndicatorProps {
  currentStageId: string;
  stageProgress: Record<string, number>;
}

interface StageComponentProps {
  stage: (typeof JOURNEY_STAGES)[number];
  handleToolSelect: (stageId: string, toolId: string) => void;
  handleDataOutputView: (outputId: string) => void;
  handleBackToOverview: (stageId?: string) => void;
  stageProgress: Record<string, number>;
}

// Enhanced sub-components

// Reusable breadcrumb component with improved styling and hover effects
const Breadcrumb = ({ stages, currentStageId, onNavigate }: BreadcrumbProps) => {
  const currentIndex = stages.findIndex(stage => stage.id === currentStageId);
  
  return (
    <div className="flex items-center text-sm">
          <Button
            variant="ghost"
        size="sm"
        className="h-8 gap-1 hover:bg-gray-100 transition-colors"
        onClick={() => onNavigate('overview')}
      >
        <HomeIcon className="h-3.5 w-3.5" />
        <span>Parcours</span>
          </Button>

      <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />

          <div className="flex items-center">
        <span 
          className="flex items-center gap-1.5 font-medium"
          style={{ color: stages[currentIndex]?.color }}
        >
          <span className="flex items-center justify-center h-5 w-5 rounded-full text-xs" 
            style={{ backgroundColor: `${stages[currentIndex]?.color}15` }}>
            {currentIndex + 1}
          </span>
          <span>{stages[currentIndex]?.title}</span>
        </span>
      </div>
    </div>
  );
};

// Enhanced progress visualization component
const StageProgressCircle = ({ progress, color, size = 64, strokeWidth = 4 }: StageProgressCircleProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div 
        className="absolute inset-0 flex items-center justify-center font-semibold text-sm"
        style={{ color }}
      >
        {progress}%
          </div>
        </div>
  );
};

// Enhanced tool card with dependency visualization and better status indicators
const ToolCard = ({ 
  tool, 
  toolProgress, 
  stageId, 
  stageColor, 
  isRecommended, 
  dependencies = [],
  dependentTools = [],
  onClick, 
  animationDelay 
}: ToolCardProps) => {
  const toolName = tool
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Mock progress data - in a real implementation this would come from props
  const progress = toolProgress[tool] || 0;
  const isComplete = progress === 100;
  const isInProgress = progress > 0 && progress < 100;
  
  // Get appropriate icon based on tool type
  const getToolIcon = (toolId: string) => {
    const toolIcons: Record<string, React.ReactNode> = {
      'market': <BarChart className="h-4 w-4" />,
      'validation': <CheckSquare className="h-4 w-4" />,
      'business-model': <FileText className="h-4 w-4" />,
      'brand': <Flag className="h-4 w-4" />,
      'product-design': <List className="h-4 w-4" />,
      'documents': <FileText className="h-4 w-4" />,
      'financials': <BarChart className="h-4 w-4" />,
      'team': <Users className="h-4 w-4" />
    };
    
    return toolIcons[toolId] || <ChevronRight className="h-4 w-4" />;
  };
  
  // Get status badge
  const getStatusBadge = () => {
    if (isComplete) {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Complété</Badge>;
    } else if (isInProgress) {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">En cours</Badge>;
    } else {
      return <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">À faire</Badge>;
    }
  };
  
  // Check if dependencies are completed
  const areDependenciesMet = () => {
    if (dependencies.length === 0) return true;
    return dependencies.every(dep => (toolProgress[dep] || 0) === 100);
  };
  
  const unmetDependencies = dependencies.filter(dep => (toolProgress[dep] || 0) < 100);

                return (
                  <Card
      className={cn(
        "transition-all duration-200 animate-slide-right-in relative",
        isComplete 
          ? "bg-green-50/20 border-green-200" 
          : isInProgress 
            ? "hover:shadow-md hover:translate-y-[-2px] border-blue-200" 
            : areDependenciesMet() 
              ? "hover:shadow-md hover:translate-y-[-2px] cursor-pointer" 
              : "border-gray-200 bg-gray-50/50 opacity-80",
        isRecommended && !isComplete && "ring-2 ring-offset-1"
      )}
      style={{ 
        animationDelay: `${animationDelay}s`, 
        animationFillMode: 'both',
        borderLeftWidth: isRecommended && !isComplete ? '4px' : '1px',
        borderLeftColor: isRecommended && !isComplete ? stageColor : undefined,
        // @ts-ignore - ringColor is a valid CSS property with Tailwind's JIT mode
        ringColor: isRecommended && !isComplete ? stageColor : undefined,
        cursor: areDependenciesMet() ? 'pointer' : 'default'
      }}
      onClick={() => areDependenciesMet() && onClick(stageId, tool)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div 
              className={cn(
                "p-2 rounded-md mt-0.5",
                isComplete 
                  ? "bg-green-100" 
                  : isInProgress 
                    ? "bg-blue-100" 
                    : "bg-gray-100"
              )}
            >
              {getToolIcon(tool)}
            </div>
            <div>
              <h3 className="font-medium mb-1">{toolName}</h3>
              <div className="flex flex-col gap-1.5">
                {getStatusBadge()}
                
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Progression</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress 
                    value={progress} 
                    className="h-1.5 w-full"
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.05)'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {areDependenciesMet() && (
            <ChevronRight className="h-5 w-5 text-gray-400 self-center" />
          )}
        </div>
        
        {isRecommended && !isComplete && (
          <div className="mt-3 pt-2 border-t border-dashed border-blue-200 text-xs text-blue-600 flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5" />
            <span>Recommandé maintenant</span>
          </div>
        )}
        
        {/* Show dependency relationships */}
        {dependencies.length > 0 && !isComplete && (
          <div className="mt-3 pt-2 border-t border-dashed border-gray-200">
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full text-xs text-gray-500">
                <span>Dépendances {!areDependenciesMet() && <span className="text-amber-500">(incomplet)</span>}</span>
                <ChevronDown className="h-3 w-3" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 space-y-1">
                {dependencies.map(dep => {
                  const depProgress = toolProgress[dep] || 0;
                  const depName = dep
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                  
                  return (
                    <div key={dep} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <Link2 className="h-3 w-3" />
                        <span>{depName}</span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[10px] py-0 h-4",
                          depProgress === 100 
                            ? "bg-green-50 text-green-700 border-green-200" 
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        )}
                      >
                        {depProgress === 100 ? "Complété" : `${depProgress}%`}
                      </Badge>
                    </div>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
        
        {/* Show if other tools depend on this one */}
        {dependentTools.length > 0 && (
          <div className={cn(
            "mt-3 pt-2 border-t border-dashed",
            isComplete ? "border-green-200" : "border-gray-200"
          )}>
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full text-xs text-gray-500">
                <span>Utilisé par {dependentTools.length} autre{dependentTools.length > 1 ? 's' : ''} outil{dependentTools.length > 1 ? 's' : ''}</span>
                <ChevronDown className="h-3 w-3" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 space-y-1">
                {dependentTools.map(dep => {
                  const depName = dep
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                  
                  return (
                    <div key={dep} className="flex items-center text-xs">
                      <Link2 className="h-3 w-3 mr-1" />
                      <span>{depName}</span>
                    </div>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
                    </CardContent>
                  </Card>
                );
};

// Enhanced validation criterion item with improved visuals and detailed progress tracking
const ValidationCriterionItem = ({ 
  criterion, 
  progress = 0, 
  stageColor, 
  animationDelay,
  relatedTools = [] 
}: ValidationCriterionItemProps) => {
  const isComplete = progress >= criterion.threshold * 100;
  const [showDetails, setShowDetails] = useState(false);
  
  // Get related tools that contribute to this criterion
  const formattedRelatedTools = relatedTools.map(tool => ({
    id: tool,
    name: tool
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }));
  
  return (
    <Card 
      className={cn(
        "animate-slide-left-in border",
        isComplete ? "bg-green-50/20 border-green-200" : "hover:bg-gray-50/50"
      )}
                  style={{
        animationDelay: `${animationDelay}s`, 
        animationFillMode: 'both'
      }}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <div className="pt-0.5">
            {isComplete ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-gray-300" />
            )}
          </div>
          <div className="flex-1">
            <button 
              className="flex items-center justify-between w-full text-left"
              onClick={() => setShowDetails(!showDetails)}
            >
              <span className="text-sm font-medium">{criterion.name}</span>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-xs font-medium",
                  isComplete ? "text-green-600" : "text-gray-500"
                )}>
                  {progress}% / {criterion.threshold * 100}%
                </span>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  showDetails ? "transform rotate-180" : ""
                )} />
              </div>
            </button>
            
            <Progress 
              value={progress} 
              className="h-1.5 mt-1.5 w-full"
              style={{
                backgroundColor: 'rgba(0,0,0,0.05)',
                // @ts-ignore - Custom CSS variable for progress color
                '--progress-color': isComplete ? '#10b981' : stageColor
              }}
            />
            
            {showDetails && (
              <div className="mt-3 pt-3 border-t border-dashed border-gray-200 text-sm">
                <p className="text-gray-600 text-xs mb-2">{criterion.description}</p>
                
                {formattedRelatedTools.length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-xs font-medium mb-1">Outils liés à ce critère:</h4>
                    <div className="flex flex-wrap gap-1">
                      {formattedRelatedTools.map(tool => (
                        <Badge key={tool.id} variant="outline" className="text-xs">
                          {tool.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {criterion.tip && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-100 flex gap-2">
                    <Lightbulb className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-blue-700">{criterion.tip}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Enhanced data output visualization component
const DataOutputItem = ({
  output,
  onView,
  stageColor,
  animationDelay
}: DataOutputItemProps) => {
  const getDataIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      'document': <FileText className="h-4 w-4" />,
      'chart': <BarChart className="h-4 w-4" />,
      'list': <List className="h-4 w-4" />,
      'metric': <Target className="h-4 w-4" />,
      'upload': <UploadCloud className="h-4 w-4" />
    };
    
    return icons[type] || <FileText className="h-4 w-4" />;
  };
  
  return (
    <Card
      className="animate-slide-left-in hover:shadow-sm transition-shadow cursor-pointer"
      style={{ 
        animationDelay: `${animationDelay}s`, 
        animationFillMode: 'both'
      }}
      onClick={() => onView(output.id)}
    >
      <CardContent className="p-3 flex items-start gap-3">
        <div className="p-2 rounded-md bg-gray-100">
          {getDataIcon(output.type)}
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium mb-0.5">{output.title}</h4>
          <p className="text-xs text-gray-500 mb-2 line-clamp-2">{output.description}</p>
          
          <div className="flex items-center justify-between">
            <Badge 
              variant="outline" 
              className="text-xs"
              style={{ 
                backgroundColor: `${stageColor}10`,
                color: stageColor,
                borderColor: `${stageColor}30`
              }}
            >
              {output.category}
            </Badge>
            
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              <Download className="h-3 w-3 mr-1" />
              Exporter
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Journey position indicator with improved visuals
const JourneyPositionIndicator = ({ currentStageId, stageProgress }: JourneyPositionIndicatorProps) => {
  return (
    <div className="flex items-center space-x-1">
      {JOURNEY_STAGES.map((stage, index) => {
        const isCurrent = stage.id === currentStageId;
        const isCompleted = (stageProgress[stage.id] || 0) === 100;
        const progress = stageProgress[stage.id] || 0;
        
        return (
          <TooltipProvider key={stage.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center">
                  <div 
                    className={cn(
                      "h-2 w-8 rounded-full transition-colors",
                      isCurrent 
                        ? `bg-${stage.color}` 
                        : isCompleted 
                          ? "bg-green-500" 
                          : progress > 0 
                            ? "bg-gray-300" 
                            : "bg-gray-200"
                    )}
                    style={{
                      backgroundColor: isCurrent ? stage.color : undefined
                    }}
                  />
                  <span className="text-[10px] text-gray-500 mt-1">
                    {index + 1}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs font-medium">{stage.title}</p>
                <p className="text-xs text-gray-500">{progress}% complété</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
};

// Main component
const StageComponent = ({ 
  stage, 
  handleToolSelect, 
  handleDataOutputView, 
  handleBackToOverview, 
  stageProgress 
}: StageComponentProps) => {
  const [expandedSection, setExpandedSection] = useState<string>('recommended-tool');
  
  // Mock tool progress data - in a real implementation this would come from props
  const toolProgress: Record<string, number> = {
    'market': 70,
    'validation': 40,
    'business-model': 20,
    'brand': 10,
    'product-design': 30,
    'documents': 0,
    'financials': 0,
    'team': 0
  };
  
  // Mock validation criteria progress - in a real implementation this would come from props
  const getCriterionProgress = (criterionId: string): number => {
    const mockData: Record<string, number> = {
      'competitor-analysis': 80,
      'partner-schema': 60,
      'client-needs': 45,
      'market-trends': 90,
      'personas-defined': 20,
      'values-defined': 75,
      'mission-articulated': 30,
      'branding-outlined': 20,
      'value-proposition': 10,
      'key-features-defined': 5,
      'business-model-validated': 0,
      'financials-created': 0,
      'branding-guidelines': 0,
      'pitch-created': 0,
      'roadmap-defined': 0
    };
    
    return mockData[criterionId] || 0;
  };
  
  // Get stage status
  const getStageStatus = () => {
    const progress = stageProgress[stage.id] || 0;
    
    if (progress === 0) {
      return { label: "Non commencé", color: "gray" };
    } else if (progress === 100) {
      return { label: "Complété", color: "green" };
    } else {
      return { label: "En cours", color: "blue" };
    }
  };
  
  const stageStatus = getStageStatus();
  
  // Get next recommended tool
  const getRecommendedTool = (): string | undefined => {
    // Find first incomplete tool
    return stage.tools.find(toolId => (toolProgress[toolId] || 0) < 100);
  };
  
  const recommendedTool = getRecommendedTool();
  
  // Find the stage position
  const stageIndex = JOURNEY_STAGES.findIndex(s => s.id === stage.id);
  
  // Find previous and next stages
  const previousStage = stageIndex > 0 ? JOURNEY_STAGES[stageIndex - 1] : null;
  const nextStage = stageIndex < JOURNEY_STAGES.length - 1 ? JOURNEY_STAGES[stageIndex + 1] : null;
  
  // Generate mock data outputs
  const mockDataOutputs: DataOutput[] = [
    {
      id: 'market-analysis',
      title: 'Analyse de marché',
      description: 'Synthèse de l\'analyse de la taille, des tendances et des acteurs du marché.',
      type: 'document',
      category: 'Marché',
      stageId: stage.id,
      createdAt: new Date().toISOString()
    },
    {
      id: 'customer-personas',
      title: 'Personas clients',
      description: 'Définition des profils types de clients et de leurs besoins spécifiques.',
      type: 'list',
      category: 'Clients',
      stageId: stage.id,
      createdAt: new Date(Date.now() - 86400000).toISOString() // yesterday
    },
    {
      id: 'competitor-matrix',
      title: 'Matrice concurrentielle',
      description: 'Comparaison des offres concurrentes selon différents critères.',
      type: 'chart',
      category: 'Concurrence',
      stageId: stage.id,
      createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
    }
  ];
  
  // Calculate total stage progress 
  const calculateStageProgress = (): number => {
    // For demonstration - in a real app this would be computed from tools and criteria
    return stageProgress[stage.id] || Math.floor(Math.random() * 100);
  };
  
  const totalProgress = calculateStageProgress();
  
  // Filter tools by completion status
  const completedTools = stage.tools.filter(tool => (toolProgress[tool] || 0) === 100);
  const inProgressTools = stage.tools.filter(tool => (toolProgress[tool] || 0) > 0 && (toolProgress[tool] || 0) < 100);
  const pendingTools = stage.tools.filter(tool => (toolProgress[tool] || 0) === 0);
  
  // Filter criteria by completion status
  const completedCriteria = stage.validationCriteria.filter(
    criterion => getCriterionProgress(criterion.id) >= criterion.threshold * 100
  );
  
  // Get mock tool dependencies
  const getToolDependencies = (toolId: string): string[] => {
    // This would come from your data model
    const mockDependencies: Record<string, string[]> = {
      'business-model': ['market', 'validation'],
      'financials': ['business-model'],
      'product-design': ['validation', 'brand']
    };
    
    return mockDependencies[toolId] || [];
  };
  
  // Get mock dependent tools
  const getDependentTools = (toolId: string): string[] => {
    // Find all tools that have this tool as a dependency
    const dependents: string[] = [];
    
    stage.tools.forEach(t => {
      const deps = getToolDependencies(t);
      if (deps.includes(toolId)) {
        dependents.push(t);
      }
    });
    
    return dependents;
  };
  
  // Get related tools for a criterion
  const getRelatedTools = (criterionId: string): string[] => {
    // In a real app, this would be data-driven
    const mockRelations: Record<string, string[]> = {
      'competitor-analysis': ['market'],
      'client-needs': ['validation', 'market'],
      'market-trends': ['market'],
      'personas-defined': ['validation'],
      'values-defined': ['brand'],
      'mission-articulated': ['brand'],
      'branding-outlined': ['brand'],
      'value-proposition': ['business-model'],
      'key-features-defined': ['product-design']
    };
    
    return mockRelations[criterionId] || [];
  };
  
  // Toggle section expansion
  const toggleSection = (sectionId: string): void => {
    if (expandedSection === sectionId) {
      setExpandedSection('');
    } else {
      setExpandedSection(sectionId);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Enhanced Header with Breadcrumb and Progress */}
      <Card className="overflow-hidden border shadow-sm animate-fade-in">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Left section with breadcrumb and title */}
            <div className="flex-1 p-4">
              <Breadcrumb
                stages={JOURNEY_STAGES}
                currentStageId={stage.id}
                onNavigate={handleBackToOverview}
              />

              <div className="mt-3 flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold mb-1">{stage.title}</h1>
                  <p className="text-sm text-gray-500">
                    {stage.description}
                  </p>
                </div>

                <Badge
                  variant="outline"
                  className={cn(
                    "hidden md:flex",
                    stageStatus.color === "green"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : stageStatus.color === "blue"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-gray-50 text-gray-500 border-gray-200"
                  )}
                >
                  {stageStatus.label}
                </Badge>
              </div>
            </div>

            {/* Right section with progress circle */}
            <div
              className="flex-shrink-0 flex items-center justify-center p-6 min-w-[160px]"
              style={{ backgroundColor: `${stage.color}10` }}
            >
              <div className="text-center">
                <StageProgressCircle
                  progress={totalProgress}
                  color={stage.color}
                />
                <div
                  className="mt-2 text-sm font-medium"
                  style={{ color: stage.color }}
                >
                  Progression
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main content with unified view and right sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Main content area - Combined tools and validation */}
        <div className="md:col-span-3 space-y-6">

          {/* Tools and validation criteria combined */}
          <div className="space-y-6">
            {/* Tools section */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Outils disponibles
                    </CardTitle>
                  <CardDescription>
                    Ces outils vous aideront à compléter cette étape
                  </CardDescription>
                </CardHeader>

                  <CardContent className="pt-0">
                    {/* All tools in a simple grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      {stage.tools.map((toolId, index) => (
                        <ToolCard
                          key={toolId}
                          tool={toolId}
                          toolProgress={toolProgress}
                          stageId={stage.id}
                          stageColor={stage.color}
                          isRecommended={toolId === recommendedTool && (toolProgress[toolId] || 0) < 100}
                          dependencies={getToolDependencies(toolId)}
                          dependentTools={getDependentTools(toolId)}
                          onClick={handleToolSelect}
                          animationDelay={0.05 * index}
                        />
                      ))}
                    </div>
                    
                    {/* No tools placeholder */}
                    {stage.tools.length === 0 && (
                      <div className="text-center py-8 text-sm text-gray-500">
                        <div>Aucun outil disponible pour cette étape</div>
                      </div>
                    )}
                  </CardContent>
              </Card>

            {/* Validation criteria section */}
            <Collapsible
              open={expandedSection === 'validation-section'}
              onOpenChange={() => toggleSection('validation-section')}
              className="animate-slide-left-in"
              style={{ animationDelay: "0.3s", animationFillMode: "both" }}
            >
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CollapsibleTrigger className="w-full flex items-center justify-between text-left">
                    <CardTitle className="text-base font-medium flex items-center">
                      <CheckSquare className="h-5 w-5 mr-2" />
                      Critères de validation
                    </CardTitle>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={
                          completedCriteria.length === stage.validationCriteria.length
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }
                      >
                        {completedCriteria.length}/{stage.validationCriteria.length}
                      </Badge>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-gray-500 transition-transform",
                          expandedSection === "validation-section" ? "transform rotate-180" : ""
                        )}
                      />
                    </div>
                  </CollapsibleTrigger>
                  <CardDescription>
                    Ces critères doivent être remplis pour compléter cette étape
                  </CardDescription>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {stage.validationCriteria.map((criterion, index) => (
                        <ValidationCriterionItem
                          key={criterion.id}
                          criterion={{
                            ...criterion,
                            description: `Description pour ${criterion.name}`, // Add mock description
                          }}
                          progress={getCriterionProgress(criterion.id)}
                          stageColor={stage.color}
                          animationDelay={0.1 + index * 0.05}
                          relatedTools={getRelatedTools(criterion.id)}
                        />
                      ))}
                    </div>
                    
                    {/* Validation recommendations - only show if there are incomplete criteria */}
                    {completedCriteria.length < stage.validationCriteria.length && (
                      <div className="mt-6 p-3 border border-amber-200 bg-amber-50/30 rounded-md">
                        <div className="flex items-center text-amber-700 mb-2">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          <h4 className="text-sm font-medium">Comment valider cette étape</h4>
                        </div>
                        <p className="text-xs text-amber-700 mb-2">
                          Pour valider complètement cette étape, concentrez-vous sur
                          les critères non-complétés ci-dessus.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>
        </div>

        {/* Right sidebar - Data outputs */}
        <div className="md:col-span-1 space-y-4">
          <DataOutputPanel
            stageId={stage.id}
            onViewOutput={handleDataOutputView}
            className="animate-slide-left-in"
            style={{ animationDelay: "0.2s", animationFillMode: "both" }}
          />
        </div>
      </div>
    </div>
  );
};

export default StageComponent