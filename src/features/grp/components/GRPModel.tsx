import React, { useState, useMemo } from 'react';
import { 
  Users, PlusCircle, LightbulbIcon, ChevronDown, Info, 
  PencilRuler, LineChart, ArrowRight, Lightbulb,
  Check, X, BarChart2, Banknote, PieChart, Share2,
  Edit3,
  Target,
  Activity,
  AlertCircle
} from 'lucide-react';
import { useAppStore, useProjectStore } from '@/store';
import { useAIStore } from '@/hooks/useAIStore';
import { 
  GrpCategory, 
  GrpSection, 
  GrpItem
} from '@/store/types';
import { generateId } from '@/lib/utils';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
// Extended types for UI that add status for comparison mode
interface ExtendedGrpCategory extends GrpCategory {
  status?: 'new' | 'modified' | 'unchanged' | 'removed';
}

interface ExtendedGrpSection extends GrpSection {
  status?: 'new' | 'modified' | 'unchanged' | 'removed';
}

interface ExtendedGrpItem extends GrpItem {
  status?: 'new' | 'modified' | 'unchanged' | 'removed';
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
  const { 
    currentData,
    comparisonMode,
    stagedData,
    addGrpCategory,
    addGrpSection,
    addGrpItem,
    updateGrpCategory,
    updateGrpSection,
    updateGrpItem,
    deleteGrpCategory,
    deleteGrpSection,
    deleteGrpItem
  } = useProjectStore();
  
  const { acceptAIChanges, rejectAIChanges } = useAIStore();
    const { expandedCell, setExpandedCell } = useAppStore();

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
    partage: false
  });
  
  // Get current data from store and organize into UI structure
  const data = useMemo(() => {
    // Default empty data structure
    const result: GRPUIData = { categories: {} };
    
    // Get flat lists from store
    const categories = currentData.grpCategories || [];
    const sections = currentData.grpSections || [];
    const items = currentData.grpItems || [];
    
    // First build the category structure
    categories.forEach(category => {
      result.categories[category.id] = {
        ...category,
        sections: {}
      };
    });
    
    // Then add sections to the appropriate categories
    sections.forEach(section => {
      const categoryId = section.category_id;
      if (categoryId && result.categories[categoryId]) {
        result.categories[categoryId].sections[section.id] = {
          ...section,
          items: []
        };
      }
    });
    
    // Finally add items to the appropriate sections
    items.forEach(item => {
      const sectionId = item.section_id;
      if (sectionId) {
        // Find the category that contains this section
        const categoryId = Object.keys(result.categories).find(catId => 
          result.categories[catId].sections[sectionId] !== undefined
        );
        
        if (categoryId) {
          result.categories[categoryId].sections[sectionId].items.push(item);
        }
      }
    });
    
    return result;
  }, [currentData]);
  
  // Get staged data if in comparison mode
  const stagedUIData = useMemo(() => {
    if (!comparisonMode || !stagedData) return null;
    
    // Default empty data structure
    const result: GRPUIData = { categories: {} };
    
    // Get flat lists from store
    const categories = stagedData.grpCategories || [];
    const sections = stagedData.grpSections || [];
    const items = stagedData.grpItems || [];
    
    // Build the same structure as with current data
    categories.forEach(category => {
      result.categories[category.id] = {
        ...category,
        sections: {}
      };
    });
    
    sections.forEach(section => {
      const categoryId = section.category_id;
      if (categoryId && result.categories[categoryId]) {
        result.categories[categoryId].sections[section.id] = {
          ...section,
          items: []
        };
      }
    });
    
    items.forEach(item => {
      const sectionId = item.section_id;
      if (sectionId) {
        // Find the category that contains this section
        const categoryId = Object.keys(result.categories).find(catId => 
          result.categories[catId].sections[sectionId] !== undefined
        );
        
        if (categoryId) {
          result.categories[categoryId].sections[sectionId].items.push(item);
        }
      }
    });
    
    return result;
  }, [comparisonMode, stagedData]);
  
  // Helper function to determine if an item is new/modified in comparison mode
  const getItemStatus = (
    itemType: 'category' | 'section' | 'item', 
    itemId: string
  ): 'new' | 'modified' | 'unchanged' | 'removed' => {
    if (!comparisonMode || !stagedUIData) return 'unchanged';
    
    if (itemType === 'category') {
      const currentItem = Object.values(data.categories).find(item => item.id === itemId);
      const stagedItem = stagedUIData ? Object.values(stagedUIData.categories).find(item => item.id === itemId) : null;
      
      if (!currentItem && stagedItem) return 'new';
      if (currentItem && !stagedItem) return 'removed';
      if (currentItem && stagedItem) {
        // Compare only the category properties, not the nested sections
        const currentCopy = { ...currentItem };
        const stagedCopy = { ...stagedItem };
        const { sections: currentSections, ...currentProps } = currentCopy;
        const { sections: stagedSections, ...stagedProps } = stagedCopy;
        
        return JSON.stringify(currentProps) !== JSON.stringify(stagedProps) ? 'modified' : 'unchanged';
      }
    } 
    else if (itemType === 'section') {
      // Find the section in the current data
      let currentItem = null;
      let stagedItem = null;
      
      // Search through all categories for the section
      for (const catId in data.categories) {
        const section = data.categories[catId].sections[itemId];
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
      
      if (!currentItem && stagedItem) return 'new';
      if (currentItem && !stagedItem) return 'removed';
      if (currentItem && stagedItem) {
        // Compare only the section properties, not the nested items
        const currentCopy = { ...currentItem };
        const stagedCopy = { ...stagedItem };
        const { items: currentItems, ...currentProps } = currentCopy;
        const { items: stagedItems, ...stagedProps } = stagedCopy;
        
        return JSON.stringify(currentProps) !== JSON.stringify(stagedProps) ? 'modified' : 'unchanged';
      }
    }
    else if (itemType === 'item') {
      // Find the item in the current data
      let currentItem = null;
      let stagedItem = null;
      
      // Search through all categories and sections for the item
      for (const catId in data.categories) {
        const category = data.categories[catId];
        for (const secId in category.sections) {
          const section = category.sections[secId];
          const item = section.items.find(i => i.id === itemId);
          if (item) {
            currentItem = item;
            break;
          }
        }
        if (currentItem) break;
      }
      
      // Search through all categories and sections in staged data for the item
      if (stagedUIData) {
        for (const catId in stagedUIData.categories) {
          const category = stagedUIData.categories[catId];
          for (const secId in category.sections) {
            const section = category.sections[secId];
            const item = section.items.find(i => i.id === itemId);
            if (item) {
              stagedItem = item;
              break;
            }
          }
          if (stagedItem) break;
        }
      }
      
      if (!currentItem && stagedItem) return 'new';
      if (currentItem && !stagedItem) return 'removed';
      if (currentItem && stagedItem) {
        return JSON.stringify(currentItem) !== JSON.stringify(stagedItem) ? 'modified' : 'unchanged';
      }
    }
    
    return 'unchanged';
  };
  
  // Calculate GRP model dashboard metrics
  const grpStats = useMemo(() => {
    let totalCategories = 0;
    let totalSections = 0;
    let totalItems = 0;
    
    // Count all categories, sections, and items
    Object.values(data.categories).forEach(category => {
      totalCategories++;
      
      Object.values(category.sections).forEach(section => {
        totalSections++;
        totalItems += section.items.length;
      });
    });
    
    // Calculate completion percentage
    const maxExpectedElements = 15; // Example: 3 categories, 9 sections, 3 items
    const completionPercentage = Math.min(Math.round((totalCategories + totalSections + totalItems) / maxExpectedElements * 100), 100);
    
    return {
      totalCategories,
      totalSections,
      totalItems,
      completionPercentage
    };
  }, [data]);
  
  // Handle adding a new category
  const handleAddCategory = (categoryType: string) => {
    const projectId = currentData.project?.id || '';
    
    addGrpCategory({
      id: generateId(),
      category_type: categoryType,
      order_index: Object.keys(data.categories).length,
      project_id: projectId,
      created_at: null,
      created_by: null,
      updated_at: null
    });
  };
  
  // Handle adding a new section
  const handleAddSection = (categoryId: string) => {
    const projectId = currentData.project?.id || '';
    
    addGrpSection({
      id: generateId(),
      name: 'New Section',
      category_id: categoryId,
      section_type: 'standard',
      order_index: 0,
      project_id: projectId,
      created_at: null,
      created_by: null,
      updated_at: null
    });
  };
  
  // Handle adding a new item
  const handleAddItem = (sectionId: string) => {
    const projectId = currentData.project?.id || '';
    
    addGrpItem({
      id: generateId(),
      title: 'New Item',
      description: '',
      section_id: sectionId,
      order_index: 0,
      percentage: 0,
      project_id: projectId,
      created_at: null,
      created_by: null,
      updated_at: null
    });
  };
  
  // Toggle help section visibility
  const toggleHelp = (section: keyof typeof expandedHelp) => {
    setExpandedHelp(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Helper to filter categories by type
  const getCategoriesByType = (type: string) => {
    return Object.values(data.categories).filter(cat => cat.category_type === type);
  };
  
  // Helper to get icon for category type
  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'generation':
        return <Lightbulb className="h-5 w-5 text-blue-500" />;
      case 'remuneration':
        return <Banknote className="h-5 w-5 text-green-500" />;
      case 'partage':
        return <Share2 className="h-5 w-5 text-purple-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const renderGRPCell = (
    section: "generation" | "remuneration" | "partage",
    subsection: string,
    cellId: string,
    title: string,
    icon: React.ReactNode,
    color: string,
    prompt: string
  ) => {
    const sectionData = data.categories[section] || {};
    const items = (sectionData[subsection as keyof typeof sectionData] ||
      []) as GrpItem[];

    // Map color string to specific color utility classes
    const colorClasses = {
      yellow: {
        bg: "bg-yellow-100",
        border: "border-yellow-200",
        text: "text-yellow-500",
        title: "text-yellow-600",
        itemBg: "bg-yellow-50",
      },
      blue: {
        bg: "bg-blue-100",
        border: "border-blue-200",
        text: "text-blue-500",
        title: "text-blue-600",
        itemBg: "bg-blue-50",
      },
      red: {
        bg: "bg-red-100",
        border: "border-red-200",
        text: "text-red-500",
        title: "text-red-600",
        itemBg: "bg-red-50",
      },
    };

    // Get the correct classes based on the color prop
    const classes =
      colorClasses[color as keyof typeof colorClasses] || colorClasses.yellow;

    return (
      <div
        className={`bg-white border ${
          classes.border
        } rounded-lg p-4 cursor-pointer transition-all duration-200 ${
          expandedCell === cellId ? "row-span-2 col-span-3" : ""
        }`}
        onClick={() => handleCellClick(cellId)}
      >
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div
            className={`w-12 h-12 ${classes.bg} rounded-full flex items-center justify-center ${classes.text} mb-3`}
          >
            {icon}
          </div>
          <h3 className={`font-medium text-lg ${classes.title}`}>{title}</h3>

          {expandedCell === cellId && (
            <div className="mt-4 text-left w-full">
              <p className="text-sm text-gray-500 mb-3">{prompt}</p>

              <div className="space-y-2">
                {items.map((item: GrpItem) => (
                  <div
                    key={item.id}
                    className={`p-3 ${classes.itemBg} rounded-md border ${classes.border}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">
                        {item.title || "Untitled"}
                      </p>
                      <Edit3 className="h-4 w-4 text-gray-400 cursor-pointer" />
                    </div>
                    <p className="text-xs text-gray-600">{item.description}</p>
                    {item.percentage && (
                      <p
                        className={`text-xs ${classes.title} font-medium mt-1`}
                      >
                        {item.percentage}% of total
                      </p>
                    )}
                  </div>
                ))}

                <div
                  className="p-2 bg-gray-50 rounded-md border border-dashed border-gray-300 flex items-center cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddItem(section);
                  }}
                >
                  <p className="text-sm text-gray-500">
                    Add {title.toLowerCase()}...
                  </p>
                  <PlusCircle className="h-4 w-4 text-gray-400 ml-auto" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
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
            'generation',
            'porteurs',
            'G1',
            'Porteur(s)',
            <Users className="h-6 w-6" />,
            'yellow',
            'Who are the project leaders and what are their roles?'
          )}
          
          {expandedCell !== 'G1' && (
            <>
              {renderGRPCell(
                'generation',
                'propositionValeur',
                'G2',
                'Proposition de valeur',
                <Target className="h-6 w-6" />,
                'yellow',
                'What value does your solution provide to customers?'
              )}
              
              {renderGRPCell(
                'generation',
                'fabricationValeur',
                'G3',
                'Fabrication de la valeur',
                <Activity className="h-6 w-6" />,
                'yellow',
                'How is your solution produced and delivered?'
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
            'remuneration',
            'sourcesRevenus',
            'R1',
            'Sources de revenus',
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>,
            'blue',
            'What are your revenue streams?'
          )}
          
          {expandedCell !== 'R1' && (
            <>
              {renderGRPCell(
                'remuneration',
                'volumeRevenus',
                'R2',
                'Volume des revenus',
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>,
                'blue',
                'What is your revenue volume and projection?'
              )}
              
              {renderGRPCell(
                'remuneration',
                'performance',
                'R3',
                'Performance',
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>,
                'blue',
                'What are your key performance metrics?'
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
            'partage',
            'partiesPrenantes',
            'P1',
            'Parties prenantes',
            <Users className="h-6 w-6" />,
            'red',
            'Who are your stakeholders in your ecosystem?'
          )}
          
          {expandedCell !== 'P1' && (
            <>
              {renderGRPCell(
                'partage',
                'conventions',
                'P2',
                'Conventions',
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>,
                'red',
                'What agreements do you have with stakeholders?'
              )}
              
              {renderGRPCell(
                'partage',
                'ecosysteme',
                'P3',
                'Écosystème',
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>,
                'red',
                'How does your business fit into the broader ecosystem?'
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Info and Actions */}
      <div className="mt-6 flex items-center p-4 border border-blue-100 rounded-lg bg-blue-50">
        <AlertCircle className="h-5 w-5 text-blue-500 mr-3" />
        <div>
          <p className="text-sm text-blue-700">Click on any cell to expand and edit its content. The GRP model helps you structure your business model through Generation (how value is created), Remuneration (how value is monetized), and Partage (how value is shared).</p>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <Button variant="outline" className="text-gray-600 mr-2">
          Save Draft
        </Button>
        <Button variant="default" className="bg-blue-600 text-white">
          Complete GRP Model
        </Button>
      </div>
    </div>
  );
};