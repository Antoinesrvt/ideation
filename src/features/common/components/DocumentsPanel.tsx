import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Copy, 
  ExternalLink, 
  Image, 
  FileSpreadsheet, 
  FilePieChart,
  ChevronRight,
  LayoutDashboard,
  Users,
  Building2,
  Handshake,
  TrendingUp
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Define the types for documents
export type DocumentType = 'template' | 'chart' | 'example';

export interface DocumentItem {
  id: string;
  title: string;
  description: string;
  type: DocumentType;
  fileType: string;
  section: string;
  previewUrl?: string;
}

export interface SectionInfo {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

export interface DocumentsPanelProps {
  currentSection: string;
  projectId: string;
  documents: DocumentItem[];
  sectionInfo: SectionInfo;
  className?: string;
  onDownloadDocument?: (id: string) => void;
  onUseTemplate?: (id: string) => void;
  onPreviewDocument?: (id: string, url: string) => void;
  onRequestDocument?: () => void;
}

export const DocumentsPanel: React.FC<DocumentsPanelProps> = ({
  currentSection,
  projectId,
  documents,
  sectionInfo,
  className,
  onDownloadDocument,
  onUseTemplate,
  onPreviewDocument,
  onRequestDocument
}) => {
  const [activeTab, setActiveTab] = React.useState<'all' | DocumentType>('all');
  
  // Count documents by type for the current section
  const documentCounts = React.useMemo(() => {
    const counts = {
      all: 0,
      template: 0,
      chart: 0,
      example: 0
    };
    
    documents.forEach(doc => {
      if (doc.section === currentSection) {
        counts.all++;
        counts[doc.type]++;
      }
    });
    
    return counts;
  }, [currentSection, documents]);
  
  const filteredDocuments = React.useMemo(() => {
    return documents.filter(doc => {
      const matchesSection = doc.section === currentSection;
      const matchesType = activeTab === 'all' || doc.type === activeTab;
      return matchesSection && matchesType;
    });
  }, [currentSection, activeTab, documents]);

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'docx':
        return <FileText className="h-4 w-4" />;
      case 'xlsx':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'svg':
        return <Image className="h-4 w-4" />;
      case 'pdf':
        return <FilePieChart className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };
  
  const getTypeColor = (type: DocumentType) => {
    switch (type) {
      case 'template':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'chart':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'example':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Render empty state with helpful guidance
  const renderEmptyState = () => {
    const emptyStateMessages: Record<string, string> = {
      default: "No documents available for this section."
    };
    
    const message = emptyStateMessages[currentSection] || emptyStateMessages.default;
    
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <div className={cn(
          "rounded-full p-4 mb-4",
          "bg-muted text-muted-foreground"
        )}>
          {sectionInfo.icon && React.cloneElement(sectionInfo.icon as React.ReactElement, { className: "h-8 w-8 opacity-40" })}
        </div>
        <p className="text-muted-foreground text-sm font-medium">No {activeTab} available for {sectionInfo.name}</p>
        <p className="text-muted-foreground text-xs mt-2 max-w-xs">{message}</p>
        <div className="mt-4 flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs"
            onClick={() => setActiveTab('all')}
          >
            View all resources
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs"
            onClick={onRequestDocument}
          >
            Request a resource
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("h-full flex flex-col", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Documents & Resources</CardTitle>
          <Badge variant="outline" className="ml-2 flex items-center gap-1.5">
            <span className={sectionInfo.color}>{sectionInfo.icon}</span>
            <span>{sectionInfo.name}</span>
          </Badge>
        </div>
        <CardDescription>
          Templates and resources for your project
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid grid-cols-4 mb-3 mx-4">
          <TabsTrigger value="all" className="relative">
            All
            {documentCounts.all > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {documentCounts.all}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="template" className="relative">
            Templates
            {documentCounts.template > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {documentCounts.template}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="chart" className="relative">
            Charts
            {documentCounts.chart > 0 && (
              <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {documentCounts.chart}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="example" className="relative">
            Examples
            {documentCounts.example > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {documentCounts.example}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-3 p-4">
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc) => (
                <Card 
                  key={doc.id} 
                  className="overflow-hidden hover:shadow-md transition-all duration-200 border-l-4"
                  style={{ 
                    borderLeftColor: doc.type === 'template' ? '#3b82f6' : 
                                      doc.type === 'chart' ? '#8b5cf6' : 
                                      '#f59e0b' 
                  }}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={cn(
                          "p-2 rounded-md",
                          doc.type === 'template' ? "bg-blue-50" : 
                          doc.type === 'chart' ? "bg-purple-50" : 
                          "bg-amber-50"
                        )}>
                          {getFileIcon(doc.fileType)}
                        </div>
                        <div>
                          <h3 className="font-medium text-sm">{doc.title}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className={getTypeColor(doc.type)}>
                              {doc.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {doc.fileType.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{doc.description}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end mt-3 space-x-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="group"
                        onClick={() => onDownloadDocument && onDownloadDocument(doc.id)}
                      >
                        <Download className="h-3.5 w-3.5 mr-1 group-hover:text-primary transition-colors" />
                        <span className="text-xs">Download</span>
                      </Button>
                      {doc.type === 'template' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="group"
                          onClick={() => onUseTemplate && onUseTemplate(doc.id)}
                        >
                          <Copy className="h-3.5 w-3.5 mr-1 group-hover:text-primary transition-colors" />
                          <span className="text-xs">Use</span>
                        </Button>
                      )}
                      {doc.previewUrl && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="group"
                          onClick={() => onPreviewDocument && onPreviewDocument(doc.id, doc.previewUrl!)}
                        >
                          <ExternalLink className="h-3.5 w-3.5 mr-1 group-hover:text-primary transition-colors" />
                          <span className="text-xs">Preview</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            ) : renderEmptyState()}
          </div>
        </ScrollArea>
      </CardContent>
    </div>
  );
}; 