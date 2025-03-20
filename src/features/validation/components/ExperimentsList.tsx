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
  DialogFooter,
  DialogTrigger
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
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Beaker, 
  Calendar, 
  Clock, 
  Edit, 
  Info, 
  Lightbulb,
  List, 
  PlusCircle, 
  Target, 
  Trash2, 
  TrendingUp,
  Plus,
  Trash,
  SlidersHorizontal,
  EyeIcon,
  EyeOffIcon,
  LineChart,
  BarChart3
} from 'lucide-react';
import { ValidationExperiment, Insert, Update } from '@/store/types';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { ValidationTable, ValidationTableColumn } from './common/ValidationTable';
import { ExperimentModal } from './modals/ExperimentModal';
import { ValidationItemType } from './common/ValidationItemModal';
import { EnhancedValidationExperiment } from '../types';
import { EnhancedExperimentForm } from './forms/EnhancedExperimentForm';

interface ExperimentsListProps {
  experiments: ValidationExperiment[];
  onUpdate: (params: { id: string; data: Partial<Omit<ValidationExperiment, 'id' | 'created_at' | 'updated_at'>> }) => void;
  onDelete: (id: string) => void;
  relationships?: any[];
  data?: any;
  projectId?: string;
}

interface ExperimentFormValues {
  title: string;
  description: string;
  hypothesis: string;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  start_date: string;
  end_date: string;
  results: string;
  learnings: string;
  metrics: MetricInput[];
}

interface MetricInput {
  id: string;
  key: string;
  target: string;
  actual: string;
}

// Define a DetailLevel type for our component
type DetailLevel = 'simple' | 'detailed';

export const ExperimentsList: React.FC<ExperimentsListProps> = ({ 
  experiments, 
  onUpdate,
  onDelete,
  relationships = [],
  data = {},
  projectId
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExperiment, setEditingExperiment] = useState<ValidationExperiment | null>(null);
  const [metrics, setMetrics] = useState<MetricInput[]>([]);
  const [detailLevel, setDetailLevel] = useState<DetailLevel>('simple');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // Modal state
  const [selectedExperimentForModal, setSelectedExperimentForModal] = useState<EnhancedValidationExperiment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const form = useForm<ExperimentFormValues>({
    defaultValues: {
      title: '',
      description: '',
      hypothesis: '',
      status: 'planned',
      start_date: '',
      end_date: '',
      results: '',
      learnings: '',
      metrics: []
    }
  });
  
  // Add new states for the enhanced form
  const [openNewDialog, setOpenNewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedExperiment, setSelectedExperiment] = useState<ValidationExperiment | null>(null);
  
  const handleEdit = (experiment: ValidationExperiment) => {
    setSelectedExperiment(experiment);
    setOpenEditDialog(true);
  };
  
  const handleSave = (values: ExperimentFormValues) => {
    if (!editingExperiment) return;
    
    // Convert metrics from form format to the experiment format
    const formattedMetrics = values.metrics.map(metric => ({
      id: metric.id,
      key: metric.key,
      target: parseFloat(metric.target) || 0,
      actual: parseFloat(metric.actual) || 0
    }));
    
    // Format values for database
    const formattedValues: Partial<Omit<ValidationExperiment, 'id' | 'created_at' | 'updated_at'>> = {
      title: values.title,
      description: values.description,
      hypothesis: values.hypothesis,
      status: values.status,
      start_date: values.start_date,
      end_date: values.end_date,
      // Store results as a JSON string
      results: values.results ? JSON.stringify({
        success: true, // This would need to be determined based on metrics
        notes: values.results,
        sampleSize: 0, // These would need to be added to the form
        conversionRate: 0
      }) : null,
      learnings: values.learnings,
      // Store metrics as a JSON string
      metrics: JSON.stringify(formattedMetrics)
    };
    
    onUpdate({
      id: editingExperiment.id,
      data: formattedValues
    });
    
    setIsDialogOpen(false);
    setEditingExperiment(null);
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this experiment?')) {
      onDelete(id);
    }
  };
  
  const handleAddMetric = () => {
    const newMetric: MetricInput = {
      id: uuidv4(),
      key: '',
      target: '',
      actual: ''
    };
    
    setMetrics([...metrics, newMetric]);
    form.setValue('metrics', [...form.getValues().metrics, newMetric]);
  };
  
  const handleRemoveMetric = (id: string) => {
    const updatedMetrics = metrics.filter(metric => metric.id !== id);
    setMetrics(updatedMetrics);
    form.setValue('metrics', updatedMetrics);
  };
  
  const handleUpdateMetric = (id: string, field: keyof MetricInput, value: string) => {
    const updatedMetrics = metrics.map(metric => 
      metric.id === id ? { ...metric, [field]: value } : metric
    );
    
    setMetrics(updatedMetrics);
    form.setValue('metrics', updatedMetrics);
  };
  
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'warning';
      case 'cancelled':
        return 'destructive';
      case 'planned':
      default:
        return 'secondary';
    }
  };
  
  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'completed':
        return <TrendingUp className="h-3.5 w-3.5" />;
      case 'in-progress':
        return <Clock className="h-3.5 w-3.5" />;
      case 'cancelled':
        return <Trash className="h-3.5 w-3.5" />;
      case 'planned':
      default:
        return <Target className="h-3.5 w-3.5" />;
    }
  };
  
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Render empty state for no experiments
  const renderEmptyState = () => (
    <div className="flex h-[400px] shrink-0 items-center justify-center rounded-md border border-dashed">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <BarChart3 className="h-10 w-10 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No experiments</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          You haven't created any experiments yet. Get started by creating your first experiment.
        </p>
        <Button onClick={() => setOpenNewDialog(true)} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          New Experiment
        </Button>
      </div>
    </div>
  );
  
  // Define table columns based on detail level
  const getTableColumns = (): ValidationTableColumn<ValidationExperiment>[] => {
    const baseColumns: ValidationTableColumn<ValidationExperiment>[] = [
      {
        header: "Title",
        cell: (experiment) => (
          <div className="font-medium max-w-md truncate">
            {experiment.title}
          </div>
        )
      },
      {
        header: "Status",
        cell: (experiment) => (
          <Badge variant={getStatusColor(experiment.status)} className="flex w-fit items-center gap-1">
            {getStatusIcon(experiment.status)}
            {(experiment.status || 'planned').charAt(0).toUpperCase() + (experiment.status || 'planned').slice(1)}
          </Badge>
        )
      }
    ];
    
    if (detailLevel === 'detailed') {
      return [
        ...baseColumns,
        {
          header: "Timeline",
          cell: (experiment) => (
            <div className="text-sm">
              {experiment.start_date ? formatDate(experiment.start_date) : 'Not started'} 
              {experiment.end_date ? ` - ${formatDate(experiment.end_date)}` : ''}
            </div>
          )
        },
        {
          header: "Hypothesis",
          cell: (experiment) => (
            <div className="max-w-[200px] truncate">
              {experiment.hypothesis || 'None'}
            </div>
          )
        },
        {
          header: "Results",
          cell: (experiment) => {
            if (!experiment.results) {
              return <span className="text-muted-foreground text-sm">No results</span>;
            }
            
            try {
              // Try to parse results if it's a string
              const resultsObj = typeof experiment.results === 'string' 
                ? JSON.parse(experiment.results) 
                : experiment.results;
                
              return (
                <Badge variant={resultsObj.success ? 'success' : 'destructive'}>
                  {resultsObj.success ? 'Success' : 'Failed'}
                </Badge>
              );
            } catch (e) {
              return <span className="text-muted-foreground text-sm">Invalid results</span>;
            }
          }
        }
      ];
    }
    
    return baseColumns;
  };

  // Handle opening the modal when a row is clicked
  const handleRowClick = (experiment: ValidationExperiment) => {
    // Convert to enhanced experiment type
    const enhancedExperiment: EnhancedValidationExperiment = {
      ...experiment,
      // Parse results if they exist
      results: experiment.results ? 
        (typeof experiment.results === 'string' ? 
          JSON.parse(experiment.results) : experiment.results) : null,
      // Parse metrics if they exist
      metrics: experiment.metrics ? 
        (typeof experiment.metrics === 'string' ? 
          JSON.parse(experiment.metrics) : experiment.metrics) : null,
      // Add learnings
      learnings: experiment.learnings || null,
      // Add hypothesis
      hypothesis: experiment.hypothesis || null
    };
    
    setSelectedExperimentForModal(enhancedExperiment);
    setIsModalOpen(true);
  };

  // Handle view item in related items
  const handleViewItem = (itemType: ValidationItemType, itemId: string) => {
    // This would be implemented to open the appropriate modal for the related item
    console.log(`View ${itemType} with ID ${itemId}`);
    // You would implement this to open the appropriate modal
  };

  // Handle experiment actions
  const handleComplete = () => {
    if (!selectedExperimentForModal) return;
    
    onUpdate({
      id: selectedExperimentForModal.id,
      data: { status: 'completed' }
    });
  };

  const handleCancel = () => {
    if (!selectedExperimentForModal) return;
    
    onUpdate({
      id: selectedExperimentForModal.id,
      data: { status: 'cancelled' }
    });
  };

  const handleAddResults = () => {
    if (!selectedExperimentForModal) return;
    setIsModalOpen(false);
    
    // Convert EnhancedValidationExperiment back to ValidationExperiment for editing
    const experimentForEdit: ValidationExperiment = {
      ...selectedExperimentForModal,
      // Convert results back to string format if needed
      results: selectedExperimentForModal.results ? 
        (typeof selectedExperimentForModal.results === 'string' ? 
          selectedExperimentForModal.results : 
          JSON.stringify(selectedExperimentForModal.results)) : null,
      // Convert metrics back to string format if needed
      metrics: selectedExperimentForModal.metrics ? 
        (typeof selectedExperimentForModal.metrics === 'string' ? 
          selectedExperimentForModal.metrics : 
          JSON.stringify(selectedExperimentForModal.metrics)) : null
    };
    
    handleEdit(experimentForEdit);
  };

  const handleCreateABTest = () => {
    // Implement navigation or modal to create A/B test based on experiment
    console.log('Create A/B test from experiment', selectedExperimentForModal?.id);
  };

  const handleCreateFeedback = () => {
    // Implement navigation or modal to add user feedback related to experiment
    console.log('Add user feedback for experiment', selectedExperimentForModal?.id);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Experiments</h2>
          <p className="text-muted-foreground">
            Test your hypotheses through structured experiments.
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
            New Experiment
          </Button>
        </div>
      </div>

      {experiments.length === 0 ? (
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
            data={experiments}
            columns={getTableColumns()}
            onEdit={handleEdit}
            onDelete={handleDelete}
            getRowId={(experiment) => experiment.id}
            onRowClick={handleRowClick}
            isRowClickable={true}
            emptyState={
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <BarChart3 className="h-8 w-8 mb-2 opacity-50" />
                <p>No experiments yet</p>
                <Button 
                  variant="link" 
                  onClick={() => setOpenNewDialog(true)}
                  className="mt-2"
                >
                  Add your first experiment
                </Button>
              </div>
            }
          />
        </div>
      )}

      {/* Enhanced Experiment Form for Creating New Experiments */}
      <EnhancedExperimentForm
        open={openNewDialog}
        onOpenChange={setOpenNewDialog}
        onSubmit={(data) => {
          // Format the Experiment for the database
          const newExperiment = {
            ...data,
            project_id: projectId ?? ''
          } as Partial<Omit<ValidationExperiment, 'id' | 'created_at' | 'updated_at'>>;
          
          onUpdate({
            id: data.id ?? '',
            data: newExperiment
          });
        }}
      />

      {/* Enhanced Experiment Form for Editing Existing Experiments */}
      {selectedExperiment && (
        <EnhancedExperimentForm
          open={openEditDialog}
          onOpenChange={setOpenEditDialog}
          initialData={selectedExperiment}
          onSubmit={(data) => {
            if (selectedExperiment) {
              // Format the Experiment for the database
              const updatedExperiment = {
                ...data,
                project_id: projectId ?? ''
              } as Partial<Omit<ValidationExperiment, 'id' | 'created_at' | 'updated_at'>>;
              
              onUpdate({
                id: selectedExperiment.id,
                data: updatedExperiment
              });
            }
          }}
        />
      )}

      {/* Experiment Modal */}
      {selectedExperimentForModal && (
        <ExperimentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          experiment={selectedExperimentForModal as unknown as EnhancedValidationExperiment}
          onEdit={() => {
            setIsModalOpen(false);
            // Convert EnhancedValidationExperiment back to ValidationExperiment
            const experimentForEdit: ValidationExperiment = {
              ...selectedExperimentForModal,
              // Convert results to string if it's an object
              results: selectedExperimentForModal.results 
                ? (typeof selectedExperimentForModal.results === 'string' 
                  ? selectedExperimentForModal.results 
                  : JSON.stringify(selectedExperimentForModal.results)) 
                : null,
              // Convert metrics to string if it's an object
              metrics: selectedExperimentForModal.metrics 
                ? (typeof selectedExperimentForModal.metrics === 'string' 
                  ? selectedExperimentForModal.metrics 
                  : JSON.stringify(selectedExperimentForModal.metrics)) 
                : null
            };
            handleEdit(experimentForEdit);
          }}
          onDelete={() => {
            setIsModalOpen(false);
            handleDelete(selectedExperimentForModal.id);
          }}
          onComplete={handleComplete}
          onCancel={handleCancel}
          onAddResults={handleAddResults}
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