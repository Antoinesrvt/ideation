import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ExperimentsList } from './ExperimentsList';
import { ABTestsList } from './ABTestsList';
import { UserFeedbackList } from './UserFeedbackList';
import { HypothesesList } from './HypothesesList';
import { 
  ExperimentForm, 
  ABTestForm, 
  UserFeedbackForm, 
  HypothesisForm 
} from '@/features/validation/components/forms';
import { 
  Beaker, 
  LineChart, 
  MessageSquare, 
  Lightbulb, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  XCircle,
  ChevronRight,
  PanelTop,
  Info,
  HelpCircle,
  ChevronDown,
  ClipboardCheck,
  AlertCircle,
  ArrowRight,
  Plus
} from 'lucide-react';
import { 
  ValidationExperiment,
  ValidationABTest,
  ValidationUserFeedback,
  ValidationHypothesis
} from '@/store/types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { useValidation } from '@/hooks/useValidation';
import { useProjectStore } from '@/store';
import { Progress } from '@/components/ui/progress';


interface ValidationData {
  experiments: ValidationExperiment[];
  abTests: ValidationABTest[];
  userFeedback: ValidationUserFeedback[];
  hypotheses: ValidationHypothesis[];
}

export const Validation: React.FC = () => {
  // Get the current project ID from the store
  const { currentData } = useProjectStore();
  const projectId = currentData.project?.id;
  
  // Use the validation hook
  const {
    data: validationData,
    isLoading,
    error,
    addExperiment,
    updateExperiment,
    deleteExperiment,
    addABTest,
    updateABTest,
    deleteABTest,
    addUserFeedback,
    updateUserFeedback,
    deleteUserFeedback,
    addHypothesis,
    updateHypothesis,
    deleteHypothesis
  } = useValidation(projectId);
  
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Add form state
  const [experimentFormOpen, setExperimentFormOpen] = useState(false);
  const [abTestFormOpen, setABTestFormOpen] = useState(false);
  const [userFeedbackFormOpen, setUserFeedbackFormOpen] = useState(false);
  const [hypothesisFormOpen, setHypothesisFormOpen] = useState(false);
  
  const counts = {
    experiments: validationData.experiments.length,
    abTests: validationData.abTests.length,
    feedback: validationData.userFeedback.length,
    hypotheses: validationData.hypotheses.length
  };

  const [expandedHelp, setExpandedHelp] = useState<{
    overview: boolean;
    hypotheses: boolean;
    experiments: boolean;
    abTests: boolean;
    userFeedback: boolean;
    learnings: boolean;
  }>({
    overview: false,
    hypotheses: false,
    experiments: false,
    abTests: false,
    userFeedback: false,
    learnings: false
  });

  const toggleHelp = (section: keyof typeof expandedHelp) => {
    setExpandedHelp(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getStatusSummary = () => {
    const summary = {
      experiments: {
        total: validationData.experiments.length,
        completed: validationData.experiments.filter(e => e.status === 'completed').length,
        inProgress: validationData.experiments.filter(e => e.status === 'in-progress').length
      },
      abTests: {
        total: validationData.abTests.length,
        completed: validationData.abTests.filter(t => t.status === 'completed').length,
        running: validationData.abTests.filter(t => t.status === 'running').length
      },
      userFeedback: {
        total: validationData.userFeedback.length,
        implemented: validationData.userFeedback.filter(f => f.status === 'implemented').length,
        pending: validationData.userFeedback.filter(f => f.status === 'new' || f.status === 'in-review').length
      },
      hypotheses: {
        total: validationData.hypotheses.length,
        validated: validationData.hypotheses.filter(h => h.status === 'validated').length,
        invalidated: validationData.hypotheses.filter(h => h.status === 'invalidated').length
      }
    };

    return summary;
  };

  const renderOverview = () => {
    const summary = getStatusSummary();

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 border-l-4 border-l-blue-500">
            <h3 className="text-lg font-semibold">Why validate your ideas?</h3>
            <p className="text-sm text-gray-600 mt-2">
              Validation helps reduce risk and increase the chances of building
              something people actually want. It's about testing your
              assumptions before investing significant time and resources.
            </p>
          </Card>
          <Card className="p-4 border-l-4 border-l-green-500">
            <h3 className="text-lg font-semibold">Validation framework</h3>
            <p className="text-sm text-gray-600 mt-2">
              Start with hypotheses, test them through experiments and A/B
              tests, collect user feedback, and iterate based on what you learn.
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Validation Progress</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Hypotheses</span>
                <div className="flex items-center">
                  <span className="text-sm mr-2">
                    {summary.hypotheses.validated}/{counts.hypotheses}
                  </span>
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{
                        width: `${
                          counts.hypotheses > 0
                            ? (summary.hypotheses.validated /
                                counts.hypotheses) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Experiments</span>
                <div className="flex items-center">
                  <span className="text-sm mr-2">
                    {summary.experiments.completed}/{counts.experiments}
                  </span>
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width: `${
                          counts.experiments > 0
                            ? (summary.experiments.completed /
                                counts.experiments) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>A/B Tests</span>
                <div className="flex items-center">
                  <span className="text-sm mr-2">
                    {summary.abTests.completed}/{counts.abTests}
                  </span>
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500"
                      style={{
                        width: `${
                          counts.abTests > 0
                            ? (summary.abTests.completed /
                                counts.abTests) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Feedback</span>
                <div className="flex items-center">
                  <span className="text-sm mr-2">
                    {summary.userFeedback.implemented}/{counts.feedback}
                  </span>
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500"
                      style={{
                        width: `${
                          counts.feedback > 0
                            ? (summary.userFeedback.implemented /
                                counts.feedback) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">
              Recommended Next Steps
            </h3>
            <div className="space-y-3">
              <Card
                className="p-3 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setActiveTab("hypotheses")}
              >
                <div className="flex items-start">
                  <Lightbulb className="h-5 w-5 mr-2 text-blue-500" />
                  <div>
                    <h4 className="font-medium">Create hypotheses</h4>
                    <p className="text-sm text-gray-600">
                      Start by documenting what you believe to be true
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 ml-auto text-gray-400" />
                </div>
              </Card>

              <Card
                className="p-3 border-l-4 border-l-indigo-500 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setActiveTab("experiments")}
              >
                <div className="flex items-start">
                  <Beaker className="h-5 w-5 mr-2 text-indigo-500" />
                  <div>
                    <h4 className="font-medium">Design experiments</h4>
                    <p className="text-sm text-gray-600">
                      Test your most important assumptions
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 ml-auto text-gray-400" />
                </div>
              </Card>

              <Card
                className="p-3 border-l-4 border-l-amber-500 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setActiveTab("user-feedback")}
              >
                <div className="flex items-start">
                  <MessageSquare className="h-5 w-5 mr-2 text-amber-500" />
                  <div>
                    <h4 className="font-medium">Collect feedback</h4>
                    <p className="text-sm text-gray-600">
                      Gather insights directly from users
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 ml-auto text-gray-400" />
                </div>
              </Card>

              <Card
                className="p-3 border-l-4 border-l-purple-500 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setActiveTab("ab-tests")}
              >
                <div className="flex items-start">
                  <LineChart className="h-5 w-5 mr-2 text-purple-500" />
                  <div>
                    <h4 className="font-medium">Run A/B tests</h4>
                    <p className="text-sm text-gray-600">
                      Compare alternatives with quantitative data
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 ml-auto text-gray-400" />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!projectId) {
    return <div>No project selected</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Validation</h2>
          <p className="text-gray-600">Test your assumptions, run experiments, and gather learnings</p>
        </div>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <HelpCircle className="h-4 w-4" />
              <span>Help Guide</span>
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Validation Resources</h4>
              <div className="space-y-2 text-sm">
                <p className="font-medium">Quick Guides:</p>
                <a href="#" className="text-blue-600 hover:underline block">
                  → Creating effective hypotheses
                </a>
                <a href="#" className="text-blue-600 hover:underline block">
                  → Designing lean experiments
                </a>
                <a href="#" className="text-blue-600 hover:underline block">
                  → Interview frameworks and techniques
                </a>
                <a href="#" className="text-blue-600 hover:underline block">
                  → Interpreting validation results
                </a>
                <p className="text-gray-500 mt-2">
                  Click on the '?' icons in each section for specific guidance.
                </p>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>

      <Collapsible
        open={expandedHelp.overview}
        onOpenChange={() => toggleHelp('overview')}
        className="mb-6"
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="flex w-full justify-between p-2 text-sm border border-indigo-100 bg-indigo-50 hover:bg-indigo-100 text-indigo-800">
            <div className="flex items-center">
              <ClipboardCheck className="h-4 w-4 mr-2 text-indigo-600" />
              <span className="font-medium">Validation Essentials</span>
            </div>
            <ChevronDown className={`h-4 w-4 transform transition-transform ${expandedHelp.overview ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="p-4 border border-indigo-100 border-t-0 bg-indigo-50 rounded-b-md">
          <div className="space-y-3">
            <p className="text-sm text-indigo-700">
              Validation is the process of testing assumptions through experiments to reduce risk and increase confidence in your ideas.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-md p-3 shadow-sm">
                <div className="flex items-center mb-2">
                  <div className="bg-indigo-100 rounded-full p-1.5 mr-2">
                    <AlertCircle className="h-4 w-4 text-indigo-600" />
                  </div>
                  <h4 className="font-medium text-indigo-800">Start with Hypotheses</h4>
                </div>
                <p className="text-xs text-indigo-700">
                  Frame your assumptions as testable predictions that can be validated or invalidated.
                </p>
              </div>
              <div className="bg-white rounded-md p-3 shadow-sm">
                <div className="flex items-center mb-2">
                  <div className="bg-indigo-100 rounded-full p-1.5 mr-2">
                    <Beaker className="h-4 w-4 text-indigo-600" />
                  </div>
                  <h4 className="font-medium text-indigo-800">Run Experiments</h4>
                </div>
                <p className="text-xs text-indigo-700">
                  Design experiments that test your hypotheses with the least amount of time and resources.
                </p>
              </div>
              <div className="bg-white rounded-md p-3 shadow-sm">
                <div className="flex items-center mb-2">
                  <div className="bg-indigo-100 rounded-full p-1.5 mr-2">
                    <ArrowRight className="h-4 w-4 text-indigo-600" />
                  </div>
                  <h4 className="font-medium text-indigo-800">Document Learnings</h4>
                </div>
                <p className="text-xs text-indigo-700">
                  Record what you learn, adjust your approach, and iterate based on evidence.
                </p>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger 
            value="hypotheses" 
            className="flex items-center"
          >
            Hypotheses
            {counts.hypotheses > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-1 h-5 min-w-5 px-1"
              >
                {counts.hypotheses}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="experiments" 
            className="flex items-center"
          >
            Experiments
            {counts.experiments > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-1 h-5 min-w-5 px-1"
              >
                {counts.experiments}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="ab-tests" 
            className="flex items-center"
          >
            A/B Tests
            {counts.abTests > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-1 h-5 min-w-5 px-1"
              >
                {counts.abTests}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="user-feedback" 
            className="flex items-center"
          >
            User Feedback
            {counts.feedback > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-1 h-5 min-w-5 px-1"
              >
                {counts.feedback}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="hypotheses">
          <div className="flex justify-between items-center mb-4">
            <div className="max-w-2xl">
              <div className="flex items-start">
                <Lightbulb className="h-5 w-5 mr-2 text-blue-500 mt-1" />
                <div>
                  <h3 className="font-medium text-lg">Hypotheses</h3>
                  <p className="text-sm text-gray-600">
                    Start with clear hypotheses about your product and market assumptions.
                    These will guide your experiments and validation efforts.
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={() => setHypothesisFormOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New Hypothesis
            </Button>
          </div>

          <Collapsible
            open={expandedHelp.learnings}
            onOpenChange={() => toggleHelp('learnings')}
            className="mb-4"
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex w-full justify-between p-2 text-sm border border-blue-100 bg-blue-50 hover:bg-blue-100 text-blue-800">
                <div className="flex items-center">
                  <Info className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="font-medium">Creating Effective Hypotheses</span>
                </div>
                <ChevronDown className={`h-4 w-4 transform transition-transform ${expandedHelp.learnings ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3 border border-blue-100 border-t-0 bg-blue-50 rounded-b-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">Hypothesis Structure</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Make it specific and testable</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Use format: "We believe that [doing X] will result in [outcome Y]"</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Include how you'll measure success</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">Prioritizing Hypotheses</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Start with riskiest assumptions</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Focus on assumptions that could invalidate your idea</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Consider time and resource constraints</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <ScrollArea className="h-[calc(100vh-280px)]">
            <HypothesesList
              hypotheses={validationData.hypotheses}
              onUpdate={(hypothesis) => updateHypothesis({ 
                id: hypothesis.id, 
                data: {
                  statement: hypothesis.statement,
                  assumptions: hypothesis.assumptions,
                  validation_method: hypothesis.validation_method,
                  status: hypothesis.status,
                  confidence: hypothesis.confidence,
                  evidence: hypothesis.evidence
                }
              })}
              onDelete={deleteHypothesis}
            />
          </ScrollArea>

          <HypothesisForm
            open={hypothesisFormOpen}
            onOpenChange={setHypothesisFormOpen}
            onSubmit={addHypothesis}
          />
        </TabsContent>

        <TabsContent value="experiments">
          <div className="flex justify-between items-center mb-4">
            <div className="max-w-2xl">
              <div className="flex items-start">
                <Beaker className="h-5 w-5 mr-2 text-indigo-500 mt-1" />
                <div>
                  <h3 className="font-medium text-lg">Experiments</h3>
                  <p className="text-sm text-gray-600">
                    Experiments are structured tests designed to validate or invalidate your hypotheses through
                    direct evidence and measurable results.
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={() => setExperimentFormOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New Experiment
            </Button>
          </div>

          <Collapsible
            open={expandedHelp.experiments}
            onOpenChange={() => toggleHelp('experiments')}
            className="mb-4"
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex w-full justify-between p-2 text-sm border border-indigo-100 bg-indigo-50 hover:bg-indigo-100 text-indigo-800">
                <div className="flex items-center">
                  <Info className="h-4 w-4 mr-2 text-indigo-600" />
                  <span className="font-medium">How to run effective experiments</span>
                </div>
                <ChevronDown className={`h-4 w-4 transform transition-transform ${expandedHelp.experiments ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3 border border-indigo-100 border-t-0 bg-indigo-50 rounded-b-md">
              <div className="flex items-start">
                <div>
                  <ul className="list-disc pl-4 mt-1 text-sm space-y-1 text-indigo-700">
                    <li>Start with a clear hypothesis you want to test</li>
                    <li>Define specific metrics to measure success</li>
                    <li>Keep experiments simple and focused on one variable</li>
                    <li>Set a timeframe with start and end dates</li>
                    <li>Document results and learnings, even if they don't match your expectations</li>
                  </ul>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <ScrollArea className="h-[calc(100vh-280px)]">
            <ExperimentsList
              experiments={validationData.experiments}
              onUpdate={({ id, data }) => updateExperiment({ id, data })}
              onDelete={deleteExperiment}
            />
          </ScrollArea>

          <ExperimentForm
            open={experimentFormOpen}
            onOpenChange={setExperimentFormOpen}
            onSubmit={addExperiment}
          />
        </TabsContent>

        <TabsContent value="ab-tests">
          <div className="flex justify-between items-center mb-4">
            <div className="max-w-2xl">
              <div className="flex items-start">
                <LineChart className="h-5 w-5 mr-2 text-purple-500 mt-1" />
                <div>
                  <h3 className="font-medium text-lg">A/B Tests</h3>
                  <p className="text-sm text-gray-600">
                    A/B tests compare two variants of a single variable to determine which performs better
                    against a specific metric.
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={() => setABTestFormOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New A/B Test
            </Button>
          </div>

          <Collapsible
            open={expandedHelp.abTests}
            onOpenChange={() => toggleHelp('abTests')}
            className="mb-4"
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex w-full justify-between p-2 text-sm border border-purple-100 bg-purple-50 hover:bg-purple-100 text-purple-800">
                <div className="flex items-center">
                  <Info className="h-4 w-4 mr-2 text-purple-600" />
                  <span className="font-medium">A/B testing best practices</span>
                </div>
                <ChevronDown className={`h-4 w-4 transform transition-transform ${expandedHelp.abTests ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3 border border-purple-100 border-t-0 bg-purple-50 rounded-b-md">
              <div className="flex items-start">
                <div>
                  <ul className="list-disc pl-4 mt-1 text-sm space-y-1 text-purple-700">
                    <li>Test only one variable at a time for clear results</li>
                    <li>Ensure your sample size is large enough (at least 100 per variant)</li>
                    <li>Run tests for sufficient time to account for variations (1-4 weeks typical)</li>
                    <li>Use statistical significance (95%+ confidence) to determine winners</li>
                    <li>Document both successful and unsuccessful tests to build knowledge</li>
                  </ul>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <ScrollArea className="h-[calc(100vh-280px)]">
            <ABTestsList
              tests={validationData.abTests}
              onUpdate={({ id, data }) => updateABTest({ id, data })}
              onDelete={deleteABTest}
            />
          </ScrollArea>

          <ABTestForm
            open={abTestFormOpen}
            onOpenChange={setABTestFormOpen}
            onSubmit={addABTest}
          />
        </TabsContent>

        <TabsContent value="user-feedback">
          <div className="flex justify-between items-center mb-4">
            <div className="max-w-2xl">
              <div className="flex items-start">
                <MessageSquare className="h-5 w-5 mr-2 text-amber-500 mt-1" />
                <div>
                  <h3 className="font-medium text-lg">User Feedback</h3>
                  <p className="text-sm text-gray-600">
                    Capture, organize, and act on direct feedback from users to improve your product
                    and validate your direction.
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={() => setUserFeedbackFormOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New Feedback
            </Button>
          </div>

          <Collapsible
            open={expandedHelp.userFeedback}
            onOpenChange={() => toggleHelp('userFeedback')}
            className="mb-4"
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex w-full justify-between p-2 text-sm border border-amber-100 bg-amber-50 hover:bg-amber-100 text-amber-800">
                <div className="flex items-center">
                  <Info className="h-4 w-4 mr-2 text-amber-600" />
                  <span className="font-medium">How to collect and use feedback effectively</span>
                </div>
                <ChevronDown className={`h-4 w-4 transform transition-transform ${expandedHelp.userFeedback ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3 border border-amber-100 border-t-0 bg-amber-50 rounded-b-md">
              <div className="flex items-start">
                <div>
                  <ul className="list-disc pl-4 mt-1 text-sm space-y-1 text-amber-700">
                    <li>Capture feedback verbatim when possible to preserve context</li>
                    <li>Categorize by type to identify patterns (feature requests, bugs, etc.)</li>
                    <li>Assess sentiment and impact to prioritize action items</li>
                    <li>Use tags to organize feedback by feature, user segment, etc.</li>
                    <li>Close the feedback loop by responding to users about their input</li>
                  </ul>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <ScrollArea className="h-[calc(100vh-280px)]">
            <UserFeedbackList
              feedback={validationData.userFeedback}
              onUpdate={({ id, data }) => updateUserFeedback({ id, data })}
              onDelete={deleteUserFeedback}
            />
          </ScrollArea>

          <UserFeedbackForm
            open={userFeedbackFormOpen}
            onOpenChange={setUserFeedbackFormOpen}
            onSubmit={addUserFeedback}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}; 