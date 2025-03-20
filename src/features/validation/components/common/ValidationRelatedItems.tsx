import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  Beaker, 
  SplitSquareVertical, 
  MessageSquare, 
  ArrowRight,
  ArrowUpRight,
  Link as LinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ValidationItemType } from './ValidationItemModal';
import { ValidationRelationship } from '../../types';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface ValidationRelatedItemsProps {
  itemType: ValidationItemType;
  itemId: string;
  relationships: ValidationRelationship[];
  onViewItem: (itemType: ValidationItemType, itemId: string) => void;
  data: any;
}

interface RelatedItemCardProps {
  title: string;
  type: ValidationItemType;
  id: string;
  description?: string;
  status?: string;
  statusColor?: string;
  relationshipType?: 'supports' | 'contradicts' | 'related';
  onClick: () => void;
}

function getItemIcon(type: ValidationItemType) {
  switch (type) {
    case 'hypothesis':
      return <Lightbulb className="h-4 w-4" />;
    case 'experiment':
      return <Beaker className="h-4 w-4" />;
    case 'abTest':
      return <SplitSquareVertical className="h-4 w-4" />;
    case 'userFeedback':
      return <MessageSquare className="h-4 w-4" />;
    default:
      return <LinkIcon className="h-4 w-4" />;
  }
}

function getRelationshipColor(type: 'supports' | 'contradicts' | 'related' | undefined) {
  switch (type) {
    case 'supports':
      return 'text-green-500';
    case 'contradicts':
      return 'text-red-500';
    case 'related':
    default:
      return 'text-blue-500';
  }
}

function getRelationshipLabel(type: 'supports' | 'contradicts' | 'related' | undefined) {
  switch (type) {
    case 'supports':
      return 'Supports';
    case 'contradicts':
      return 'Contradicts';
    case 'related':
    default:
      return 'Related to';
  }
}

function RelatedItemCard({ 
  title, 
  type, 
  id, 
  description, 
  status, 
  statusColor = 'default',
  relationshipType,
  onClick 
}: RelatedItemCardProps) {
  const icon = getItemIcon(type);
  const relationshipColor = getRelationshipColor(relationshipType);
  const relationshipLabel = getRelationshipLabel(relationshipType);
  
  return (
    <Card className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={onClick}>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={relationshipColor}>
              {icon}
            </div>
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          {status && (
            <Badge variant={statusColor as any} className="capitalize">
              {status}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        {description && (
          <CardDescription className="text-sm mb-2 line-clamp-2">
            {description}
          </CardDescription>
        )}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className={relationshipColor}>{relationshipLabel}</span>
          </div>
          <Button variant="ghost" size="sm" className="h-7 gap-1">
            View <ArrowUpRight className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ValidationRelatedItems({ 
  itemType, 
  itemId, 
  relationships, 
  onViewItem,
  data
}: ValidationRelatedItemsProps) {
  // Filter relationships where this item is either source or target
  const relevantRelationships = relationships.filter(
    rel => (rel.sourceId === itemId && rel.sourceType === itemType) || 
           (rel.targetId === itemId && rel.targetType === itemType)
  );
  
  // Group by type
  const groupedItems = {
    hypothesis: [] as any[],
    experiment: [] as any[],
    abTest: [] as any[],
    userFeedback: [] as any[]
  };
  
  // Find the related items and their details
  relevantRelationships.forEach(rel => {
    // Determine if the current item is the source or target
    const isSource = rel.sourceId === itemId && rel.sourceType === itemType;
    const relatedType = isSource ? rel.targetType : rel.sourceType;
    const relatedId = isSource ? rel.targetId : rel.sourceId;
    
    // Find the related item in the data
    let relatedItem;
    let relatedItems;
    
    switch (relatedType) {
      case 'hypothesis':
        relatedItems = data.hypotheses || [];
        break;
      case 'experiment':
        relatedItems = data.experiments || [];
        break;
      case 'abTest':
        relatedItems = data.abTests || [];
        break;
      case 'userFeedback':
        relatedItems = data.userFeedback || [];
        break;
      default:
        relatedItems = [];
    }
    
    relatedItem = relatedItems.find((item: any) => item.id === relatedId);
    
    if (relatedItem) {
      // Add to the appropriate group with relationship info
      const itemWithRelationship = {
        ...relatedItem,
        relationshipType: rel.relationshipType,
        relationshipStrength: rel.strength,
        relationshipNotes: rel.notes
      };
      
      switch (relatedType) {
        case 'hypothesis':
          groupedItems.hypothesis.push(itemWithRelationship);
          break;
        case 'experiment':
          groupedItems.experiment.push(itemWithRelationship);
          break;
        case 'abTest':
          groupedItems.abTest.push(itemWithRelationship);
          break;
        case 'userFeedback':
          groupedItems.userFeedback.push(itemWithRelationship);
          break;
      }
    }
  });
  
  // Check if there are any related items
  const hasRelatedItems = Object.values(groupedItems).some(group => group.length > 0);
  
  if (!hasRelatedItems) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <LinkIcon className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Related Items</h3>
        <p className="text-muted-foreground max-w-md">
          This item doesn't have any connected validation items yet. 
          Connect it to hypotheses, experiments, A/B tests, or user feedback to build a validation chain.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Hypotheses */}
      {groupedItems.hypothesis.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
            <Lightbulb className="h-5 w-5" /> Related Hypotheses
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {groupedItems.hypothesis.map((item) => (
              <RelatedItemCard
                key={item.id}
                title={item.statement}
                type="hypothesis"
                id={item.id}
                status={item.status}
                statusColor={item.status === 'validated' ? 'success' : item.status === 'invalidated' ? 'destructive' : 'default'}
                relationshipType={item.relationshipType}
                onClick={() => onViewItem('hypothesis', item.id)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Experiments */}
      {groupedItems.experiment.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
            <Beaker className="h-5 w-5" /> Related Experiments
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {groupedItems.experiment.map((item) => (
              <RelatedItemCard
                key={item.id}
                title={item.title}
                type="experiment"
                id={item.id}
                description={item.description}
                status={item.status}
                statusColor={item.status === 'completed' ? 'success' : item.status === 'in-progress' ? 'warning' : 'default'}
                relationshipType={item.relationshipType}
                onClick={() => onViewItem('experiment', item.id)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* A/B Tests */}
      {groupedItems.abTest.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
            <SplitSquareVertical className="h-5 w-5" /> Related A/B Tests
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {groupedItems.abTest.map((item) => (
              <RelatedItemCard
                key={item.id}
                title={item.title}
                type="abTest"
                id={item.id}
                description={item.description}
                status={item.status}
                statusColor={item.status === 'completed' ? 'success' : item.status === 'running' ? 'warning' : 'default'}
                relationshipType={item.relationshipType}
                onClick={() => onViewItem('abTest', item.id)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* User Feedback */}
      {groupedItems.userFeedback.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" /> Related User Feedback
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {groupedItems.userFeedback.map((item) => (
              <RelatedItemCard
                key={item.id}
                title={item.content}
                type="userFeedback"
                id={item.id}
                status={item.sentiment}
                statusColor={item.sentiment === 'positive' ? 'success' : item.sentiment === 'negative' ? 'destructive' : 'default'}
                relationshipType={item.relationshipType}
                onClick={() => onViewItem('userFeedback', item.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 