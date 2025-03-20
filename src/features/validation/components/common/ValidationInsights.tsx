import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight, 
  Brain,
  BarChart,
  Target,
  Zap,
  ThumbsUp,
  ThumbsDown,
  MessageSquare
} from 'lucide-react';
import { ValidationItemType } from './ValidationItemModal';
import { Progress } from '@/components/ui/progress';

export interface ValidationInsightProps {
  itemType: ValidationItemType;
  data: any;
  relationships?: any[];
}

interface InsightCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  actions?: React.ReactNode;
}

// Define the insight item interface
interface InsightItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  variant: 'default' | 'success' | 'warning' | 'danger' | 'info';
  qualityScore?: number;
}

function InsightCard({ 
  title, 
  description, 
  icon, 
  variant = 'default',
  actions
}: InsightCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'danger':
        return 'bg-red-50 border-red-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getIconStyles = () => {
    switch (variant) {
      case 'success':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'danger':
        return 'text-red-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card className={`${getVariantStyles()} border shadow-sm`}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className={`${getIconStyles()}`}>
            {icon}
          </div>
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm text-gray-700 whitespace-pre-line">
          {description}
        </CardDescription>
        {actions && (
          <div className="mt-4">
            {actions}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ValidationInsights({ itemType, data, relationships = [] }: ValidationInsightProps) {
  // Generate insights based on item type and data
  const getHypothesisInsights = (): InsightItem[] => {
    const insights: InsightItem[] = [];
    
    // Quality assessment
    const hasAssumptions = data.assumptions && data.assumptions.length > 0;
    const hasValidationMethod = data.validation_method && data.validation_method.length > 0;
    const hasEvidence = data.evidence && data.evidence.length > 0;
    
    const qualityScore = [
      data.statement && data.statement.length > 20 ? 25 : 0,
      hasAssumptions ? 25 : 0,
      hasValidationMethod ? 25 : 0,
      hasEvidence ? 25 : 0
    ].reduce((a, b) => a + b, 0);
    
    insights.push({
      title: 'Hypothesis Quality Assessment',
      description: `This hypothesis is ${qualityScore >= 75 ? 'well-formed' : qualityScore >= 50 ? 'adequately formed' : 'needs improvement'}.
      
${!data.statement || data.statement.length < 20 ? '• The hypothesis statement could be more specific and detailed.\n' : ''}
${!hasAssumptions ? '• Consider adding key assumptions that underlie this hypothesis.\n' : ''}
${!hasValidationMethod ? '• A validation method should be defined to test this hypothesis.\n' : ''}
${!hasEvidence ? '• Add supporting evidence as you validate this hypothesis.\n' : ''}

A strong hypothesis clearly states what you believe, why you believe it, and how you'll test it.`,
      icon: <Target className="h-5 w-5" />,
      variant: qualityScore >= 75 ? 'success' : qualityScore >= 50 ? 'info' : 'warning',
      qualityScore
    });
    
    // Validation status
    if (data.status === 'validated' || data.status === 'invalidated') {
      insights.push({
        title: data.status === 'validated' ? 'Validated Hypothesis' : 'Invalidated Hypothesis',
        description: `This hypothesis has been ${data.status}. 
        
${data.status === 'validated' 
  ? 'Consider creating experiments to further explore and refine your understanding.' 
  : 'Consider revising your hypothesis or exploring alternative approaches based on what you learned.'}

${hasEvidence 
  ? `Evidence collected: ${data.evidence.length} item${data.evidence.length !== 1 ? 's' : ''}` 
  : 'No evidence has been recorded yet. Adding evidence strengthens your validation.'}`,
        icon: data.status === 'validated' ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />,
        variant: data.status === 'validated' ? 'success' : 'info'
      });
    } else {
      insights.push({
        title: 'Hypothesis Needs Validation',
        description: `This hypothesis has not been validated yet. 
        
Consider these validation methods:
• Create an experiment to test a specific aspect
• Run an A/B test to compare alternatives
• Collect user feedback related to this hypothesis

Validating hypotheses quickly helps you focus on the most promising ideas.`,
        icon: <Lightbulb className="h-5 w-5" />,
        variant: 'warning'
      });
    }
    
    // Related items
    const relatedExperiments = relationships.filter(r => 
      r.targetType === 'experiment' && r.sourceId === data.id
    ).length;
    
    const relatedTests = relationships.filter(r => 
      r.targetType === 'abTest' && r.sourceId === data.id
    ).length;
    
    if (relatedExperiments > 0 || relatedTests > 0) {
      insights.push({
        title: 'Connected Validation Activities',
        description: `This hypothesis is connected to:
        
${relatedExperiments > 0 ? `• ${relatedExperiments} experiment${relatedExperiments !== 1 ? 's' : ''}\n` : ''}
${relatedTests > 0 ? `• ${relatedTests} A/B test${relatedTests !== 1 ? 's' : ''}\n` : ''}

${relatedExperiments === 0 && data.status === 'unvalidated' 
  ? 'Consider creating an experiment to test this hypothesis.' 
  : ''}`,
        icon: <TrendingUp className="h-5 w-5" />,
        variant: 'info'
      });
    }
    
    return insights;
  };
  
  const getExperimentInsights = (): InsightItem[] => {
    const insights: InsightItem[] = [];
    
    // Status-based insights
    if (data.status === 'completed') {
      insights.push({
        title: 'Experiment Completed',
        description: `This experiment has been completed. 
        
${data.results 
  ? 'Results have been recorded. Consider creating follow-up experiments or A/B tests based on these findings.' 
  : 'No results have been recorded yet. Adding detailed results helps track what you learned.'}

${data.learnings 
  ? 'Key learnings have been documented.' 
  : 'Consider documenting key learnings from this experiment.'}`,
        icon: <CheckCircle className="h-5 w-5" />,
        variant: 'success'
      });
    } else if (data.status === 'in-progress') {
      insights.push({
        title: 'Experiment In Progress',
        description: `This experiment is currently running. 
        
${data.start_date 
  ? `Started on ${new Date(data.start_date).toLocaleDateString()}.` 
  : 'No start date has been recorded.'}
${data.end_date 
  ? `Scheduled to end on ${new Date(data.end_date).toLocaleDateString()}.` 
  : 'No end date has been set.'}

Remember to document results and learnings when the experiment concludes.`,
        icon: <TrendingUp className="h-5 w-5" />,
        variant: 'info'
      });
    } else {
      insights.push({
        title: 'Experiment Planned',
        description: `This experiment is planned but hasn't started yet.
        
${data.start_date 
  ? `Scheduled to start on ${new Date(data.start_date).toLocaleDateString()}.` 
  : 'No start date has been set.'}

Ensure you have clear metrics defined to measure the success of this experiment.`,
        icon: <Lightbulb className="h-5 w-5" />,
        variant: 'warning'
      });
    }
    
    // Metrics analysis
    const hasMetrics = data.metrics && Array.isArray(data.metrics) && data.metrics.length > 0;
    if (hasMetrics) {
      insights.push({
        title: 'Metrics Analysis',
        description: `This experiment has ${data.metrics.length} defined metric${data.metrics.length !== 1 ? 's' : ''}.
        
${data.status === 'completed' 
  ? 'Compare actual results against targets to evaluate success.' 
  : 'Ensure all metrics have clear targets before starting the experiment.'}`,
        icon: <BarChart className="h-5 w-5" />,
        variant: 'info'
      });
    } else {
      insights.push({
        title: 'No Metrics Defined',
        description: `This experiment doesn't have any metrics defined.
        
Well-defined metrics are essential for measuring the success of your experiment. Consider adding metrics such as:
• Conversion rate
• User engagement
• Task completion time
• Error rate`,
        icon: <AlertTriangle className="h-5 w-5" />,
        variant: 'warning'
      });
    }
    
    return insights;
  };
  
  const getABTestInsights = (): InsightItem[] => {
    const insights: InsightItem[] = [];
    
    // Status-based insights
    if (data.status === 'completed') {
      const hasWinner = data.winner && data.winner !== 'inconclusive';
      const hasConfidence = data.confidence && data.confidence > 0;
      const highConfidence = data.confidence && data.confidence >= 95;
      
      insights.push({
        title: hasWinner ? 'Test Completed with Clear Winner' : 'Test Completed',
        description: `This A/B test has been completed. 
        
${hasWinner 
  ? `Variant ${data.winner} performed better.` 
  : data.winner === 'inconclusive' 
    ? 'Results were inconclusive.' 
    : 'No winner has been recorded.'}
${hasConfidence 
  ? `Confidence level: ${data.confidence}% (${highConfidence ? 'High' : 'Moderate'} confidence)` 
  : 'No confidence level has been recorded.'}

${hasWinner && highConfidence 
  ? 'Consider implementing the winning variant.' 
  : data.winner === 'inconclusive' 
    ? 'Consider running a follow-up test with more distinct variants or larger sample size.' 
    : 'Make sure to record the winner and confidence level.'}`,
        icon: <CheckCircle className="h-5 w-5" />,
        variant: hasWinner && highConfidence ? 'success' : 'info'
      });
      
      // Improvement analysis
      if (data.conversion_a && data.conversion_b) {
        const improvement = ((data.conversion_b - data.conversion_a) / data.conversion_a) * 100;
        const significantImprovement = improvement >= 10;
        
        insights.push({
          title: 'Performance Improvement Analysis',
          description: `Variant B ${improvement >= 0 ? 'outperformed' : 'underperformed'} Variant A by ${Math.abs(improvement).toFixed(1)}%.
          
${significantImprovement 
  ? 'This is a significant improvement that could have meaningful business impact.' 
  : 'This is a modest improvement. Consider whether the change is worth implementing.'}

Sample size: ${data.sample_size || 'Not recorded'}`,
          icon: <TrendingUp className="h-5 w-5" />,
          variant: significantImprovement ? 'success' : 'info'
        });
      }
    } else if (data.status === 'running') {
      insights.push({
        title: 'A/B Test In Progress',
        description: `This A/B test is currently running. 
        
${data.start_date 
  ? `Started on ${new Date(data.start_date).toLocaleDateString()}.` 
  : 'No start date has been recorded.'}
${data.end_date 
  ? `Scheduled to end on ${new Date(data.end_date).toLocaleDateString()}.` 
  : 'No end date has been set.'}

Ensure you collect enough data for statistical significance before concluding the test.`,
        icon: <TrendingUp className="h-5 w-5" />,
        variant: 'info'
      });
    } else {
      insights.push({
        title: 'A/B Test Planned',
        description: `This A/B test is planned but hasn't started yet.
        
${data.start_date 
  ? `Scheduled to start on ${new Date(data.start_date).toLocaleDateString()}.` 
  : 'No start date has been set.'}

Ensure your variants are meaningfully different and you have a clear metric to measure.`,
        icon: <Lightbulb className="h-5 w-5" />,
        variant: 'warning'
      });
    }
    
    return insights;
  };
  
  const getUserFeedbackInsights = (): InsightItem[] => {
    const insights: InsightItem[] = [];
    
    // Sentiment analysis
    const sentiment = data.sentiment || 'neutral';
    insights.push({
      title: `${sentiment.charAt(0).toUpperCase() + sentiment.slice(1)} Feedback`,
      description: `This feedback has been classified as ${sentiment}.
      
${sentiment === 'positive' 
  ? 'Positive feedback can validate your hypotheses and confirm you are on the right track.' 
  : sentiment === 'negative' 
    ? 'Negative feedback provides valuable opportunities for improvement.' 
    : 'Neutral feedback may contain both positive and negative aspects.'}

${data.impact 
  ? `Impact level: ${data.impact} - ${data.impact === 'high' 
      ? 'This feedback should be prioritized.' 
      : data.impact === 'medium' 
        ? 'This feedback deserves attention.' 
        : 'This feedback may be addressed later.'}` 
  : 'No impact level has been assigned.'}`,
      icon: sentiment === 'positive' 
        ? <ThumbsUp className="h-5 w-5" /> 
        : sentiment === 'negative' 
          ? <AlertTriangle className="h-5 w-5" /> 
          : <MessageSquare className="h-5 w-5" />,
      variant: sentiment === 'positive' 
        ? 'success' 
        : sentiment === 'negative' 
          ? 'warning' 
          : 'info'
    });
    
    // Response status
    if (data.status === 'addressed' || data.status === 'implemented') {
      insights.push({
        title: 'Feedback Addressed',
        description: `This feedback has been ${data.status}.
        
${data.response 
  ? 'A response has been recorded.' 
  : 'Consider documenting how this feedback was addressed.'}

Closing the feedback loop helps build trust with users and improves your product.`,
        icon: <CheckCircle className="h-5 w-5" />,
        variant: 'success'
      });
    } else if (data.status === 'in_progress' || data.status === 'planned') {
      insights.push({
        title: 'Feedback Being Addressed',
        description: `This feedback is ${data.status === 'in_progress' ? 'currently being addressed' : 'planned to be addressed'}.
        
${data.response 
  ? 'An initial response has been recorded.' 
  : 'Consider providing an initial response to acknowledge this feedback.'}

Keeping users informed about how their feedback is being used improves engagement.`,
        icon: <TrendingUp className="h-5 w-5" />,
        variant: 'info'
      });
    } else {
      insights.push({
        title: 'Feedback Needs Action',
        description: `This feedback hasn't been addressed yet.
        
${data.impact === 'high' 
  ? 'This high-impact feedback should be prioritized.' 
  : 'Consider whether this feedback requires action.'}

${data.response 
  ? 'An initial response has been recorded.' 
  : 'Consider providing a response to acknowledge this feedback.'}`,
        icon: <AlertTriangle className="h-5 w-5" />,
        variant: 'warning'
      });
    }
    
    return insights;
  };
  
  let insights: InsightItem[] = [];
  
  switch (itemType) {
    case 'hypothesis':
      insights = getHypothesisInsights();
      break;
    case 'experiment':
      insights = getExperimentInsights();
      break;
    case 'abTest':
      insights = getABTestInsights();
      break;
    case 'userFeedback':
      insights = getUserFeedbackInsights();
      break;
    default:
      insights = [];
  }
  
  // Calculate overall quality score if available
  const qualityScore = insights.find(i => i.qualityScore !== undefined)?.qualityScore || 0;
  
  return (
    <div className="space-y-6">
      {qualityScore > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <h3 className="text-base font-medium">Quality Assessment</h3>
            </div>
            <Badge variant={qualityScore >= 75 ? 'success' : qualityScore >= 50 ? 'default' : 'destructive'}>
              {qualityScore}%
            </Badge>
          </div>
          <Progress value={qualityScore} className="h-2" />
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-4">
        {insights.map((insight, index) => (
          <InsightCard
            key={index}
            title={insight.title}
            description={insight.description}
            icon={insight.icon}
            variant={insight.variant}
          />
        ))}
      </div>
      
      <div className="flex items-center justify-center mt-8 text-sm text-muted-foreground">
        <Zap className="h-4 w-4 mr-2 text-primary" />
        <span>AI-generated insights based on your validation data</span>
      </div>
    </div>
  );
} 