import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { 
  ProjectDetails, 
  GRPModel, 
  GRPItem,
  CanvasItem,
  CustomerPersona as Persona,
  Competitor,
  Feature,
  MarketTrend,
  Experiment,
  ABTest,
  UserFeedback,
  Hypothesis
} from '@/types';
import { 
  Layers, 
  PieChart as PieChartIcon, 
  Target, 
  Users, 
  FileText, 
  BarChart as BarChartIcon, 
  Clock, 
  CheckCircle, 
  ArrowRight, 
  Lightbulb,
  LineChart,
  MessageSquare,
  Beaker,
  TrendingUp,
  AlertCircle,
  Award,
  Clipboard,
  HeartHandshake,
  ChevronRight
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store';
import { BarChart, PieChart } from '@/features/common/components/DataVisualization';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ProjectOverviewProps {
  project: ProjectDetails;
}

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({ project }) => {
  const { setActiveSection } = useAppStore();
  
  // Calculate section completion percentages
  const getSectionCompletion = (section: string) => {
    switch (section) {
      case 'canvas':
        if (!project.canvas) return 0;
        const canvasItems = Object.values(project.canvas).flat();
        const completedCanvasItems = canvasItems.filter(item => item.checked).length;
        return canvasItems.length > 0 ? Math.round((completedCanvasItems / canvasItems.length) * 100) : 0;
      
      case 'grp':
        if (!project.grpModel) return 0;
        
        // Calculate GRP model completion based on entered data
        let totalItems = 0;
        let completedItems = 0;
        
        // In the existing GRP model, count items with descriptions
        if (project.grpModel) {
          // Generation section
          if (project.grpModel.generation) {
            totalItems += countGRPSectionItems(project.grpModel.generation);
            completedItems += countCompletedGRPItems(project.grpModel.generation);
          }
          
          // Remuneration section
          if (project.grpModel.remuneration) {
            totalItems += countGRPSectionItems(project.grpModel.remuneration);
            completedItems += countCompletedGRPItems(project.grpModel.remuneration);
          }
          
          // Partage section
          if (project.grpModel.partage) {
            totalItems += countGRPSectionItems(project.grpModel.partage);
            completedItems += countCompletedGRPItems(project.grpModel.partage);
          }
        }
        
        return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
      
      case 'market':
        if (!project.marketAnalysis) return 0;
        
        let marketTotalItems = 0;
        let marketCompletedItems = 0;
        
        // Count personas
        if (project.marketAnalysis.customerInsights?.personas) {
          const personas = project.marketAnalysis.customerInsights.personas;
          marketTotalItems += personas.length * 3; // Name, role, demographics are key fields
          
          personas.forEach(persona => {
            if (persona.name) marketCompletedItems++;
            if (persona.role) marketCompletedItems++;
            if (persona.demographics) marketCompletedItems++;
          });
        }
        
        // Count competitors
        if (project.marketAnalysis.competitors) {
          const competitors = project.marketAnalysis.competitors;
          marketTotalItems += competitors.length * 3; // Name, strengths, weaknesses are key fields
          
          competitors.forEach(competitor => {
            if (competitor.name) marketCompletedItems++;
            if (competitor.strengths && competitor.strengths.length > 0) marketCompletedItems++;
            if (competitor.weaknesses && competitor.weaknesses.length > 0) marketCompletedItems++;
          });
        }
        
        // Count trends if available
        if (project.marketAnalysis.trends) {
          marketTotalItems += project.marketAnalysis.trends.length * 2;
          project.marketAnalysis.trends.forEach(trend => {
            if (trend.name) marketCompletedItems++;
            if (trend.description) marketCompletedItems++;
          });
        }
        
        return marketTotalItems > 0 ? Math.round((marketCompletedItems / marketTotalItems) * 100) : 0;
      
      case 'userflow':
        if (!project.userFlow) return 0;
        
        let userFlowTotalItems = 0;
        let userFlowCompletedItems = 0;
        
        // Count features
        if (project.userFlow.features) {
          userFlowTotalItems += project.userFlow.features.length * 2; // Name and description are key fields
          
          project.userFlow.features.forEach(feature => {
            if (feature.name) userFlowCompletedItems++;
            if (feature.description) userFlowCompletedItems++;
          });
        }
        
        // Count wireframes if available
        if (project.userFlow.wireframes) {
          userFlowTotalItems += project.userFlow.wireframes.length;
          project.userFlow.wireframes.forEach(wireframe => {
            if (wireframe.name) userFlowCompletedItems++;
          });
        }
        
        // Count journey stages if available
        if (project.userFlow.journey?.stages) {
          userFlowTotalItems += project.userFlow.journey.stages.length * 2;
          project.userFlow.journey.stages.forEach(stage => {
            if (stage.name) userFlowCompletedItems++;
            if (stage.description) userFlowCompletedItems++;
          });
        }
        
        return userFlowTotalItems > 0 ? Math.round((userFlowCompletedItems / userFlowTotalItems) * 100) : 0;
      
      case 'documents':
        return project.documents && project.documents.length > 0 ? 
          Math.min(100, project.documents.length * 25) : 0; // Each document counts as 25% up to 100%
          
      case 'validation':
        if (!project.validation) return 0;
        
        let validationTotal = 0;
        let validationCompleted = 0;
        
        // Count experiments
        if (project.validation.experiments) {
          validationTotal += project.validation.experiments.length;
          validationCompleted += project.validation.experiments.filter(
            exp => exp.status === 'completed'
          ).length;
        }
        
        // Count A/B tests
        if (project.validation.abTests) {
          validationTotal += project.validation.abTests.length;
          validationCompleted += project.validation.abTests.filter(
            test => test.status === 'completed'
          ).length;
        }
        
        // Count user feedback
        if (project.validation.userFeedback) {
          validationTotal += project.validation.userFeedback.length;
          validationCompleted += project.validation.userFeedback.filter(
            feedback => feedback.status === 'implemented' || feedback.status === 'accepted'
          ).length;
        }
        
        // Count hypotheses
        if (project.validation.hypotheses) {
          validationTotal += project.validation.hypotheses.length;
          validationCompleted += project.validation.hypotheses.filter(
            hypothesis => hypothesis.status === 'validated' || hypothesis.status === 'invalidated'
          ).length;
        }
        
        return validationTotal > 0 ? Math.round((validationCompleted / validationTotal) * 100) : 0;
      
      default:
        return 0;
    }
  };
  
  // Helper function to count the total number of items in a GRP section
  const countGRPSectionItems = (section: Record<string, GRPItem[]>) => {
    return Object.values(section).reduce((total, items) => total + items.length, 0);
  };
  
  // Helper function to count completed GRP items (those with descriptions)
  const countCompletedGRPItems = (section: Record<string, GRPItem[]>) => {
    return Object.values(section).flat().filter(item => !!item.description).length;
  };

  // Calculate project health score based on various factors
  const getProjectHealthScore = () => {
    const sectionScores = [
      getSectionCompletion('canvas'),
      getSectionCompletion('grp'),
      getSectionCompletion('market'),
      getSectionCompletion('userflow'),
      getSectionCompletion('validation')
    ];
    
    // Calculate weighted average, giving more weight to market analysis and validation
    const weightedTotal = sectionScores[0] * 0.15 + 
                          sectionScores[1] * 0.15 + 
                          sectionScores[2] * 0.25 + 
                          sectionScores[3] * 0.15 + 
                          sectionScores[4] * 0.3;
    
    return Math.round(weightedTotal);
  };
  
  // Determine project phase based on completion percentages
  const getProjectPhase = () => {
    const overallCompletion = project.completion;
    const validationProgress = getSectionCompletion('validation');
    const marketAnalysisProgress = getSectionCompletion('market');
    
    if (overallCompletion < 25) return 'Concept';
    if (overallCompletion < 50) return 'Development';
    if (overallCompletion < 75 || validationProgress < 50) return 'Validation';
    if (overallCompletion < 90 || marketAnalysisProgress < 70) return 'Refinement';
    return 'Ready for launch';
  };
  
  // Get prioritized recommended actions based on current state
  const getRecommendedActions = () => {
    const actions = [];
    
    if (getSectionCompletion('canvas') < 70) {
      actions.push({
        id: 'canvas-action',
        title: 'Complete your business model canvas',
        description: 'Define your key value propositions and customer segments',
        icon: <Layers className="h-5 w-5 text-blue-600" />,
        priority: 1,
        section: 'canvas'
      });
    }
    
    if (getSectionCompletion('market') < 60) {
      actions.push({
        id: 'market-action',
        title: 'Develop your market analysis',
        description: 'Research competitors and identify customer personas',
        icon: <Target className="h-5 w-5 text-green-600" />,
        priority: getSectionCompletion('canvas') > 50 ? 1 : 2,
        section: 'market'
      });
    }
    
    // If validation is missing or low, prioritize it highly if other areas are progressed
    if (getSectionCompletion('validation') < 40 && getSectionCompletion('canvas') > 50) {
      actions.push({
        id: 'validation-action',
        title: 'Test your core assumptions',
        description: 'Set up experiments to validate your business model',
        icon: <Beaker className="h-5 w-5 text-indigo-600" />,
        priority: 1,
        section: 'validation'
      });
    }
    
    if (getSectionCompletion('userflow') < 50 && getSectionCompletion('canvas') > 40) {
      actions.push({
        id: 'userflow-action',
        title: 'Design your user flows',
        description: 'Map out key user journeys and features',
        icon: <Users className="h-5 w-5 text-purple-600" />,
        priority: 2,
        section: 'product-design'
      });
    }
    
    if (getSectionCompletion('documents') < 30 && project.completion > 60) {
      actions.push({
        id: 'documents-action',
        title: 'Generate key documents',
        description: 'Create a business plan and pitch deck',
        icon: <FileText className="h-5 w-5 text-red-600" />,
        priority: 3,
        section: 'documents'
      });
    }
    
    // Sort by priority
    return actions.sort((a, b) => a.priority - b.priority).slice(0, 3);
  };

  // Status cards data for quick insights
  const getProjectInsights = () => {
    const insights = [];
    
    // Canvas insights
    const canvasItems = project.canvas ? Object.values(project.canvas).flat() : [];
    const valueProps = project.canvas?.valuePropositions || [];
    if (valueProps.length > 0) {
      insights.push({
        id: 'value-props',
        title: 'Value Propositions',
        value: valueProps.length,
        description: `You've defined ${valueProps.length} value proposition${valueProps.length !== 1 ? 's' : ''}`,
        icon: <Award className="h-5 w-5 text-amber-500" />,
        color: 'amber'
      });
    }
    
    // Market insights
    if (project.marketAnalysis?.competitors?.length) {
      insights.push({
        id: 'competitors',
        title: 'Competitors',
        value: project.marketAnalysis.competitors.length,
        description: `You're tracking ${project.marketAnalysis.competitors.length} competitor${project.marketAnalysis.competitors.length !== 1 ? 's' : ''}`,
        icon: <Target className="h-5 w-5 text-green-500" />,
        color: 'green'
      });
    }
    
    // User flow insights
    if (project.userFlow?.features?.length) {
      const mustHaveFeatures = project.userFlow.features.filter(f => f.priority === 'must').length;
      if (mustHaveFeatures > 0) {
        insights.push({
          id: 'must-features',
          title: 'Must-Have Features',
          value: mustHaveFeatures,
          description: `You've defined ${mustHaveFeatures} critical feature${mustHaveFeatures !== 1 ? 's' : ''}`,
          icon: <Clipboard className="h-5 w-5 text-purple-500" />,
          color: 'purple'
        });
      }
    }
    
    // Validation insights
    if (project.validation?.experiments?.length) {
      const completedExperiments = project.validation.experiments.filter(e => e.status === 'completed').length;
      if (completedExperiments > 0) {
        insights.push({
          id: 'experiments',
          title: 'Completed Experiments',
          value: completedExperiments,
          description: `You've completed ${completedExperiments} validation experiment${completedExperiments !== 1 ? 's' : ''}`,
          icon: <Beaker className="h-5 w-5 text-indigo-500" />,
          color: 'indigo'
        });
      }
    }
    
    if (project.validation?.hypotheses?.length) {
      const validatedHypotheses = project.validation.hypotheses.filter(h => h.status === 'validated').length;
      if (validatedHypotheses > 0) {
        insights.push({
          id: 'hypotheses',
          title: 'Validated Hypotheses',
          value: validatedHypotheses,
          description: `You've validated ${validatedHypotheses} business hypothesis/es`,
          icon: <Lightbulb className="h-5 w-5 text-blue-500" />,
          color: 'blue'
        });
      }
    }
    
    // Return a slice to avoid too many items
    return insights.slice(0, 4);
  };

  // Risk analysis - look for potential warning signs
  const getProjectRisks = () => {
    const risks = [];
    
    // No market validation indicates risk
    if (getSectionCompletion('validation') < 20 && project.completion > 40) {
      risks.push({
        id: 'validation-risk',
        title: 'Limited Validation',
        description: 'Your business model assumptions need testing',
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        severity: 'high',
        action: 'validation'
      });
    }
    
    // No competitors analysis might mean insufficient market research
    if ((!project.marketAnalysis?.competitors || project.marketAnalysis.competitors.length === 0) && 
        project.completion > 30) {
      risks.push({
        id: 'competitors-risk',
        title: 'Missing Competitor Analysis',
        description: 'Understanding the competitive landscape is crucial',
        icon: <AlertCircle className="h-5 w-5 text-amber-500" />,
        severity: 'medium',
        action: 'market'
      });
    }
    
    // If user flows are missing but we're far along
    if (getSectionCompletion('userflow') < 20 && project.completion > 50) {
      risks.push({
        id: 'userflow-risk',
        title: 'Underdeveloped User Flows',
        description: 'You need to define how users will interact with your product',
        icon: <AlertCircle className="h-5 w-5 text-orange-500" />,
        severity: 'medium',
        action: 'product-design'
      });
    }
    
    // Return the top 2 risks
    return risks.slice(0, 2);
  };

  const sections = [
    { id: 'canvas', name: 'Business Model Canvas', icon: <Layers className="h-5 w-5 text-blue-500" /> },
    { id: 'grp', name: 'GRP Model', icon: <PieChartIcon className="h-5 w-5 text-yellow-500" /> },
    { id: 'market', name: 'Market Analysis', icon: <Target className="h-5 w-5 text-green-500" /> },
    { id: 'product-design', name: 'User Flow Design', icon: <Users className="h-5 w-5 text-purple-500" /> },
    { id: 'validation', name: 'Validation', icon: <Beaker className="h-5 w-5 text-indigo-500" /> },
    { id: 'documents', name: 'Document Generation', icon: <FileText className="h-5 w-5 text-red-500" /> }
  ];
  
  const chartData = sections.map(section => ({
    label: section.name.split(' ').pop() || section.name,
    value: getSectionCompletion(section.id),
    color: section.id === 'canvas' ? '#3b82f6' : 
           section.id === 'grp' ? '#eab308' : 
           section.id === 'market' ? '#22c55e' : 
           section.id === 'product-design' ? '#a855f7' : 
           section.id === 'validation' ? '#6366f1' : 
           '#ef4444'
  }));
  
  // Memoize the calculated values
  const projectHealth = useMemo(() => getProjectHealthScore(), [project]);
  const projectPhase = useMemo(() => getProjectPhase(), [project]);
  const recommendedActions = useMemo(() => getRecommendedActions(), [project]);
  const projectInsights = useMemo(() => getProjectInsights(), [project]);
  const projectRisks = useMemo(() => getProjectRisks(), [project]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{project.name ?? 'Untitled Project'}</h2>
        <p className="text-gray-600">Last edited: {project.lastEdited ? formatDate(project.lastEdited) : 'Not available'}</p>
      </div>

      {/* Project Health & Phase Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
                Project Health
              </div>
              <Badge 
                className={`
                  ${projectHealth >= 80 ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                  ${projectHealth >= 50 && projectHealth < 80 ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' : ''}
                  ${projectHealth < 50 ? 'bg-red-100 text-red-800 hover:bg-red-100' : ''}
                `}
              >
                {projectHealth >= 80 ? 'Healthy' : projectHealth >= 50 ? 'Needs attention' : 'At risk'}
              </Badge>
            </CardTitle>
            <CardDescription>
              Overall health score based on completion and validation metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div>
            <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Health Score</span>
                  <span className="text-sm font-medium text-blue-600">{projectHealth}%</span>
                </div>
                <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      projectHealth >= 80 ? 'bg-green-500' : 
                      projectHealth >= 50 ? 'bg-amber-500' : 
                      'bg-red-500'
                    }`}
                    style={{ width: `${projectHealth}%` }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="border rounded-lg p-3">
                  <div className="text-sm text-gray-500 mb-1">Current Phase</div>
                  <div className="font-medium flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      projectPhase === 'Ready for launch' ? 'bg-green-500' :
                      projectPhase === 'Refinement' ? 'bg-blue-500' :
                      projectPhase === 'Validation' ? 'bg-indigo-500' :
                      projectPhase === 'Development' ? 'bg-amber-500' :
                      'bg-gray-500'
                    }`} />
                    {projectPhase}
                  </div>
                </div>
                
                <div className="border rounded-lg p-3">
                  <div className="text-sm text-gray-500 mb-1">Completion</div>
                  <div className="font-medium flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    {project.completion}% complete
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projectRisks.length > 0 ? (
              <div className="space-y-3">
                {projectRisks.map(risk => (
                  <div 
                    key={risk.id}
                    className="border rounded-lg p-3 cursor-pointer hover:border-red-200 hover:bg-red-50 transition-colors"
                    onClick={() => setActiveSection(risk.action as any)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {risk.icon}
                        <span className="font-medium text-sm ml-2">{risk.title}</span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`
                          ${risk.severity === 'high' ? 'border-red-500 text-red-700' : ''}
                          ${risk.severity === 'medium' ? 'border-amber-500 text-amber-700' : ''}
                          ${risk.severity === 'low' ? 'border-yellow-500 text-yellow-700' : ''}
                        `}
                      >
                        {risk.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{risk.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-24 text-center">
                <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                <p className="text-sm text-gray-600">No significant risks identified</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Project Insights Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Project Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {projectInsights.map(insight => (
            <Card key={insight.id} className={`border-t-4 border-t-${insight.color}-500`}>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{insight.title}</p>
                    <p className="text-2xl font-bold mt-1">{insight.value}</p>
                  </div>
                  <div className={`p-2 rounded-full bg-${insight.color}-100`}>
                    {insight.icon}
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2">{insight.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Priority Actions Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
            Priority Actions
          </CardTitle>
          <CardDescription>
            Recommended next steps to improve your project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendedActions.map((action, index) => (
              <div 
                key={action.id}
                className="flex items-start p-3 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                onClick={() => setActiveSection(action.section as any)}
              >
                <div className="mr-3 flex-shrink-0">
                  <div className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center bg-white text-blue-700 font-medium">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    {action.icon}
                    <h4 className="font-medium ml-2">{action.title}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSection(action.section as any);
                  }}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>
          </CardContent>
        </Card>

      {/* Data Visualization Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <BarChart 
          title="Section Completion" 
          data={chartData}
        />
        
        <PieChart 
          title="Project Breakdown" 
          data={chartData}
        />
      </div>

      {/* Project Sections */}
      <Card>
        <CardHeader>
          <CardTitle>Project Sections</CardTitle>
          <CardDescription>Track your progress across different sections of your startup plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sections.map(section => {
              const completion = getSectionCompletion(section.id);
              return (
                <TooltipProvider key={section.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                <div 
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                  onClick={() => setActiveSection(section.id as any)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      {section.icon}
                      <h3 className="font-medium ml-2">{section.name}</h3>
                    </div>
                          <div className="flex items-center">
                            <span className="text-sm text-blue-600 font-medium mr-2">{completion}%</span>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </div>
                  </div>
                  <Progress value={completion} className="h-2 bg-gray-200" />
                </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to view and edit {section.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};