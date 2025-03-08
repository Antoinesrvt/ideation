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


 


  const renderGRPCell = (
    section: GRPCategoryType,
    subsection: string,
    cellId: string,
    title: string,
    icon: React.ReactNode,
    color: string,
    prompt: string
  ) => {
    const sectionData = dataStructure.categories[section] || {};
    const items = (sectionData[subsection as keyof typeof sectionData] ||
      []) as GrpItem[];

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
    <div className="">
      {/* GRP Model - Grid Layout */}
      <div className="space-y-4">
        {/* G Row - Génération de la valeur (yellow) */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-yellow-400 text-white p-6 rounded-lg flex flex-col items-center justify-center text-center">
            <span className="text-6xl font-bold">G</span>
            <div className="mt-2">
              <p className="font-semibold">Génération</p>
              <p>de la valeur</p>
            </div>
          </div>

          {renderGRPCell(
            "generation",
            "porteurs",
            "G1",
            "Porteur(s)",
            <Users className="h-6 w-6" />,
            "yellow",
            "Who are the project leaders and what are their roles?"
          )}

          {expandedCell !== "G1" && (
            <>
              {renderGRPCell(
                "generation",
                "propositionValeur",
                "G2",
                "Proposition de valeur",
                <Target className="h-6 w-6" />,
                "yellow",
                "What value does your solution provide to customers?"
              )}

              {renderGRPCell(
                "generation",
                "fabricationValeur",
                "G3",
                "Fabrication de la valeur",
                <Activity className="h-6 w-6" />,
                "yellow",
                "How is your solution produced and delivered?"
              )}
            </>
          )}
        </div>

        {/* R Row - Rémunération de la valeur (blue) */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-blue-500 text-white p-6 rounded-lg flex flex-col items-center justify-center text-center">
            <span className="text-6xl font-bold">R</span>
            <div className="mt-2">
              <p className="font-semibold">Rémunération</p>
              <p>de la valeur</p>
            </div>
          </div>

          {renderGRPCell(
            "remuneration",
            "sourcesRevenus",
            "R1",
            "Sources de revenus",
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>,
            "blue",
            "What are your revenue streams?"
          )}

          {expandedCell !== "R1" && (
            <>
              {renderGRPCell(
                "remuneration",
                "volumeRevenus",
                "R2",
                "Volume des revenus",
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                  />
                </svg>,
                "blue",
                "What is your revenue volume and projection?"
              )}

              {renderGRPCell(
                "remuneration",
                "performance",
                "R3",
                "Performance",
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>,
                "blue",
                "What are your key performance metrics?"
              )}
            </>
          )}
        </div>

        {/* P Row - Partage de la valeur (coral/red) */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-red-500 text-white p-6 rounded-lg flex flex-col items-center justify-center text-center">
            <span className="text-6xl font-bold">P</span>
            <div className="mt-2">
              <p className="font-semibold">Partage</p>
              <p>de la valeur</p>
            </div>
          </div>

          {renderGRPCell(
            "partage",
            "partiesPrenantes",
            "P1",
            "Parties prenantes",
            <Users className="h-6 w-6" />,
            "red",
            "Who are your stakeholders in your ecosystem?"
          )}

          {expandedCell !== "P1" && (
            <>
              {renderGRPCell(
                "partage",
                "conventions",
                "P2",
                "Conventions",
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>,
                "red",
                "What agreements do you have with stakeholders?"
              )}

              {renderGRPCell(
                "partage",
                "ecosysteme",
                "P3",
                "Écosystème",
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>,
                "red",
                "How does your business fit into the broader ecosystem?"
              )}
            </>
          )}
        </div>
      </div>

      {/* Info and Actions */}
      <div className="mt-6 flex items-center p-4 border border-blue-100 rounded-lg bg-blue-50">
        <AlertCircle className="h-5 w-5 text-blue-500 mr-3" />
        <div>
          <p className="text-sm text-blue-700">
            Click on any cell to expand and edit its content. The GRP model
            helps you structure your business model through Generation (how
            value is created), Remuneration (how value is monetized), and
            Partage (how value is shared).
          </p>
        </div>
      </div>
    </div>
  );
};
