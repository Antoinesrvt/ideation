import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Activity, Target, ChevronRight, Download, Trash2, HelpCircle, BarChart, Clock, FileCheck, Info } from 'lucide-react';
import { Document } from '@/store/types';
import { formatDate } from '@/lib/utils';
import { useDocuments } from '@/hooks/features/useDocuments';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface DocumentGeneratorProps {
  projectId: string;
  documents?: Document[];
}

export const DocumentGenerator: React.FC<DocumentGeneratorProps> = ({
  projectId,
  documents: propDocuments
}) => {
  const { documents: hookDocuments, generateDocument, deleteDocument } = useDocuments(projectId);
  const [generating, setGenerating] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState<{[key: string]: boolean}>({});
  
  // Use provided documents from props if available, otherwise use the ones from the hook
  const documents = propDocuments || hookDocuments.data || [];

  const handleGenerateDocument = (type: 'business-plan' | 'pitch-deck' | 'financial-projections') => {
    setGenerating(type);
    generateDocument({ projectId, type });
    // Simulate turning off the generating state after a short delay
    setTimeout(() => setGenerating(null), 2000);
  };

  // Format relative time for display
  const formatDistanceToNow = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInSecs = Math.floor(diffInMs / 1000);
    const diffInMins = Math.floor(diffInSecs / 60);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return diffInDays === 1 ? 'Yesterday' : `${diffInDays} days ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInMins > 0) {
      return `${diffInMins} ${diffInMins === 1 ? 'minute' : 'minutes'} ago`;
    } else {
      return 'Just now';
    }
  };

  // Calculate stats for the dashboard
  const documentStats = {
    totalDocuments: documents.length,
    recentlyGenerated: documents.length > 0 ? formatDistanceToNow(documents[0].created_at) : 'None',
    // Group documents by type
    byType: {
      'business-plan': documents.filter(d => d.type === 'business-plan').length,
      'pitch-deck': documents.filter(d => d.type === 'pitch-deck').length,
      'financial-projections': documents.filter(d => d.type === 'financial-projections').length
    }
  };
  
  const documentTypes = [
    {
      type: 'business-plan' as const,
      title: 'Business Plan',
      description: 'Comprehensive business plan with executive summary, market analysis, and financial projections',
      icon: <FileText className="h-16 w-16 text-blue-500" />,
      benefits: [
        'Clarify your business model and strategy',
        'Identify market opportunities and challenges',
        'Set clear objectives and implementation plans',
        'Outline financial requirements and projections'
      ]
    },
    {
      type: 'pitch-deck' as const,
      title: 'Pitch Deck',
      description: 'Investor-ready presentation with key business highlights, market opportunity, and traction',
      icon: <Activity className="h-16 w-16 text-blue-500" />,
      benefits: [
        'Communicate your vision concisely',
        'Highlight your competitive advantage',
        'Demonstrate market traction and validation',
        'Present your team and funding requirements'
      ]
    },
    {
      type: 'financial-projections' as const,
      title: 'Financial Projections',
      description: '3-year financial forecast including revenue projections, expense breakdown, and cash flow',
      icon: <Target className="h-16 w-16 text-blue-500" />,
      benefits: [
        'Project revenue growth and profitability',
        'Plan for operational expenses and investments',
        'Analyze break-even point and unit economics',
        'Create cash flow projections and runway analysis'
      ]
    }
  ];
  
  const toggleHelp = (docType: string) => {
    setShowHelp(prev => ({
      ...prev,
      [docType]: !prev[docType]
    }));
  };
  
  return (
    <TooltipProvider>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Document Generation</h2>
            <p className="text-gray-600">Create professional documents based on your project data</p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <HelpCircle className="h-4 w-4" />
                <span className="sr-only">Help</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" align="end" className="max-w-sm">
              <p>Generate documents based on your project data. Hover over elements for more information.</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <FileCheck className="h-4 w-4 mr-2 text-blue-500" />
                Document Overview
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 ml-1 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total number of documents generated for this project</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <p className="text-2xl font-bold">{documentStats.totalDocuments}</p>
                <p className="text-xs text-gray-500 ml-2">Total documents</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Clock className="h-4 w-4 mr-2 text-green-500" />
                Recent Activity
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 ml-1 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Time since your most recent document was generated</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <p className="text-sm font-bold">{documentStats.recentlyGenerated}</p>
                <p className="text-xs text-gray-500 ml-2">Last document generated</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <BarChart className="h-4 w-4 mr-2 text-purple-500" />
                Documents by Type
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 ml-1 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Distribution of document types in your project</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  BP: {documentStats.byType['business-plan']}
                </Badge>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  PD: {documentStats.byType['pitch-deck']}
                </Badge>
                <Badge variant="outline" className="bg-amber-100 text-amber-800">
                  FP: {documentStats.byType['financial-projections']}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-3 gap-6 mb-6">
          {documentTypes.map(doc => (
            <Card key={doc.type} className="hover:shadow-md transition-shadow border border-gray-200">
              <CardContent className="p-0">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-center h-32">
                    {doc.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-center mt-4">{doc.title}</h3>
                  <p className="text-sm text-gray-500 text-center mt-1">{doc.description}</p>
                </div>
                
                <Collapsible open={showHelp[doc.type]} onOpenChange={() => toggleHelp(doc.type)}>
                  <div className="px-6 py-2 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-700">Benefits</h4>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                        <Info className="h-4 w-4 text-gray-500" />
                        <span className="sr-only">Toggle benefits</span>
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent>
                    <div className="px-6 py-2 bg-gray-50 border-b border-gray-200">
                      <ul className="text-xs text-gray-600 space-y-1">
                        {doc.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-500 mr-1">•</span> {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
                
                <div className="p-4">
                  <Button 
                    variant="default" 
                    className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                    onClick={() => handleGenerateDocument(doc.type)}
                    disabled={generating === doc.type}
                  >
                    {generating === doc.type ? (
                      <>Generating...</>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Document
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Document History</CardTitle>
              <CardDescription>Previously generated documents</CardDescription>
            </div>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="ghost" size="icon">
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">About Document History</h4>
                  <p className="text-sm text-gray-500">
                    Documents are generated based on your project data. Ensure your project details are complete for best results.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.length > 0 ? (
                documents.map(doc => (
                  <div key={doc.id} className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:shadow-sm transition-shadow">
                    <div className="flex items-center">
                      {doc.type === 'business-plan' && <FileText className="h-5 w-5 text-blue-500 mr-3" />}
                      {doc.type === 'pitch-deck' && <Activity className="h-5 w-5 text-green-500 mr-3" />}
                      {doc.type === 'financial-projections' && <Target className="h-5 w-5 text-amber-500 mr-3" />}
                      <div>
                        <h4 className="font-medium">{doc.name}</h4>
                        <div className="flex items-center">
                          <p className="text-xs text-gray-500">Generated {formatDate(doc.created_at)}</p>
                          <Badge variant="outline" className="ml-2 text-xs bg-gray-100 text-gray-700">
                            {doc.type === 'business-plan' && 'Business Plan'}
                            {doc.type === 'pitch-deck' && 'Pitch Deck'}
                            {doc.type === 'financial-projections' && 'Financial Projections'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <a 
                        href={doc.storage_path} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 text-sm flex items-center hover:text-blue-800 transition-colors p-1"
                      >
                        <ChevronRight className="h-4 w-4 ml-1" />
                        View
                      </a>
                      <Button 
                        variant="outline" 
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm flex items-center hover:bg-gray-200 transition-colors"
                        onClick={() => window.open(doc.storage_path, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="text-red-600 border-red-200 hover:bg-red-50 px-2 py-1 rounded-md text-sm"
                            onClick={() => deleteDocument && deleteDocument(doc.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete this document</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                ))
              ) : (
                <div className="border border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500">
                  <FileText className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm mb-1">No documents generated yet</p>
                  <p className="text-xs text-gray-400 text-center max-w-md">
                    Generate your first document by selecting one of the options above.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};