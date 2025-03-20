import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowRightIcon, 
  ArrowLeftIcon, 
  ChevronRightIcon, 
  InfoIcon, 
  ZapIcon,
  GitBranchIcon,
  CheckIcon,
  XIcon,
  AlertCircleIcon
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Types
interface JourneyStage {
  id: string;
  name: string;
  phase: 'ideation' | 'validation' | 'growth' | 'scaling';
  description: string;
  completed: boolean;
  progress: number; // 0-1
}

interface Dependency {
  fromId: string;
  toId: string;
  type: 'blocker' | 'enabler' | 'accelerator' | 'optional';
  description: string;
  status: 'satisfied' | 'unsatisfied' | 'partially';
}

// Mock data
const mockStages: JourneyStage[] = [
  {
    id: 'problem-validation',
    name: 'Problem Validation',
    phase: 'ideation',
    description: 'Confirm that the problem exists and is worth solving',
    completed: true,
    progress: 1
  },
  {
    id: 'solution-ideation',
    name: 'Solution Ideation',
    phase: 'ideation',
    description: 'Generate potential solutions to the validated problem',
    completed: true,
    progress: 1
  },
  {
    id: 'customer-identification',
    name: 'Customer Identification',
    phase: 'ideation',
    description: 'Define and segment target customers',
    completed: true,
    progress: 1
  },
  {
    id: 'value-proposition',
    name: 'Value Proposition',
    phase: 'ideation',
    description: 'Articulate the unique value offered to customers',
    completed: false,
    progress: 0.7
  },
  {
    id: 'prototyping',
    name: 'Prototyping',
    phase: 'validation',
    description: 'Create a representation of the solution',
    completed: false,
    progress: 0.4
  },
  {
    id: 'customer-interviews',
    name: 'Customer Interviews',
    phase: 'validation',
    description: 'Conduct in-depth conversations with potential customers',
    completed: false,
    progress: 0.2
  },
  {
    id: 'mvp-definition',
    name: 'MVP Definition',
    phase: 'validation',
    description: 'Define the scope of your minimal viable product',
    completed: false,
    progress: 0.1
  },
  {
    id: 'market-sizing',
    name: 'Market Sizing',
    phase: 'validation',
    description: 'Determine the total addressable market',
    completed: false,
    progress: 0.3
  },
  {
    id: 'business-model',
    name: 'Business Model',
    phase: 'growth',
    description: 'Establish how your business will make money',
    completed: false,
    progress: 0.2
  },
  {
    id: 'funding-strategy',
    name: 'Funding Strategy',
    phase: 'growth',
    description: 'Plan how to finance your venture',
    completed: false,
    progress: 0
  },
  {
    id: 'mvp-build',
    name: 'MVP Build',
    phase: 'growth',
    description: 'Build the minimal viable product',
    completed: false,
    progress: 0
  },
  {
    id: 'go-to-market',
    name: 'Go-to-Market',
    phase: 'scaling',
    description: 'Define strategy for bringing product to market',
    completed: false,
    progress: 0
  }
];

const mockDependencies: Dependency[] = [
  {
    fromId: 'problem-validation',
    toId: 'solution-ideation',
    type: 'blocker',
    description: 'Must validate problem before ideating solutions',
    status: 'satisfied'
  },
  {
    fromId: 'problem-validation',
    toId: 'customer-identification',
    type: 'enabler',
    description: 'Problem validation helps identify potential customers',
    status: 'satisfied'
  },
  {
    fromId: 'customer-identification',
    toId: 'value-proposition',
    type: 'enabler',
    description: 'Knowing customers helps craft value proposition',
    status: 'satisfied'
  },
  {
    fromId: 'solution-ideation',
    toId: 'value-proposition',
    type: 'enabler',
    description: 'Solutions inform the value proposition',
    status: 'satisfied'
  },
  {
    fromId: 'value-proposition',
    toId: 'prototyping',
    type: 'blocker',
    description: 'Value proposition guides prototype features',
    status: 'partially'
  },
  {
    fromId: 'prototyping',
    toId: 'customer-interviews',
    type: 'accelerator',
    description: 'Prototypes make customer interviews more effective',
    status: 'unsatisfied'
  },
  {
    fromId: 'customer-identification',
    toId: 'customer-interviews',
    type: 'blocker',
    description: 'Need to identify customers before interviews',
    status: 'satisfied'
  },
  {
    fromId: 'customer-interviews',
    toId: 'mvp-definition',
    type: 'enabler',
    description: 'Customer feedback helps define MVP scope',
    status: 'unsatisfied'
  },
  {
    fromId: 'value-proposition',
    toId: 'market-sizing',
    type: 'enabler',
    description: 'Value proposition helps define market boundaries',
    status: 'partially'
  },
  {
    fromId: 'market-sizing',
    toId: 'business-model',
    type: 'enabler',
    description: 'Market size informs business model viability',
    status: 'unsatisfied'
  },
  {
    fromId: 'mvp-definition',
    toId: 'mvp-build',
    type: 'blocker',
    description: 'Must define MVP before building it',
    status: 'unsatisfied'
  },
  {
    fromId: 'business-model',
    toId: 'funding-strategy',
    type: 'enabler',
    description: 'Business model informs funding requirements',
    status: 'unsatisfied'
  },
  {
    fromId: 'funding-strategy',
    toId: 'mvp-build',
    type: 'optional',
    description: 'Funding may accelerate MVP development',
    status: 'unsatisfied'
  },
  {
    fromId: 'mvp-build',
    toId: 'go-to-market',
    type: 'blocker',
    description: 'Need MVP before go-to-market execution',
    status: 'unsatisfied'
  }
];

export function DependencyMatrix() {
  const [viewMode, setViewMode] = useState<'matrix' | 'diagram' | 'list'>('matrix');
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [showInfo, setShowInfo] = useState<boolean>(false);
  
  // Filter stages based on selected phase
  const filteredStages = selectedPhase === 'all' 
    ? mockStages 
    : mockStages.filter(stage => stage.phase === selectedPhase);
  
  // Filter dependencies to only include those that have both ends in filtered stages
  const filteredDependencies = mockDependencies.filter(dep => {
    const fromStage = filteredStages.find(s => s.id === dep.fromId);
    const toStage = filteredStages.find(s => s.id === dep.toId);
    return fromStage && toStage;
  });
  
  // Function to get stage by ID
  const getStageById = (id: string) => mockStages.find(stage => stage.id === id);
  
  // Get matrix cells for the dependency matrix
  const getMatrixCells = () => {
    return filteredStages.map(fromStage => (
      <tr key={`row-${fromStage.id}`}>
        <td className="px-4 py-2 border-r bg-muted whitespace-nowrap sticky left-0 z-10 max-w-[200px]">
          <div className="font-medium truncate">{fromStage.name}</div>
        </td>
        {filteredStages.map(toStage => {
          // Don't show dependencies to self
          if (fromStage.id === toStage.id) {
            return <td key={`cell-${fromStage.id}-${toStage.id}`} className="p-2 border text-center bg-muted-foreground/10">—</td>;
          }
          
          // Find if there's a dependency
          const dependency = filteredDependencies.find(
            dep => dep.fromId === fromStage.id && dep.toId === toStage.id
          );
          
          if (!dependency) {
            return <td key={`cell-${fromStage.id}-${toStage.id}`} className="p-2 border text-center">·</td>;
          }
          
          return (
            <td 
              key={`cell-${fromStage.id}-${toStage.id}`}
              className="p-2 border text-center relative"
            >
              <TooltipProvider>
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <div className="w-full h-full flex items-center justify-center cursor-pointer">
                      {getDependencyIcon(dependency)}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[300px] p-3">
                    <div className="font-medium mb-1 flex items-center gap-1">
                      {getDependencyTypeLabel(dependency.type)}
                    </div>
                    <p className="text-sm text-muted-foreground">{dependency.description}</p>
                    <div className="mt-2 flex items-center text-xs">
                      <div className={`h-2 w-2 rounded-full mr-1 ${getDependencyStatusColor(dependency.status)}`}></div>
                      {dependency.status.charAt(0).toUpperCase() + dependency.status.slice(1)}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </td>
          );
        })}
      </tr>
    ));
  };
  
  // Get dependency type badge
  const getDependencyTypeLabel = (type: Dependency['type']) => {
    const typeLabels = {
      'blocker': <Badge variant="destructive">Blocker</Badge>,
      'enabler': <Badge variant="default">Enabler</Badge>,
      'accelerator': <Badge variant="secondary">Accelerator</Badge>,
      'optional': <Badge variant="outline">Optional</Badge>
    };
    return typeLabels[type];
  };
  
  // Get dependency icon
  const getDependencyIcon = (dependency: Dependency) => {
    // Icon based on type
    const iconMap = {
      'blocker': <XIcon className={`h-5 w-5 ${getDependencyStatusColor(dependency.status, true)}`} />,
      'enabler': <CheckIcon className={`h-5 w-5 ${getDependencyStatusColor(dependency.status, true)}`} />,
      'accelerator': <ZapIcon className={`h-5 w-5 ${getDependencyStatusColor(dependency.status, true)}`} />,
      'optional': <GitBranchIcon className={`h-5 w-5 ${getDependencyStatusColor(dependency.status, true)}`} />
    };
    
    return iconMap[dependency.type];
  };
  
  // Get color for dependency status
  const getDependencyStatusColor = (status: Dependency['status'], isText = false) => {
    const prefix = isText ? 'text' : 'bg';
    switch (status) {
      case 'satisfied':
        return `${prefix}-green-600`;
      case 'partially':
        return `${prefix}-amber-500`;
      case 'unsatisfied':
        return `${prefix}-red-500`;
      default:
        return `${prefix}-gray-400`;
    }
  };
  
  // Dependency List component
  const DependencyList = () => {
    return (
      <div className="space-y-3 mt-4">
        {filteredDependencies
          .sort((a, b) => {
            // First sort by status (unsatisfied first)
            const statusOrder = { unsatisfied: 0, partially: 1, satisfied: 2 };
            if (statusOrder[a.status] !== statusOrder[b.status]) {
              return statusOrder[a.status] - statusOrder[b.status];
            }
            
            // Then by type (blockers first)
            const typeOrder = { blocker: 0, enabler: 1, accelerator: 2, optional: 3 };
            return typeOrder[a.type] - typeOrder[b.type];
          })
          .map(dependency => {
            const fromStage = getStageById(dependency.fromId);
            const toStage = getStageById(dependency.toId);
            
            if (!fromStage || !toStage) return null;
            
            return (
              <Card key={`${dependency.fromId}-${dependency.toId}`} className="overflow-hidden">
                <div className={`h-1 w-full ${getDependencyStatusColor(dependency.status)}`} />
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getDependencyTypeLabel(dependency.type)}
                      <span className={`text-sm ${getDependencyStatusColor(dependency.status, true)}`}>
                        {dependency.status === 'satisfied' ? 'Satisfied' : 
                          dependency.status === 'partially' ? 'Partially Satisfied' : 'Unsatisfied'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <Badge variant="outline" className="bg-muted">
                      {fromStage.name}
                    </Badge>
                    <ArrowRightIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <Badge variant="outline" className="bg-muted">
                      {toStage.name}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">{dependency.description}</p>
                </CardContent>
              </Card>
            );
          })}
      </div>
    );
  };
  
  // Dependency Diagram component
  const DependencyDiagram = () => {
    return (
      <div className="relative overflow-x-auto mt-4 border rounded-md p-4 bg-muted/20">
        <div className="text-center mb-4 text-sm text-muted-foreground">
          <p>Dependency flow diagram showing the relationships between journey stages</p>
        </div>
        <div className="flex flex-col items-center">
          {/* Group stages by phase */}
          {(['ideation', 'validation', 'growth', 'scaling'] as const).map(phase => {
            const phaseStages = filteredStages.filter(stage => stage.phase === phase);
            if (phaseStages.length === 0) return null;
            
            return (
              <div key={phase} className="mb-8 w-full">
                <div className="text-center font-medium mb-4 capitalize bg-muted py-1 rounded">
                  {phase} Phase
                </div>
                <div className="flex flex-wrap justify-center gap-6">
                  {phaseStages.map(stage => (
                    <div 
                      key={stage.id}
                      className={`
                        relative p-3 rounded-md border-2 w-[200px] 
                        ${stage.completed ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'}
                      `}
                    >
                      <div className="font-medium">{stage.name}</div>
                      <div className="text-xs text-muted-foreground mt-1 h-8 overflow-hidden">
                        {stage.description}
                      </div>
                      
                      {/* Find incoming dependencies */}
                      <div className="mt-2">
                        {filteredDependencies
                          .filter(dep => dep.toId === stage.id)
                          .slice(0, 2) // Limit to prevent clutter
                          .map(dep => {
                            const fromStage = getStageById(dep.fromId);
                            if (!fromStage) return null;
                            
                            return (
                              <div 
                                key={`${dep.fromId}-${dep.toId}`} 
                                className={`
                                  text-xs px-2 py-1 rounded-sm mt-1 flex items-center
                                  ${getDependencyStatusColor(dep.status)}
                                `}
                              >
                                <ArrowLeftIcon className="h-3 w-3 mr-1 text-white" />
                                <span className="text-white truncate">{fromStage.name}</span>
                              </div>
                            );
                          })}
                        
                        {filteredDependencies.filter(dep => dep.toId === stage.id).length > 2 && (
                          <div className="text-xs text-muted-foreground mt-1 text-center">
                            + {filteredDependencies.filter(dep => dep.toId === stage.id).length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Matrix View
  const MatrixView = () => {
    return (
      <div className="overflow-x-auto mt-4 border rounded-md">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="p-3 border-b border-r bg-muted font-medium text-left sticky left-0 z-20">
                FROM ↓ / TO →
              </th>
              {filteredStages.map(stage => (
                <th key={`col-${stage.id}`} className="p-3 border-b font-medium text-center">
                  <div className="transform -rotate-45 origin-center whitespace-nowrap w-20 overflow-hidden text-ellipsis">
                    {stage.name}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {getMatrixCells()}
          </tbody>
        </table>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl flex items-center">
              <GitBranchIcon className="h-5 w-5 mr-2 text-blue-500" />
              Dependency Matrix
            </CardTitle>
            <CardDescription>
              Visualize dependencies between different stages of your journey
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowInfo(!showInfo)}
          >
            <InfoIcon className="h-5 w-5" />
          </Button>
        </CardHeader>
        
        {showInfo && (
          <div className="px-6 py-2 bg-muted/50 text-sm">
            <p className="mb-2">
              <strong>Dependency Types:</strong>
            </p>
            <ul className="list-disc ml-6 space-y-1 mb-2">
              <li>
                <strong>Blockers</strong>: Must be resolved before the dependent stage can proceed
              </li>
              <li>
                <strong>Enablers</strong>: Help unlock capabilities needed for the dependent stage
              </li>
              <li>
                <strong>Accelerators</strong>: Speed up or improve the quality of the dependent stage
              </li>
              <li>
                <strong>Optional</strong>: May provide benefits but are not required
              </li>
            </ul>
          </div>
        )}
        
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            {/* View selector */}
            <div>
              <Tabs 
                value={viewMode} 
                onValueChange={(value) => setViewMode(value as 'matrix' | 'diagram' | 'list')}
              >
                <TabsList>
                  <TabsTrigger value="matrix">Matrix</TabsTrigger>
                  <TabsTrigger value="diagram">Diagram</TabsTrigger>
                  <TabsTrigger value="list">List</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {/* Phase filter */}
            <Tabs value={selectedPhase} onValueChange={setSelectedPhase}>
              <TabsList>
                <TabsTrigger value="all">All Phases</TabsTrigger>
                <TabsTrigger value="ideation">Ideation</TabsTrigger>
                <TabsTrigger value="validation">Validation</TabsTrigger>
                <TabsTrigger value="growth">Growth</TabsTrigger>
                <TabsTrigger value="scaling">Scaling</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Selected view */}
          {viewMode === 'matrix' && <MatrixView />}
          {viewMode === 'diagram' && <DependencyDiagram />}
          {viewMode === 'list' && <DependencyList />}
          
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-6 text-sm text-muted-foreground">
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-green-600 mr-2"></div>
              <span>Satisfied</span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-amber-500 mr-2"></div>
              <span>Partially Satisfied</span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
              <span>Unsatisfied</span>
            </div>
            <div className="flex items-center ml-4">
              <XIcon className="h-4 w-4 text-muted-foreground mr-1" />
              <span>Blocker</span>
            </div>
            <div className="flex items-center">
              <CheckIcon className="h-4 w-4 text-muted-foreground mr-1" />
              <span>Enabler</span>
            </div>
            <div className="flex items-center">
              <ZapIcon className="h-4 w-4 text-muted-foreground mr-1" />
              <span>Accelerator</span>
            </div>
            <div className="flex items-center">
              <GitBranchIcon className="h-4 w-4 text-muted-foreground mr-1" />
              <span>Optional</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 