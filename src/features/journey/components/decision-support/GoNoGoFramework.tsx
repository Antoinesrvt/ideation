import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  ThumbsUp, 
  ThumbsDown, 
  AlertTriangle,
  ChevronRight, 
  ChevronDown, 
  CircleCheck, 
  CircleX
} from 'lucide-react';

interface GoNoGoCriterion {
  id: string;
  name: string;
  description: string;
  score: number;
  evidence: string[];
  threshold: number;
}

interface GoNoGoStage {
  id: string;
  title: string;
  description: string;
  criteria: GoNoGoCriterion[];
  recommendation: {
    decision: 'go' | 'no-go' | 'consider';
    confidence: number;
    rationale: string;
  };
  nextSteps: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    link?: { section: string; tool: string };
  }>;
}

// Mock data for validation stage criteria
const VALIDATION_CRITERIA: GoNoGoCriterion[] = [
  {
    id: 'problem-solution-fit',
    name: 'Problem-Solution Fit',
    description: 'Evidence that your solution addresses a real problem',
    score: 0.75,
    evidence: [
      '6 user interviews confirmed problem exists',
      '4/6 users expressed strong interest in solution',
      'MVP prototype resonated with test users'
    ],
    threshold: 0.7
  },
  {
    id: 'market-size',
    name: 'Market Size',
    description: 'Sufficient market size to support business model',
    score: 0.85,
    evidence: [
      'TAM of $2.5B validated through research',
      'SAM of $450M identified',
      'Initial target segment is $50M'
    ],
    threshold: 0.6
  },
  {
    id: 'value-proposition',
    name: 'Compelling Value Proposition',
    description: 'Clear value proposition that resonates with target customers',
    score: 0.65,
    evidence: [
      'Value proposition tested with 8 potential customers',
      '5/8 found it compelling',
      'Main competitor comparison shows unique differentiators'
    ],
    threshold: 0.7
  },
  {
    id: 'validation-methods',
    name: 'Validation Methodology',
    description: 'Robust methods used to validate assumptions',
    score: 0.55,
    evidence: [
      'Used multiple validation methods (interviews, surveys, landing page)',
      'Small sample size limits confidence',
      'More validation needed in specific segments'
    ],
    threshold: 0.6
  },
  {
    id: 'willingness-to-pay',
    name: 'Willingness to Pay',
    description: 'Evidence that customers will pay for your solution',
    score: 0.4,
    evidence: [
      'Only 2/6 users indicated clear willingness to pay',
      'Price sensitivity higher than expected',
      'Competing free solutions create friction'
    ],
    threshold: 0.65
  }
];

// Mock data for stages
const STAGES: Record<string, GoNoGoStage> = {
  'validity': {
    id: 'validity',
    title: 'Check Validity',
    description: 'Evaluate whether your solution has been validated with potential customers and in the market',
    criteria: VALIDATION_CRITERIA,
    recommendation: {
      decision: 'consider',
      confidence: 0.65,
      rationale: 'Strong problem-solution fit and market size, but concerns about willingness to pay and validation methods. More evidence needed before proceeding.'
    },
    nextSteps: [
      {
        action: 'Conduct 5 more user interviews focused on pricing',
        priority: 'high',
        link: { section: 'validation', tool: 'interviews' }
      },
      {
        action: 'Create a landing page with pricing tiers to test conversion',
        priority: 'medium',
        link: { section: 'validation', tool: 'landing-page' }
      },
      {
        action: 'Refine value proposition based on feedback',
        priority: 'medium',
        link: { section: 'business-model', tool: 'canvas' }
      }
    ]
  },
  'viability': {
    id: 'viability',
    title: 'Check Viability',
    description: 'Evaluate the business model viability and financial projections',
    criteria: [],
    recommendation: {
      decision: 'go',
      confidence: 0,
      rationale: ''
    },
    nextSteps: []
  },
  'create': {
    id: 'create',
    title: 'Create First Product',
    description: 'Evaluate readiness to build the initial product version',
    criteria: [],
    recommendation: {
      decision: 'go',
      confidence: 0,
      rationale: ''
    },
    nextSteps: []
  }
};

interface GoNoGoFrameworkProps {
  stageId: string;
}

export function GoNoGoFramework({ stageId = 'validity' }: GoNoGoFrameworkProps) {
  const [expandedCriteria, setExpandedCriteria] = useState<string[]>([]);
  
  // Get stage data
  const stage = STAGES[stageId] || STAGES.validity;
  
  // Calculate overall score
  const overallScore = stage.criteria.reduce((sum, criterion) => sum + criterion.score, 0) / stage.criteria.length;
  
  // Count criteria that meet threshold
  const criteriaMetCount = stage.criteria.filter(criterion => criterion.score >= criterion.threshold).length;
  
  // Toggle expansion of a criterion
  const toggleCriterion = (id: string) => {
    if (expandedCriteria.includes(id)) {
      setExpandedCriteria(expandedCriteria.filter(c => c !== id));
    } else {
      setExpandedCriteria([...expandedCriteria, id]);
    }
  };
  
  // Get status badge for recommendation
  const getStatusBadge = (decision: 'go' | 'no-go' | 'consider') => {
    switch (decision) {
      case 'go':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <ThumbsUp className="h-3 w-3 mr-1" /> Go
          </Badge>
        );
      case 'no-go':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            <ThumbsDown className="h-3 w-3 mr-1" /> No-Go
          </Badge>
        );
      case 'consider':
      default:
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
            <AlertTriangle className="h-3 w-3 mr-1" /> Consider
          </Badge>
        );
    }
  };
  
  // Get priority badge
  const getPriorityBadge = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case 'medium':
        return <Badge className="bg-amber-100 text-amber-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-blue-100 text-blue-800">Low</Badge>;
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl flex items-center">
                <Zap className="h-5 w-5 mr-2 text-amber-500" />
                Go/No-Go Assessment: {stage.title}
              </CardTitle>
              <CardDescription className="mt-1.5">
                {stage.description}
              </CardDescription>
            </div>
            {getStatusBadge(stage.recommendation.decision)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-gray-700">Overall Score</div>
              <div className="text-sm font-medium">
                {Math.round(overallScore * 100)}%
              </div>
            </div>
            <Progress 
              value={overallScore * 100} 
              className="h-2" 
              indicatorClassName={`${
                overallScore >= 0.7 
                  ? 'bg-green-500' 
                  : overallScore >= 0.5 
                    ? 'bg-amber-500' 
                    : 'bg-red-500'
              }`} 
            />
            <div className="mt-2 text-sm text-gray-600">
              {criteriaMetCount}/{stage.criteria.length} criteria met threshold
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-md font-medium mb-3">Assessment Criteria</h3>
            <div className="space-y-3">
              {stage.criteria.map(criterion => (
                <Card 
                  key={criterion.id}
                  className={`border ${
                    criterion.score >= criterion.threshold 
                      ? 'border-green-200' 
                      : 'border-amber-200'
                  }`}
                >
                  <CardHeader className="p-4 pb-0">
                    <div 
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => toggleCriterion(criterion.id)}
                    >
                      <div className="flex items-center">
                        {criterion.score >= criterion.threshold 
                          ? <CircleCheck className="h-5 w-5 text-green-500 mr-2" /> 
                          : <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                        }
                        <div>
                          <h4 className="font-medium text-gray-900">{criterion.name}</h4>
                          <p className="text-xs text-gray-600">{criterion.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="mr-3 text-sm font-medium">
                          {Math.round(criterion.score * 100)}%
                        </div>
                        {expandedCriteria.includes(criterion.id) 
                          ? <ChevronDown className="h-4 w-4 text-gray-500" />
                          : <ChevronRight className="h-4 w-4 text-gray-500" />
                        }
                      </div>
                    </div>
                  </CardHeader>
                  
                  {expandedCriteria.includes(criterion.id) && (
                    <CardContent className="pt-2">
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <div>0%</div>
                          <div>Threshold: {criterion.threshold * 100}%</div>
                          <div>100%</div>
                        </div>
                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          {/* Threshold marker */}
                          <div 
                            className="absolute h-3 w-0.5 bg-gray-500 rounded-full"
                            style={{ 
                              left: `calc(${criterion.threshold * 100}% - 1px)`, 
                              marginTop: '-2px' 
                            }}
                          />
                          {/* Progress bar */}
                          <div 
                            className={`h-full ${
                              criterion.score >= criterion.threshold 
                                ? 'bg-green-500' 
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${criterion.score * 100}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <h5 className="text-xs font-medium text-gray-700 mb-1">Supporting Evidence:</h5>
                        <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
                          {criterion.evidence.map((evidence, i) => (
                            <li key={i}>{evidence}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
          
          <div className="mb-3">
            <h3 className="text-md font-medium mb-2">Recommendation</h3>
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-sm mb-2">
                <span className="font-medium">Confidence:</span> {Math.round(stage.recommendation.confidence * 100)}%
              </div>
              <p className="text-sm text-gray-700">{stage.recommendation.rationale}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-md font-medium mb-2">Next Steps</h3>
            <div className="space-y-2">
              {stage.nextSteps.map((step, i) => (
                <div key={i} className="flex items-start p-2 border rounded-md border-gray-200">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="text-sm font-medium">{step.action}</span>
                      <div className="ml-2">
                        {getPriorityBadge(step.priority)}
                      </div>
                    </div>
                  </div>
                  {step.link && (
                    <Button variant="ghost" size="sm" className="text-blue-600">
                      Go to tool
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 