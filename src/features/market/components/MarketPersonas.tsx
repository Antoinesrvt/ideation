import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMarketAnalysis } from '@/hooks/features/useMarketAnalysis';
import { useProjectStore } from '@/store';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Dialog, 
  DialogHeader, 
  DialogContent, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  UserPlus, 
  Search, 
  Layers, 
  List, 
  Grid3X3, 
  Map, 
  Filter, 
  SlidersHorizontal,
  MessageSquare, 
  Plus,
  InfoIcon,
  XIcon,
  Edit,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PersonaCard } from './personas/PersonaCard';
import { PersonaInterviews } from './personas/PersonaInterviews';
import { EmpathyMap } from './personas/EmpathyMap';
import { MarketPersona, MarketInterview, Insert, Update } from '@/store/types';
import { AddPersonaForm } from './personas/AddPersonaForm';
import { EditPersonaForm } from './personas/EditPersonaForm';
import { EmptyPlaceholder } from './personas/EmptyPlaceholder';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

// EmpathyMap data structure
interface EmpathyMapData {
  thinks: string[];
  feels: string[];
  sees: string[];
  hears: string[];
  says?: string[];
  does?: string[];
}

// Props interface
interface MarketPersonasProps {
  personas: MarketPersona[];
  projectId: string;
  interviews?: any[]; // Add interview data if available
}

// Segment visualization colors
const SEGMENT_COLORS = [
  'rgb(149, 97, 226)',
  'rgb(14, 165, 233)',
  'rgb(16, 185, 129)',
  'rgb(245, 158, 11)',
  'rgb(236, 72, 153)',
  'rgb(239, 68, 68)',
  'rgb(168, 85, 247)',
];

// View mode options
type ViewMode = 'cards' | 'segments' | 'journey';

export const MarketPersonas: React.FC<MarketPersonasProps> = ({ 
  personas, 
  projectId,
  interviews = [] 
}) => {
  
  const { toast } = useToast();
  
  // State for UI controls
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [segmentFilter, setSegmentFilter] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<MarketPersona | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState('overview');
  
  // Get all unique segments from personas
  const uniqueSegments = useMemo(() => {
    const segments = new Set<string>();
    personas.forEach(persona => {
      if (persona.persona_segments) {
        persona.persona_segments.forEach(segment => segments.add(segment));
      }
    });
    return Array.from(segments);
  }, [personas]);
  
  // Filter personas based on search query and filters
  const filteredPersonas = useMemo(() => {
    return personas.filter(persona => {
      // Search query filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        !searchQuery ||
        persona.name?.toLowerCase().includes(searchLower) ||
        persona.role?.toLowerCase().includes(searchLower) ||
        persona.demographics?.toLowerCase().includes(searchLower) ||
        (persona.goals && persona.goals.some(goal => goal.toLowerCase().includes(searchLower))) ||
        (persona.pain_points && persona.pain_points.some(pain => pain.toLowerCase().includes(searchLower)));
      
      // Priority filter
      const matchesPriority = !priorityFilter || persona.priority === priorityFilter;
      
      // Segment filter
      const matchesSegment = !segmentFilter || 
        (persona.persona_segments && persona.persona_segments.includes(segmentFilter));
      
      return matchesSearch && matchesPriority && matchesSegment;
    });
  }, [personas, searchQuery, priorityFilter, segmentFilter]);
  
  // Count interviews per persona
  const interviewCountByPersona = useMemo(() => {
    const counts: Record<string, number> = {};
    if (interviews && interviews.length > 0) {
      interviews.forEach(interview => {
        if (interview.persona_id) {
          counts[interview.persona_id] = (counts[interview.persona_id] || 0) + 1;
        }
      });
    }
    return counts;
  }, [interviews]);
  
  // CRUD handlers
  const handleAddPersona = async (formData: Insert<'market_personas'>) => {
    try {
      // Here, you would call your addPersona API function
      // For now, we'll just show a success toast
      console.log('Adding persona with data:', formData);
      
      toast({
        title: "Persona added",
        description: `${formData.name} has been added successfully.`,
      });
      
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding persona:', error);
      
      toast({
        title: "Error",
        description: "Failed to add persona. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleEditPersona = async (formData: Update<'market_personas'>) => {
    try {
      if (!selectedPersona) return;
      
      // Here, you would call your updatePersona API function
      // For now, we'll just show a success toast
      console.log('Updating persona with data:', formData);
      
      toast({
        title: "Persona updated",
        description: `${selectedPersona.name} has been updated successfully.`,
      });
      
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating persona:', error);
      
      toast({
        title: "Error",
        description: "Failed to update persona. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeletePersona = async () => {
    try {
      if (!selectedPersona) return;
      
      // Here, you would call your deletePersona API function
      // For now, we'll just show a success toast
      console.log('Deleting persona:', selectedPersona.id);
      
      toast({
        title: "Persona deleted",
        description: `${selectedPersona.name} has been deleted successfully.`,
      });
      
      setIsDeleteDialogOpen(false);
      setSelectedPersona(null);
    } catch (error) {
      console.error('Error deleting persona:', error);
      
      toast({
        title: "Error",
        description: "Failed to delete persona. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Helper functions
  const handleSelectPersona = (persona: MarketPersona) => {
    setSelectedPersona(persona);
    setIsDetailDialogOpen(true);
  };
  
  const handleEditClick = (persona: MarketPersona) => {
    setSelectedPersona(persona);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteClick = (persona: MarketPersona) => {
    setSelectedPersona(persona);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDebugClick = () => {
    console.log('Current personas:', personas);
    
    toast({
      title: "Debug Info",
      description: `${personas.length} personas found in state.`,
    });
  };
  
  // Render functions
  const renderPersonaCards = () => {
    if (filteredPersonas.length === 0) {
      return (
        <EmptyPlaceholder 
          icon={<Users className="h-10 w-10 text-muted-foreground opacity-20" />}
          title={searchQuery ? "No matching personas" : "No personas yet"}
          description={searchQuery 
            ? "Try adjusting your search or filters to find what you're looking for." 
            : "Create your first persona to understand your target customers better."}
          actions={
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Persona
            </Button>
          }
        />
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPersonas.map(persona => (
          <PersonaCard 
            key={persona.id}
            persona={persona}
            interviewCount={interviewCountByPersona[persona.id] || 0}
            onEdit={() => handleEditClick(persona)}
            onDelete={() => handleDeleteClick(persona)}
            onSelect={() => handleSelectPersona(persona)}
            isSelected={selectedPersona?.id === persona.id}
          />
        ))}
      </div>
    );
  };
  
  const renderSegmentsView = () => {
    if (filteredPersonas.length === 0) {
      return (
        <EmptyPlaceholder 
          icon={<Layers className="h-10 w-10 text-muted-foreground opacity-20" />}
          title="No segments or personas to visualize"
          description="Add personas with segment information to see them visualized here."
        />
      );
    }
    
    // Group personas by segment
    const personasBySegment: Record<string, MarketPersona[]> = {};
    
    // First, handle personas without segments
    const noSegment: MarketPersona[] = [];
    
    filteredPersonas.forEach(persona => {
      if (!persona.persona_segments || persona.persona_segments.length === 0) {
        noSegment.push(persona);
      } else {
        persona.persona_segments.forEach(segment => {
          if (!personasBySegment[segment]) {
            personasBySegment[segment] = [];
          }
          personasBySegment[segment].push(persona);
        });
      }
    });
    
    // Now render the segmentation visualization
    return (
      <div className="space-y-6">
        {/* Segments with personas */}
        {Object.entries(personasBySegment).map(([segment, segmentPersonas], index) => (
          <div key={segment} className="border rounded-lg p-4 bg-white/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: SEGMENT_COLORS[index % SEGMENT_COLORS.length] }}
                />
                <h3 className="text-lg font-medium">{segment}</h3>
                <Badge variant="outline" className="ml-2">
                  {segmentPersonas.length} {segmentPersonas.length === 1 ? 'persona' : 'personas'}
                </Badge>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 items-center">
              {segmentPersonas.map(persona => (
                <motion.div
                  key={persona.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white border rounded-lg p-3 shadow-sm cursor-pointer"
                  onClick={() => handleSelectPersona(persona)}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
                      style={{ 
                        backgroundColor: SEGMENT_COLORS[index % SEGMENT_COLORS.length] + '30',
                        color: SEGMENT_COLORS[index % SEGMENT_COLORS.length]
                      }}
                    >
                      {persona.name?.charAt(0).toUpperCase() || 'P'}
                    </div>
                    <div>
                      <div className="font-medium">{persona.name}</div>
                      <div className="text-xs text-muted-foreground">{persona.role || 'No role'}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
        
        {/* Personas without segments */}
        {noSegment.length > 0 && (
          <div className="border rounded-lg p-4 border-dashed">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium text-muted-foreground">Unassigned</h3>
                <Badge variant="outline" className="ml-2">
                  {noSegment.length} {noSegment.length === 1 ? 'persona' : 'personas'}
                </Badge>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 items-center">
              {noSegment.map(persona => (
                <motion.div
                  key={persona.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white border rounded-lg p-3 shadow-sm cursor-pointer"
                  onClick={() => handleSelectPersona(persona)}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                      {persona.name?.charAt(0).toUpperCase() || 'P'}
                    </div>
                    <div>
                      <div className="font-medium">{persona.name}</div>
                      <div className="text-xs text-muted-foreground">{persona.role || 'No role'}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const renderJourneyMapView = () => {
    if (filteredPersonas.length === 0) {
      return (
        <EmptyPlaceholder 
          icon={<Map className="h-10 w-10 text-muted-foreground opacity-20" />}
          title="No journey data to visualize"
          description="Select a persona first to view their customer journey."
        />
      );
    }
    
    if (!selectedPersona) {
      return (
        <div className="p-8 text-center">
          <Map className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-20" />
          <h3 className="text-lg font-medium">Select a persona to view their journey</h3>
          <p className="text-muted-foreground mt-2 mb-6">
            Choose a persona to see their customer journey visualization.
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            {filteredPersonas.slice(0, 4).map(persona => (
              <Button 
                key={persona.id} 
                variant="outline" 
                onClick={() => setSelectedPersona(persona)}
              >
                {persona.name}
              </Button>
            ))}
            {filteredPersonas.length > 4 && (
              <Button variant="ghost" size="sm">
                +{filteredPersonas.length - 4} more
              </Button>
            )}
          </div>
        </div>
      );
    }
    
    // TODO: Replace with actual journey map implementation
    return (
      <div className="p-4 border rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Journey Map: {selectedPersona.name}</h3>
          <Button variant="ghost" size="sm" onClick={() => setSelectedPersona(null)}>
            Change Persona
          </Button>
        </div>
        
        <Alert className="mb-4">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            Journey mapping is a work in progress. This section will visualize the user's path, touchpoints, emotions and pain points across the customer journey.
          </AlertDescription>
        </Alert>
        
        <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
          <p className="text-muted-foreground">Journey map visualization coming soon</p>
        </div>
      </div>
    );
  };
  
  const renderPersonaDetails = () => {
    if (!selectedPersona) return null;
    
    const convertToEmpathyMapData = (empathyMap: any): EmpathyMapData => {
      if (!empathyMap) {
        return {
          thinks: [],
          feels: [],
          sees: [],
          hears: [],
          says: [],
          does: []
        };
      }
      
      return {
        thinks: empathyMap.thinks || [],
        feels: empathyMap.feels || [],
        sees: empathyMap.sees || [],
        hears: empathyMap.hears || [],
        says: empathyMap.says || [],
        does: empathyMap.does || []
      };
    };
    
    return (
      <Tabs defaultValue={activeDetailTab} onValueChange={setActiveDetailTab} className="w-full h-full flex flex-col">
        <TabsList className="w-full mb-0 px-6 border-b rounded-none h-12 bg-transparent gap-6 justify-start">
          <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 h-full">
            Overview
          </TabsTrigger>
          <TabsTrigger value="empathy" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 h-full">
            Empathy Map
          </TabsTrigger>
          <TabsTrigger value="interviews" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 h-full flex items-center gap-2">
            Interviews
            {interviewCountByPersona[selectedPersona.id] ? (
              <Badge variant="secondary" className="ml-1">
                {interviewCountByPersona[selectedPersona.id]}
              </Badge>
            ) : null}
          </TabsTrigger>
        </TabsList>
        
        <div className="flex-1 overflow-auto">
          <ScrollArea className="h-full w-full">
            <div className="p-6">
              {activeDetailTab === 'overview' && (
                <div className="space-y-4">
                  <PersonaCard 
                    persona={selectedPersona}
                    interviewCount={interviewCountByPersona[selectedPersona.id] || 0}
                    showDetails={true}
                  />
                </div>
              )}
              
              {activeDetailTab === 'empathy' && (
                <EmpathyMap 
                  data={convertToEmpathyMapData(selectedPersona.empathy_map)}
                  onSave={async (personaId: string, data: EmpathyMapData) => {
                    // TODO: Implement proper empathy map saving
                    console.log('Saving empathy map for', personaId, data);
                    return Promise.resolve();
                  }}
                  personaId={selectedPersona.id}
                  readOnly={false}
                />
              )}
              
              {activeDetailTab === 'interviews' && (
                <PersonaInterviews 
                  persona={selectedPersona}
                  interviews={interviews.filter(i => i.persona_id === selectedPersona.id)}
                  onAddInterview={() => {}} // TODO: Implement add interview
                  allInterviews={interviews}
                />
              )}
            </div>
          </ScrollArea>
        </div>
      </Tabs>
    );
  };
  
  return (
    <div className="space-y-4">
      
      {/* Controls area */}
      <div className="flex items-center justify-between space-x-4">
        {/* Search and filters */}
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search"
              placeholder="Search personas..." 
              className="pl-8" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
        </div>
        
        {/* View mode toggles */}
        <div className="flex gap-1 items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={viewMode === 'cards' ? 'default' : 'outline'} 
                  size="icon"
                  onClick={() => setViewMode('cards')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Card View</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={viewMode === 'segments' ? 'default' : 'outline'} 
                  size="icon"
                  onClick={() => setViewMode('segments')}
                >
                  <Layers className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Segments View</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={viewMode === 'journey' ? 'default' : 'outline'} 
                  size="icon"
                  onClick={() => setViewMode('journey')}
                >
                  <Map className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Journey Mapping</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Personas count and filter summary */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <div>
          {filteredPersonas.length} {filteredPersonas.length === 1 ? 'persona' : 'personas'} 
          {(searchQuery || priorityFilter || segmentFilter) ? ' (filtered)' : ''}
        </div>
        
        {(searchQuery || priorityFilter || segmentFilter) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setSearchQuery('');
              setPriorityFilter(null);
              setSegmentFilter(null);
            }}
          >
            <XIcon className="h-3 w-3 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>
      
      {/* Main content area */}
          {viewMode === 'cards' && renderPersonaCards()}
          {viewMode === 'segments' && renderSegmentsView()}
          {viewMode === 'journey' && renderJourneyMapView()}
      
      {/* Add Persona Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Add New Persona</DialogTitle>
            <DialogDescription>
              Define a new customer persona to understand user needs better
            </DialogDescription>
          </DialogHeader>
          
          <AddPersonaForm 
            defaultValues={{
              name: '',
              role: '',
              demographics: '',
              goals: [],
              pain_points: [],
              influence_score: null,
              priority: null,
              persona_segments: [],
              project_id: projectId,
              empathy_map: null
            }}
            onSubmit={handleAddPersona} 
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Persona Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Edit Persona: {selectedPersona?.name}</DialogTitle>
            <DialogDescription>
              Update this persona's details
            </DialogDescription>
          </DialogHeader>
          
          {selectedPersona && (
            <EditPersonaForm 
              persona={selectedPersona} 
              onSubmit={handleEditPersona} 
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedPersona?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              persona and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePersona}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Persona Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl h-[85vh] p-0 gap-0">
          <DialogHeader className="p-6 pb-2 border-b">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <DialogTitle className="text-xl">
                  {selectedPersona?.name} Details
                </DialogTitle>
                <DialogDescription>
                  View and manage details, empathy map, and interviews for this persona.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-grow overflow-auto ">
            {renderPersonaDetails()}
          </div>
          
          <div className="px-4 py-3 border-t bg-muted/10 flex justify-end gap-2">
            {selectedPersona && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsDetailDialogOpen(false);
                    handleEditClick(selectedPersona);
                  }}
                  className="gap-1"
                >
                  <Edit className="h-4 w-4" />
                  Edit Persona
                </Button>
                <Button variant="default" onClick={() => setIsDetailDialogOpen(false)}>
                  Close
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 