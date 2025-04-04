import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PlusCircle, Save, Brain, Heart, Eye, Ear, MessageSquareText, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

// Interface for empathy map data structure
interface EmpathyMapData {
  thinks: string[];
  feels: string[];
  sees: string[];
  hears: string[];
  says?: string[];
  does?: string[];
}

// Component props interface
interface EmpathyMapProps {
  personaId?: string;
  data?: EmpathyMapData;
  onSave: (personaId: string, data: EmpathyMapData) => Promise<void>;
  readOnly?: boolean;
}

// Quadrant configuration
interface Quadrant {
  id: keyof EmpathyMapData;
  title: string;
  icon: React.ReactNode;
  color: string;
  placeholder: string;
}

// Default empty empathy map data
const defaultEmpathyMapData: EmpathyMapData = {
  thinks: [],
  feels: [],
  sees: [],
  hears: [],
  says: [],
  does: []
};

export const EmpathyMap: React.FC<EmpathyMapProps> = ({
  personaId = '',
  data = defaultEmpathyMapData,
  onSave,
  readOnly = false
}) => {
  // Setup state for the empathy map data
  const [mapData, setMapData] = useState<EmpathyMapData>(data);
  const [isSaving, setIsSaving] = useState(false);
  const [newEntry, setNewEntry] = useState<Record<keyof EmpathyMapData, string>>({
    thinks: '',
    feels: '',
    sees: '',
    hears: '',
    says: '',
    does: ''
  });
  
  // Toast for notifications
  const { toast } = useToast();
  
  // Update local state when props change
  useEffect(() => {
    setMapData(data);
  }, [data]);
  
  // Define the quadrants
  const quadrants: Quadrant[] = [
    {
      id: 'thinks',
      title: 'Thinks',
      icon: <Brain className="h-5 w-5" />,
      color: 'text-purple-500 bg-purple-50 border-purple-200',
      placeholder: 'What thoughts and beliefs does this persona have?'
    },
    {
      id: 'feels',
      title: 'Feels',
      icon: <Heart className="h-5 w-5" />,
      color: 'text-pink-500 bg-pink-50 border-pink-200',
      placeholder: 'What emotions does this persona experience?'
    },
    {
      id: 'sees',
      title: 'Sees',
      icon: <Eye className="h-5 w-5" />,
      color: 'text-blue-500 bg-blue-50 border-blue-200',
      placeholder: 'What does this persona observe in their environment?'
    },
    {
      id: 'hears',
      title: 'Hears',
      icon: <Ear className="h-5 w-5" />,
      color: 'text-amber-500 bg-amber-50 border-amber-200',
      placeholder: 'What messages does this persona hear from others?'
    },
    {
      id: 'says',
      title: 'Says',
      icon: <MessageSquareText className="h-5 w-5" />,
      color: 'text-green-500 bg-green-50 border-green-200',
      placeholder: 'What does this persona say and talk about?'
    },
    {
      id: 'does',
      title: 'Does',
      icon: <ArrowRight className="h-5 w-5" />,
      color: 'text-cyan-500 bg-cyan-50 border-cyan-200',
      placeholder: 'What actions does this persona take?'
    }
  ];
  
  // Handle adding a new entry to a quadrant
  const handleAddEntry = (quadrantId: keyof EmpathyMapData) => {
    if (!newEntry[quadrantId].trim()) return;
    
    setMapData(prev => ({
      ...prev,
      [quadrantId]: [...(prev[quadrantId] || []), newEntry[quadrantId].trim()]
    }));
    
    setNewEntry(prev => ({
      ...prev,
      [quadrantId]: ''
    }));
  };
  
  // Handle removing an entry from a quadrant
  const handleRemoveEntry = (quadrantId: keyof EmpathyMapData, index: number) => {
    setMapData(prev => ({
      ...prev,
      [quadrantId]: prev[quadrantId]?.filter((_, i) => i !== index) || []
    }));
  };
  
  // Handle saving the empathy map
  const handleSave = async () => {
    if (!personaId) {
      toast({
        title: 'Error',
        description: 'Cannot save empathy map: Missing persona ID',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setIsSaving(true);
      await onSave(personaId, mapData);
      
      toast({
        title: 'Success',
        description: 'Empathy map saved successfully'
      });
    } catch (error) {
      console.error('Error saving empathy map:', error);
      
      toast({
        title: 'Error',
        description: 'Failed to save empathy map',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Render a single quadrant
  const renderQuadrant = (quadrant: Quadrant) => {
    const entries = mapData[quadrant.id] || [];
    
    return (
      <Card key={quadrant.id} className={cn("h-full border", readOnly ? "bg-muted/10" : "")}>
        <CardContent className="p-4 h-full flex flex-col">
          <div className={cn("flex items-center gap-2 font-medium mb-3 py-2 px-3 rounded-md", quadrant.color)}>
            {quadrant.icon}
            <span>{quadrant.title}</span>
            <span className="ml-1 text-xs opacity-60">({entries.length})</span>
          </div>
          
          {/* Entry list */}
          <ScrollArea className="flex-grow pr-4">
            <div className="space-y-2">
              {entries.length === 0 ? (
                <div className="text-sm text-muted-foreground p-3 text-center italic rounded-md bg-muted/30">
                  No {quadrant.title.toLowerCase()} entries yet
                </div>
              ) : (
                entries.map((entry, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start group gap-2 p-2 rounded-md border bg-card"
                  >
                    <div className="flex-grow text-sm leading-relaxed">{entry}</div>
                    
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveEntry(quadrant.id, index)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <path d="M18 6 6 18"></path>
                          <path d="m6 6 12 12"></path>
                        </svg>
                      </Button>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </ScrollArea>
          
          {/* Add new entry input */}
          {!readOnly && (
            <div className="mt-3 space-y-2">
              <Textarea 
                placeholder={quadrant.placeholder}
                value={newEntry[quadrant.id]}
                onChange={(e) => setNewEntry(prev => ({
                  ...prev,
                  [quadrant.id]: e.target.value
                }))}
                className="text-sm min-h-[60px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddEntry(quadrant.id);
                  }
                }}
              />
              
              <Button 
                variant="outline"
                className="w-full text-xs gap-1 h-8"
                onClick={() => handleAddEntry(quadrant.id)}
                disabled={!newEntry[quadrant.id].trim()}
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Add Entry
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="space-y-4">
      

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quadrants.map(quadrant => renderQuadrant(quadrant))}
        </div>
    </div>
  );
};