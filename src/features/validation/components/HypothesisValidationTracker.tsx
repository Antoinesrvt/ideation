import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { 
  AlertCircle, ArrowRight, Beaker, CheckCircle2, Clock, ExternalLink, 
  FilePlus2, LineChart, MessageCircle, Plus, SplitSquareVertical, XCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { 
  HypothesisValidationTrackerProps, 
  EnhancedValidationExperiment, 
  EnhancedValidationABTest,
  EnhancedValidationUserFeedback 
} from '../types';

export function HypothesisValidationTracker({
  hypothesis,
  linkedExperiments,
  linkedTests,
  linkedFeedback,
  validationStatus,
  onAddExperiment,
  onViewResults
}: HypothesisValidationTrackerProps) {
  // Get date formatting helper
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Get status badge
  const getStatusBadge = (status: string | null) => {
    let variant = 'default';
    let icon = <Clock className="h-3 w-3 mr-1" />;
    
    switch(status) {
      case 'validated':
        variant = 'success';
        icon = <CheckCircle2 className="h-3 w-3 mr-1" />;
        break;
      case 'invalidated':
        variant = 'destructive';
        icon = <XCircle className="h-3 w-3 mr-1" />;
        break;
      case 'in-progress':
      case 'running':
        variant = 'warning';
        icon = <Clock className="h-3 w-3 mr-1" />;
        break;
      case 'planned':
        variant = 'outline';
        icon = <Clock className="h-3 w-3 mr-1" />;
        break;
      default:
        variant = 'default';
    }
    
    return (
      <Badge variant={variant as any} className="flex items-center">
        {icon} {status || 'Unknown'}
      </Badge>
    );
  };
  
  // Confidence indicator
  const getConfidenceIndicator = (confidence: number) => {
    let color = "bg-gray-300";
    
    if (confidence >= 80) {
      color = "bg-green-500";
    } else if (confidence >= 60) {
      color = "bg-blue-500";
    } else if (confidence >= 40) {
      color = "bg-yellow-500";
    } else if (confidence >= 20) {
      color = "bg-orange-500";
    } else {
      color = "bg-red-500";
    }
    
    return (
      <div className="flex items-center space-x-2">
        <div className={`h-2 w-2 rounded-full ${color}`} />
        <span className="text-sm text-muted-foreground">{confidence}% confidence</span>
      </div>
    );
  };
  
  // Get supporting evidence count
  const supportingCount = useMemo(() => {
    let count = 0;
    
    // Count successful experiments
    count += linkedExperiments.filter(e => 
      e.status === 'completed' && e.results?.success
    ).length;
    
    // Count positive A/B tests
    count += linkedTests.filter(t => 
      t.status === 'completed' && t.results?.winner === 'B'
    ).length;
    
    // Count positive feedback
    count += linkedFeedback.filter(f => 
      f.analysis?.sentiment === 'positive'
    ).length;
    
    return count;
  }, [linkedExperiments, linkedTests, linkedFeedback]);
  
  // Get contradicting evidence count
  const contradictingCount = useMemo(() => {
    let count = 0;
    
    // Count unsuccessful experiments
    count += linkedExperiments.filter(e => 
      e.status === 'completed' && !e.results?.success
    ).length;
    
    // Count negative or inconclusive A/B tests
    count += linkedTests.filter(t => 
      t.status === 'completed' && (t.results?.winner === 'A' || t.results?.winner === 'inconclusive')
    ).length;
    
    // Count negative feedback
    count += linkedFeedback.filter(f => 
      f.analysis?.sentiment === 'negative'
    ).length;
    
    return count;
  }, [linkedExperiments, linkedTests, linkedFeedback]);
  
  // Get in progress count
  const inProgressCount = useMemo(() => {
    let count = 0;
    
    // Count in-progress experiments
    count += linkedExperiments.filter(e => 
      e.status === 'in-progress'
    ).length;
    
    // Count running A/B tests
    count += linkedTests.filter(t => 
      t.status === 'running'
    ).length;
    
    return count;
  }, [linkedExperiments, linkedTests]);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl flex items-center">
              {hypothesis.statement || 'Unnamed Hypothesis'}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-2">
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-md">
                      A validation hypothesis should be testable with experiments, 
                      A/B tests, and user feedback. Aim for 80%+ confidence.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <CardDescription className="mt-1">
              Created on {formatDate(hypothesis.created_at)}
            </CardDescription>
          </div>
          {getStatusBadge(hypothesis.status)}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Hypothesis details */}
        <div className="text-sm text-muted-foreground">
          <p>{hypothesis.statement || ''}</p>
        </div>
        
        {/* Validation progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Validation Progress</span>
            <span>{validationStatus.progress}%</span>
          </div>
          <Progress value={validationStatus.progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{getConfidenceIndicator(validationStatus.confidence)}</span>
            <HoverCard>
              <HoverCardTrigger className="flex items-center">
                <span className="cursor-help">Evidence summary</span>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="grid grid-cols-3 gap-2 pb-2">
                  <div className="text-center">
                    <div className="text-green-600 text-lg font-bold">{supportingCount}</div>
                    <div className="text-xs text-muted-foreground">Supporting</div>
                  </div>
                  <div className="text-center">
                    <div className="text-red-600 text-lg font-bold">{contradictingCount}</div>
                    <div className="text-xs text-muted-foreground">Contradicting</div>
                  </div>
                  <div className="text-center">
                    <div className="text-amber-600 text-lg font-bold">{inProgressCount}</div>
                    <div className="text-xs text-muted-foreground">In progress</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  Confidence increases as you gather more supporting evidence.
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>
        
        {/* Connected validation activities */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Validation Activities</h4>
          
          {/* Experiments */}
          <ValidationActivitySection 
            title="Experiments" 
            icon={<Beaker className="h-4 w-4" />}
            items={linkedExperiments.map(exp => ({
              id: exp.id,
              title: exp.title || 'Unnamed Experiment',
              status: exp.status || 'unknown',
              result: exp.results?.success ? 'success' : exp.results ? 'failure' : undefined
            }))}
            emptyText="No experiments linked to this hypothesis."
            onAddClick={onAddExperiment}
          />
          
          {/* A/B Tests */}
          <ValidationActivitySection 
            title="A/B Tests" 
            icon={<SplitSquareVertical className="h-4 w-4" />}
            items={linkedTests.map(test => ({
              id: test.id,
              title: test.title || 'Unnamed A/B Test',
              status: test.status || 'unknown',
              result: test.results?.winner === 'B' ? 'success' : 
                     test.results?.winner === 'A' ? 'failure' :
                     test.results ? 'neutral' : undefined
            }))}
            emptyText="No A/B tests linked to this hypothesis."
            onAddClick={() => {}}
          />
          
          {/* User Feedback */}
          <ValidationActivitySection 
            title="User Feedback" 
            icon={<MessageCircle className="h-4 w-4" />}
            items={linkedFeedback.map(feedback => ({
              id: feedback.id,
              title: feedback.content || 'Unnamed Feedback',
              status: 'completed',
              result: feedback.analysis?.sentiment === 'positive' ? 'success' : 
                     feedback.analysis?.sentiment === 'negative' ? 'failure' : 'neutral'
            }))}
            emptyText="No user feedback linked to this hypothesis."
            onAddClick={() => {}}
          />
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onAddExperiment}>
          <Plus className="h-4 w-4 mr-2" />
          Add Experiment
        </Button>
        <Button onClick={onViewResults}>
          <LineChart className="h-4 w-4 mr-2" />
          View Results
        </Button>
      </CardFooter>
    </Card>
  );
}

// Helper component for validation activities
interface ValidationActivityItem {
  id: string;
  title: string;
  status: string;
  result?: 'success' | 'failure' | 'neutral';
}

interface ValidationActivitySectionProps {
  title: string;
  icon: React.ReactNode;
  items: ValidationActivityItem[];
  emptyText: string;
  onAddClick: () => void;
}

function ValidationActivitySection({
  title,
  icon,
  items,
  emptyText,
  onAddClick
}: ValidationActivitySectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded-full bg-muted">
            {icon}
          </div>
          <span className="text-sm font-medium">{title}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onAddClick} className="h-7">
          <Plus className="h-3 w-3 mr-1" />
          Add
        </Button>
      </div>
      
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">{emptyText}</p>
      ) : (
        <div className="space-y-1 pl-7">
          {items.map((item, index) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between py-1 px-2 rounded-md hover:bg-muted/50 text-sm"
            >
              <div className="flex items-center space-x-2">
                {item.result === 'success' ? (
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                ) : item.result === 'failure' ? (
                  <XCircle className="h-3 w-3 text-red-600" />
                ) : item.result === 'neutral' ? (
                  <AlertCircle className="h-3 w-3 text-amber-600" />
                ) : (
                  <Clock className="h-3 w-3 text-muted-foreground" />
                )}
                <span className="truncate max-w-[200px]">{item.title}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Badge variant="outline" className="text-xs py-0 px-1.5 h-5">
                  {item.status}
                </Badge>
                <Button variant="ghost" size="icon" className="h-5 w-5">
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
} 