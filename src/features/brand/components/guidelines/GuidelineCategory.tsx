import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Archive, Check, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface GuidelineItem {
  id: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  compliance: 'compliant' | 'warning' | 'violation';
  lastUpdated: string;
}

export interface GuidelineCategoryProps {
  title: string;
  description: string;
  icon: React.ElementType;
  guidelines: GuidelineItem[];
  onAdd?: () => void;
  onEdit?: (id: string) => void;
  onArchive?: (id: string) => void;
  className?: string;
}

export function GuidelineCategory({
  title,
  description,
  icon: Icon,
  guidelines,
  onAdd,
  onEdit,
  onArchive,
  className
}: GuidelineCategoryProps) {
  // Calculate completion percentage
  const publishedCount = guidelines.filter(g => g.status === 'published').length;
  const completionPercentage = (publishedCount / guidelines.length) * 100 || 0;

  // Get compliance status
  const getComplianceStatus = () => {
    const violations = guidelines.filter(g => g.compliance === 'violation').length;
    const warnings = guidelines.filter(g => g.compliance === 'warning').length;
    
    if (violations > 0) return 'violation';
    if (warnings > 0) return 'warning';
    return 'compliant';
  };

  const complianceStatus = getComplianceStatus();

  return (
    <Card className={cn("transition-all duration-200 hover:shadow-md", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className="h-5 w-5 text-primary-600" />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <Badge
            variant={
              complianceStatus === 'compliant' ? 'success' :
              complianceStatus === 'warning' ? 'warning' : 'destructive'
            }
            className="px-2 py-0.5"
          >
            {complianceStatus === 'compliant' && <Check className="h-3 w-3 mr-1" />}
            {complianceStatus === 'warning' && <AlertTriangle className="h-3 w-3 mr-1" />}
            {complianceStatus === 'violation' && <X className="h-3 w-3 mr-1" />}
            {complianceStatus.charAt(0).toUpperCase() + complianceStatus.slice(1)}
          </Badge>
        </div>
        <CardDescription>{description}</CardDescription>
        <div className="mt-2">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-500">Completion</span>
            <span className="font-medium">{Math.round(completionPercentage)}%</span>
          </div>
          <Progress 
            value={completionPercentage} 
            className="h-1.5"
            indicatorClassName={cn(
              completionPercentage === 100 ? "bg-green-500" :
              completionPercentage > 50 ? "bg-blue-500" :
              "bg-amber-500"
            )}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {guidelines.map((guideline) => (
            <div 
              key={guideline.id}
              className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1 mr-4">
                <p className="text-sm text-gray-700">{guideline.content}</p>
                <div className="flex items-center mt-2 space-x-2">
                  <Badge 
                    variant={
                      guideline.status === 'published' ? 'subtle-primary' :
                      guideline.status === 'draft' ? 'subtle' : 'outline'
                    }
                    size="sm"
                  >
                    {guideline.status}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    Updated {guideline.lastUpdated}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => onEdit?.(guideline.id)}
                >
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-500"
                  onClick={() => onArchive?.(guideline.id)}
                >
                  <Archive className="h-4 w-4" />
                  <span className="sr-only">Archive</span>
                </Button>
              </div>
            </div>
          ))}
          
          {onAdd && (
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={onAdd}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Guideline
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 