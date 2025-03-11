import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ComplianceIssue {
  id: string;
  type: 'error' | 'warning';
  message: string;
  category: string;
  suggestions: string[];
  impact: 'high' | 'medium' | 'low';
}

interface ComplianceStats {
  total: number;
  compliant: number;
  warnings: number;
  errors: number;
}

export interface ComplianceCheckerProps {
  issues: ComplianceIssue[];
  stats: ComplianceStats;
  onFixIssue?: (issueId: string) => void;
  className?: string;
}

export function ComplianceChecker({
  issues,
  stats,
  onFixIssue,
  className
}: ComplianceCheckerProps) {
  const complianceScore = Math.round((stats.compliant / stats.total) * 100);

  const getImpactColor = (impact: ComplianceIssue['impact']) => {
    switch (impact) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-amber-600';
      case 'low':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTypeIcon = (type: ComplianceIssue['type']) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return null;
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Brand Compliance Check</CardTitle>
            <CardDescription>
              Automated analysis of your brand guidelines compliance
            </CardDescription>
          </div>
          <Badge
            variant={
              complianceScore >= 90 ? 'success' :
              complianceScore >= 70 ? 'warning' : 'destructive'
            }
            className="px-2 py-1"
          >
            {complianceScore}% Compliant
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Compliance Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {stats.compliant}
              </div>
              <div className="text-sm text-green-700">Compliant</div>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">
                {stats.warnings}
              </div>
              <div className="text-sm text-amber-700">Warnings</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {stats.errors}
              </div>
              <div className="text-sm text-red-700">Errors</div>
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Overall Compliance</span>
              <span className="font-medium">{complianceScore}%</span>
            </div>
            <Progress 
              value={complianceScore} 
              className="h-2"
              indicatorClassName={cn(
                complianceScore >= 90 ? "bg-green-500" :
                complianceScore >= 70 ? "bg-amber-500" :
                "bg-red-500"
              )}
            />
          </div>

          {/* Issues List */}
          {issues.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">
                Issues to Address
              </h4>
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  className="p-3 bg-gray-50 rounded-lg space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2">
                      {getTypeIcon(issue.type)}
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {issue.message}
                        </p>
                        <p className="text-xs text-gray-500">
                          Category: {issue.category}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        getImpactColor(issue.impact)
                      )}
                    >
                      {issue.impact} impact
                    </Badge>
                  </div>

                  {issue.suggestions.length > 0 && (
                    <div className="pl-6">
                      <p className="text-xs text-gray-600 mb-1">Suggestions:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {issue.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-center">
                            <ArrowRight className="h-3 w-3 mr-1 text-gray-400" />
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {onFixIssue && (
                    <div className="pl-6 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => onFixIssue(issue.id)}
                      >
                        Fix Issue
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">
                All guidelines are compliant!
              </p>
              <p className="text-xs text-gray-500">
                Keep up the great work maintaining brand consistency.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 