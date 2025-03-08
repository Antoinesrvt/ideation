import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectRisk } from '@/types/project';

interface RisksSectionProps {
  risks: ProjectRisk[];
  onActionClick?: (section: string) => void;
}

export function RisksSection({ risks, onActionClick }: RisksSectionProps) {
  // Get the appropriate styling for risk severity
  const getSeverityBadge = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-0">
            High Risk
          </Badge>
        );
      case 'medium':
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-0">
            Medium Risk
          </Badge>
        );
      case 'low':
      default:
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-0">
            Low Risk
          </Badge>
        );
    }
  };
  
  if (!risks || risks.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Potential Risks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center text-gray-500">
            <div className="p-3 rounded-full bg-green-50 mb-4">
              <AlertCircle className="h-8 w-8 text-green-500" />
            </div>
            <p>No significant risks detected.</p>
            <p className="text-sm mt-1">Your project appears to be on track. Keep up the good work!</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Potential Risks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {risks.map((risk) => (
            <Card key={risk.id} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5">
                      <AlertCircle className={`h-5 w-5 ${
                        risk.severity === 'high' ? 'text-red-500' : 
                        risk.severity === 'medium' ? 'text-amber-500' : 
                        'text-blue-500'
                      }`} />
                    </div>
                    <div>
                      <div className="font-medium">{risk.title}</div>
                      <div className="text-sm text-gray-500 mt-1">{risk.description}</div>
                      
                      {risk.action && (
                        <Button 
                          variant="link" 
                          className="text-blue-600 h-auto p-0 mt-2"
                          onClick={() => onActionClick?.(risk.action || '')}
                        >
                          Address this risk <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div>
                    {getSeverityBadge(risk.severity)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 