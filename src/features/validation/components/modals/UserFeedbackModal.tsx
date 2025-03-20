import React from 'react';
import { EnhancedValidationUserFeedback } from '../../types';
import { ValidationItemModal, ValidationItemTabs, ValidationItemType } from '../common/ValidationItemModal';
import { UserFeedbackDetails } from '../common/UserFeedbackDetails';
import { ValidationInsights } from '../common/ValidationInsights';
import { ValidationRelatedItems } from '../common/ValidationRelatedItems';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle,
  MessageCircle,
  BarChart,
  Lightbulb,
  Beaker,
  SplitSquareVertical
} from 'lucide-react';

export interface UserFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: EnhancedValidationUserFeedback;
  onEdit: () => void;
  onDelete: () => void;
  onMarkAddressed: () => void;
  onMarkImplemented: () => void;
  onReject: () => void;
  onAddResponse: () => void;
  onCreateHypothesis: () => void;
  onCreateExperiment: () => void;
  onCreateABTest: () => void;
  onViewItem: (itemType: ValidationItemType, itemId: string) => void;
  relationships: any[];
  data: any;
}

export function UserFeedbackModal({
  isOpen,
  onClose,
  feedback,
  onEdit,
  onDelete,
  onMarkAddressed,
  onMarkImplemented,
  onReject,
  onAddResponse,
  onCreateHypothesis,
  onCreateExperiment,
  onCreateABTest,
  onViewItem,
  relationships,
  data
}: UserFeedbackModalProps) {
  const getSentimentColor = (sentiment: string | null) => {
    if (!sentiment) return 'default';
    switch (sentiment) {
      case 'positive':
        return 'success';
      case 'negative':
        return 'destructive';
      case 'neutral':
      default:
        return 'default';
    }
  };

  const getActions = () => {
    const actions = [];

    // Status-based actions
    if (feedback.status !== 'addressed' && feedback.status !== 'implemented' && feedback.status !== 'rejected') {
      actions.push({
        label: 'Mark Addressed',
        icon: <CheckCircle className="h-4 w-4" />,
        onClick: onMarkAddressed,
        variant: 'default' as const
      });
      
      actions.push({
        label: 'Mark Implemented',
        icon: <CheckCircle className="h-4 w-4" />,
        onClick: onMarkImplemented,
        variant: 'default' as const
      });
      
      actions.push({
        label: 'Reject',
        icon: <XCircle className="h-4 w-4" />,
        onClick: onReject,
        variant: 'destructive' as const
      });
    }

    // Response action
    if (!feedback.analysis?.response) {
      actions.push({
        label: 'Add Response',
        icon: <MessageCircle className="h-4 w-4" />,
        onClick: onAddResponse,
        variant: 'outline' as const
      });
    }

    // Create related items
    actions.push({
      label: 'Create Hypothesis',
      icon: <Lightbulb className="h-4 w-4" />,
      onClick: onCreateHypothesis,
      variant: 'outline' as const
    });
    
    actions.push({
      label: 'Create Experiment',
      icon: <Beaker className="h-4 w-4" />,
      onClick: onCreateExperiment,
      variant: 'outline' as const
    });
    
    actions.push({
      label: 'Create A/B Test',
      icon: <SplitSquareVertical className="h-4 w-4" />,
      onClick: onCreateABTest,
      variant: 'outline' as const
    });

    return actions;
  };

  return (
    <ValidationItemModal
      isOpen={isOpen}
      onClose={onClose}
      itemType="userFeedback"
      title={feedback.content?.substring(0, 60) + (feedback.content?.length > 60 ? '...' : '') || 'User Feedback'}
      status={feedback.sentiment || 'neutral'}
      statusColor={getSentimentColor(feedback.sentiment)}
      onEdit={onEdit}
      onDelete={onDelete}
      createdAt={feedback.created_at || undefined}
      updatedAt={feedback.updated_at || undefined}
      actions={
        <div className="flex items-center gap-2 justify-end flex-wrap">
          {getActions().map((action, index) => (
            <Button 
              key={index} 
              variant={action.variant} 
              size="sm" 
              onClick={action.onClick}
              className="flex items-center gap-2"
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>
      }
    >
      <ValidationItemTabs
        detailsContent={<UserFeedbackDetails feedback={feedback} />}
        insightsContent={
          <ValidationInsights 
            itemType="userFeedback" 
            data={feedback} 
            relationships={relationships}
          />
        }
        relatedContent={
          <ValidationRelatedItems
            itemType="userFeedback"
            itemId={feedback.id}
            relationships={relationships}
            onViewItem={onViewItem}
            data={data}
          />
        }
      />
    </ValidationItemModal>
  );
} 