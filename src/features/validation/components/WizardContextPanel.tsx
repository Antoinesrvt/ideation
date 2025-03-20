import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronRight, 
  ArrowRight, 
  Lightbulb, 
  Beaker, 
  SplitSquareVertical, 
  MessageSquare,
  PieChart,
  Info,
  Link,
  ChevronLeft
} from 'lucide-react';
import { motion } from 'framer-motion';

interface WizardContextPanelProps {
  activePhase: string;
  phaseTips: string[];
  relatedItems: {
    title: string;
    items: any[];
    type: string;
    emptyMessage: string;
  };
  onOpenForm: (type: string) => void;
  onPhaseChange: (phaseId: string) => void;
  onToggle: () => void;
}

export function WizardContextPanel({
  activePhase,
  phaseTips,
  relatedItems,
  onOpenForm,
  onPhaseChange,
  onToggle
}: WizardContextPanelProps) {
  // Get the appropriate icon for the current phase
  const getPhaseIcon = () => {
    switch (activePhase) {
      case 'hypothesize':
        return <Lightbulb className="h-5 w-5 text-amber-500" />;
      case 'experiment':
        return <Beaker className="h-5 w-5 text-blue-500" />;
      case 'test':
        return <SplitSquareVertical className="h-5 w-5 text-purple-500" />;
      case 'feedback':
        return <MessageSquare className="h-5 w-5 text-green-500" />;
      case 'overview':
      case 'results':
        return <PieChart className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Get the appropriate title for the current phase
  const getPhaseName = () => {
    switch (activePhase) {
      case 'hypothesize':
        return 'Hypothesize';
      case 'experiment':
        return 'Experiment';
      case 'test':
        return 'A/B Test';
      case 'feedback':
        return 'User Feedback';
      case 'overview':
        return 'Overview';
      case 'results':
        return 'Results';
      default:
        return 'Validation';
    }
  };
  
  // Get the appropriate description for the current phase
  const getPhaseDescription = () => {
    switch (activePhase) {
      case 'hypothesize':
        return 'Create and validate hypotheses about your product ideas';
      case 'experiment':
        return 'Design experiments to test your hypotheses';
      case 'test':
        return 'Run A/B tests to validate your experiments';
      case 'feedback':
        return 'Collect and analyze user feedback';
      case 'overview':
        return 'Review your validation progress';
      case 'results':
        return 'Analyze your validation results';
      default:
        return 'Validate your product ideas';
    }
  };
  
  // Get the appropriate action for the current phase
  const getPhaseAction = () => {
    switch (activePhase) {
      case 'hypothesize':
        return {
          label: 'Add Hypothesis',
          action: () => onOpenForm('hypothesis')
        };
      case 'experiment':
        return {
          label: 'Add Experiment',
          action: () => onOpenForm('experiment')
        };
      case 'test':
        return {
          label: 'Add A/B Test',
          action: () => onOpenForm('abTest')
        };
      case 'feedback':
        return {
          label: 'Add Feedback',
          action: () => onOpenForm('userFeedback')
        };
      default:
        return null;
    }
  };
  
  const phaseAction = getPhaseAction();
  
  // Render a related item based on its type
  const renderRelatedItem = (item: any) => {
    switch (relatedItems.type) {
      case 'hypotheses':
        return (
          <div key={item.id} className="p-2 bg-muted/30 rounded-md">
            <div className="flex items-start">
              <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium truncate">{item.statement}</p>
                <p className="text-xs text-muted-foreground">
                  Status: {item.status || 'unvalidated'}
                </p>
              </div>
            </div>
          </div>
        );
      case 'experiments':
        return (
          <div key={item.id} className="p-2 bg-muted/30 rounded-md">
            <div className="flex items-start">
              <Beaker className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  Status: {item.status || 'planned'}
                </p>
              </div>
            </div>
          </div>
        );
      case 'abTests':
        return (
          <div key={item.id} className="p-2 bg-muted/30 rounded-md">
            <div className="flex items-start">
              <SplitSquareVertical className="h-4 w-4 text-purple-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  Status: {item.status || 'planned'}
                </p>
              </div>
            </div>
          </div>
        );
      case 'feedback':
        return (
          <div key={item.id} className="p-2 bg-muted/30 rounded-md">
            <div className="flex items-start">
              <MessageSquare className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium truncate">{item.content}</p>
                <p className="text-xs text-muted-foreground">
                  Sentiment: {item.analysis?.sentiment || 'not analyzed'}
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  
  // Get the next phase in the validation journey
  const getNextPhase = () => {
    switch (activePhase) {
      case 'overview':
        return 'hypothesize';
      case 'hypothesize':
        return 'experiment';
      case 'experiment':
        return 'test';
      case 'test':
        return 'feedback';
      case 'feedback':
        return 'results';
      default:
        return 'overview';
    }
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {getPhaseIcon()}
            <CardTitle className="ml-2 text-lg">{getPhaseName()}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onToggle}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>{getPhaseDescription()}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Phase tips */}
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center">
            <Info className="h-4 w-4 mr-1.5 text-primary" />
            Pro Tips
          </h3>
          <div className="space-y-2">
            {phaseTips.map((tip, index) => (
              <div key={index} className="flex items-start">
                <ArrowRight className="h-3.5 w-3.5 text-primary mt-0.5 mr-1.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">{tip}</p>
              </div>
            ))}
          </div>
        </div>
        
        <Separator />
        
        {/* Related items */}
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center">
            <Link className="h-4 w-4 mr-1.5 text-primary" />
            {relatedItems.title}
          </h3>
          
          {relatedItems.items.length > 0 ? (
            <div className="space-y-2">
              {relatedItems.items.map(renderRelatedItem)}
              
              {relatedItems.items.length > 3 && (
                <Button 
                  variant="link" 
                  className="text-xs p-0 h-auto"
                  onClick={() => {
                    // Navigate to the appropriate phase based on the related items type
                    switch (relatedItems.type) {
                      case 'hypotheses':
                        onPhaseChange('hypothesize');
                        break;
                      case 'experiments':
                        onPhaseChange('experiment');
                        break;
                      case 'abTests':
                        onPhaseChange('test');
                        break;
                      case 'feedback':
                        onPhaseChange('feedback');
                        break;
                      default:
                        break;
                    }
                  }}
                >
                  View all ({relatedItems.items.length})
                </Button>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{relatedItems.emptyMessage}</p>
          )}
        </div>
        
        <Separator />
        
        {/* Next steps */}
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center">
            <ChevronRight className="h-4 w-4 mr-1.5 text-primary" />
            Next Steps
          </h3>
          
          <div className="space-y-2">
            {phaseAction && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={phaseAction.action}
              >
                {phaseAction.label}
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => onPhaseChange(getNextPhase())}
            >
              Continue to {getNextPhase() === 'hypothesize' ? 'Hypotheses' : 
                          getNextPhase() === 'experiment' ? 'Experiments' :
                          getNextPhase() === 'test' ? 'A/B Tests' :
                          getNextPhase() === 'feedback' ? 'User Feedback' :
                          getNextPhase() === 'results' ? 'Results' : 'Overview'}
              <ChevronRight className="h-4 w-4 ml-auto" />
            </Button>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full"
          onClick={() => onPhaseChange('overview')}
        >
          <PieChart className="h-4 w-4 mr-2" />
          View Overall Progress
        </Button>
      </CardFooter>
    </Card>
  );
} 