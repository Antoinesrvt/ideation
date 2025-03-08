import React, { useState, useMemo } from "react";
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
} from "lucide-react";
import { WireframeGallery } from "./WireframeGallery";
import { FeatureMap } from "./FeatureMap";
import { UserJourneyMap } from "./UserJourneyMap";

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
import { useToast } from "@/components/ui/use-toast";

const tabs = [
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

  const [activeTab, setActiveTab] = useState("wireframes");
  const [showInfo, setShowInfo] = useState<{ [key: string]: boolean }>({
    wireframes: false,
    features: false,
    journey: false,
  });

  // Track which help sections are expanded
  const [expandedHelp, setExpandedHelp] = useState<{
    wireframes: boolean;
    features: boolean;
    journey: boolean;
  }>({
    wireframes: false,
    features: false,
    journey: false,
  });

  // Track which journey stage is currently selected
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);

  // Use the hook with proper error handling
  const {
    data,
    isLoading,
    error,

    // Wireframes
    addWireframe,
    updateWireframe,
    deleteWireframe,

    // Features
    addFeature,
    updateFeature,
    deleteFeature,

    // Journey Stages
    addJourneyStage,
    updateJourneyStage,
    deleteJourneyStage,

    // Diff helpers
    getWireframeChangeType,
    getFeatureChangeType,
    getJourneyStageChangeType,
    isDiffMode,
  } = useProductDesign(currentData.project?.id);

  // Get current data from the hook
  const uiData = useMemo(
    () => ({
      wireframes: data?.wireframes || [],
      features: data?.features || [],
      journeyStages: data?.journey?.stages || [],
    }),
    [data]
  );

  // Helper function to determine if an item is new/modified in comparison mode
  const getItemStatus = (
    section: "wireframes" | "features" | "journeyStages",
    itemId: string
  ): "new" | "modified" | "unchanged" | "removed" => {
    if (!isDiffMode) return "unchanged";

    if (section === "wireframes") {
      return getWireframeChangeType(itemId) as
        | "new"
        | "modified"
        | "unchanged"
        | "removed";
    } else if (section === "features") {
      return getFeatureChangeType(itemId) as
        | "new"
        | "modified"
        | "unchanged"
        | "removed";
    } else if (section === "journeyStages") {
      return getJourneyStageChangeType(itemId) as
        | "new"
        | "modified"
        | "unchanged"
        | "removed";
    }

    return "unchanged";
  };


  // Handle adding a new wireframe
  const handleAddWireframe = async () => {
    const projectId = currentData.project?.id || "";

    try {
      await addWireframe({
        project_id: projectId,
        name: "New Wireframe",
        description: "",
        image_url: null,
        screen_type: "desktop",
        order_index: uiData.wireframes.length,
        tags: [],
        created_by: null,
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
  };

  // Handle adding a new feature
  const handleAddFeature = async (
    priority: "must" | "should" | "could" | "wont" = "should"
  ) => {
    const projectId = currentData.project?.id || "";

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
        created_by: null,
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
  };

  // Handle adding a new journey stage
  const handleAddJourneyStage = async () => {
    const projectId = currentData.project?.id || "";

    try {
      await addJourneyStage({
        project_id: projectId,
        name: "New Stage",
        description: "",
        completed: false,
        order_index: uiData.journeyStages.length,
        created_by: null,
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
  };

  console.log("Wireframes data:", data.wireframes);

  // Render tabs and content
  return (
    <TooltipProvider>
      <div className="">
        {/* Dashboard Overview */}
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-4">
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
                  <p className="text-2xl font-bold">
                    {data.wireframes.length}
                  </p>
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
                    {data.features.filter((feature) => feature.priority === "must").length} / {data.features.length}
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
                    {data.journey.stages.length}
                  </p>
                  <p className="text-xs text-gray-500 ml-2">Total stages</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <LayoutGroup id="product-design-tabs">
          <div className="space-y-6">
            <Tabs
              defaultValue="wireframes"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <TabList
                  tabs={tabs}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
              </div>

              <AnimatePresence mode="wait">
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
                        onCreate={handleAddWireframe}
                        count={data.wireframes.length}
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
                        hasItems={data.wireframes.length > 0}
                        emptyState={{
                          description:
                            "Start by adding wireframes to visualize your product's interface and user flows.",
                        }}
                      >
                        <WireframeGallery
                          wireframes={data.wireframes}
                          onAdd={handleAddWireframe}
                          onSelect={(id) => console.log(id)}
                        />
                      </SectionTab>
                    </TabsContent>
                  </motion.div>
                )}

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
                        description="Prioritize features for your product roadmap"
                        onCreate={handleAddFeature}
                        count={data.features.length}
                        helper={{
                          icon: <Info className="h-5 w-5" />,
                          title: "MoSCoW Prioritization Method",
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
                        hasItems={data.features.length > 0}
                        emptyState={{
                          description:
                            "Define and prioritize your product features using the MoSCoW method.",
                        }}
                      >
                        <FeatureMap
                          features={data.features}
                          onAddFeature={handleAddFeature}
                          onEditFeature={(id) => console.log(id)}
                        />
                      </SectionTab>
                    </TabsContent>
                  </motion.div>
                )}

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
                        description="Map out your user's experience with your product"
                        onCreate={handleAddJourneyStage}
                        count={data.journey.stages.length}
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
                        hasItems={data.journey.stages.length > 0}
                        emptyState={{
                          description:
                            "Create a user journey map to visualize the complete user experience with your product.",
                        }}
                      >
                        <UserJourneyMap
                          stages={data.journey.stages}
                          selectedStage={selectedStageId || undefined}
                          onSelectStage={setSelectedStageId}
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
