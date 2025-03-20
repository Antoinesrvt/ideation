import React, { useState } from 'react';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Trash2, 
  Calendar,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  SlidersHorizontal,
  EyeIcon,
  EyeOffIcon,
  PlusCircle,
  BarChart3
} from 'lucide-react';
import { Update, ValidationUserFeedback } from '@/store/types';
import { UserFeedbackForm } from './forms/UserFeedbackForm';
import { ValidationTable, ValidationTableColumn } from './common/ValidationTable';
import { UserFeedbackModal } from './modals/UserFeedbackModal';
import { ValidationItemType } from './common/ValidationItemModal';
import { EnhancedValidationUserFeedback } from '../types';
import { EnhancedUserFeedbackForm } from './forms/EnhancedUserFeedbackForm';

interface UserFeedbackListProps {
  feedback: ValidationUserFeedback[];
  onUpdate: (params: { id: string; data: Update<"validation_user_feedback"> }) => void;
  onDelete: (id: string) => void;
  relationships?: any[];
  data?: any;
  projectId?: string;
}

// Define a DetailLevel type for our component
type DetailLevel = 'simple' | 'detailed';

export const UserFeedbackList: React.FC<UserFeedbackListProps> = ({ 
  feedback, 
  onUpdate,
  onDelete,
  relationships = [],
  data = {},
  projectId
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<ValidationUserFeedback | null>(null);
  const [detailLevel, setDetailLevel] = useState<DetailLevel>('simple');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // Modal state
  const [selectedFeedbackForModal, setSelectedFeedbackForModal] = useState<EnhancedValidationUserFeedback | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Add new states for the enhanced form
  const [openNewDialog, setOpenNewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<ValidationUserFeedback | null>(null);
  
  const handleEdit = (item: ValidationUserFeedback) => {
    setSelectedFeedback(item);
    setOpenEditDialog(true);
  };
  
  const handleSave = (feedback: any) => {
    if (editingFeedback) {
      // Extract only the data fields from the feedback object (exclude id, created_at, updated_at)
      const { id, created_at, updated_at, ...data } = feedback;

      onUpdate({
        id: editingFeedback.id,
        data
      });
    }
    setIsDialogOpen(false);
    setEditingFeedback(null);
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      onDelete(id);
    }
  };
  
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid date' : new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Helper functions for the table view
  const getSentimentColor = (sentiment: string | null) => {
    switch (sentiment) {
      case 'positive':
        return 'success';
      case 'negative':
        return 'destructive';
      case 'neutral':
      default:
        return 'secondary';
    }
  };
  
  const getSentimentIcon = (sentiment: string | null) => {
    switch (sentiment) {
      case 'positive':
        return <ThumbsUp className="h-3.5 w-3.5" />;
      case 'negative':
        return <ThumbsDown className="h-3.5 w-3.5" />;
      case 'neutral':
      default:
        return <MessageSquare className="h-3.5 w-3.5" />;
    }
  };
  
  const getImpactColor = (impact: string | null) => {
    switch (impact) {
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };
  
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'addressed':
      case 'implemented':
        return 'success';
      case 'in_progress':
      case 'in-review':
        return 'warning';
      case 'planned':
      case 'accepted':
        return 'info';
      case 'wont_fix':
      case 'rejected':
        return 'destructive';
      case 'new':
      default:
        return 'secondary';
    }
  };
  
  // Render empty state
  const renderEmptyState = () => (
    <div className="flex h-[400px] shrink-0 items-center justify-center rounded-md border border-dashed">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <BarChart3 className="h-10 w-10 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No user feedback</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          You haven't collected any user feedback yet. Get started by recording your first piece of feedback.
        </p>
        <Button onClick={() => setOpenNewDialog(true)} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Add User Feedback
        </Button>
      </div>
    </div>
  );
  
  // Define table columns based on detail level
  const getTableColumns = (): ValidationTableColumn<ValidationUserFeedback>[] => {
    const baseColumns: ValidationTableColumn<ValidationUserFeedback>[] = [
      {
        header: "Feedback",
        className: "w-[30%]",
        cell: (item) => (
          <div className="font-medium max-w-md truncate">
            {item.content}
          </div>
        )
      },
      {
        header: "Sentiment",
        cell: (item) => (
          <Badge variant={getSentimentColor(item.sentiment)} className="flex w-fit items-center gap-1">
            {getSentimentIcon(item.sentiment)}
            {item.sentiment || 'Neutral'}
          </Badge>
        )
      }
    ];
    
    if (detailLevel === 'detailed') {
      return [
        ...baseColumns,
        {
          header: "Source",
          cell: (item) => (
            <div className="max-w-[150px] truncate">
              {item.source || 'Unknown'}
            </div>
          )
        },
        {
          header: "Type",
          cell: (item) => (
            <div className="max-w-[150px] truncate">
              {item.type || '—'}
            </div>
          )
        },
        {
          header: "Impact",
          cell: (item) => (
            <Badge variant={getImpactColor(item.impact)}>
              {item.impact || 'Unknown'}
            </Badge>
          )
        },
        {
          header: "Status",
          cell: (item) => (
            <Badge variant={getStatusColor(item.status)}>
              {item.status?.replace('_', ' ') || 'New'}
            </Badge>
          )
        }
      ];
    }
    
    return baseColumns;
  };

  // Handle opening the modal when a row is clicked
  const handleRowClick = (item: ValidationUserFeedback) => {
    // Convert to enhanced feedback type
    const enhancedFeedback: EnhancedValidationUserFeedback = {
      ...item,
      analysis: item.sentiment ? {
        sentiment: (item.sentiment as 'positive' | 'neutral' | 'negative'),
        impact: (item.impact as 'high' | 'medium' | 'low') || 'medium',
        tags: item.tags || [],
        response: item.response || '',
        responseTime: 0 // This would need to be calculated
      } : null,
      entityId: null, // These fields are added in the EnhancedValidationUserFeedback type
      entityType: null, // These fields are added in the EnhancedValidationUserFeedback type
      sentimentScore: item.sentiment === 'positive' ? 1 : item.sentiment === 'negative' ? -1 : 0
    };
    
    setSelectedFeedbackForModal(enhancedFeedback);
    setIsModalOpen(true);
  };

  // Handle view item in related items
  const handleViewItem = (itemType: ValidationItemType, itemId: string) => {
    // This would be implemented to open the appropriate modal for the related item
    console.log(`View ${itemType} with ID ${itemId}`);
    // You would implement this to open the appropriate modal
  };

  // Handle feedback actions
  const handleMarkAddressed = () => {
    if (!selectedFeedbackForModal) return;
    
    onUpdate({
      id: selectedFeedbackForModal.id,
      data: { status: 'addressed' }
    });
  };

  const handleMarkImplemented = () => {
    if (!selectedFeedbackForModal) return;
    
    onUpdate({
      id: selectedFeedbackForModal.id,
      data: { status: 'implemented' }
    });
  };

  const handleReject = () => {
    if (!selectedFeedbackForModal) return;
    
    onUpdate({
      id: selectedFeedbackForModal.id,
      data: { status: 'rejected' }
    });
  };

  const handleAddResponse = () => {
    if (!selectedFeedbackForModal) return;
    setIsModalOpen(false);
    handleEdit(selectedFeedbackForModal);
  };

  const handleCreateHypothesis = () => {
    // Implement navigation or modal to create hypothesis based on feedback
    console.log('Create hypothesis from feedback', selectedFeedbackForModal?.id);
  };

  const handleCreateExperiment = () => {
    // Implement navigation or modal to create experiment based on feedback
    console.log('Create experiment from feedback', selectedFeedbackForModal?.id);
  };

  const handleCreateABTest = () => {
    // Implement navigation or modal to create A/B test based on feedback
    console.log('Create A/B test from feedback', selectedFeedbackForModal?.id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Feedback</h2>
          <p className="text-muted-foreground">
            Collect and track user feedback to inform your product decisions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setDetailLevel(detailLevel === "simple" ? "detailed" : "simple")
            }
            className="flex items-center gap-1"
          >
            {detailLevel === "simple" ? (
              <EyeIcon className="h-4 w-4" />
            ) : (
              <EyeOffIcon className="h-4 w-4" />
            )}
            {detailLevel === "simple" ? "Show Details" : "Simple View"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="flex items-center gap-1"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
          <Button 
            onClick={() => setOpenNewDialog(true)} 
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Add User Feedback
          </Button>
        </div>
      </div>

      {feedback.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="space-y-4">
          {isFiltersOpen && (
            <Card className="mb-4">
              <CardContent className="pt-4">
                {/* Filter content would go here */}
              </CardContent>
            </Card>
          )}
          
          <ValidationTable
            data={feedback}
            columns={getTableColumns()}
            onEdit={handleEdit}
            onDelete={handleDelete}
            getRowId={(item) => item.id}
            onRowClick={handleRowClick}
            isRowClickable={true}
            emptyState={
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <BarChart3 className="h-8 w-8 mb-2 opacity-50" />
                <p>No user feedback yet</p>
                <Button 
                  variant="link" 
                  onClick={() => setOpenNewDialog(true)}
                  className="mt-2"
                >
                  Add your first feedback
                </Button>
              </div>
            }
          />
        </div>
      )}

      {/* Enhanced User Feedback Form for Creating New Feedback */}
      <EnhancedUserFeedbackForm
        open={openNewDialog}
        onOpenChange={setOpenNewDialog}
        onSubmit={(data) => {
          // Format the User Feedback for the database
          const newFeedback = {
            ...data,
            project_id: projectId ?? ''
          };
          
          onUpdate({
            id: data.id ?? '',
            data: newFeedback
          });
        }}
      />

      {/* Enhanced User Feedback Form for Editing Existing Feedback */}
      {selectedFeedback && (
        <EnhancedUserFeedbackForm
          open={openEditDialog}
          onOpenChange={setOpenEditDialog}
          initialData={selectedFeedback}
          onSubmit={(data) => {
            if (selectedFeedback) {
              // Format the User Feedback for the database
              const updatedFeedback = {
                ...data,
                id: selectedFeedback.id,
                project_id: projectId ?? ''
              };
              
              onUpdate({
                id: selectedFeedback.id,
                data: updatedFeedback
              });
            }
          }}
        />
      )}

      {/* User Feedback Modal */}
      {selectedFeedbackForModal && (
        <UserFeedbackModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          feedback={selectedFeedbackForModal as unknown as EnhancedValidationUserFeedback}
          onEdit={() => {
            setIsModalOpen(false);
            handleEdit(selectedFeedbackForModal);
          }}
          onDelete={() => {
            setIsModalOpen(false);
            handleDelete(selectedFeedbackForModal.id);
          }}
          onMarkAddressed={handleMarkAddressed}
          onMarkImplemented={handleMarkImplemented}
          onReject={handleReject}
          onAddResponse={handleAddResponse}
          onCreateHypothesis={handleCreateHypothesis}
          onCreateExperiment={handleCreateExperiment}
          onCreateABTest={handleCreateABTest}
          onViewItem={handleViewItem}
          relationships={relationships}
          data={data}
        />
      )}
    </div>
  );
}; 