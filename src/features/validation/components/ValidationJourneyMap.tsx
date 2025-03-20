import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, 
  Beaker, 
  SplitSquareVertical, 
  MessageSquare, 
  PieChart,
  Zap,
  CheckCircle2,
  Award,
  PartyPopper
} from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ValidationPhase } from '../types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import confetti from 'canvas-confetti';

interface ValidationJourneyMapProps {
  currentPhase: string;
  phases: ValidationPhase[];
  onPhaseChange: (phaseId: string) => void;
  className?: string;
}

// Helper function to get the appropriate icon for each phase
function getPhaseIcon(iconType: string) {
  switch (iconType) {
    case 'lightbulb':
      return <Lightbulb className="h-5 w-5" />;
    case 'beaker':
      return <Beaker className="h-5 w-5" />;
    case 'split':
      return <SplitSquareVertical className="h-5 w-5" />;
    case 'message':
      return <MessageSquare className="h-5 w-5" />;
    case 'chart':
      return <PieChart className="h-5 w-5" />;
    case 'bulb':
      return <Zap className="h-5 w-5" />;
    case 'check':
      return <CheckCircle2 className="h-5 w-5" />;
    default:
      return <Lightbulb className="h-5 w-5" />;
  }
}

export function ValidationJourneyMap({ 
  currentPhase, 
  phases, 
  onPhaseChange,
  className = ''
}: ValidationJourneyMapProps) {
  // Sort phases by order
  const sortedPhases = [...phases].sort((a, b) => a.order - b.order);
  
  // State to track newly completed phases
  const [recentlyCompletedPhase, setRecentlyCompletedPhase] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Calculate overall progress
  const completedPhases = phases.filter(phase => phase.isCompleted).length;
  const totalPhases = phases.length;
  const overallProgress = totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0;
  
  // Check for newly completed phases
  useEffect(() => {
    const currentPhaseObj = phases.find(p => p.id === currentPhase);
    if (currentPhaseObj?.isCompleted) {
      // Check if this was recently completed
      const wasAlreadyCompleted = localStorage.getItem(`phase_${currentPhaseObj.id}_completed`);
      if (!wasAlreadyCompleted) {
        // Mark as completed in localStorage
        localStorage.setItem(`phase_${currentPhaseObj.id}_completed`, 'true');
        
        // Trigger celebration
        setRecentlyCompletedPhase(currentPhaseObj.id);
        setShowCelebration(true);
        
        // Trigger confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        
        // Hide celebration after 3 seconds
        setTimeout(() => {
          setShowCelebration(false);
        }, 3000);
      }
    }
  }, [phases, currentPhase]);
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-primary/10 backdrop-blur-sm rounded-lg p-8 text-center"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 10, 0] }}
                transition={{ repeat: 2, duration: 0.5 }}
              >
                <PartyPopper className="h-16 w-16 text-primary mx-auto mb-4" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2">Phase Completed!</h3>
              <p className="text-muted-foreground">
                {phases.find((p) => p.id === recentlyCompletedPhase)?.name}{" "}
                phase has been completed.
              </p>
              <div className="mt-4">
                <Badge variant="outline" className="bg-primary/20 text-primary">
                  +1 Milestone Achieved
                </Badge>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visual timeline with connected phases */}
      <div className="flex items-center justify-between relative">
        {sortedPhases.map((phase, index) => (
          <React.Fragment key={phase.id}>
            {/* Phase node */}
            <HoverCard>
              <HoverCardTrigger asChild>
                <motion.div
                  className={`
                    relative z-10 rounded-full p-3 cursor-pointer transition-all
                    ${
                      currentPhase === phase.id
                        ? "bg-primary/20 text-primary shadow-lg ring-2 ring-primary/20"
                        : phase.isCompleted
                        ? "bg-primary/20 text-primary hover:bg-primary/30"
                        : phase.isActive
                        ? "bg-muted text-muted-foreground hover:bg-muted/80"
                        : "bg-muted/50 text-muted-foreground/50 cursor-not-allowed"
                    }
                  `}
                  whileHover={{ scale: phase.isActive ? 1.1 : 1 }}
                  whileTap={{ scale: phase.isActive ? 0.95 : 1 }}
                  onClick={() => phase.isActive && onPhaseChange(phase.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                >
                  {getPhaseIcon(phase.icon)}
                  <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-sm font-medium">
                    {phase.name}
                  </span>
                  {phase.isCompleted && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 15,
                        delay: index * 0.1 + 0.2,
                      }}
                    >
                      <Badge
                        variant="secondary"
                        className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center rounded-full"
                      >
                        ✓
                      </Badge>
                    </motion.div>
                  )}

                  {/* Add a pulsing effect for the current active phase */}
                  {currentPhase === phase.id && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-primary"
                      initial={{ opacity: 0, scale: 1 }}
                      animate={{ opacity: [0, 0.2, 0], scale: [1, 1.3, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "loop",
                      }}
                      style={{ zIndex: -1 }}
                    />
                  )}
                </motion.div>
              </HoverCardTrigger>
              <HoverCardContent className="w-72 p-0 overflow-hidden">
                <div className="bg-primary/5 p-3 border-b">
                  <h4 className="font-semibold flex items-center">
                    {getPhaseIcon(phase.icon)}
                    <span className="ml-2">{phase.name}</span>
                    {phase.isCompleted && (
                      <Badge variant="success" className="ml-auto">
                        Completed
                      </Badge>
                    )}
                  </h4>
                </div>
                <div className="p-3 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {phase.description}
                  </p>

                  <div className="flex items-center pt-2">
                    <Badge
                      variant={
                        phase.isCompleted
                          ? "success"
                          : phase.isActive
                          ? "default"
                          : "outline"
                      }
                    >
                      {phase.isCompleted
                        ? "Completed"
                        : phase.isActive
                        ? "Active"
                        : "Not Started"}
                    </Badge>

                    {phase.isCompleted && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="ml-auto">
                              <Award className="h-5 w-5 text-amber-500" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Phase completed! Great job!</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>

                  {phase.milestones && phase.milestones.length > 0 && (
                    <div className="mt-2">
                      <h5 className="text-xs font-medium mb-1">
                        Key Milestones:
                      </h5>
                      <ul className="text-xs space-y-1">
                        {phase.milestones.slice(0, 3).map((milestone) => (
                          <li key={milestone.id} className="flex items-center">
                            <div
                              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                milestone.status === "completed"
                                  ? "bg-green-500"
                                  : milestone.status === "in-progress"
                                  ? "bg-blue-500"
                                  : "bg-gray-300"
                              }`}
                            />
                            <span className="truncate">{milestone.title}</span>
                          </li>
                        ))}
                        {phase.milestones.length > 3 && (
                          <li className="text-xs text-muted-foreground">
                            +{phase.milestones.length - 3} more
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {currentPhase !== phase.id && phase.isActive && (
                    <button
                      onClick={() => onPhaseChange(phase.id)}
                      className="text-xs text-primary hover:underline mt-2"
                    >
                      Go to this phase
                    </button>
                  )}
                </div>
              </HoverCardContent>
            </HoverCard>

            {/* Connector line between phases */}
            {index < sortedPhases.length - 1 && (
              <div
                className={`
                flex-1 h-1 mx-2 relative overflow-hidden rounded-full
                ${
                  index < sortedPhases.findIndex((p) => p.id === currentPhase)
                    ? "bg-primary"
                    : index ===
                      sortedPhases.findIndex((p) => p.id === currentPhase)
                    ? "bg-gradient-to-r from-primary to-muted"
                    : "bg-muted"
                }
              `}
              >
                {/* Progress indicator */}
                {index <
                  sortedPhases.findIndex((p) => p.id === currentPhase) && (
                  <motion.div
                    className="absolute inset-0 bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{
                      duration: 0.5,
                      ease: "easeOut",
                      delay: index * 0.1 + 0.3,
                    }}
                  />
                )}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Mobile-friendly phase selector (visible on small screens) */}
      <div className="md:hidden mt-8">
        <select
          className="w-full p-2 border rounded-md"
          value={currentPhase}
          onChange={(e) => onPhaseChange(e.target.value)}
        >
          {sortedPhases.map((phase) => (
            <option key={phase.id} value={phase.id} disabled={!phase.isActive}>
              {phase.name} {phase.isCompleted ? "(Completed)" : ""}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
} 