import React from 'react';
import { EnhancedValidationABTest } from '../../types';
import { ValidationItemModal, ValidationItemTabs, ValidationItemType } from '../common/ValidationItemModal';
import { ABTestDetails } from '../common/ABTestDetails';
import { ValidationInsights } from '../common/ValidationInsights';
import { ValidationRelatedItems } from '../common/ValidationRelatedItems';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  CheckCircle, 
  XCircle,
  BarChart,
  Flag
} from 'lucide-react';

export interface ABTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  abTest: EnhancedValidationABTest;
  onEdit: () => void;
  onDelete: () => void;
  onComplete: () => void;
  onCancel: () => void;
  onAddResults: () => void;
  onImplementWinner: () => void;
  onCreateFeedback: () => void;
  onViewItem: (itemType: ValidationItemType, itemId: string) => void;
  relationships: any[];
  data: any;
}

export function ABTestModal({
  isOpen,
  onClose,
  abTest,
  onEdit,
  onDelete,
  onComplete,
  onCancel,
  onAddResults,
  onImplementWinner,
  onCreateFeedback,
  onViewItem,
  relationships,
  data
}: ABTestModalProps) {
  const getStatusColor = (status: string | null) => {
    if (!status) return 'default';
    switch (status) {
      case 'completed':
        return 'success';
      case 'running':
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
    if (abTest.status === 'running') {
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
    if (abTest.status === 'completed') {
      if (!abTest.results) {
        actions.push({
          label: 'Add Results',
          icon: <BarChart className="h-4 w-4" />,
          onClick: onAddResults,
          variant: 'default' as const
        });
      } else if (abTest.results.winner && abTest.results.winner !== 'inconclusive') {
        actions.push({
          label: 'Implement Winner',
          icon: <Flag className="h-4 w-4" />,
          onClick: onImplementWinner,
          variant: 'default' as const
        });
      }
    }

    // Create related items
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
      itemType="abTest"
      title={abTest.title || 'A/B Test'}
      status={abTest.status || 'planned'}
      statusColor={getStatusColor(abTest.status)}
      onEdit={onEdit}
      onDelete={onDelete}
      createdAt={abTest.created_at || undefined}
      updatedAt={abTest.updated_at || undefined}
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
        detailsContent={<ABTestDetails abTest={abTest} />}
        insightsContent={
          <ValidationInsights 
            itemType="abTest" 
            data={abTest} 
            relationships={relationships}
          />
        }
        relatedContent={
          <ValidationRelatedItems
            itemType="abTest"
            itemId={abTest.id}
            relationships={relationships}
            onViewItem={onViewItem}
            data={data}
          />
        }
      />
    </ValidationItemModal>
  );
} 