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

  const handleHypothesisUpdate = (hypothesis: ValidationHypothesis) => {
    updateHypothesis({
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
  };

  const renderOverview = () => {
    const summary = getStatusSummary();

    return (
      <div className="space-y-6 pt-6">
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
                            ? (summary.abTests.completed / counts.abTests) * 100
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
                onUpdate={handleHypothesisUpdate}
                onDelete={deleteHypothesis}
              />
            </SectionTab>

            <HypothesisForm
              open={hypothesisFormOpen}
              onOpenChange={setHypothesisFormOpen}
              onSubmit={addHypothesis}
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
                onUpdate={({ id, data }) => updateExperiment({ id, data })}
                onDelete={deleteExperiment}
              />
            </SectionTab>

            <ExperimentForm
              open={experimentFormOpen}
              onOpenChange={setExperimentFormOpen}
              onSubmit={addExperiment}
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
                onUpdate={({ id, data }) => updateABTest({ id, data })}
                onDelete={deleteABTest}
              />
            </SectionTab>

            <ABTestForm
              open={abTestFormOpen}
              onOpenChange={setABTestFormOpen}
              onSubmit={addABTest}
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
                onUpdate={({ id, data }) => updateUserFeedback({ id, data })}
                onDelete={deleteUserFeedback}
              />
            </SectionTab>

            <UserFeedbackForm
              open={userFeedbackFormOpen}
              onOpenChange={setUserFeedbackFormOpen}
              onSubmit={addUserFeedback}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
