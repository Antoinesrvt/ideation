import React, { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ExperimentsList } from "./ExperimentsList";
import { ABTestsList } from "./ABTestsList";
import { UserFeedbackList } from "./UserFeedbackList";
import { HypothesesList } from "./HypothesesList";
import {
  ExperimentForm,
  ABTestForm,
  UserFeedbackForm,
  HypothesisForm,
} from "@/features/validation/components/forms";
import {
  Check,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Info,
  Lightbulb,
  LineChart,
  MessageSquare,
  ClipboardCheck,
  Beaker,
  AlertCircle,
  ArrowRight,
  Plus,
  MessageCircle,
  Split,
  PlusCircle,
  CheckCircle2,
  Clock,
  XCircle,
  PanelTop,
  FileText,
} from "lucide-react";
import {
  ValidationHypothesis,
} from "@/store/types";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useValidation } from "@/hooks/features/useValidation";
import { useProjectStore } from "@/store";
import { Progress } from "@/components/ui/progress";
import { SectionTab } from "@/components/ui/section-tab";
import TabList from '@/features/common/components/TabList';
import { useToast } from "@/components/ui/use-toast";
import { LoadingState, ErrorState } from "@/features/common/components/LoadingAndErrorState";

const tabs = [
  // {
  //   id: 'overview',
  //   label: 'Overview',
  //   icon: <Info className="h-4 w-4 mr-2" />
  // },
  {
    id: "hypotheses",
    label: "Hypotheses",
    icon: <Lightbulb className="h-4 w-4 mr-2" />
  },
  {
    id: "experiments",
    label: "Experiments",
    icon: <Beaker className="h-4 w-4 mr-2" />
  },
  {
    id: "ab-tests",
    label: "A/B Tests",
    icon: <LineChart className="h-4 w-4 mr-2" />
  },
  {
    id: "user-feedback",
    label: "User Feedback",
    icon: <MessageSquare className="h-4 w-4 mr-2" />
  }
]

export const Validation: React.FC = () => {
  // Get the current project ID from the store
  const { currentData } = useProjectStore();
  const projectId = currentData.project?.id;
  const { toast } = useToast();

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
    deleteHypothesis,
  } = useValidation(projectId);

  const [activeTab, setActiveTab] = useState<string>("hypotheses");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Add form state
  const [experimentFormOpen, setExperimentFormOpen] = useState(false);
  const [abTestFormOpen, setABTestFormOpen] = useState(false);
  const [userFeedbackFormOpen, setUserFeedbackFormOpen] = useState(false);
  const [hypothesisFormOpen, setHypothesisFormOpen] = useState(false);

  const counts = {
    experiments: validationData.experiments.length,
    abTests: validationData.abTests.length,
    feedback: validationData.userFeedback.length,
    hypotheses: validationData.hypotheses.length,
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
    learnings: false,
  });

  const toggleHelp = (section: keyof typeof expandedHelp) => {
    setExpandedHelp((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getStatusSummary = () => {
    const summary = {
      experiments: {
        total: validationData.experiments.length,
        completed: validationData.experiments.filter(
          (e) => e.status === "completed"
        ).length,
        inProgress: validationData.experiments.filter(
          (e) => e.status === "in-progress"
        ).length,
      },
      abTests: {
        total: validationData.abTests.length,
        completed: validationData.abTests.filter(
          (t) => t.status === "completed"
        ).length,
        running: validationData.abTests.filter((t) => t.status === "running")
          .length,
      },
      userFeedback: {
        total: validationData.userFeedback.length,
        implemented: validationData.userFeedback.filter(
          (f) => f.status === "implemented"
        ).length,
        pending: validationData.userFeedback.filter(
          (f) => f.status === "new" || f.status === "in-review"
        ).length,
      },
      hypotheses: {
        total: validationData.hypotheses.length,
        validated: validationData.hypotheses.filter(
          (h) => h.status === "validated"
        ).length,
        invalidated: validationData.hypotheses.filter(
          (h) => h.status === "invalidated"
        ).length,
      },
    };

    return summary;
  };

  // Handle adding experiments
  const handleAddExperiment = async (experimentData: any) => {
    try {
      if (!projectId) throw new Error("No project ID available");
      
      await addExperiment({
        ...experimentData,
        project_id: projectId,
        created_by: null
      });
      
      setExperimentFormOpen(false);
      toast({
        title: "Experiment added",
        description: "The experiment has been successfully added",
        variant: "default"
      });
    } catch (err) {
      toast({
        title: "Error adding experiment",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  // Handle updating experiments
  const handleUpdateExperiment = async ({ id, data }: { id: string; data: any }) => {
    try {
      await updateExperiment({ id, data });
      toast({
        title: "Experiment updated",
        description: "The experiment has been successfully updated",
        variant: "default"
      });
    } catch (err) {
      toast({
        title: "Error updating experiment",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  // Handle deleting experiments
  const handleDeleteExperiment = async (id: string) => {
    try {
      await deleteExperiment(id);
      toast({
        title: "Experiment deleted",
        description: "The experiment has been successfully deleted",
        variant: "default"
      });
    } catch (err) {
      toast({
        title: "Error deleting experiment",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  // Handle adding AB tests
  const handleAddABTest = async (testData: any) => {
    try {
      if (!projectId) throw new Error("No project ID available");
      
      await addABTest({
        ...testData,
        project_id: projectId,
        created_by: null
      });
      
      setABTestFormOpen(false);
      toast({
        title: "A/B Test added",
        description: "The A/B test has been successfully added",
        variant: "default"
      });
    } catch (err) {
      toast({
        title: "Error adding A/B Test",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  // Handle updating AB tests
  const handleUpdateABTest = async ({ id, data }: { id: string; data: any }) => {
    try {
      await updateABTest({ id, data });
      toast({
        title: "A/B Test updated",
        description: "The A/B test has been successfully updated",
        variant: "default"
      });
    } catch (err) {
      toast({
        title: "Error updating A/B Test",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  // Handle deleting AB tests
  const handleDeleteABTest = async (id: string) => {
    try {
      await deleteABTest(id);
      toast({
        title: "A/B Test deleted",
        description: "The A/B test has been successfully deleted",
        variant: "default"
      });
    } catch (err) {
      toast({
        title: "Error deleting A/B Test",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  // Handle adding user feedback
  const handleAddUserFeedback = async (feedbackData: any) => {
    try {
      if (!projectId) throw new Error("No project ID available");
      
      await addUserFeedback({
        ...feedbackData,
        project_id: projectId,
        created_by: null
      });
      
      setUserFeedbackFormOpen(false);
      toast({
        title: "User Feedback added",
        description: "The user feedback has been successfully added",
        variant: "default"
      });
    } catch (err) {
      toast({
        title: "Error adding user feedback",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  // Handle updating user feedback
  const handleUpdateUserFeedback = async ({ id, data }: { id: string; data: any }) => {
    try {
      await updateUserFeedback({ id, data });
      toast({
        title: "User Feedback updated",
        description: "The user feedback has been successfully updated",
        variant: "default"
      });
    } catch (err) {
      toast({
        title: "Error updating user feedback",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  // Handle deleting user feedback
  const handleDeleteUserFeedback = async (id: string) => {
    try {
      await deleteUserFeedback(id);
      toast({
        title: "User Feedback deleted",
        description: "The user feedback has been successfully deleted",
        variant: "default"
      });
    } catch (err) {
      toast({
        title: "Error deleting user feedback",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  // Handle adding hypotheses
  const handleAddHypothesis = async (hypothesisData: any) => {
    try {
      if (!projectId) throw new Error("No project ID available");
      
      await addHypothesis({
        ...hypothesisData,
        project_id: projectId,
        created_by: null
      });
      
      setHypothesisFormOpen(false);
      toast({
        title: "Hypothesis added",
        description: "The hypothesis has been successfully added",
        variant: "default"
      });
    } catch (err) {
      toast({
        title: "Error adding hypothesis",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  // Handle updating hypotheses
  const handleUpdateHypothesis = async (hypothesis: ValidationHypothesis) => {
    try {
      await updateHypothesis({
        id: hypothesis.id,
        data: {
          statement: hypothesis.statement,
          assumptions: hypothesis.assumptions,
          validation_method: hypothesis.validation_method,
          status: hypothesis.status,
          confidence: hypothesis.confidence,
          evidence: hypothesis.evidence
        }
      });
      toast({
        title: "Hypothesis updated",
        description: "The hypothesis has been successfully updated",
        variant: "default"
      });
    } catch (err) {
      toast({
        title: "Error updating hypothesis",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  // Handle deleting hypotheses
  const handleDeleteHypothesis = async (id: string) => {
    try {
      await deleteHypothesis(id);
      toast({
        title: "Hypothesis deleted",
        description: "The hypothesis has been successfully deleted",
        variant: "default"
      });
    } catch (err) {
      toast({
        title: "Error deleting hypothesis",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <LoadingState message="Loading validation data..." />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <ErrorState 
            error={error} 
            onRetry={() => window.location.reload()} 
          />
        </CardContent>
      </Card>
    );
  }

  if (!projectId) {
    return <div>No project selected</div>;
  }

  return (
    <div className="space-y-8">
      {/* Validation Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Hypotheses Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Hypotheses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Lightbulb className="h-5 w-5 text-amber-500 mr-2" />
                <span className="text-2xl font-bold">{counts.hypotheses}</span>
              </div>
              <div className="text-xs font-medium text-gray-500">
                {
                  validationData.hypotheses.filter(
                    (h) => h.status === "validated"
                  ).length
                }{" "}
                validated
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Experiments Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Experiments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Beaker className="h-5 w-5 text-purple-600 mr-2" />
                <span className="text-2xl font-bold">{counts.experiments}</span>
              </div>
              <div className="text-xs font-medium text-gray-500">
                {
                  validationData.experiments.filter(
                    (e) => e.status === "completed"
                  ).length
                }{" "}
                completed
              </div>
            </div>
          </CardContent>
        </Card>

        {/* A/B Tests Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              A/B Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Split className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-2xl font-bold">{counts.abTests}</span>
              </div>
              <div className="text-xs font-medium text-gray-500">
                {
                  validationData.abTests.filter((t) => t.status === "completed")
                    .length
                }{" "}
                completed
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Feedback Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              User Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MessageCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-2xl font-bold">{counts.feedback}</span>
              </div>
              <div className="text-xs font-medium text-gray-500">
                {
                  validationData.userFeedback.filter(
                    (f) => f.sentiment === "positive"
                  ).length
                }{" "}
                positive
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* <HoverCard>
        <HoverCardTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="float-right flex items-center gap-1"
          >
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
            </div>
          </div>
        </HoverCardContent>
      </HoverCard> */}
      <div className="space-y-6">
        <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
          <TabList tabs={tabs} />

          {/* <TabsContent value="overview">{renderOverview()}</TabsContent> */}

          <TabsContent value="hypotheses" variant="pills">
            <SectionTab
              icon={<Lightbulb className="h-5 w-5 text-primary-700" />}
              title="Hypotheses"
              description="Start with clear hypotheses about your product and market assumptions. These will guide your experiments and validation efforts."
              count={validationData.hypotheses.length}
              onCreate={() => setHypothesisFormOpen(true)}
              helper={{
                icon: <Info className="h-5 w-5" />,
                title: "Creating Effective Hypotheses",
                content: (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-primary-800 mb-2">
                          Hypothesis Structure
                        </h4>
                        <ul className="text-sm text-dark-600 space-y-1.5">
                          <li className="flex items-start">
                            <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0 text-primary-500" />
                            <span>Make it specific and testable</span>
                          </li>
                          <li className="flex items-start">
                            <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0 text-primary-500" />
                            <span>
                              Use format: "We believe that [doing X] will result
                              in [outcome Y]"
                            </span>
                          </li>
                          <li className="flex items-start">
                            <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0 text-primary-500" />
                            <span>Include how you'll measure success</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-primary-800 mb-2">
                          Prioritizing Hypotheses
                        </h4>
                        <ul className="text-sm text-dark-600 space-y-1.5">
                          <li className="flex items-start">
                            <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0 text-primary-500" />
                            <span>Start with riskiest assumptions</span>
                          </li>
                          <li className="flex items-start">
                            <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0 text-primary-500" />
                            <span>
                              Focus on assumptions that could invalidate your
                              idea
                            </span>
                          </li>
                          <li className="flex items-start">
                            <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0 text-primary-500" />
                            <span>
                              Order by impact and effort required to test
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="bg-white/80 rounded-md p-3 border border-primary-100 mt-2">
                      <p className="text-sm font-medium text-primary-800 mb-1">
                        Example hypothesis:
                      </p>
                      <p className="text-sm text-dark-700">
                        "We believe that freelance designers will pay $29/month
                        for our design tool because it saves them 5+ hours per
                        week on repetitive tasks."
                      </p>
                    </div>
                  </div>
                ),
              }}
              hasItems={validationData.hypotheses.length > 0}
              emptyState={{
                description:
                  "Formulate and track your key business hypotheses and their validation status",
              }}
            >
              <HypothesesList
                hypotheses={validationData.hypotheses}
                onUpdate={handleUpdateHypothesis}
                onDelete={handleDeleteHypothesis}
              />
            </SectionTab>

            <HypothesisForm
              open={hypothesisFormOpen}
              onOpenChange={setHypothesisFormOpen}
              onSubmit={handleAddHypothesis}
            />
          </TabsContent>

          <TabsContent value="experiments">
            <SectionTab
              icon={<FileText className="h-5 w-5 text-primary-700" />}
              title="Experiments"
              description="Document your experiments to test your hypotheses and gather evidence about your assumptions."
              count={validationData.experiments.length}
              onCreate={() => setExperimentFormOpen(true)}
              helper={{
                icon: <Info className="h-5 w-5" />,
                title: "Running Effective Experiments",
                content: (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-primary-800 mb-2">
                          Experiment Design
                        </h4>
                        <ul className="text-sm text-dark-600 space-y-1.5">
                          <li className="flex items-start">
                            <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0 text-primary-500" />
                            <span>Define clear success criteria</span>
                          </li>
                          <li className="flex items-start">
                            <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0 text-primary-500" />
                            <span>Keep experiments small and focused</span>
                          </li>
                          <li className="flex items-start">
                            <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0 text-primary-500" />
                            <span>
                              Measure both qualitative and quantitative data
                            </span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-primary-800 mb-2">
                          Experiment Types
                        </h4>
                        <ul className="text-sm text-dark-600 space-y-1.5">
                          <li className="flex items-start">
                            <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0 text-primary-500" />
                            <span>
                              Problem interviews to validate pain points
                            </span>
                          </li>
                          <li className="flex items-start">
                            <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0 text-primary-500" />
                            <span>Solution interviews to test concepts</span>
                          </li>
                          <li className="flex items-start">
                            <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0 text-primary-500" />
                            <span>MVPs to test actual usage behavior</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ),
              }}
              hasItems={validationData.experiments.length > 0}
              emptyState={{
                description:
                  "Run experiments to test your hypotheses and gather evidence about your product's viability",
              }}
            >
              <ExperimentsList
                experiments={validationData.experiments}
                onUpdate={handleUpdateExperiment}
                onDelete={handleDeleteExperiment}
              />
            </SectionTab>

            <ExperimentForm
              open={experimentFormOpen}
              onOpenChange={setExperimentFormOpen}
              onSubmit={handleAddExperiment}
            />
          </TabsContent>

          <TabsContent value="ab-tests">
            <SectionTab
              icon={<Split className="h-5 w-5 text-primary-700" />}
              title="A/B Tests"
              description="Compare different versions of your product to identify which performs better with real users."
              onCreate={() => setABTestFormOpen(true)}
              count={validationData.abTests.length}
              helper={{
                icon: <Info className="h-5 w-5" />,
                title: "Effective A/B Testing",
                content: (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-primary-800 mb-2">
                          Test Setup
                        </h4>
                        <ul className="text-sm text-dark-600 space-y-1.5">
                          <li className="flex items-start">
                            <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0 text-primary-500" />
                            <span>Test only one variable at a time</span>
                          </li>
                          <li className="flex items-start">
                            <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0 text-primary-500" />
                            <span>
                              Ensure your sample size is statistically
                              significant
                            </span>
                          </li>
                          <li className="flex items-start">
                            <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0 text-primary-500" />
                            <span>Run tests for adequate time periods</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-primary-800 mb-2">
                          Common Test Areas
                        </h4>
                        <ul className="text-sm text-dark-600 space-y-1.5">
                          <li className="flex items-start">
                            <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0 text-primary-500" />
                            <span>Headlines, copy, and messaging</span>
                          </li>
                          <li className="flex items-start">
                            <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0 text-primary-500" />
                            <span>CTAs and button placement</span>
                          </li>
                          <li className="flex items-start">
                            <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0 text-primary-500" />
                            <span>Pricing models and feature presentation</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ),
              }}
              hasItems={validationData.abTests.length > 0}
              emptyState={{
                description:
                  "Create A/B tests to compare different versions of your product and optimize performance",
              }}
            >
              <ABTestsList
                tests={validationData.abTests}
                onUpdate={handleUpdateABTest}
                onDelete={handleDeleteABTest}
              />
            </SectionTab>

            <ABTestForm
              open={abTestFormOpen}
              onOpenChange={setABTestFormOpen}
              onSubmit={handleAddABTest}
              // hypotheses={validationData.hypotheses}
            />
          </TabsContent>

          <TabsContent value="user-feedback">
            <SectionTab
              icon={<MessageSquare className="h-5 w-5 text-primary-700" />}
              title="User Feedback"
              description="Collect and analyze feedback from users to identify issues and opportunities for improvement."
              onCreate={() => setUserFeedbackFormOpen(true)}
              count={validationData.userFeedback.length}
              helper={{
                icon: <Info className="h-5 w-5" />,
                title: "Collecting Actionable Feedback",
                content: (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-primary-800 mb-2">
                          Feedback Methods
                        </h4>
                        <ul className="text-sm text-dark-600 space-y-1.5">
                          <li className="flex items-start">
                            <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0 text-primary-500" />
                            <span>
                              User interviews for in-depth understanding
                            </span>
                          </li>
                          <li className="flex items-start">
                            <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0 text-primary-500" />
                            <span>Surveys for quantitative data at scale</span>
                          </li>
                          <li className="flex items-start">
                            <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0 text-primary-500" />
                            <span>
                              Usability testing to observe real behavior
                            </span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-primary-800 mb-2">
                          Feedback Analysis
                        </h4>
                        <ul className="text-sm text-dark-600 space-y-1.5">
                          <li className="flex items-start">
                            <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0 text-primary-500" />
                            <span>Look for patterns across multiple users</span>
                          </li>
                          <li className="flex items-start">
                            <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0 text-primary-500" />
                            <span>
                              Categorize by feature, problem, and severity
                            </span>
                          </li>
                          <li className="flex items-start">
                            <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0 text-primary-500" />
                            <span>Prioritize based on business goals</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ),
              }}
              hasItems={validationData.userFeedback.length > 0}
              emptyState={{
                description:
                  "Collect and document user feedback to improve your product based on real user needs",
              }}
            >
              <UserFeedbackList
                feedback={validationData.userFeedback}
                onUpdate={handleUpdateUserFeedback}
                onDelete={handleDeleteUserFeedback}
              />
            </SectionTab>

            <UserFeedbackForm
              open={userFeedbackFormOpen}
              onOpenChange={setUserFeedbackFormOpen}
              onSubmit={handleAddUserFeedback}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
