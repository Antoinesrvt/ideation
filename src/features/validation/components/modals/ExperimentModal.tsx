import React from 'react';
import { EnhancedValidationExperiment } from '../../types';
import { ValidationItemModal, ValidationItemTabs, ValidationItemType } from '../common/ValidationItemModal';
import { ExperimentDetails } from '../common/ExperimentDetails';
import { ValidationInsights } from '../common/ValidationInsights';
import { ValidationRelatedItems } from '../common/ValidationRelatedItems';
import { Button } from '@/components/ui/button';
import { 
  SplitSquareVertical, 
  MessageSquare, 
  CheckCircle, 
  XCircle,
  BarChart
} from 'lucide-react';

export interface ExperimentModalProps {
  isOpen: boolean;
  onClose: () => void;
  experiment: EnhancedValidationExperiment;
  onEdit: () => void;
  onDelete: () => void;
  onComplete: () => void;
  onCancel: () => void;
  onCreateABTest: () => void;
  onAddResults: () => void;
  onCreateFeedback: () => void;
  onViewItem: (itemType: ValidationItemType, itemId: string) => void;
  relationships: any[];
  data: any;
}

export function ExperimentModal({
  isOpen,
  onClose,
  experiment,
  onEdit,
  onDelete,
  onComplete,
  onCancel,
  onCreateABTest,
  onAddResults,
  onCreateFeedback,
  onViewItem,
  relationships,
  data
}: ExperimentModalProps) {
  const getStatusColor = (status: string | null) => {
    if (!status) return 'default';
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'warning';
      case 'cancelled':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getActions = () => {
    const actions = [];

    // Status-based actions
    if (experiment.status === 'in-progress') {
      actions.push({
        label: 'Mark Complete',
        icon: <CheckCircle className="h-4 w-4" />,
        onClick: onComplete,
        variant: 'default' as const
      });
      
      actions.push({
        label: 'Cancel',
        icon: <XCircle className="h-4 w-4" />,
        onClick: onCancel,
        variant: 'destructive' as const
      });
    }

    // Results actions
    if (experiment.status === 'completed' && !experiment.results) {
      actions.push({
        label: 'Add Results',
        icon: <BarChart className="h-4 w-4" />,
        onClick: onAddResults,
        variant: 'default' as const
      });
    }

    // Create related items
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
      itemType="experiment"
      title={experiment.title || 'Experiment'}
      status={experiment.status || 'planned'}
      statusColor={getStatusColor(experiment.status)}
      onEdit={onEdit}
      onDelete={onDelete}
      createdAt={experiment.created_at || undefined}
      updatedAt={experiment.updated_at || undefined}
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
        detailsContent={<ExperimentDetails experiment={experiment} />}
        insightsContent={
          <ValidationInsights 
            itemType="experiment" 
            data={experiment} 
            relationships={relationships}
          />
        }
        relatedContent={
          <ValidationRelatedItems
            itemType="experiment"
            itemId={experiment.id}
            relationships={relationships}
            onViewItem={onViewItem}
            data={data}
          />
        }
      />
    </ValidationItemModal>
  );
} 