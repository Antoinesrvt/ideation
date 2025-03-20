import React from 'react';
import { EnhancedValidationExperiment } from '../../types';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Beaker, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  FileText,
  BarChart,
  Target,
  Lightbulb
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

export interface ExperimentDetailsProps {
  experiment: EnhancedValidationExperiment;
}

export function ExperimentDetails({ experiment }: ExperimentDetailsProps) {
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string | null) => {
    if (!status) return 'default';
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'warning';
      case 'cancelled':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string | null) => {
    if (!status) return <HelpCircle className="h-4 w-4" />;
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in-progress':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getMetricProgressColor = (actual: number, target: number) => {
    const percentage = (actual / target) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Main information */}
      <div>
        <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
          <Beaker className="h-5 w-5 text-blue-500" />
          Experiment Details
        </h3>
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">{experiment.title}</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{experiment.description}</p>
          </CardContent>
        </Card>
      </div>

      {/* Status and timeline */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusIcon(experiment.status)}
              <Badge variant={getStatusColor(experiment.status) as any} className="capitalize">
                {experiment.status || 'Not set'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Start: {formatDate(experiment.start_date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>End: {formatDate(experiment.end_date)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hypothesis */}
      {experiment.hypothesis && (
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2 text-muted-foreground">
            <Lightbulb className="h-4 w-4" />
            Related Hypothesis
          </h3>
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-4">
              <p className="text-sm">{experiment.hypothesis}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Separator />

      {/* Metrics */}
      {experiment.metrics && experiment.metrics.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2 text-muted-foreground">
            <BarChart className="h-4 w-4" />
            Metrics
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {experiment.metrics.map((metric, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{metric.key}</CardTitle>
                    <Badge variant={metric.actual >= metric.target ? 'success' : 'default'}>
                      {metric.actual >= metric.target ? 'Achieved' : 'In Progress'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span>Target: {metric.target}</span>
                      </div>
                      <span>Actual: {metric.actual}</span>
                    </div>
                    <Progress 
                      value={Math.min((metric.actual / metric.target) * 100, 100)} 
                      className={`h-2 ${getMetricProgressColor(metric.actual, metric.target)}`} 
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {experiment.results && (
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2 text-muted-foreground">
            <CheckCircle className="h-4 w-4" />
            Results
          </h3>
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Success</p>
                  <Badge variant={experiment.results.success ? 'success' : 'destructive'}>
                    {experiment.results.success ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Sample Size</p>
                  <p className="text-sm font-medium">{experiment.results.sampleSize}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Conversion Rate</p>
                  <p className="text-sm font-medium">{experiment.results.conversionRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">P-Value</p>
                  <p className="text-sm font-medium">{experiment.results.pValue}</p>
                </div>
              </div>
              {experiment.results.notes && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm whitespace-pre-line">{experiment.results.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Learnings */}
      {experiment.learnings && (
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4" />
            Learnings
          </h3>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm whitespace-pre-line">{experiment.learnings}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <h3 className="text-xs font-medium mb-1 flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Created
          </h3>
          <p className="text-sm">{formatDate(experiment.created_at)}</p>
        </div>
        <div>
          <h3 className="text-xs font-medium mb-1 flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Last Updated
          </h3>
          <p className="text-sm">{formatDate(experiment.updated_at)}</p>
        </div>
      </div>
    </div>
  );
} 