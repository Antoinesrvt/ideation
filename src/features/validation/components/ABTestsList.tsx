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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Edit, 
  Trash2, 
  Calendar, 
  LineChart,
  ArrowUpDown,
  Award,
  Percent,
  Scale,
  UserCheck,
  Clock,
  Plus,
  Trash,
  SlidersHorizontal,
  EyeIcon,
  EyeOffIcon,
  PlusCircle,
  SplitSquareVertical,
  BarChart3
} from 'lucide-react';
import { ValidationABTest as ABTest, Insert, Update } from '@/store/types';
import { useForm } from 'react-hook-form';
import { ValidationTable, ValidationTableColumn } from './common/ValidationTable';
import { ABTestModal } from './modals/ABTestModal';
import { ValidationItemType } from './common/ValidationItemModal';
import { EnhancedValidationABTest } from '../types';
import { EnhancedABTestForm } from './forms/EnhancedABTestForm';

interface ABTestsListProps {
  tests: ABTest[];
  onUpdate: (params: { id: string; data: Partial<Omit<ABTest, 'id' | 'created_at' | 'updated_at'>> }) => void;
  onDelete: (id: string) => void; 
  relationships?: any[];
  data?: any;
  projectId?: string;
}

interface ABTestFormValues {
  title: string;
  description: string;
  variant_a: string;
  variant_b: string;
  metric: string;
  status: 'planned' | 'running' | 'completed';
  start_date: string;
  end_date: string;
  sample_size: number;
  conversion_a: number;
  conversion_b: number;
  confidence: number;
  winner: string | null;
  notes: string;
}

// Define a DetailLevel type for our component
type DetailLevel = 'simple' | 'detailed';

export function ABTestsList({ 
  tests, 
  onUpdate, 
  onDelete,
  relationships = [],
  data = {},
  projectId
}: ABTestsListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<ABTest | null>(null);
  const [detailLevel, setDetailLevel] = useState<DetailLevel>('simple');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // Modal state
  const [selectedTestForModal, setSelectedTestForModal] = useState<EnhancedValidationABTest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const form = useForm<ABTestFormValues>({
    defaultValues: {
      title: '',
      description: '',
      variant_a: '',
      variant_b: '',
      metric: '',
      status: 'planned',
      start_date: '',
      end_date: '',
      sample_size: 0,
      conversion_a: 0,
      conversion_b: 0,
      confidence: 0,
      winner: null,
      notes: ''
    }
  });
  
  // Add new state for the enhanced form
  const [openNewDialog, setOpenNewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  
  const handleEdit = (test: ABTest) => {
    setSelectedTest(test);
    setOpenEditDialog(true);
  };
  
  const handleSave = (values: ABTestFormValues) => {
    if (!editingTest) return;
    
    onUpdate({
      id: editingTest.id,
      data: {
        ...values,
        winner: values.winner || undefined
      }
    });

    setIsDialogOpen(false);
    setEditingTest(null);
    form.reset();
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this A/B test?')) {
      onDelete(id);
    }
  };
  
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'running':
        return 'warning';
      default:
        return 'secondary';
    }
  };
  
  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'completed':
        return <Award className="h-3.5 w-3.5" />;
      case 'running':
        return <Clock className="h-3.5 w-3.5" />;
      default:
        return <SplitSquareVertical className="h-3.5 w-3.5" />;
    }
  };
  
  const getWinnerColor = (winner: string | null) => {
    switch (winner) {
      case 'A':
        return 'success';
      case 'B':
        return 'info';
      case 'inconclusive':
        return 'warning';
      default:
        return 'secondary';
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

  const getImprovement = (test: ABTest) => {
    if (
      !test.conversion_a ||
      !test.conversion_b ||
      test.conversion_a === 0
    ) {
      return null;
    }
    
    const improvement = ((test.conversion_b - test.conversion_a) / test.conversion_a) * 100;
    return improvement.toFixed(1);
  };

  // Render empty state
  const renderEmptyState = () => (
    <div className="flex h-[400px] shrink-0 items-center justify-center rounded-md border border-dashed">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <BarChart3 className="h-10 w-10 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No A/B tests</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          You haven't created any A/B tests yet. Get started by creating your first test.
        </p>
        <Button onClick={() => setOpenNewDialog(true)} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          New A/B Test
        </Button>
      </div>
    </div>
  );
  
  // Define table columns based on detail level
  const getTableColumns = (): ValidationTableColumn<ABTest>[] => {
    const baseColumns: ValidationTableColumn<ABTest>[] = [
      {
        header: "Title",
        cell: (test) => (
          <div className="font-medium max-w-md truncate">
            {test.title}
              </div>
        )
      },
      {
        header: "Status",
        cell: (test) => (
          <Badge variant={getStatusColor(test.status)} className="flex w-fit items-center gap-1">
            {getStatusIcon(test.status)}
            {(test.status || 'planned').charAt(0).toUpperCase() + (test.status || 'planned').slice(1)}
              </Badge>
        )
      }
    ];
    
    if (detailLevel === 'detailed') {
      return [
        ...baseColumns,
        {
          header: "Variants",
          cell: (test) => (
            <div className="text-sm">
              <div>A: {test.variant_a || 'Control'}</div>
              <div>B: {test.variant_b || 'Variant'}</div>
            </div>
          )
        },
        {
          header: "Metric",
          cell: (test) => (
            <div className="max-w-[150px] truncate">
              {test.metric || 'Not specified'}
            </div>
          )
        },
        {
          header: "Results",
          cell: (test) => (
            test.status === 'completed' ? (
              <div>
                <Badge variant={getWinnerColor(test.winner)}>
                  {test.winner === 'A' ? 'A Wins' :
                  test.winner === 'B' ? 'B Wins' :
                     test.winner === 'inconclusive' ? 'Inconclusive' : 'No Result'}
                  </Badge>
                  {getImprovement(test) && (
                  <div className="text-xs text-muted-foreground mt-1">
                      {getImprovement(test)}% improvement
                    </div>
                  )}
                </div>
              ) : (
              <span className="text-muted-foreground text-sm">No results</span>
            )
          )
        }
      ];
    }
    
    return baseColumns;
  };

  // Handle opening the modal when a row is clicked
  const handleRowClick = (test: ABTest) => {
    // Convert to enhanced test type
    const enhancedTest: EnhancedValidationABTest = {
      ...test,
      results: test.conversion_a && test.conversion_b ? {
        sampleSize: test.sample_size || 0,
        conversionA: test.conversion_a || 0,
        conversionB: test.conversion_b || 0,
        confidence: test.confidence || 0,
        winner: (test.winner as 'A' | 'B' | 'inconclusive') || 'inconclusive',
        improvement: parseFloat(getImprovement(test) || '0')
      } : null,
      experimentId: null
    };
    
    setSelectedTestForModal(enhancedTest);
    setIsModalOpen(true);
  };

  // Handle view item in related items
  const handleViewItem = (itemType: ValidationItemType, itemId: string) => {
    // This would be implemented to open the appropriate modal for the related item
    console.log(`View ${itemType} with ID ${itemId}`);
    // You would implement this to open the appropriate modal
  };

  // Handle A/B test actions
  const handleComplete = () => {
    if (!selectedTestForModal) return;
    
    onUpdate({
      id: selectedTestForModal.id,
      data: { status: 'completed' }
    });
  };

  const handleCancel = () => {
    if (!selectedTestForModal) return;
    
    onUpdate({
      id: selectedTestForModal.id,
      data: { status: 'cancelled' }
    });
  };

  const handleAddResults = () => {
    if (!selectedTestForModal) return;
    setIsModalOpen(false);
    handleEdit(selectedTestForModal);
  };

  const handleImplementWinner = () => {
    // Implement logic to implement the winner
    console.log('Implement winner for A/B test', selectedTestForModal?.id);
  };

  const handleCreateFeedback = () => {
    // Implement navigation or modal to add user feedback related to A/B test
    console.log('Add user feedback for A/B test', selectedTestForModal?.id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">A/B Tests</h2>
          <p className="text-muted-foreground">
            Test different versions of your product to optimize for success.
          </p>
        </div>
        <Button onClick={() => setOpenNewDialog(true)} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          New A/B Test
        </Button>
      </div>

      {tests.length === 0 ? (
        renderEmptyState()
      ) : (
        <ValidationTable
          data={tests}
          columns={getTableColumns()}
          getRowId={(test) => test.id}
          onRowClick={handleRowClick}
          isRowClickable={true}
          emptyState={
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <BarChart3 className="h-8 w-8 mb-2 opacity-50" />
              <p>No A/B tests yet</p>
              <Button 
                variant="link" 
                onClick={() => setOpenNewDialog(true)}
                className="mt-2"
              >
                Add your first A/B test
              </Button>
            </div>
          }
        />
      )}

      {/* Enhanced AB Test Form for Creating New Tests */}
      <EnhancedABTestForm
        open={openNewDialog}
        onOpenChange={setOpenNewDialog}
        onSubmit={(data) => {
          // Format the AB Test for the database
          const newABTest = {
            ...data,
            project_id: projectId ?? ''
          };
          
          onUpdate({
            id: data.id ?? '', // Ensure id is a string
            data: newABTest
          });
        }}
      />

      {/* Enhanced AB Test Form for Editing Existing Tests */}
      {selectedTest && (
        <EnhancedABTestForm
          open={openEditDialog}
          onOpenChange={setOpenEditDialog}
          initialData={selectedTest}
          onSubmit={(data) => {
            if (selectedTest) {
              // Format the AB Test for the database
              const { id, ...restData } = data;
              const updatedABTest = {
                ...restData,
                project_id: projectId ?? ''
              };
              
              onUpdate({
                id: selectedTest.id,
                data: updatedABTest
              });
            }
          }}
        />
      )}

      {/* Keep the existing modal for detailed view */}
      {selectedTestForModal && (
        <ABTestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          abTest={selectedTestForModal}
          onEdit={() => {
            setIsModalOpen(false);
            handleEdit(selectedTestForModal);
          }}
          onDelete={() => {
            setIsModalOpen(false);
            handleDelete(selectedTestForModal.id);
          }}
          onComplete={handleComplete}
          onCancel={handleCancel}
          onAddResults={handleAddResults}
          onImplementWinner={handleImplementWinner}
          onCreateFeedback={handleCreateFeedback}
          onViewItem={handleViewItem}
          relationships={relationships}
          data={data}
        />
      )}
    </div>
  );
} 