import React from 'react';
import { EnhancedValidationABTest } from '../../types';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  SplitSquareVertical, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  FileText,
  BarChart,
  TrendingUp,
  Percent,
  Users
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

export interface ABTestDetailsProps {
  abTest: EnhancedValidationABTest;
}

export function ABTestDetails({ abTest }: ABTestDetailsProps) {
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
      case 'running':
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
      case 'running':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getWinnerColor = (winner: string | null) => {
    if (!winner) return 'default';
    switch (winner) {
      case 'A':
        return 'success';
      case 'B':
        return 'success';
      case 'inconclusive':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getConfidenceColor = (confidence: number | null) => {
    if (!confidence) return 'bg-gray-200';
    if (confidence >= 95) return 'bg-green-500';
    if (confidence >= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getImprovementColor = (improvement: number | null) => {
    if (!improvement) return 'text-gray-500';
    if (improvement > 0) return 'text-green-500';
    if (improvement < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Main information */}
      <div>
        <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
          <SplitSquareVertical className="h-5 w-5 text-purple-500" />
          A/B Test Details
        </h3>
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">{abTest.title}</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{abTest.description}</p>
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
              {getStatusIcon(abTest.status)}
              <Badge variant={getStatusColor(abTest.status) as any} className="capitalize">
                {abTest.status || 'Not set'}
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
                <span>Start: {formatDate(abTest.start_date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>End: {formatDate(abTest.end_date)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Variants */}
      <div>
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2 text-muted-foreground">
          <SplitSquareVertical className="h-4 w-4" />
          Test Variants
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <Card className={abTest.results?.winner === 'A' ? 'border-green-500' : ''}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Variant A</CardTitle>
                {abTest.results?.winner === 'A' && (
                  <Badge variant="success">Winner</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-sm whitespace-pre-line">{abTest.variant_a}</p>
            </CardContent>
          </Card>

          <Card className={abTest.results?.winner === 'B' ? 'border-green-500' : ''}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Variant B</CardTitle>
                {abTest.results?.winner === 'B' && (
                  <Badge variant="success">Winner</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-sm whitespace-pre-line">{abTest.variant_b}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Test metric */}
      <div>
        <h3 className="text-sm font-medium mb-2 flex items-center gap-2 text-muted-foreground">
          <BarChart className="h-4 w-4" />
          Test Metric
        </h3>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm">{abTest.metric || 'No metric specified'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {abTest.results && (
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2 text-muted-foreground">
            <CheckCircle className="h-4 w-4" />
            Results
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            {/* Winner and confidence */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Winner</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant={getWinnerColor(abTest.results.winner) as any} className="capitalize">
                    {abTest.results.winner === 'inconclusive' 
                      ? 'Inconclusive' 
                      : abTest.results.winner 
                        ? `Variant ${abTest.results.winner}` 
                        : 'Not determined'}
                  </Badge>
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
                        <span className="font-medium">{abTest.results.confidence || 0}%</span>
                      </div>
                    </div>
                    <Progress 
                      value={abTest.results.confidence || 0} 
                      className={`h-2 ${getConfidenceColor(abTest.results.confidence)}`} 
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Conversion rates */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Variant A</p>
                      <p className="text-sm font-medium">{abTest.results.conversionA}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Variant B</p>
                      <p className="text-sm font-medium">{abTest.results.conversionB}%</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Improvement</p>
                    <div className="flex items-center gap-1">
                      <TrendingUp className={`h-4 w-4 ${getImprovementColor(abTest.results.improvement)}`} />
                      <span className={`text-sm font-medium ${getImprovementColor(abTest.results.improvement)}`}>
                        {abTest.results.improvement > 0 ? '+' : ''}{abTest.results.improvement}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sample size */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Sample Size</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{abTest.results.sampleSize} participants</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Notes */}
      {abTest.notes && (
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4" />
            Notes
          </h3>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm whitespace-pre-line">{abTest.notes}</p>
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
          <p className="text-sm">{formatDate(abTest.created_at)}</p>
        </div>
        <div>
          <h3 className="text-xs font-medium mb-1 flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Last Updated
          </h3>
          <p className="text-sm">{formatDate(abTest.updated_at)}</p>
        </div>
      </div>
    </div>
  );
} 