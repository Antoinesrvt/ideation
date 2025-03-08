import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Activity, Target, ChevronRight, Download, Trash2, HelpCircle, BarChart, Clock, FileCheck, Info, Loader2, PlusCircle } from 'lucide-react';
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
import { useProjectStore } from '@/store';
import { useToast } from '@/components/ui/use-toast';
import { LoadingState, ErrorState } from '@/features/common/components/LoadingAndErrorState';

export const DocumentGenerator: React.FC = () => {
  // Get project ID from the store
  const { currentData } = useProjectStore();
  const projectId = currentData.project?.id;
  const { toast } = useToast();

  // Use documents hook for data and operations
  const { 
    documents, 
    generateDocument, 
    deleteDocument,
    isDiffMode
  } = useDocuments(projectId);
  
  const [generating, setGenerating] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState<{[key: string]: boolean}>({});
  
  const handleGenerateDocument = async (type: 'business-plan' | 'pitch-deck' | 'financial-projections') => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "No active project found",
        variant: "destructive"
      });
      return;
    }

    try {
      setGenerating(type);
      
      const result = await generateDocument( type );
      
      if (result) {
        toast({
          title: "Document generated",
          description: `Your ${type.replace('-', ' ')} has been successfully generated`,
          variant: "default"
        });
      } else {
        throw new Error("Failed to generate document");
      }
    } catch (err) {
      toast({
        title: "Error generating document",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setGenerating(null);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await deleteDocument(id);
      toast({
        title: "Document deleted",
        description: "Document has been successfully deleted",
        variant: "default"
      });
    } catch (err) {
      toast({
        title: "Error deleting document",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
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
    totalDocuments: documents.data.length,
    recentlyGenerated: documents.data.length > 0 ? formatDistanceToNow(documents.data[0].created_at) : 'None',
    // Group documents by type
    byType: {
      'business-plan': documents.data.filter(d => d.type === 'business-plan').length,
      'pitch-deck': documents.data.filter(d => d.type === 'pitch-deck').length,
      'financial-projections': documents.data.filter(d => d.type === 'financial-projections').length
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


  // Handle error state
  if (documents.error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <ErrorState 
            error={documents.error} 
            onRetry={() => window.location.reload()}
          />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <TooltipProvider>
      <div className="">

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

        {/* Document Generation Cards */}
        <div className="mb-8">
          <h2 className="text-lg font-heading font-semibold mb-4">Generate Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {documentTypes.map((docType) => (
              <Card key={docType.type} className="hover:shadow-md transition-all">
                <CardHeader>
                  <div className="flex justify-between">
                    {docType.icon}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-gray-700"
                      onClick={() => toggleHelp(docType.type)}
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardTitle className="text-primary-900 mt-3">{docType.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {docType.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Collapsible open={showHelp[docType.type]}>
                    <CollapsibleContent className="mb-4 border-l-2 border-l-blue-500 pl-3 bg-blue-50/30 p-2 rounded text-sm">
                      <p className="font-medium text-primary-800 mb-1">Key Benefits:</p>
                      <ul className="space-y-1">
                        {docType.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-start">
                            <ChevronRight className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5 mr-1" />
                            <span className="text-gray-700">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                    onClick={() => handleGenerateDocument(docType.type)}
                    disabled={generating === docType.type}
                  >
                    {generating === docType.type ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Generate {docType.title}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Document List */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Your Documents</CardTitle>
            <CardDescription>
              Generated documents for your project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.data.length > 0 ? (
                documents.data.map((doc) => (
                  <div key={doc.id} className="p-4 border rounded-lg flex justify-between items-center hover:bg-gray-50">
                    <div className="flex items-center">
                      <div className="mr-3">
                        {doc.type === 'business-plan' && <FileText className="h-6 w-6 text-blue-500" />}
                        {doc.type === 'pitch-deck' && <Activity className="h-6 w-6 text-green-500" />}
                        {doc.type === 'financial-projections' && <Target className="h-6 w-6 text-amber-500" />}
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {doc.name || (
                            <>
                              {doc.type === 'business-plan' && 'Business Plan'}
                              {doc.type === 'pitch-deck' && 'Pitch Deck'}
                              {doc.type === 'financial-projections' && 'Financial Projections'}
                            </>
                          )}
                        </h3>
                        <div className="flex space-x-2 text-xs text-gray-500">
                          <span>Created {formatDate(doc.created_at)}</span>
                          <Badge variant="outline" className="text-xs p-1">
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
                            onClick={() => handleDeleteDocument(doc.id)}
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