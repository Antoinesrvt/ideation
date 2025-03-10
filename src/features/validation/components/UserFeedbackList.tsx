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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Trash2, 
  Calendar, 
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  AlertCircle
} from 'lucide-react';
import { Update, ValidationUserFeedback } from '@/store/types';
import { ViewToggle, ViewMode } from './common/ViewToggle';
import { UserFeedbackCard } from './common/UserFeedbackCard';
import { UserFeedbackForm } from './forms/UserFeedbackForm';

interface UserFeedbackListProps {
  feedback: ValidationUserFeedback[];
  onUpdate: (params: { id: string; data: Update<"validation_user_feedback"> }) => void;
  onDelete: (id: string) => void;
}

export const UserFeedbackList: React.FC<UserFeedbackListProps> = ({ 
  feedback, 
  onUpdate,
  onDelete
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<ValidationUserFeedback | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  
  const handleEdit = (item: ValidationUserFeedback) => {
    setEditingFeedback(item);
    setIsDialogOpen(true);
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
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      case 'neutral':
      default:
        return 'bg-gray-100 text-gray-800';
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
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'addressed':
      case 'implemented':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
      case 'in-review':
        return 'bg-yellow-100 text-yellow-800';
      case 'planned':
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'wont_fix':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'new':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Render empty state
  const renderEmptyState = () => (
    <Card className="border-dashed border-2">
      <CardContent className="pt-6 pb-4 flex flex-col items-center text-center">
        <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">No User Feedback Yet</h3>
        <p className="text-sm text-gray-500 max-w-md mb-4">
          Track and analyze feedback from your users to improve your product
        </p>
      </CardContent>
    </Card>
  );
  
  // Render the table view
  const renderTableView = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[30%]">Feedback</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Sentiment</TableHead>
          <TableHead>Impact</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {feedback.map((item: ValidationUserFeedback) => (
          <TableRow key={item.id}>
            <TableCell>
              <div className="flex flex-col">
                <span className="font-medium line-clamp-2">{item.content}</span>
                {item.date && (
                  <span className="text-xs text-gray-500 mt-1">
                    {formatDate(item.date)}
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell>{item.source}</TableCell>
            <TableCell>{item.type || '—'}</TableCell>
            <TableCell>
              <Badge className={getSentimentColor(item.sentiment)}>
                <span className="flex items-center gap-1">
                  {getSentimentIcon(item.sentiment)}
                  {item.sentiment || 'Neutral'}
                </span>
              </Badge>
            </TableCell>
            <TableCell>
              <Badge className={getImpactColor(item.impact)}>
                {item.impact || 'Unknown'}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge className={getStatusColor(item.status)}>
                {item.status?.replace('_', ' ') || 'New'}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(item)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
  
  // Render the card view
  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {feedback.map((item) => (
        <UserFeedbackCard 
          key={item.id}
          feedback={item}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* View toggle control */}
      <div className="flex justify-end mb-4">
        <ViewToggle
          viewMode={viewMode}
          onChange={setViewMode}
          className="ml-auto"
        />
      </div>

      {/* Content based on available data and view mode */}
      {feedback.length === 0 ? (
        renderEmptyState()
      ) : (
        viewMode === 'table' ? renderTableView() : renderCardView()
      )}

      {/* Edit dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit User Feedback</DialogTitle>
          </DialogHeader>
          <UserFeedbackForm 
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            initialData={editingFeedback || undefined}
            onSubmit={handleSave}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}; 