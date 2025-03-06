import React, { useState, useMemo } from 'react';
import { 
  Users, PlusCircle, LightbulbIcon, ChevronDown, Info, 
  PencilRuler, LineChart, ArrowRight, Lightbulb,
  Check, X, BarChart2, Banknote, PieChart, Share2
} from 'lucide-react';
import { useProjectStore } from '@/store';
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
  
  return (
    <div className="p-6">
      {/* Header with help menu */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">GRP Value Model</h2>
          <p className="text-gray-600">Define your value creation, capture, and sharing approach</p>
        </div>
        
        <div className="flex items-center gap-2">
          {comparisonMode && (
            <div className="bg-blue-50 px-4 py-2 rounded-lg flex items-center mr-2">
              <span className="text-blue-700 text-sm font-medium">Viewing AI suggested changes</span>
            </div>
          )}
          
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Info className="h-4 w-4" />
                <span>Help Guide</span>
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-medium">GRP Value Model Guide</h4>
                <p className="text-sm text-gray-500">
                  The GRP model helps you define your value creation approach through three main areas:
                </p>
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-1">
                    <Lightbulb className="h-4 w-4 text-blue-500" />
                    <span><strong>G</strong>eneration: How you create value</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Banknote className="h-4 w-4 text-green-500" />
                    <span><strong>R</strong>emuneration: How you capture value</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Share2 className="h-4 w-4 text-purple-500" />
                    <span><strong>P</strong>artage: How you share value</span>
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>
      
      {/* GRP dashboard cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-100 p-2 rounded">
                  <PieChart className="text-indigo-700 h-5 w-5" />
                </div>
                <span className="font-medium">GRP Model Completion</span>
              </div>
              <div>
                <Badge 
                  variant="outline" 
                  className={`
                    ${grpStats.completionPercentage >= 75 ? 'bg-green-50 text-green-700 border-green-200' :
                     grpStats.completionPercentage >= 50 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                     'bg-red-50 text-red-700 border-red-200'}
                  `}
                >
                  {grpStats.completionPercentage}%
                </Badge>
              </div>
            </div>
            <Progress 
              value={grpStats.completionPercentage} 
              className={`h-2 ${
                grpStats.completionPercentage >= 75 ? 'bg-green-100' :
                grpStats.completionPercentage >= 50 ? 'bg-yellow-100' :
                'bg-red-100'
              }`} 
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 p-2 rounded">
                  <Lightbulb className="text-blue-700 h-5 w-5" />
                </div>
                <span className="font-medium">Generation</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold">{getCategoriesByType('generation').length}</span>
              <span className="text-xs text-gray-500">Value creation approaches</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className="bg-green-100 p-2 rounded">
                  <Banknote className="text-green-700 h-5 w-5" />
                </div>
                <span className="font-medium">Remuneration</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold">{getCategoriesByType('remuneration').length}</span>
              <span className="text-xs text-gray-500">Value capture methods</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className="bg-purple-100 p-2 rounded">
                  <Share2 className="text-purple-700 h-5 w-5" />
                </div>
                <span className="font-medium">Partage</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold">{getCategoriesByType('partage').length}</span>
              <span className="text-xs text-gray-500">Value sharing strategies</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main content tabs */}
      <Tabs defaultValue="generation" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="generation" className="flex items-center gap-1">
            <Lightbulb className="h-4 w-4" />
            <span>Generation</span>
          </TabsTrigger>
          <TabsTrigger value="remuneration" className="flex items-center gap-1">
            <Banknote className="h-4 w-4" />
            <span>Remuneration</span>
          </TabsTrigger>
          <TabsTrigger value="partage" className="flex items-center gap-1">
            <Share2 className="h-4 w-4" />
            <span>Partage</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Generation Tab */}
        <TabsContent value="generation" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-start">
              <h3 className="text-lg font-semibold">Value Generation</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2 h-6 w-6 p-0" 
                onClick={() => toggleHelp('generation')}
              >
                <Info className="h-4 w-4 text-gray-500" />
              </Button>
            </div>
            
            <Button 
              onClick={() => handleAddCategory('generation')} 
              className="flex items-center gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add Generation Approach</span>
            </Button>
          </div>
          
          <Collapsible open={expandedHelp.generation} className="mb-4">
            <CollapsibleContent>
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4 text-sm text-blue-900">
                  <h4 className="font-medium mb-2 flex items-center gap-1">
                    <LightbulbIcon className="h-4 w-4 text-blue-600" />
                    <span>Value Generation Approaches</span>
                  </h4>
                  <p className="mb-2">
                    Value generation defines how your product or service creates value for customers. When defining your generation strategies:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Identify specific customer problems you solve</li>
                    <li>Define what makes your solution unique</li>
                    <li>Explain how you deliver benefits to users</li>
                    <li>Consider both tangible and intangible value</li>
                    <li>Focus on key differentiators from competitors</li>
                  </ul>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
          
          {/* List of Generation categories */}
          <div className="grid grid-cols-1 gap-4">
            {/* Categories would be displayed here */}
          </div>
        </TabsContent>
        
        {/* Remuneration Tab - similar to Generation tab */}
        <TabsContent value="remuneration" className="space-y-4">
          {/* Similar structure to Generation tab */}
        </TabsContent>
        
        {/* Partage Tab - similar to Generation tab */}
        <TabsContent value="partage" className="space-y-4">
          {/* Similar structure to Generation tab */}
        </TabsContent>
      </Tabs>
      
      {/* AI Suggestion Actions */}
      {comparisonMode && (
        <div className="mt-6 flex justify-end gap-2">
          <Button 
            variant="outline" 
            className="text-gray-600" 
            onClick={() => rejectAIChanges()}
          >
            <X className="mr-2 h-4 w-4" /> Discard Changes
          </Button>
          <Button 
            variant="default" 
            className="bg-green-600 text-white" 
            onClick={() => acceptAIChanges()}
          >
            <Check className="mr-2 h-4 w-4" /> Apply Changes
          </Button>
        </div>
      )}
    </div>
  );
};