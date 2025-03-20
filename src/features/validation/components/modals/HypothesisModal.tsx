import React from 'react';
import { ValidationHypothesis } from '@/store/types';
import { ValidationItemModal, ValidationItemTabs, ValidationItemType } from '../common/ValidationItemModal';
import { HypothesisDetails } from '../common/HypothesisDetails';
import { ValidationInsights } from '../common/ValidationInsights';
import { ValidationRelatedItems } from '../common/ValidationRelatedItems';
import { Button } from '@/components/ui/button';
import { 
  Beaker, 
  SplitSquareVertical, 
  MessageSquare, 
  ArrowRight, 
  CheckCircle, 
  XCircle 
} from 'lucide-react';

export interface HypothesisModalProps {
  isOpen: boolean;
  onClose: () => void;
  hypothesis: ValidationHypothesis;
  onEdit: () => void;
  onDelete: () => void;
  onValidate: () => void;
  onInvalidate: () => void;
  onCreateExperiment: () => void;
  onCreateABTest: () => void;
  onCreateFeedback: () => void;
  onViewItem: (itemType: ValidationItemType, itemId: string) => void;
  relationships: any[];
  data: any;
}

export function HypothesisModal({
  isOpen,
  onClose,
  hypothesis,
  onEdit,
  onDelete,
  onValidate,
  onInvalidate,
  onCreateExperiment,
  onCreateABTest,
  onCreateFeedback,
  onViewItem,
  relationships,
  data
}: HypothesisModalProps) {
  const getStatusColor = (status: string | null) => {
    if (!status) return 'default';
    switch (status) {
      case 'validated':
        return 'success';
      case 'invalidated':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getActions = () => {
    const actions = [];

    // Status-based actions
    if (hypothesis.status !== 'validated' && hypothesis.status !== 'invalidated') {
      actions.push({
        label: 'Validate',
        icon: <CheckCircle className="h-4 w-4" />,
        onClick: onValidate,
        variant: 'default' as const
      });
      
      actions.push({
        label: 'Invalidate',
        icon: <XCircle className="h-4 w-4" />,
        onClick: onInvalidate,
        variant: 'destructive' as const
      });
    }

    // Create related items
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
    
    actions.push({
      label: 'Add User Feedback',
      icon: <MessageSquare className="h-4 w-4" />,
      onClick: onCreateFeedback,
      variant: 'outline' as const
    });

    return actions;
  };

  return (
    <ValidationItemModal
      isOpen={isOpen}
      onClose={onClose}
      itemType="hypothesis"
      title={hypothesis.statement?.substring(0, 60) + (hypothesis.statement?.length > 60 ? '...' : '') || 'Hypothesis'}
      status={hypothesis.status || 'unvalidated'}
      statusColor={getStatusColor(hypothesis.status)}
      onEdit={onEdit}
      onDelete={onDelete}
      createdAt={hypothesis.created_at || undefined}
      updatedAt={hypothesis.updated_at || undefined}
      actions={
        <div className="flex items-center gap-2 justify-end">
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
        detailsContent={<HypothesisDetails hypothesis={hypothesis} />}
        insightsContent={
          <ValidationInsights 
            itemType="hypothesis" 
            data={hypothesis} 
            relationships={relationships}
          />
        }
        relatedContent={
          <ValidationRelatedItems
            itemType="hypothesis"
            itemId={hypothesis.id}
            relationships={relationships}
            onViewItem={onViewItem}
            data={data}
          />
        }
      />
    </ValidationItemModal>
  );
} 