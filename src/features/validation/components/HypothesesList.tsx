import React, { useState } from 'react';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Edit, 
  Trash2, 
  Calendar, 
  Lightbulb, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  PlusCircle,
  EyeIcon,
  EyeOffIcon,
  SlidersHorizontal,
  Percent,
  BarChart3
} from 'lucide-react';
import { ValidationHypothesis as Hypothesis, Insert, Update } from '@/store/types';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { ValidationTable, ValidationTableColumn } from './common/ValidationTable';
import { HypothesisModal } from './modals/HypothesisModal';
import { ValidationItemType } from './common/ValidationItemModal';
import { EnhancedHypothesisForm } from './forms/EnhancedHypothesisForm';

// Define a DetailLevel type for our component
type DetailLevel = 'simple' | 'detailed';

interface HypothesesListProps {
  hypotheses: Hypothesis[];
  onUpdate: (params: { id: string; data: Update<"validation_hypotheses"> }) => void;
  onDelete: (id: string) => void;
  relationships?: any[];
  data?: any;
  projectId?: string;
}

interface HypothesisFormValues {
  statement: string;
  assumptions: string[];
  validationMethod: string;
  status: 'validated' | 'invalidated' | 'unvalidated';
  confidence: number;
  evidence: string[];
}

export const HypothesesList: React.FC<HypothesesListProps> = ({ 
  hypotheses, 
  onUpdate,
  onDelete,
  relationships = [],
  data = {},
  projectId
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHypothesis, setEditingHypothesis] = useState<Hypothesis | null>(null);
  const [newAssumption, setNewAssumption] = useState('');
  const [newEvidence, setNewEvidence] = useState('');
  // Detail level (how much information to show)
  const [detailLevel, setDetailLevel] = useState<DetailLevel>('simple');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // Modal state
  const [selectedHypothesisForModal, setSelectedHypothesisForModal] = useState<Hypothesis | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const form = useForm<HypothesisFormValues>({
    defaultValues: {
      statement: '',
      assumptions: [],
      validationMethod: '',
      status: 'unvalidated',
      confidence: 0,
      evidence: []
    }
  });
  
  // Add new states for the enhanced form
  const [openNewDialog, setOpenNewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedHypothesis, setSelectedHypothesis] = useState<Hypothesis | null>(null);
  
  const handleEdit = (hypothesis: Hypothesis) => {
    setSelectedHypothesis(hypothesis);
    setOpenEditDialog(true);
  };
  
  const handleSave = (values: HypothesisFormValues) => {
    if (!editingHypothesis) return;
    
    // Map validationMethod to validation_method for the database
    const formattedValues = {
      statement: values.statement,
      assumptions: values.assumptions,
      validation_method: values.validationMethod,
      status: values.status,
      confidence: values.confidence,
      evidence: values.evidence
    };
    
    onUpdate({
      id: editingHypothesis.id,
      data: formattedValues
    });
    
    setIsDialogOpen(false);
    setEditingHypothesis(null);
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this hypothesis?')) {
      onDelete(id);
    }
  };
  
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'validated':
        return 'success';
      case 'invalidated':
        return 'destructive';
      case 'unvalidated':
      default:
        return 'secondary';
    }
  };
  
  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'validated':
        return <CheckCircle2 className="h-3.5 w-3.5" />;
      case 'invalidated':
        return <XCircle className="h-3.5 w-3.5" />;
      case 'unvalidated':
      default:
        return <HelpCircle className="h-3.5 w-3.5" />;
    }
  };
  
  const getConfidenceColor = (confidence: number | null) => {
    if (!confidence) return 'secondary';
    if (confidence >= 80) return 'success';
    if (confidence >= 50) return 'warning';
    return 'destructive';
  };
  
  const getConfidenceLevel = (confidence: number | null) => {
    if (!confidence) return 'Unknown';
    if (confidence >= 80) return 'High';
    if (confidence >= 50) return 'Medium';
    return 'Low';
  };
  
  const handleAddAssumption = () => {
    if (!newAssumption.trim()) return;
    
    const currentAssumptions = form.getValues().assumptions || [];
    form.setValue('assumptions', [...currentAssumptions, newAssumption.trim()]);
    setNewAssumption('');
  };
  
  const handleRemoveAssumption = (assumption: string) => {
    const currentAssumptions = form.getValues().assumptions || [];
    form.setValue('assumptions', currentAssumptions.filter(a => a !== assumption));
  };
  
  const handleAddEvidence = () => {
    if (!newEvidence.trim()) return;
    
    const currentEvidence = form.getValues().evidence || [];
    form.setValue('evidence', [...currentEvidence, newEvidence.trim()]);
    setNewEvidence('');
  };
  
  const handleRemoveEvidence = (evidence: string) => {
    const currentEvidence = form.getValues().evidence || [];
    form.setValue('evidence', currentEvidence.filter(e => e !== evidence));
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Render empty state for no hypotheses
  const renderEmptyState = () => (
    <div className="flex h-[400px] shrink-0 items-center justify-center rounded-md border border-dashed">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <BarChart3 className="h-10 w-10 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No hypotheses</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          You haven't created any hypotheses yet. Get started by creating your first hypothesis.
        </p>
        <Button onClick={() => setOpenNewDialog(true)} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          New Hypothesis
        </Button>
      </div>
    </div>
  );

  // Define table columns based on detail level
  const getTableColumns = (): ValidationTableColumn<Hypothesis>[] => {
    const baseColumns: ValidationTableColumn<Hypothesis>[] = [
      {
        header: "Statement",
        cell: (hypothesis) => (
          <div className="font-medium max-w-md truncate">
            {hypothesis.statement}
          </div>
        )
      },
      {
        header: "Status",
        cell: (hypothesis) => (
          <Badge variant={getStatusColor(hypothesis.status)} className="flex w-fit items-center gap-1">
            {getStatusIcon(hypothesis.status)}
            {(hypothesis.status || 'unvalidated').charAt(0).toUpperCase() + (hypothesis.status || 'unvalidated').slice(1)}
          </Badge>
        )
      }
    ];

    if (detailLevel === 'detailed') {
      return [
        ...baseColumns,
        {
          header: "Confidence",
          cell: (hypothesis) => (
            <Badge variant={getConfidenceColor(hypothesis.confidence)} className="w-fit">
              {getConfidenceLevel(hypothesis.confidence)}
            </Badge>
          )
        },
        {
          header: "Method",
          cell: (hypothesis) => (
            <div className="max-w-[150px] truncate">
              {hypothesis.validation_method || 'Not specified'}
            </div>
          )
        },
        {
          header: "Created",
          cell: (hypothesis) => formatDate(hypothesis.created_at)
        }
      ];
    }

    return baseColumns;
  };

  // Handle opening the modal when a row is clicked
  const handleRowClick = (hypothesis: Hypothesis) => {
    setSelectedHypothesisForModal(hypothesis);
    setIsModalOpen(true);
  };

  // Handle view item in related items
  const handleViewItem = (itemType: ValidationItemType, itemId: string) => {
    // This would be implemented to open the appropriate modal for the related item
    console.log(`View ${itemType} with ID ${itemId}`);
    // You would implement this to open the appropriate modal
  };

  // Handle hypothesis actions
  const handleValidate = () => {
    if (!selectedHypothesisForModal) return;
    
    onUpdate({
      id: selectedHypothesisForModal.id,
      data: { status: 'validated' }
    });
  };

  const handleInvalidate = () => {
    if (!selectedHypothesisForModal) return;
    
    onUpdate({
      id: selectedHypothesisForModal.id,
      data: { status: 'invalidated' }
    });
  };

  const handleCreateExperiment = () => {
    // Implement navigation or modal to create experiment based on hypothesis
    console.log('Create experiment from hypothesis', selectedHypothesisForModal?.id);
  };

  const handleCreateABTest = () => {
    // Implement navigation or modal to create A/B test based on hypothesis
    console.log('Create A/B test from hypothesis', selectedHypothesisForModal?.id);
  };

  const handleCreateFeedback = () => {
    // Implement navigation or modal to add user feedback related to hypothesis
    console.log('Add user feedback for hypothesis', selectedHypothesisForModal?.id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Hypotheses</h2>
          <p className="text-muted-foreground">
            Create and validate your business hypotheses.
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
            New Hypothesis
          </Button>
        </div>
      </div>

      {hypotheses.length === 0 ? (
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
            data={hypotheses}
            columns={getTableColumns()}
            onEdit={handleEdit}
            onDelete={handleDelete}
            getRowId={(hypothesis) => hypothesis.id}
            onRowClick={handleRowClick}
            isRowClickable={true}
            emptyState={
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <BarChart3 className="h-8 w-8 mb-2 opacity-50" />
                <p>No hypotheses yet</p>
                <Button 
                  variant="link" 
                  onClick={() => setOpenNewDialog(true)}
                  className="mt-2"
                >
                  Add your first hypothesis
                </Button>
              </div>
            }
          />
        </div>
      )}

      {/* Enhanced Hypothesis Form for Creating New Hypotheses */}
      <EnhancedHypothesisForm
        open={openNewDialog}
        onOpenChange={setOpenNewDialog}
        onSubmit={(data) => {
          // Format the Hypothesis for the database
          const newHypothesis = {
            ...data,
            project_id: projectId ?? ''
          };
          
          onUpdate({
            id: data.id ?? '',
            data: newHypothesis
          });
        }}
      />

      {/* Enhanced Hypothesis Form for Editing Existing Hypotheses */}
      {selectedHypothesis && (
        <EnhancedHypothesisForm
          open={openEditDialog}
          onOpenChange={setOpenEditDialog}
          initialData={selectedHypothesis}
          onSubmit={(data) => {
            if (selectedHypothesis) {
              // Format the Hypothesis for the database
              const updatedHypothesis = {
                ...data,
                id: selectedHypothesis.id,
                project_id: projectId ?? ''
              };
              
              onUpdate({
                id: selectedHypothesis.id,
                data: updatedHypothesis
              });
            }
          }}
        />
      )}

      {/* Keep the existing modal for detailed view */}
      {selectedHypothesisForModal && (
        <HypothesisModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          hypothesis={selectedHypothesisForModal}
          onEdit={() => {
            setIsModalOpen(false);
            handleEdit(selectedHypothesisForModal);
          }}
          onDelete={() => {
            setIsModalOpen(false);
            handleDelete(selectedHypothesisForModal.id);
          }}
          onValidate={handleValidate}
          onInvalidate={handleInvalidate}
          onCreateExperiment={handleCreateExperiment}
          onCreateABTest={handleCreateABTest}
          onCreateFeedback={handleCreateFeedback}
          onViewItem={handleViewItem}
          relationships={relationships}
          data={data}
        />
      )}
    </div>
  );
}; 