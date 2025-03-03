import React, { useState } from 'react';
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
import { ProjectDetails, Experiment, ABTest, UserFeedback, Hypothesis } from '@/types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

interface ValidationProps {
  data?: ProjectDetails;
  onUpdate: (data: Partial<ProjectDetails>) => void;
}

interface ValidationData {
  experiments: Experiment[];
  abTests: ABTest[];
  userFeedback: UserFeedback[];
  hypotheses: Hypothesis[];
}

export const Validation: React.FC<ValidationProps> = ({ data, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Add form state
  const [experimentFormOpen, setExperimentFormOpen] = useState(false);
  const [abTestFormOpen, setABTestFormOpen] = useState(false);
  const [userFeedbackFormOpen, setUserFeedbackFormOpen] = useState(false);
  const [hypothesisFormOpen, setHypothesisFormOpen] = useState(false);
  
  // Ensure we have default values if data is undefined
  const safeData: ValidationData = {
    experiments: data?.validation?.experiments || [],
    abTests: data?.validation?.abTests || [],
    userFeedback: data?.validation?.userFeedback || [],
    hypotheses: data?.validation?.hypotheses || []
  };

  const counts = {
    experiments: safeData.experiments.length,
    abTests: safeData.abTests.length,
    feedback: safeData.userFeedback.length,
    hypotheses: safeData.hypotheses.length
  };

  const handleAddExperiment = (experiment: Experiment) => {
    onUpdate({
      validation: {
        ...safeData,
        experiments: [...safeData.experiments, experiment]
      }
    });
  };

  const handleUpdateExperiment = (updatedExperiment: Experiment) => {
    onUpdate({
      validation: {
        ...safeData,
        experiments: safeData.experiments.map(exp => 
          exp.id === updatedExperiment.id ? updatedExperiment : exp
        )
      }
    });
  };

  const handleDeleteExperiment = (id: string) => {
    onUpdate({
      validation: {
        ...safeData,
        experiments: safeData.experiments.filter(exp => exp.id !== id)
      }
    });
  };

  const handleAddABTest = (test: ABTest) => {
    onUpdate({
      validation: {
        ...safeData,
        abTests: [...safeData.abTests, test]
      }
    });
  };

  const handleUpdateABTest = (updatedTest: ABTest) => {
    onUpdate({
      validation: {
        ...safeData,
        abTests: safeData.abTests.map(test => 
          test.id === updatedTest.id ? updatedTest : test
        )
      }
    });
  };

  const handleDeleteABTest = (id: string) => {
    onUpdate({
      validation: {
        ...safeData,
        abTests: safeData.abTests.filter(test => test.id !== id)
      }
    });
  };

  const handleAddUserFeedback = (feedback: UserFeedback) => {
    onUpdate({
      validation: {
        ...safeData,
        userFeedback: [...safeData.userFeedback, feedback]
      }
    });
  };

  const handleUpdateUserFeedback = (updatedFeedback: UserFeedback) => {
    onUpdate({
      validation: {
        ...safeData,
        userFeedback: safeData.userFeedback.map(feedback => 
          feedback.id === updatedFeedback.id ? updatedFeedback : feedback
        )
      }
    });
  };

  const handleDeleteUserFeedback = (id: string) => {
    onUpdate({
      validation: {
        ...safeData,
        userFeedback: safeData.userFeedback.filter(feedback => feedback.id !== id)
      }
    });
  };

  const handleAddHypothesis = (hypothesis: Hypothesis) => {
    onUpdate({
      validation: {
        ...safeData,
        hypotheses: [...safeData.hypotheses, hypothesis]
      }
    });
  };

  const handleUpdateHypothesis = (updatedHypothesis: Hypothesis) => {
    onUpdate({
      validation: {
        ...safeData,
        hypotheses: safeData.hypotheses.map(hypothesis => 
          hypothesis.id === updatedHypothesis.id ? updatedHypothesis : hypothesis
        )
      }
    });
  };

  const handleDeleteHypothesis = (id: string) => {
    onUpdate({
      validation: {
        ...safeData,
        hypotheses: safeData.hypotheses.filter(hypothesis => hypothesis.id !== id)
      }
    });
  };
  
  const getStatusSummary = () => {
    const summary = {
      experimentsByStatus: {} as Record<string, number>,
      testsByStatus: {} as Record<string, number>,
      feedbackByStatus: {} as Record<string, number>,
      hypothesesByStatus: {} as Record<string, number>,
      validatedHypotheses: 0,
      completedExperiments: 0,
      completedTests: 0,
      processedFeedback: 0
    };

    safeData.experiments.forEach(exp => {
      summary.experimentsByStatus[exp.status] = (summary.experimentsByStatus[exp.status] || 0) + 1;
      if (exp.status === 'completed') {
        summary.completedExperiments++;
      }
    });

    safeData.abTests.forEach(test => {
      summary.testsByStatus[test.status] = (summary.testsByStatus[test.status] || 0) + 1;
      if (test.status === 'completed') {
        summary.completedTests++;
      }
    });

    safeData.userFeedback.forEach(feedback => {
      summary.feedbackByStatus[feedback.status] = (summary.feedbackByStatus[feedback.status] || 0) + 1;
      if (feedback.status === 'implemented') {
        summary.processedFeedback++;
      }
    });

    safeData.hypotheses.forEach(hyp => {
      summary.hypothesesByStatus[hyp.status] = (summary.hypothesesByStatus[hyp.status] || 0) + 1;
      if (hyp.status === 'validated') {
        summary.validatedHypotheses++;
      }
    });

    return summary;
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

  const renderOverview = () => {
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
                    {getStatusSummary().validatedHypotheses}/{counts.hypotheses}
                  </span>
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{
                        width: `${
                          counts.hypotheses > 0
                            ? (getStatusSummary().validatedHypotheses /
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
                    {getStatusSummary().completedExperiments}/
                    {counts.experiments}
                  </span>
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width: `${
                          counts.experiments > 0
                            ? (getStatusSummary().completedExperiments /
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
                    {getStatusSummary().completedTests}/{counts.abTests}
                  </span>
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500"
                      style={{
                        width: `${
                          counts.abTests > 0
                            ? (getStatusSummary().completedTests /
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
                    {getStatusSummary().processedFeedback}/{counts.feedback}
                  </span>
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500"
                      style={{
                        width: `${
                          counts.feedback > 0
                            ? (getStatusSummary().processedFeedback /
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
                    A hypothesis is a testable statement about what you believe to be true. Good hypotheses are specific, 
                    measurable, and falsifiable.
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={() => setHypothesisFormOpen(true)} size="sm">
              <PlusCircle className="h-4 w-4 mr-1" />
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
              hypotheses={
                searchQuery
                  ? safeData.hypotheses.filter(
                      (h: Hypothesis) =>
                        h.statement
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                        h.assumptions.some((a: string) =>
                          a.toLowerCase().includes(searchQuery.toLowerCase())
                        ) ||
                        h.validationMethod
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                        h.evidence.some((e: string) =>
                          e.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                    )
                  : safeData.hypotheses
              }
              onUpdate={handleUpdateHypothesis}
              onDelete={handleDeleteHypothesis}
            />
          </ScrollArea>

          <HypothesisForm
            open={hypothesisFormOpen}
            onOpenChange={setHypothesisFormOpen}
            onSubmit={handleAddHypothesis}
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
              <PlusCircle className="h-4 w-4 mr-1" />
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
              experiments={
                searchQuery
                  ? safeData.experiments.filter(
                      (e: Experiment) =>
                        e.title
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                        e.description
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                        e.hypothesis
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                    )
                  : safeData.experiments
              }
              onUpdate={handleUpdateExperiment}
              onDelete={handleDeleteExperiment}
            />
          </ScrollArea>

          <ExperimentForm
            open={experimentFormOpen}
            onOpenChange={setExperimentFormOpen}
            onSubmit={handleAddExperiment}
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
              <PlusCircle className="h-4 w-4 mr-1" />
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
              tests={
                searchQuery
                  ? safeData.abTests.filter(
                      (t: ABTest) =>
                        t.title
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                        t.description
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                        t.variantA
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                        t.variantB
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                    )
                  : safeData.abTests
              }
              onUpdate={handleUpdateABTest}
              onDelete={handleDeleteABTest}
            />
          </ScrollArea>

          <ABTestForm
            open={abTestFormOpen}
            onOpenChange={setABTestFormOpen}
            onSubmit={handleAddABTest}
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
              <PlusCircle className="h-4 w-4 mr-1" />
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
              feedback={
                searchQuery
                  ? safeData.userFeedback.filter(
                      (f: UserFeedback) =>
                        f.source
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                        f.content
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                        f.tags.some((tag: string) =>
                          tag.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                    )
                  : safeData.userFeedback
              }
              onUpdate={handleUpdateUserFeedback}
              onDelete={handleDeleteUserFeedback}
            />
          </ScrollArea>

          <UserFeedbackForm
            open={userFeedbackFormOpen}
            onOpenChange={setUserFeedbackFormOpen}
            onSubmit={handleAddUserFeedback}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}; 