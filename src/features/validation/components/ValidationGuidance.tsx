import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, 
  Beaker, 
  SplitSquareVertical, 
  MessageSquare, 
  PieChart,
  X,
  ChevronRight,
  ChevronLeft,
  HelpCircle
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface ValidationGuidanceProps {
  onClose: () => void;
  open?: boolean;
  className?: string;
}

export function ValidationGuidance({ onClose, open = false, className = '' }: ValidationGuidanceProps) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    {
      title: "Start with Hypotheses",
      description: "Begin by defining clear hypotheses about your product, market, or users that you want to validate.",
      icon: <Lightbulb className="h-8 w-8 text-amber-500" />,
      tips: [
        "Make hypotheses specific and testable",
        "Focus on key assumptions that could make or break your product",
        "Phrase as statements: 'Users will prefer feature X over Y'"
      ]
    },
    {
      title: "Design Experiments",
      description: "Create experiments to test each hypothesis with measurable outcomes and clear success criteria.",
      icon: <Beaker className="h-8 w-8 text-blue-500" />,
      tips: [
        "Define clear metrics for success/failure",
        "Keep experiments simple and focused",
        "Set a timeframe and sample size in advance"
      ]
    },
    {
      title: "Run A/B Tests",
      description: "Compare different versions of your product to determine which performs better with real users.",
      icon: <SplitSquareVertical className="h-8 w-8 text-purple-500" />,
      tips: [
        "Test one variable at a time",
        "Ensure statistical significance",
        "Document all test conditions"
      ]
    },
    {
      title: "Collect User Feedback",
      description: "Gather qualitative insights directly from users to complement your quantitative data.",
      icon: <MessageSquare className="h-8 w-8 text-green-500" />,
      tips: [
        "Ask open-ended questions",
        "Look for patterns across multiple users",
        "Pay attention to user behavior, not just what they say"
      ]
    },
    {
      title: "Analyze Results",
      description: "Review all validation data to extract insights and make informed decisions about your product.",
      icon: <PieChart className="h-8 w-8 text-red-500" />,
      tips: [
        "Look for both confirming and contradicting evidence",
        "Be willing to invalidate hypotheses",
        "Document learnings for future reference"
      ]
    }
  ];
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <HelpCircle className="h-5 w-5 mr-2 text-primary" />
            Validation Journey Guide
          </DialogTitle>
          <DialogDescription>
            Learn how to effectively validate your product ideas
          </DialogDescription>
        </DialogHeader>
        
        <Separator />
        
        <div className="pt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-start">
                <div className="mr-4 p-3 bg-primary/10 rounded-lg">
                  {steps[currentStep].icon}
                </div>
                <div>
                  <h3 className="text-lg font-medium">{steps[currentStep].title}</h3>
                  <p className="text-muted-foreground mt-1">{steps[currentStep].description}</p>
                </div>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-lg mt-4">
                <h4 className="text-sm font-medium mb-2">Pro Tips:</h4>
                <ul className="space-y-2">
                  {steps[currentStep].tips.map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs mr-2 mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </AnimatePresence>
          
          {/* Step indicator */}
          <div className="flex justify-center mt-6 space-x-1">
            {steps.map((_, index) => (
              <div 
                key={index} 
                className={`h-1.5 rounded-full transition-all ${
                  index === currentStep 
                    ? 'w-6 bg-primary' 
                    : 'w-1.5 bg-primary/30'
                }`}
                onClick={() => setCurrentStep(index)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={onClose}>
              Get Started
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 