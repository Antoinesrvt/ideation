import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HypothesesList } from "./HypothesesList";
import { ExperimentsList } from "./ExperimentsList";
import { ABTestsList } from "./ABTestsList";
import { UserFeedbackList } from "./UserFeedbackList";
import {
  Lightbulb,
  Beaker,
  SplitSquareVertical,
  MessageSquare,
  AlertCircle,
  PlusCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ViewMode } from "./common/ViewToggle";
import { EnhancedValidationData, EnhancedValidationExperiment } from "../types";
import type { ValidationExperiment } from "@/store/types";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ValidationPhaseContentProps {
  activePhase: string;
  data: EnhancedValidationData;
  onAddItem: (type: string, data: any) => void;
  onUpdateItem: (id: string, data: any) => void;
  onDeleteItem: (type: string, id: string) => void;
  onOpenForm: (type: string) => void;
  projectId?: string;
}

// Phase information with detailed descriptions
const phaseInfo = {
  hypothesize: {
    title: "Hypothesize",
    description: "Create and validate hypotheses about your product ideas",
    icon: <Lightbulb className="h-5 w-5" />,
    emptyMessage: "Start by creating hypotheses about your product ideas",
  },
  experiment: {
    title: "Experiment",
    description: "Design experiments to test your hypotheses",
    icon: <Beaker className="h-5 w-5" />,
    emptyMessage: "Design experiments to test your hypotheses",
  },
  test: {
    title: "A/B Test",
    description: "Run A/B tests to validate your experiments",
    icon: <SplitSquareVertical className="h-5 w-5" />,
    emptyMessage: "Run A/B tests to validate your experiments",
  },
  feedback: {
    title: "User Feedback",
    description: "Collect and analyze user feedback",
    icon: <MessageSquare className="h-5 w-5" />,
    emptyMessage: "Collect feedback from users to validate your ideas",
  },
};

// Convert enhanced experiments to the format expected by ExperimentsList
const convertExperimentsForList = (
  experiments: EnhancedValidationExperiment[]
): ValidationExperiment[] => {
  return experiments.map((exp) => ({
    ...exp,
    results: exp.results ? JSON.stringify(exp.results) : null,
    metrics: exp.metrics ? JSON.stringify(exp.metrics) : null,
  })) as ValidationExperiment[];
};

export function ValidationPhaseContent({
  activePhase,
  data,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onOpenForm,
  projectId
}: ValidationPhaseContentProps) {
  // Initialize view mode state
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  
  const currentPhaseInfo = phaseInfo[activePhase as keyof typeof phaseInfo];
  const isEmpty =
    activePhase === "hypothesize"
      ? data.hypotheses.length === 0
      : activePhase === "experiment"
      ? data.experiments.length === 0
      : activePhase === "test"
      ? data.abTests.length === 0
      : activePhase === "feedback"
      ? data.userFeedback.length === 0
      : false;

  // Convert experiments for the list component
  const experimentsForList = useMemo(
    () => convertExperimentsForList(data.experiments),
    [data.experiments]
  );

  // Calculate phase completion metrics
  const phaseCompletionMetrics = useMemo(() => {
    switch (activePhase) {
      case "hypothesize":
        const validatedHypotheses = data.hypotheses.filter(
          (h) => h.status === "validated" || h.status === "invalidated"
        ).length;
        const totalHypotheses = data.hypotheses.length || 1;
        return {
          completed: validatedHypotheses,
          total: totalHypotheses,
          percentage: Math.round((validatedHypotheses / totalHypotheses) * 100),
        };
      case "experiment":
        const completedExperiments = data.experiments.filter(
          (e) => e.status === "completed"
        ).length;
        const totalExperiments = data.experiments.length || 1;
        return {
          completed: completedExperiments,
          total: totalExperiments,
          percentage: Math.round(
            (completedExperiments / totalExperiments) * 100
          ),
        };
      case "test":
        const completedTests = data.abTests.filter(
          (t) => t.status === "completed"
        ).length;
        const totalTests = data.abTests.length || 1;
        return {
          completed: completedTests,
          total: totalTests,
          percentage: Math.round((completedTests / totalTests) * 100),
        };
      case "feedback":
        const analyzedFeedback = data.userFeedback.filter(
          (f) => f.analysis !== null
        ).length;
        const totalFeedback = data.userFeedback.length || 1;
        return {
          completed: analyzedFeedback,
          total: totalFeedback,
          percentage: Math.round((analyzedFeedback / totalFeedback) * 100),
        };
      default:
        return { completed: 0, total: 1, percentage: 0 };
    }
  }, [activePhase, data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Phase header with progress */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              {currentPhaseInfo.icon}
            </div>
            <div>
              <CardTitle>{currentPhaseInfo.title}</CardTitle>
              <CardDescription>{currentPhaseInfo.description}</CardDescription>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Badge
                variant={
                  phaseCompletionMetrics.percentage === 100
                    ? "success"
                    : "outline"
                }
              >
                {phaseCompletionMetrics.completed}/
                {phaseCompletionMetrics.total} Complete
              </Badge>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        onOpenForm(
                          activePhase === "hypothesize"
                            ? "hypothesis"
                            : activePhase === "experiment"
                            ? "experiment"
                            : activePhase === "test"
                            ? "abTest"
                            : "userFeedback"
                        )
                      }
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Add new{" "}
                      {activePhase === "hypothesize"
                        ? "hypothesis"
                        : activePhase === "experiment"
                        ? "experiment"
                        : activePhase === "test"
                        ? "A/B test"
                        : "user feedback"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="mt-2">
            <Progress
              value={phaseCompletionMetrics.percentage}
              className="h-2"
            />
          </div>
        </CardHeader>
      </Card>

      {/* Empty state */}
      {isEmpty && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No items yet</AlertTitle>
          <AlertDescription>
            {currentPhaseInfo.emptyMessage}. Click the Add button in the
            action bar to get started.
          </AlertDescription>
        </Alert>
      )}

      {/* Phase content */}
      {activePhase === "hypothesize" && (
        <div className="space-y-6">
          <HypothesesList
            hypotheses={data.hypotheses}
            onUpdate={(params) => onUpdateItem(params.id, params.data)}
            onDelete={(id) => onDeleteItem("hypothesis", id)}
            relationships={data.relationships}
            data={data}
            projectId={projectId}
          />
        </div>
      )}

      {activePhase === "experiment" && (
        <div className="space-y-6">
          <ExperimentsList
            experiments={experimentsForList}
            onUpdate={(params) => onUpdateItem(params.id, params.data)}
            onDelete={(id) => onDeleteItem("experiment", id)}
            relationships={data.relationships}
            data={data}
            projectId={projectId}
          />
        </div>
      )}

      {activePhase === "test" && (
        <div className="space-y-6">
          <ABTestsList
            tests={data.abTests}
            onUpdate={(params) => onUpdateItem(params.id, params.data)}
            onDelete={(id) => onDeleteItem("abTest", id)}
            relationships={data.relationships}
            data={data}
            projectId={projectId}
          />
        </div>
      )}

      {activePhase === "feedback" && (
        <div className="space-y-6">
          <UserFeedbackList
            feedback={data.userFeedback}
            onUpdate={(params) => onUpdateItem(params.id, params.data)}
            onDelete={(id) => onDeleteItem("userFeedback", id)}
            relationships={data.relationships}
            data={data}
            projectId={projectId}
          />
        </div>
      )}
    </motion.div>
  );
}
