import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Activity, Target, ChevronRight } from 'lucide-react';
import { Document } from '@/types';
import { formatDate } from '@/lib/utils';
import { useDocuments } from '@/hooks/useDocuments';

interface DocumentGeneratorProps {
  projectId: string;
  documents: Document[];
}

export const DocumentGenerator: React.FC<DocumentGeneratorProps> = ({
  projectId,
  documents
}) => {
  const { generateDocument, deleteDocument } = useDocuments(projectId);
  
  const handleGenerateDocument = (type: 'business-plan' | 'pitch-deck' | 'financial-projections') => {
    generateDocument({ projectId, type });
  };
  
  const documentTypes = [
    {
      type: 'business-plan' as const,
      title: 'Business Plan',
      description: 'Comprehensive business plan with executive summary, market analysis, and financial projections',
      icon: <FileText className="h-16 w-16 text-blue-500" />
    },
    {
      type: 'pitch-deck' as const,
      title: 'Pitch Deck',
      description: 'Investor-ready presentation with key business highlights, market opportunity, and traction',
      icon: <Activity className="h-16 w-16 text-blue-500" />
    },
    {
      type: 'financial-projections' as const,
      title: 'Financial Projections',
      description: '3-year financial forecast including revenue projections, expense breakdown, and cash flow',
      icon: <Target className="h-16 w-16 text-blue-500" />
    }
  ];
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Document Generation</h2>
        <p className="text-gray-600">Create professional documents based on your project data</p>
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        {documentTypes.map(doc => (
          <Card key={doc.type} className="hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-center h-32">
                  {doc.icon}
                </div>
                <h3 className="text-xl font-semibold text-center mt-4">{doc.title}</h3>
                <p className="text-sm text-gray-500 text-center mt-1">{doc.description}</p>
              </div>
              <div className="p-4">
                <Button 
                  variant="default" 
                  className="w-full bg-blue-600 text-white p-2 rounded-md"
                  onClick={() => handleGenerateDocument(doc.type)}
                >
                  Generate Document
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Document History</CardTitle>
          <CardDescription>Previously generated documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.length > 0 ? (
              documents.map(doc => (
                <div key={doc.id} className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-blue-500 mr-3" />
                    <div>
                      <h4 className="font-medium">{doc.name}</h4>
                      <p className="text-xs text-gray-500">Generated {formatDate(doc.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm flex items-center">
                      View <ChevronRight className="h-4 w-4 ml-1" />
                    </a>
                    <Button 
                      variant="outline" 
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm"
                      onClick={() => window.open(doc.url, '_blank')}
                    >
                      Download
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-500">
                <p className="text-sm">No documents generated yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};