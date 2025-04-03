import React from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Trash2, 
  MessageSquare, 
  ChevronRight, 
  User, 
  Target,
  Tag,
  Goal, 
  AlertTriangle,
  Layers,
  TrendingUp,
  Info
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { MarketPersona } from '@/store/types';

// Type for priority colors
type PriorityColor = {
  badge: string;
  bg: string;
  border: string;
  text: string;
};

// Priority color mapping
const PRIORITY_COLORS: Record<string, PriorityColor> = {
  primary: {
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-800',
  },
  secondary: {
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
  },
  tertiary: {
    badge: 'bg-gray-100 text-gray-800 border-gray-200',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-800',
  },
};

// Props interface
interface PersonaCardProps {
  persona: MarketPersona;
  interviewCount?: number;
  isSelected?: boolean;
  showDetails?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onSelect?: () => void;
}

export const PersonaCard: React.FC<PersonaCardProps> = ({
  persona,
  interviewCount = 0,
  isSelected = false,
  showDetails = false,
  onEdit,
  onDelete,
  onSelect,
}) => {
  const priorityColors = persona.priority 
    ? PRIORITY_COLORS[persona.priority] 
    : { badge: '', bg: '', border: '', text: '' };
  
  // Format the avatar initials from the persona name
  const formatInitials = () => {
    if (!persona.name) return 'P';
    
    const parts = persona.name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };
  
  // Get a priority label
  const getPriorityLabel = () => {
    if (!persona.priority) return null;
    
    return {
      primary: 'Primary',
      secondary: 'Secondary',
      tertiary: 'Tertiary',
    }[persona.priority] || persona.priority;
  };
  
  const renderCompactView = () => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      className={cn(
        "h-full",
        isSelected && "ring-2 ring-primary rounded-md"
      )}
    >
      <Card 
        className={cn(
          "h-full cursor-pointer transition-all duration-200",
          isSelected && "border-primary",
          persona.priority && priorityColors.border
        )}
        onClick={onSelect}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <Avatar className={cn(
                "h-10 w-10", 
                persona.priority && priorityColors.bg, 
                persona.priority && priorityColors.text
              )}>
                <AvatarFallback>{formatInitials()}</AvatarFallback>
              </Avatar>
              
              <div>
                <CardTitle className="text-lg">{persona.name || 'Unnamed Persona'}</CardTitle>
                <CardDescription>{persona.role || 'No role defined'}</CardDescription>
              </div>
            </div>
            
            {onEdit && onDelete && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => { 
                    e.stopPropagation(); 
                    onEdit();
                  }}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit persona
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onDelete();
                    }}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete persona
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pb-3">
          {/* Demographics */}
          {persona.demographics && (
            <div className="flex items-start gap-2 text-sm mb-3">
              <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>{persona.demographics}</div>
            </div>
          )}
          
          {/* Goals */}
          {persona.goals && persona.goals.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center gap-1 mb-1 text-sm font-medium">
                <Goal className="h-4 w-4 text-muted-foreground" />
                <span>Goals</span>
              </div>
              <ul className="ml-6 text-sm list-disc space-y-1">
                {persona.goals.slice(0, showDetails ? undefined : 2).map((goal, index) => (
                  <li key={index} className="text-sm">{goal}</li>
                ))}
                {!showDetails && persona.goals.length > 2 && (
                  <li className="text-sm text-muted-foreground">+{persona.goals.length - 2} more goals</li>
                )}
              </ul>
            </div>
          )}
          
          {/* Pain Points */}
          {persona.pain_points && persona.pain_points.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center gap-1 mb-1 text-sm font-medium">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <span>Pain Points</span>
              </div>
              <ul className="ml-6 text-sm list-disc space-y-1">
                {persona.pain_points.slice(0, showDetails ? undefined : 2).map((pain, index) => (
                  <li key={index} className="text-sm">{pain}</li>
                ))}
                {!showDetails && persona.pain_points.length > 2 && (
                  <li className="text-sm text-muted-foreground">+{persona.pain_points.length - 2} more pain points</li>
                )}
              </ul>
            </div>
          )}
          
          {/* Tags area */}
          {(persona.priority || (persona.persona_segments && persona.persona_segments.length > 0)) && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {/* Priority badge */}
              {persona.priority && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className={cn(
                        "flex items-center gap-1",
                        priorityColors.badge
                      )}>
                        <Target className="h-3 w-3" />
                        {getPriorityLabel()}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Priority: {getPriorityLabel()}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {/* Segments */}
              {persona.persona_segments && persona.persona_segments.length > 0 && persona.persona_segments.slice(0, 2).map((segment, index) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {segment}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Segment: {segment}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
              
              {persona.persona_segments && persona.persona_segments.length > 2 && (
                <Badge variant="outline">+{persona.persona_segments.length - 2} more</Badge>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between pt-0">
          <div className="flex items-center text-sm text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5 mr-1" />
            {interviewCount} {interviewCount === 1 ? 'interview' : 'interviews'}
          </div>
          
          {onSelect && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation(); 
                      onSelect();
                    }}
                  >
                    View Details
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View interviews and empathy map</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
  
  const renderDetailedView = () => (
    <div className="space-y-6">
      {/* Persona header with avatar and basic info */}
      <div className="flex items-start gap-4">
        <Avatar className={cn(
          "h-16 w-16 rounded-md shadow-sm", 
          persona.priority && priorityColors.bg, 
          persona.priority && priorityColors.text
        )}>
          <AvatarFallback className="text-xl">{formatInitials()}</AvatarFallback>
        </Avatar>
        
        <div className="space-y-1 flex-1">
          <h2 className="text-xl font-semibold">{persona.name || 'Unnamed Persona'}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-muted-foreground">{persona.role || 'No role defined'}</p>
            {persona.priority && (
              <Badge className={cn("ml-1", priorityColors.badge)}>
                {getPriorityLabel()}
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      {/* Demographics section */}
      <div className="bg-muted/30 p-4 rounded-lg border space-y-1">
        <h3 className="text-sm font-medium flex items-center gap-1.5 mb-2 text-muted-foreground">
          <User className="h-4 w-4" />
          <span>Demographics</span>
        </h3>
        <p className="text-sm">
          {persona.demographics || 'No demographics information provided'}
        </p>
      </div>
      
      {/* Two-column layout for Goals and Pain Points */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Goals */}
        <div className="border rounded-lg p-4 bg-white">
          <h3 className="text-sm font-medium flex items-center gap-1.5 mb-3 text-muted-foreground">
            <Target className="h-4 w-4 text-primary/80" />
            <span>Goals</span>
          </h3>
          
          {persona.goals && persona.goals.length > 0 ? (
            <ul className="space-y-2">
              {persona.goals.map((goal, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="mt-1 rounded-full h-1.5 w-1.5 bg-primary/80 flex-shrink-0" />
                  <span>{goal}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No goals defined</p>
          )}
        </div>
        
        {/* Pain Points */}
        <div className="border rounded-lg p-4 bg-white">
          <h3 className="text-sm font-medium flex items-center gap-1.5 mb-3 text-muted-foreground">
            <AlertTriangle className="h-4 w-4 text-destructive/80" />
            <span>Pain Points</span>
          </h3>
          
          {persona.pain_points && persona.pain_points.length > 0 ? (
            <ul className="space-y-2">
              {persona.pain_points.map((pain, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="mt-1 rounded-full h-1.5 w-1.5 bg-destructive/80 flex-shrink-0" />
                  <span>{pain}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No pain points defined</p>
          )}
        </div>
      </div>
      
      {/* Additional Information Section */}
      {(persona.persona_segments && persona.persona_segments.length > 0) || (persona.influence_score !== null) && (
        <div className="grid grid-cols-2 gap-4">
          {/* Segments */}
          {persona.persona_segments && persona.persona_segments.length > 0 && (
            <div className="col-span-2 md:col-span-1 border rounded-lg p-4">
              <h3 className="text-sm font-medium flex items-center gap-1.5 mb-3 text-muted-foreground">
                <Layers className="h-4 w-4" />
                <span>Segments</span>
              </h3>
              
              <div className="flex flex-wrap gap-2">
                {persona.persona_segments.map((segment, index) => (
                  <Badge key={segment} variant="outline" className="bg-primary/5">
                    {segment}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Influence Score */}
          {persona.influence_score !== null && (
            <div className="col-span-2 md:col-span-1 border rounded-lg p-4">
              <h3 className="text-sm font-medium flex items-center gap-1.5 mb-3 text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>Influence Score</span>
              </h3>
              
              <div className="flex items-center gap-2">
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div 
                    className="bg-primary rounded-full h-2.5" 
                    style={{ width: `${(persona.influence_score / 5) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{persona.influence_score}/5</span>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Interview metrics */}
      <div className="border rounded-lg p-4 bg-muted/10">
        <h3 className="text-sm font-medium flex items-center gap-1.5 mb-3">
          <MessageSquare className="h-4 w-4 text-blue-500" />
          <span>Interview Data</span>
        </h3>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Interviews conducted</span>
          <div className="flex items-center gap-2">
            <Badge variant={interviewCount > 0 ? "default" : "outline"} className={interviewCount > 0 ? "bg-blue-500" : ""}>
              {interviewCount}
            </Badge>
            {interviewCount === 0 && (
              <span className="text-xs text-muted-foreground">No interviews yet</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  
  return showDetails ? renderDetailedView() : renderCompactView();
}; 