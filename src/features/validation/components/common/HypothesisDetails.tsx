import React from 'react';
import { ValidationHypothesis } from '@/store/types';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  Calendar, 
  Percent,
  FileText
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

export interface HypothesisDetailsProps {
  hypothesis: ValidationHypothesis;
}

export function HypothesisDetails({ hypothesis }: HypothesisDetailsProps) {
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
      case 'validated':
        return 'success';
      case 'invalidated':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string | null) => {
    if (!status) return <HelpCircle className="h-4 w-4" />;
    switch (status) {
      case 'validated':
        return <CheckCircle className="h-4 w-4" />;
      case 'invalidated':
        return <XCircle className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (confidence: number | null) => {
    if (!confidence) return 'bg-gray-200';
    if (confidence >= 80) return 'bg-green-500';
    if (confidence >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Main statement */}
      <div>
        <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Hypothesis Statement
        </h3>
        <Card>
          <CardContent className="p-4">
            <p className="text-base whitespace-pre-line">{hypothesis.statement}</p>
          </CardContent>
        </Card>
      </div>

      {/* Status and confidence */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusIcon(hypothesis.status)}
              <Badge variant={getStatusColor(hypothesis.status) as any} className="capitalize">
                {hypothesis.status || 'Not set'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Percent className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{hypothesis.confidence || 0}%</span>
                </div>
              </div>
              <Progress value={hypothesis.confidence || 0} className={`h-2 ${getConfidenceColor(hypothesis.confidence)}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assumptions */}
      <div>
        <h3 className="text-sm font-medium mb-2 flex items-center gap-2 text-muted-foreground">
          <FileText className="h-4 w-4" />
          Assumptions
        </h3>
        {hypothesis.assumptions && hypothesis.assumptions.length > 0 ? (
          <ul className="space-y-2 pl-5 list-disc">
            {hypothesis.assumptions.map((assumption, index) => (
              <li key={index} className="text-sm">{assumption}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground italic">No assumptions recorded</p>
        )}
      </div>

      <Separator />

      {/* Validation method */}
      <div>
        <h3 className="text-sm font-medium mb-2 flex items-center gap-2 text-muted-foreground">
          <CheckCircle className="h-4 w-4" />
          Validation Method
        </h3>
        {hypothesis.validation_method ? (
          <p className="text-sm whitespace-pre-line">{hypothesis.validation_method}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">No validation method specified</p>
        )}
      </div>

      {/* Evidence */}
      <div>
        <h3 className="text-sm font-medium mb-2 flex items-center gap-2 text-muted-foreground">
          <FileText className="h-4 w-4" />
          Evidence
        </h3>
        {hypothesis.evidence && hypothesis.evidence.length > 0 ? (
          <ul className="space-y-2 pl-5 list-disc">
            {hypothesis.evidence.map((evidence, index) => (
              <li key={index} className="text-sm">{evidence}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground italic">No evidence recorded</p>
        )}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <h3 className="text-xs font-medium mb-1 flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Created
          </h3>
          <p className="text-sm">{formatDate(hypothesis.created_at)}</p>
        </div>
        <div>
          <h3 className="text-xs font-medium mb-1 flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Last Updated
          </h3>
          <p className="text-sm">{formatDate(hypothesis.updated_at)}</p>
        </div>
      </div>
    </div>
  );
} 