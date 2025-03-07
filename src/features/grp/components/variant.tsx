import React, { useState, useMemo } from "react";
import {
  Users,
  PlusCircle,
  LightbulbIcon,
  ChevronDown,
  Info,
  PencilRuler,
  LineChart,
  ArrowRight,
  Lightbulb,
  Check,
  X,
  BarChart2,
  Banknote,
  PieChart,
  Share2,
  Edit3,
  Target,
  Activity,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAppStore, useProjectStore } from "@/store";
import { useAIStore } from "@/hooks/useAIStore";
import { GrpCategory, GrpSection, GrpItem } from "@/store/types";
import { generateId } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { useGRP } from "@/hooks/features/useGRP";
import { useToast } from "@/components/ui/use-toast";
import {
  LoadingState,
  ErrorState,
} from "@/features/common/components/LoadingAndErrorState";
import {
  GRPModel as GRPModelType,
  GRPCategory as GRPCategoryType,
} from "@/lib/services/features/grp-service";

// Extended types for UI that add status for comparison mode
interface ExtendedGrpCategory extends GrpCategory {
  status?: "new" | "modified" | "unchanged" | "removed";
}

interface ExtendedGrpSection extends GrpSection {
  status?: "new" | "modified" | "unchanged" | "removed";
}

interface ExtendedGrpItem extends GrpItem {
  status?: "new" | "modified" | "unchanged" | "removed";
  categoryType?: string;
  sectionName?: string;
}

// Define UI data structure with nested relationships
interface GRPUIData {
  categories: {
    [id: string]: ExtendedGrpCategory & {
      sections: {
        [id: string]: ExtendedGrpSection & {
          items: ExtendedGrpItem[];
        };
      };
    };
  };
}

export const GRPModel: React.FC = () => {
  const { currentData } = useProjectStore();
  const projectId = currentData.project?.id;
  const { toast } = useToast();

  const {
    data,
    isLoading,
    error,
    addItem,
    updateItem,
    deleteItem,
    getAllItems,
    getItemChangeType,
    getCategoryChangeType,
    getSectionChangeType,
    isDiffMode,
  } = useGRP(projectId);

  const { acceptAIChanges, rejectAIChanges } = useAIStore();
  const { expandedCell, setExpandedCell } = useAppStore();
  const [submitting, setSubmitting] = useState<string | null>(null);

  const handleCellClick = (cell: string) => {
    setExpandedCell(expandedCell === cell ? null : cell);
  };

  // Track which help sections are expanded
  const [expandedHelp, setExpandedHelp] = useState<{
    generation: boolean;
    remuneration: boolean;
    partage: boolean;
  }>({
    generation: false,
    remuneration: false,
    partage: false,
  });

  // Handle adding a new item
  const handleAddItem = async (
    categoryType: GRPCategoryType,
    sectionName: string,
    title: string = "New Item"
  ) => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "No active project found",
        variant: "destructive",
      });
      return;
    }

    const itemId = `${categoryType}-${sectionName}-${Date.now()}`;
    setSubmitting(itemId);

    try {
      const result = await addItem(
        categoryType, // Pass the GRPCategory string directly (generation, remuneration, partage)
        sectionName,
        {
          title,
          description: "",
          percentage: 0,
          order_index: 0,
          created_by: null,
        }
      );

      if (result) {
        toast({
          title: "Success",
          description: "Item added successfully",
          variant: "default",
        });
      } else {
        throw new Error("Failed to add item");
      }
    } catch (err) {
      toast({
        title: "Error adding item",
        description:
          err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setSubmitting(null);
    }
  };

  // Handle updating an item
  const handleUpdateItem = async (
    categoryType: GRPCategoryType,
    sectionName: string,
    itemId: string,
    updates: Partial<{
      title: string;
      description: string;
      percentage: number;
    }>
  ) => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "No active project found",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(itemId);

    try {
      const result = await updateItem(
        categoryType, // Pass the GRPCategory string directly
        sectionName,
        itemId,
        updates
      );

      if (result) {
        toast({
          title: "Success",
          description: "Item updated successfully",
          variant: "default",
        });
      } else {
        throw new Error("Failed to update item");
      }
    } catch (err) {
      toast({
        title: "Error updating item",
        description:
          err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setSubmitting(null);
    }
  };

  // Handle deleting an item
  const handleDeleteItem = async (
    categoryType: GRPCategoryType,
    sectionName: string,
    itemId: string
  ) => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "No active project found",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(itemId);

    try {
      const result = await deleteItem(
        categoryType, // Pass the GRPCategory string directly
        sectionName,
        itemId
      );

      if (result) {
        toast({
          title: "Success",
          description: "Item deleted successfully",
          variant: "default",
        });
      } else {
        throw new Error("Failed to delete item");
      }
    } catch (err) {
      toast({
        title: "Error deleting item",
        description:
          err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setSubmitting(null);
    }
  };

  // Toggle help section visibility
  const toggleHelp = (section: keyof typeof expandedHelp) => {
    setExpandedHelp((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Helper to get icon for category type
  const getCategoryIcon = (type: string) => {
    switch (type) {
      case "generation":
        return <Lightbulb className="h-5 w-5 text-blue-500" />;
      case "remuneration":
        return <Banknote className="h-5 w-5 text-green-500" />;
      case "partage":
        return <Share2 className="h-5 w-5 text-purple-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <LoadingState message="Loading GRP model data..." />
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <ErrorState error={error} onRetry={() => window.location.reload()} />
        </CardContent>
      </Card>
    );
  }

  // Convert data to UI structure
  const dataStructure = useMemo(() => {
    // Default empty data structure
    const result: GRPUIData = { categories: {} };

    // Get categories from currentData
    const categories = currentData.grpCategories || [];
    const sections = currentData.grpSections || [];
    const items = currentData.grpItems || [];

    // First build the category structure
    categories.forEach((category) => {
      result.categories[category.id] = {
        ...category,
        sections: {},
      };
    });

    // Then add sections to their categories
    sections.forEach((section) => {
      const categoryId = section.category_id;
      if (categoryId && result.categories[categoryId]) {
        result.categories[categoryId].sections[section.id] = {
          ...section,
          items: [],
        };
      }
    });

    // Then add items to their sections
    items.forEach((item) => {
      const sectionId = item.section_id;
      if (sectionId) {
        // Find the category that contains this section
        const categoryId = Object.keys(result.categories).find(
          (catId) => result.categories[catId].sections[sectionId] !== undefined
        );

        if (categoryId) {
          result.categories[categoryId].sections[sectionId].items.push(item);
        }
      }
    });

    return result;
  }, [currentData]);

  // Get staged data using data from GRP hook
  const stagedUIData = useMemo(() => {
    if (!isDiffMode || !data) return null;

    // Default empty data structure
    const result: GRPUIData = { categories: {} };

    // Convert the GRPModel structure to our UI data structure
    Object.entries(data).forEach(([categoryType, categorySections]) => {
      // Find category in currentData
      const category = currentData.grpCategories.find(
        (c) => c.category_type === categoryType
      );
      if (category) {
        result.categories[category.id] = {
          ...category,
          sections: {},
        };

        // For each section in this category
        Object.entries(categorySections as Record<string, GrpItem[]>).forEach(
          ([sectionName, sectionItems]) => {
            // Find section in currentData
            const section = currentData.grpSections.find(
              (s) =>
                s.category_id === category.id &&
                s.name?.toLowerCase() === sectionName.toLowerCase()
            );

            if (section) {
              result.categories[category.id].sections[section.id] = {
                ...section,
                items: sectionItems.map((item: GrpItem) => ({
                  ...item,
                  section_id: section.id,
                })),
              };
            }
          }
        );
      }
    });

    return result;
  }, [isDiffMode, data, currentData]);

  // Helper function to determine if an item is new/modified in comparison mode
  const getItemStatus = (
    itemType: "category" | "section" | "item",
    itemId: string
  ): "new" | "modified" | "unchanged" | "removed" => {
    if (!isDiffMode || !stagedUIData) return "unchanged";

    if (itemType === "category") {
      const currentItem = Object.values(dataStructure.categories).find(
        (item) => item.id === itemId
      );
      const stagedItem = stagedUIData
        ? Object.values(stagedUIData.categories).find(
            (item) => item.id === itemId
          )
        : null;

      if (!currentItem && stagedItem) return "new";
      if (currentItem && !stagedItem) return "removed";
      if (currentItem && stagedItem) {
        // Compare only the category properties, not the nested sections
        const currentCopy = { ...currentItem };
        const stagedCopy = { ...stagedItem };
        const { sections: currentSections, ...currentProps } = currentCopy;
        const { sections: stagedSections, ...stagedProps } = stagedCopy;

        return JSON.stringify(currentProps) !== JSON.stringify(stagedProps)
          ? "modified"
          : "unchanged";
      }
    } else if (itemType === "section") {
      // Find the section in the current data
      let currentItem = null;
      let stagedItem = null;

      // Search through all categories for the section
      for (const catId in dataStructure.categories) {
        const section = dataStructure.categories[catId].sections[itemId];
        if (section) {
          currentItem = section;
          break;
        }
      }

      // Search through all categories in staged data for the section
      if (stagedUIData) {
        for (const catId in stagedUIData.categories) {
          const section = stagedUIData.categories[catId].sections[itemId];
          if (section) {
            stagedItem = section;
            break;
          }
        }
      }

      if (!currentItem && stagedItem) return "new";
      if (currentItem && !stagedItem) return "removed";
      if (currentItem && stagedItem) {
        // Compare only the section properties, not the nested items
        const currentCopy = { ...currentItem };
        const stagedCopy = { ...stagedItem };
        const { items: currentItems, ...currentProps } = currentCopy;
        const { items: stagedItems, ...stagedProps } = stagedCopy;

        return JSON.stringify(currentProps) !== JSON.stringify(stagedProps)
          ? "modified"
          : "unchanged";
      }
    } else if (itemType === "item") {
      return getItemChangeType(itemId) as
        | "new"
        | "modified"
        | "unchanged"
        | "removed";
    }

    return "unchanged";
  };

  // Calculate analytics stats
  const stats = useMemo(() => {
    let totalCategories = 0;
    let totalSections = 0;
    let totalItems = 0;

    // Count all categories, sections, and items
    Object.values(dataStructure.categories).forEach((category) => {
      totalCategories++;

      Object.values(category.sections).forEach((section) => {
        totalSections++;
        totalItems += section.items.length;
      });
    });

    const completionPercentage = Math.min(
      Math.round((totalItems / (9 * 5)) * 100),
      100
    );

    return {
      totalCategories,
      totalSections,
      totalItems,
      completionPercentage,
    };
  }, [dataStructure]);

  // Handle adding a new category
  const handleAddCategory = async (categoryType: string) => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "No active project found",
        variant: "destructive",
      });
      return;
    }

    // We don't have direct category creation in the hook, so we'll use store actions here
    // This should be replaced with proper API once available

    toast({
      title: "Success",
      description: "Category type " + categoryType + " already exists",
      variant: "default",
    });
  };

  // Handle adding a new section
  const handleAddSection = async (categoryId: string) => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "No active project found",
        variant: "destructive",
      });
      return;
    }

    // We don't have direct section creation in the hook, so we'll use store actions here
    // This should be replaced with proper API once available

    toast({
      title: "Success",
      description: "Sections are predefined in the GRP model",
      variant: "default",
    });
  };

  // Helper to filter categories by type
  const getCategoriesByType = (type: string) => {
    return Object.values(dataStructure.categories).filter(
      (cat) => cat.category_type === type
    );
  };

  const renderGRPCell = (
    section: GRPCategoryType,
    subsection: string,
    cellId: string,
    title: string,
    icon: React.ReactNode,
    color: string,
    prompt: string
  ) => {
    // Find the category and section to get the items
    const category = currentData.grpCategories.find(
      (c) => c.category_type === section
    );
    const sectionObj = category
      ? currentData.grpSections.find(
          (s) =>
            s.category_id === category.id &&
            s.name?.toLowerCase() === subsection.toLowerCase()
        )
      : null;

    const items = sectionObj
      ? currentData.grpItems.filter((item) => item.section_id === sectionObj.id)
      : [];

    // Map color string to specific color utility classes
    const colorClasses = {
      yellow: {
        bg: "bg-yellow-100",
        border: "border-yellow-200",
        iconBg: "bg-yellow-100",
        expandedBg: "bg-yellow-50",
      },
      blue: {
        bg: "bg-blue-100",
        border: "border-blue-200",
        iconBg: "bg-blue-100",
        expandedBg: "bg-blue-50",
      },
      green: {
        bg: "bg-green-100",
        border: "border-green-200",
        iconBg: "bg-green-100",
        expandedBg: "bg-green-50",
      },
      purple: {
        bg: "bg-purple-100",
        border: "border-purple-200",
        iconBg: "bg-purple-100",
        expandedBg: "bg-purple-50",
      },
      red: {
        bg: "bg-red-100",
        border: "border-red-200",
        iconBg: "bg-red-100",
        expandedBg: "bg-red-50",
      },
      orange: {
        bg: "bg-orange-100",
        border: "border-orange-200",
        iconBg: "bg-orange-100",
        expandedBg: "bg-orange-50",
      },
    };

    const classes = colorClasses[color as keyof typeof colorClasses];

    // Collapsed cell state
    if (expandedCell !== cellId) {
      return (
        <Card
          className={`${classes.bg} border ${classes.border} cursor-pointer transition-all hover:shadow-md h-40 rounded-lg`}
          onClick={() => handleCellClick(cellId)}
        >
          <CardContent className="p-4 flex flex-col h-full">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium">{title}</h3>
              <div className={`${classes.iconBg} p-1 rounded-full`}>{icon}</div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <p className="text-center text-sm text-gray-500">
                {items.length === 0
                  ? "Click to add items"
                  : `${items.length} item${items.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Expanded cell state
    return (
      <Card
        className={`${classes.expandedBg} border ${classes.border} transition-all hover:shadow-md h-auto rounded-lg`}
      >
        <CardHeader className="p-4 pb-2 pt-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <div className={`${classes.iconBg} p-1 rounded-full mr-2`}>
                {icon}
              </div>
              <CardTitle className="text-base font-medium">{title}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="p-1.5 h-auto text-gray-500"
              onClick={() => handleCellClick(cellId)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-xs mt-1">{prompt}</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-2 mt-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white p-2 rounded border border-gray-200 text-sm"
              >
                <div className="flex justify-between">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-gray-500">
                    {item.percentage !== null && `${item.percentage}%`}
                  </div>
                </div>
                {item.description && (
                  <p className="text-xs text-gray-600 mt-1">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="w-full border border-dashed border-gray-300 text-sm h-auto py-1.5 hover:bg-white hover:border-gray-400 text-gray-600"
              onClick={(e) => {
                e.stopPropagation();
                handleAddItem(section, subsection);
              }}
            >
              <p className="text-sm text-gray-500">
                <PlusCircle className="h-3.5 w-3.5 inline-block mr-1.5" />
                Add Item
              </p>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with title and stats */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">GRP Model</h2>
          <p className="text-gray-500 mt-1">
            The GRP model helps you analyze your business through Generation,
            Remuneration, and Partage.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {isDiffMode && (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => acceptAIChanges()}
                className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
              >
                <Check className="h-4 w-4 mr-2" />
                Accept Changes
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => rejectAIChanges()}
                className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
              >
                <X className="h-4 w-4 mr-2" />
                Reject Changes
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold text-blue-500">
              {stats.totalCategories}
            </div>
            <p className="text-gray-500 text-sm">Categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold text-green-500">
              {stats.totalSections}
            </div>
            <p className="text-gray-500 text-sm">Sections</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold text-purple-500">
              {stats.totalItems}
            </div>
            <p className="text-gray-500 text-sm">Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="flex justify-between w-full mb-2">
              <span className="text-sm text-gray-500">Completion</span>
              <span className="text-sm font-semibold">
                {stats.completionPercentage}%
              </span>
            </div>
            <Progress value={stats.completionPercentage} className="w-full" />
          </CardContent>
        </Card>
      </div>

      {/* GRP Model Tabs */}
      <Tabs defaultValue="generation">
        <TabsList className="mb-4">
          <TabsTrigger value="generation" className="flex items-center">
            <Lightbulb className="h-4 w-4 mr-2" />
            Generation
          </TabsTrigger>
          <TabsTrigger value="remuneration" className="flex items-center">
            <Banknote className="h-4 w-4 mr-2" />
            Remuneration
          </TabsTrigger>
          <TabsTrigger value="partage" className="flex items-center">
            <Share2 className="h-4 w-4 mr-2" />
            Partage
          </TabsTrigger>
        </TabsList>

        {/* Generation Tab */}
        <TabsContent value="generation">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">Generation</CardTitle>
                  <CardDescription>
                    How your business creates value
                  </CardDescription>
                </div>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Info className="h-4 w-4" />
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Generation</h4>
                      <p className="text-sm text-gray-500">
                        Value generation focuses on how your business creates
                        value through its people, value propositions, and
                        manufacturing processes.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderGRPCell(
                  "generation",
                  "porteurs",
                  "generation-porteurs",
                  "Porteurs",
                  <Users className="h-4 w-4" />,
                  "blue",
                  "Who drives value creation in your business?"
                )}
                {renderGRPCell(
                  "generation",
                  "propositionValeur",
                  "generation-proposition",
                  "Proposition de Valeur",
                  <Lightbulb className="h-4 w-4" />,
                  "blue",
                  "What value do you deliver to customers?"
                )}
                {renderGRPCell(
                  "generation",
                  "fabricationValeur",
                  "generation-fabrication",
                  "Fabrication de Valeur",
                  <PencilRuler className="h-4 w-4" />,
                  "blue",
                  "How do you create this value?"
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Remuneration Tab */}
        <TabsContent value="remuneration">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">Remuneration</CardTitle>
                  <CardDescription>
                    How your business captures value
                  </CardDescription>
                </div>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Info className="h-4 w-4" />
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Remuneration</h4>
                      <p className="text-sm text-gray-500">
                        Value capture describes how your business monetizes its
                        value proposition, including revenue sources, volume,
                        and performance metrics.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderGRPCell(
                  "remuneration",
                  "sourcesRevenus",
                  "remuneration-sources",
                  "Sources de Revenus",
                  <BarChart2 className="h-4 w-4" />,
                  "green",
                  "What are your business revenue sources?"
                )}
                {renderGRPCell(
                  "remuneration",
                  "volumeRevenus",
                  "remuneration-volume",
                  "Volume de Revenus",
                  <PieChart className="h-4 w-4" />,
                  "green",
                  "What is your revenue volume and structure?"
                )}
                {renderGRPCell(
                  "remuneration",
                  "performance",
                  "remuneration-performance",
                  "Performance",
                  <Activity className="h-4 w-4" />,
                  "green",
                  "How do you measure business performance?"
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Partage Tab */}
        <TabsContent value="partage">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">Partage</CardTitle>
                  <CardDescription>
                    How your business shares value
                  </CardDescription>
                </div>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Info className="h-4 w-4" />
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Partage</h4>
                      <p className="text-sm text-gray-500">
                        Value sharing explores how your business distributes
                        value among stakeholders, conventions, and the broader
                        ecosystem.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderGRPCell(
                  "partage",
                  "partiesPrenantes",
                  "partage-parties",
                  "Parties Prenantes",
                  <Users className="h-4 w-4" />,
                  "purple",
                  "Who are your key stakeholders?"
                )}
                {renderGRPCell(
                  "partage",
                  "conventions",
                  "partage-conventions",
                  "Conventions",
                  <Target className="h-4 w-4" />,
                  "purple",
                  "What agreements govern your business relationships?"
                )}
                {renderGRPCell(
                  "partage",
                  "ecosysteme",
                  "partage-ecosysteme",
                  "Écosystème",
                  <Share2 className="h-4 w-4" />,
                  "purple",
                  "How does your business interact with its ecosystem?"
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
