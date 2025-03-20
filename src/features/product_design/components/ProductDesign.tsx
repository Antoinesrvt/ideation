import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Check,
  PlusCircle,
  HelpCircle,
  Info,
  Layout,
  MapPin,
  Map,
  AlertCircle,
  Lightbulb,
  Puzzle,
  ArrowRight,
  Play
} from "lucide-react";
import { WireframeGallery } from "./WireframeGallery";
import { FeatureMap } from "./FeatureMap";
import { UserJourneyMap } from "./UserJourneyMap";
import { ProblemSolutionFit } from "./ProblemSolutionFit";
import { MVPScopeDefinition } from "./MVPScopeDefinition";
import { StepperDialog } from "./StepperDialog";
import { SuccessCriterion, TimelinePhase } from "./MVPScopeDefinition";

import { useProjectStore } from "@/store";
import { useAIStore } from "@/hooks/useAIStore";
import { generateId } from "@/lib/utils";
import TabList from "@/features/common/components/TabList";
import { SectionTab } from "@/components/ui/section-tab";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  LoadingState,
  ErrorState,
} from "@/features/common/components/LoadingAndErrorState";
import { useProductDesign } from "@/hooks/features/useProductDesign";
import { useProductDevelopment } from "@/hooks/features/useProductDevelopment";
import { useToast } from "@/components/ui/use-toast";
import { ProductProblem, ProductSolution, ProductEvidence } from "@/store/types";

const tabs = [
  {
    id: "problems",
    label: "Problem-Solution Fit",
    icon: <Lightbulb className="h-4 w-4 mr-2" />,
  },
  {
    id: "wireframes",
    label: "Wireframes",
    icon: <Layout className="h-4 w-4 mr-2" />,
  },
  {
    id: "features",
    label: "Feature Map",
    icon: <MapPin className="h-4 w-4 mr-2" />,
  },
  {
    id: "journey",
    label: "User Journey",
    icon: <Map className="h-4 w-4 mr-2" />,
  },
];

// Animation variants for the tab content
const tabContentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: "easeIn",
      when: "afterChildren",
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

export const ProductDesign: React.FC = () => {
  const { currentData, comparisonMode, stagedData } = useProjectStore();
  const { toast } = useToast();
  const projectId = currentData?.project?.id;

 

  const [activeTab, setActiveTab] = useState("wireframes");
  const [showInfo, setShowInfo] = useState<{ [key: string]: boolean }>({
    wireframes: false,
    features: false,
    journey: false,
    problems: false,
  });

  // Use the product design hook for wireframes, features, and journey
  const {
    data,
    isLoading: isProductDesignLoading,
    error: productDesignError,
    addWireframe,
    updateWireframe,
    deleteWireframe,
    addFeature,
    updateFeature,
    deleteFeature,
    addJourneyStage,
  } = useProductDesign(projectId);

  // Use the product development hook for problems, solutions, and evidence
  const {
    data: developmentData,
    isLoading: isDevelopmentLoading,
    error: developmentError,
    addProblem,
    updateProblem,
    deleteProblem,
    addSolution,
    updateSolution,
    deleteSolution,
    addEvidence,
    updateEvidence,
    deleteEvidence,
  } = useProductDevelopment(projectId);

  // Combine loading and error states
  const isLoading = isProductDesignLoading || isDevelopmentLoading;
  const error = productDesignError || developmentError;

  // Single handler for tab changes to avoid confusion
  const handleTabChange = useCallback((value: string) => {
    console.log("Tab change requested:", value);
    setActiveTab(value);
  }, []);

  // Get current data from the hook - memoized with all dependencies
  const uiData = useMemo(
    () => ({
      wireframes: data?.wireframes || [],
      features: data?.features || [],
      journeyStages: data?.journey?.stages || [],
      problems: developmentData?.problems || [],
      solutions: developmentData?.solutions || [],
      evidence: developmentData?.evidence || [],
      mvps: developmentData?.mvps || [],
      mvpFeatures: developmentData?.mvpFeatures || []
    }),
    [
      data?.wireframes, 
      data?.features, 
      data?.journey?.stages, 
      developmentData?.problems, 
      developmentData?.solutions, 
      developmentData?.evidence,
      developmentData?.mvps,
      developmentData?.mvpFeatures
    ]
  );

  // Memoize the problem-solution data for ProblemSolutionFit component
  const problemSolutionProps = useMemo(() => ({
    problems: uiData.problems,
    solutions: uiData.solutions,
    evidence: uiData.evidence,
    evidenceLinks: developmentData?.evidenceLinks || [],
    projectId,
    isLoading: isDevelopmentLoading,
    error: developmentError,
  }), [
    uiData.problems,
    uiData.solutions,
    uiData.evidence,
    developmentData?.evidenceLinks,
    projectId,
    isDevelopmentLoading,
    developmentError,
  ]);

  // Memoize handler functions for the ProblemSolutionFit component
  const problemSolutionHandlers = useMemo(() => ({
    onAddProblem: addProblem,
    onUpdateProblem: updateProblem,
    onDeleteProblem: deleteProblem,
    onAddSolution: addSolution,
    onUpdateSolution: updateSolution,
    onDeleteSolution: deleteSolution,
    onAddEvidence: addEvidence,
    onUpdateEvidence: updateEvidence,
    onDeleteEvidence: deleteEvidence,
  }), [
    addProblem,
    updateProblem,
    deleteProblem,
    addSolution,
    updateSolution,
    deleteSolution,
    addEvidence,
    updateEvidence,
    deleteEvidence,
  ]);

  // Handle adding a new wireframe - with mounted check
  const handleAddWireframe = useCallback(async () => {
    if (!projectId) return;
  
    try {
      await addWireframe({
        project_id: projectId,
        name: "New Wireframe",
        description: "",
        image_url: null,
        screen_type: "desktop",
        order_index: uiData.wireframes.length,
        tags: [],
      });

      
      toast({
        title: "Wireframe added",
        description: "New wireframe has been created successfully.",
        variant: "default",
      });
    } catch (err) {
      
      toast({
        title: "Error adding wireframe",
        description:
          err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  }, [projectId, addWireframe, uiData.wireframes.length, toast]);
  
  // Handle adding a new feature
  const handleAddFeature = useCallback(async (
    priority: "must" | "should" | "could" | "wont" = "should"
  ) => {
    if (!projectId) return;

    try {
      await addFeature({
        project_id: projectId,
        name: "New Feature",
        description: "",
        priority,
        status: "planned",
        effort: 2,
        impact: 2,
        tags: [],
        notes: "",
      });



      toast({
        title: "Feature added",
        description: "New feature has been created successfully.",
        variant: "default",
      });
    } catch (err) {
      toast({
        title: "Error adding feature",
        description:
          err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  }, [projectId, addFeature, toast]);
  
  // Handle adding a new journey stage
  const handleAddJourneyStage = useCallback(async () => {
    if (!projectId) return;

    try {
      await addJourneyStage({
        project_id: projectId,
        name: "New Stage",
        description: "",
        completed: false,
        order_index: uiData.journeyStages.length,
      });


      toast({
        title: "Journey stage added",
        description: "New journey stage has been created successfully.",
        variant: "default",
      });
    } catch (err) {
      toast({
        title: "Error adding journey stage",
        description:
          err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  }, [projectId, addJourneyStage, uiData.journeyStages.length, toast]);

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <ErrorState error={error} onRetry={() => window.location.reload()} />
        </CardContent>
      </Card>
    );
  }

  // Render tabs and content
  return (
    <TooltipProvider>
      <div className="">
        {/* Dashboard Overview */}
        <div className="mb-6">
          <div className="grid grid-cols-4 gap-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Layout className="h-4 w-4 mr-2 text-blue-500" />
                  Wireframes & Visuals
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 ml-1"
                      >
                        <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent side="top" className="w-80">
                      <p className="text-xs">
                        Wireframes help visualize your product's interface
                        before development. They're useful for getting early
                        feedback on layouts and user flows.
                      </p>
                    </HoverCardContent>
                  </HoverCard>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <p className="text-2xl font-bold">{uiData.wireframes.length}</p>
                  <p className="text-xs text-gray-500 ml-2">Total wireframes</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-green-500" />
                  Feature Planning
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 ml-1"
                      >
                        <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent side="top" className="w-80">
                      <p className="text-xs">
                        Feature mapping helps prioritize what to build. Focus on
                        "Must Have" features for your MVP to validate your core
                        concept quickly.
                      </p>
                    </HoverCardContent>
                  </HoverCard>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <p className="text-2xl font-bold">
                    {
                      uiData.features.filter(
                        (feature) => feature.priority === "must"
                      ).length
                    }{" "}
                    / {uiData.features.length}
                  </p>
                  <p className="text-xs text-gray-500 ml-2">
                    MVP / Total features
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Map className="h-4 w-4 mr-2 text-purple-500" />
                  User Journey
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 ml-1"
                      >
                        <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent side="top" className="w-80">
                      <p className="text-xs">
                        User journey maps visualize the complete user experience
                        from start to finish. Identify pain points and
                        opportunities to improve the user experience.
                      </p>
                    </HoverCardContent>
                  </HoverCard>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <p className="text-2xl font-bold">
                    {uiData.journeyStages.length}
                  </p>
                  <p className="text-xs text-gray-500 ml-2">Total stages</p>
                </div>
              </CardContent>
            </Card>

            <StepperDialog
              trigger={
                <Card className="shadow-sm relative overflow-hidden cursor-pointer border-primary/50 hover:bg-primary/5 transition-colors group">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Play className="h-4 w-4 mr-2 text-primary" />
                      Product Development
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-muted-foreground">Start guided product development</p>
                      <ArrowRight className="h-4 w-4 ml-2 text-primary group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />
                </Card>
              }
            />
          </div>
        </div>
        
        <LayoutGroup id="product-design-tabs">
          <div className="space-y-8">
            <Tabs
              defaultValue={activeTab}
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <TabList
                  tabs={tabs}
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                />
              </div>

              <AnimatePresence mode="wait">
                
                {/* Problem-Solution Fit Tab */}
                {activeTab === "problems" && (
                  <motion.div
                    key="problems"
                    variants={tabContentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="w-full"
                    layoutId="tab-content"
                  >
                    <TabsContent
                      value="problems"
                      className="mt-0 border-none shadow-none"
                      forceMount
                    >
                      <SectionTab
                        icon={
                          <Lightbulb className="h-5 w-5 text-primary-700" />
                        }
                        title="Problem-Solution Fit"
                        description="Define and validate the problems you're solving and your proposed solutions"
                        count={uiData.problems ? uiData.problems.length : 0}
                        hasItems={
                          uiData.problems ? uiData.problems.length > 0 : false
                        }
                        emptyState={{
                          description:
                            "Define the problems your customers are facing and how your solution addresses them.",
                        }}
                        isCustomEmptyState={true}
                        helper={{
                          icon: <Info className="h-5 w-5" />,
                          title: "Problem-Solution Fit",
                          content: (
                            <div className="space-y-3">
                              <p className="text-dark-700">
                                Problem-Solution Fit is the foundation of
                                product success:
                              </p>
                              <ul className="list-disc list-inside text-dark-600 space-y-1">
                                <li>
                                  Identify real customer problems through
                                  research
                                </li>
                                <li>
                                  Validate problems before building solutions
                                </li>
                                <li>Create hypotheses that can be tested</li>
                                <li>
                                  Gather evidence to support your assumptions
                                </li>
                              </ul>
                            </div>
                          ),
                        }}
                      >
                        <ProblemSolutionFit 
                          {...problemSolutionProps}
                          {...problemSolutionHandlers}
                        />
                      </SectionTab>
                    </TabsContent>
                  </motion.div>
                )}
                
                {/* Wireframes Tab - Existing */}
                {activeTab === "wireframes" && (
                  <motion.div
                    key="wireframes"
                    variants={tabContentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="w-full"
                    layoutId="tab-content"
                  >
                    <TabsContent
                      value="wireframes"
                      className="mt-0 border-none shadow-none"
                      forceMount
                    >
                      <SectionTab
                        icon={<Layout className="h-5 w-5 text-primary-700" />}
                        title="Wireframes"
                        description="Visualize your product's interface and user flow"
                        onCreate={() => handleAddWireframe()}
                        count={uiData.wireframes.length}
                        helper={{
                          icon: <Info className="h-5 w-5" />,
                          title: "Creating Effective Wireframes",
                          content: (
                            <div className="space-y-3">
                              <p className="text-dark-700">
                                Wireframes help you:
                              </p>
                              <ul className="list-disc list-inside text-dark-600 space-y-1">
                                <li>
                                  Visualize page layouts without visual design
                                  distractions
                        </li>
                                <li>Test user flows before development</li>
                                <li>Get early stakeholder feedback</li>
                                <li>Define content hierarchy and structure</li>
                                <li>
                                  Plan responsive layouts and interactions
                        </li>
                      </ul>
                    </div>
                          ),
                        }}
                        hasItems={uiData.wireframes.length > 0}
                        emptyState={{
                          description:
                            "Start by adding wireframes to visualize your product's interface and user flows.",
                        }}
                      >
                        <WireframeGallery
                          wireframes={uiData.wireframes}
                          onAdd={handleAddWireframe}
                          onSelect={(id) => console.log(id)}
                        />
                      </SectionTab>
          </TabsContent>
                  </motion.div>
                )}

                {/* Features Tab - Enhanced with MVP Scope Definition */}
                {activeTab === "features" && (
                  <motion.div
                    key="features"
                    variants={tabContentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="w-full"
                    layoutId="tab-content"
                  >
                    <TabsContent
                      value="features"
                      className="mt-0 border-none shadow-none"
                      forceMount
                    >
                      <SectionTab
                        icon={<MapPin className="h-5 w-5 text-primary-700" />}
                        title="Feature Map"
                        description="Define and prioritize your product features using the MoSCoW method"
                        onCreate={() => handleAddFeature("must")}
                        count={uiData.features.length}
                        helper={{
                          icon: <Info className="h-5 w-5" />,
                          title: "MoSCoW Prioritization",
                          content: (
                            <div className="space-y-3">
                              <p className="text-dark-700">
                                The MoSCoW method helps prioritize features:
                              </p>
                              <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-red-50 border border-red-100 rounded">
                                  <h5 className="text-xs font-medium text-red-800">
                                    Must Have
                                  </h5>
                                  <p className="text-xs text-red-600">
                                    Critical for MVP
                                  </p>
                        </div>
                        <div className="p-2 bg-yellow-50 border border-yellow-100 rounded">
                                  <h5 className="text-xs font-medium text-yellow-800">
                                    Should Have
                                  </h5>
                                  <p className="text-xs text-yellow-600">
                                    Important but not critical
                                  </p>
                        </div>
                        <div className="p-2 bg-green-50 border border-green-100 rounded">
                                  <h5 className="text-xs font-medium text-green-800">
                                    Could Have
                                  </h5>
                                  <p className="text-xs text-green-600">
                                    Nice to have
                                  </p>
                        </div>
                        <div className="p-2 bg-gray-50 border border-gray-100 rounded">
                                  <h5 className="text-xs font-medium text-gray-800">
                                    Won't Have
                                  </h5>
                                  <p className="text-xs text-gray-600">
                                    Future consideration
                                  </p>
                        </div>
                      </div>
                    </div>
                          ),
                        }}
                        hasItems={uiData.features.length > 0}
                        emptyState={{
                          description:
                            "Define and prioritize your product features using the MoSCoW method.",
                        }}
                      >
                        <div className="space-y-8">
                          {/* Feature Map */}
                        <FeatureMap
                          features={uiData.features}
                          onAddFeature={handleAddFeature}
                          onEditFeature={(id) => console.log(id)}
                        />

                          {/* MVP Scope Definition */}
                          <Card>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center">
                                  <Puzzle className="h-5 w-5 mr-2 text-primary" />
                                  MVP Scope Definition
                                </CardTitle>
                                <StepperDialog
                                  trigger={
                                    <Button size="sm" variant="outline" className="gap-2">
                                      <Play className="h-4 w-4" />
                                      <span>Start Guided Flow</span>
                                    </Button>
                                  }
                                />
                              </div>
                              <CardDescription>
                                Define the minimal viable product scope and plan
                                your product roadmap
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <MVPScopeDefinition
                                features={uiData.features}
                                onUpdateFeature={(id, updates) => updateFeature({ id, data: updates })}
                                onUpdateMVPScope={(featureIds) => {
                                  // Handle MVP scope update
                                  console.log("Updating MVP scope", featureIds);
                                }}
                                selectedMVPFeatures={
                                  uiData.mvpFeatures?.map(mvpf => mvpf.feature_id).filter((id): id is string => id !== null) || []
                                }
                                onSaveSuccessCriteria={(criteria) => {
                                  // Handle success criteria
                                  console.log("Saving success criteria", criteria);
                                }}
                                successCriteria={[]} // Connect to actual data when available
                                onSaveTimeline={(timeline) => {
                                  // Handle timeline
                                  console.log("Saving timeline", timeline);
                                }}
                                timeline={[]} // Connect to actual data when available
                              />
                            </CardContent>
                          </Card>
                        </div>
                      </SectionTab>
          </TabsContent>
                  </motion.div>
                )}

                {/* User Journey Tab - Existing */}
                {activeTab === "journey" && (
                  <motion.div
                    key="journey"
                    variants={tabContentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="w-full"
                    layoutId="tab-content"
                  >
                    <TabsContent
                      value="journey"
                      className="mt-0 border-none shadow-none"
                      forceMount
                    >
                      <SectionTab
                        icon={<Map className="h-5 w-5 text-primary-700" />}
                        title="User Journey"
                        description="Map out the complete user experience with your product"
                        onCreate={() => handleAddJourneyStage()}
                        count={uiData.journeyStages.length}
                        helper={{
                          icon: <Info className="h-5 w-5" />,
                          title: "User Journey Mapping",
                          content: (
                            <div className="space-y-3">
                              <p className="text-dark-700">
                                Key elements of journey mapping:
                              </p>
                              <ul className="list-disc list-inside text-dark-600 space-y-1">
                                <li>
                                  Define clear user stages and touchpoints
                        </li>
                                <li>Identify pain points and opportunities</li>
                                <li>Map user emotions and expectations</li>
                                <li>
                                  Connect stages to features and solutions
                        </li>
                                <li>Track user progress and success metrics</li>
                      </ul>
                    </div>
                          ),
                        }}
                        hasItems={uiData.journeyStages.length > 0}
                        emptyState={{
                          description:
                            "Create a user journey map to visualize the complete user experience with your product.",
                        }}
                      >
                <UserJourneyMap 
                          stages={uiData.journeyStages}
                  onAddStage={handleAddJourneyStage} 
                  onEditStage={(id) => console.log(id)} 
                />
                      </SectionTab>
          </TabsContent>
                  </motion.div>
                )}
              </AnimatePresence>
        </Tabs>
          </div>
        </LayoutGroup>
      </div>
    </TooltipProvider>
  );
};
