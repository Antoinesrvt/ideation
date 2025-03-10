import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Check, 
  X, 
  Pencil, 
  Trash2, 
  Plus,
  Loader2
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface EditableTableRowProps<T> {
  /**
   * Data for the row
   */
  data: T;
  
  /**
   * Initial data for a new row
   */
  initialData?: T;
  
  /**
   * Whether this is a new row being created
   */
  isNewRow?: boolean;
  
  /**
   * Whether to show the empty row placeholder
   */
  isEmptyRow?: boolean;
  
  /**
   * Message to show in empty row
   */
  emptyRowMessage?: string;
  
  /**
   * Columns configuration for the row
   */
  columns: {
    key: keyof T;
    title: string;
    renderViewMode: (value: any, data: T) => React.ReactNode;
    renderEditMode: (
      value: any, 
      onChange: (key: keyof T, value: any) => void, 
      data: T,
      ref?: React.RefObject<HTMLInputElement>
    ) => React.ReactNode;
    validate?: (value: any, data: T) => string | null;
    colSpan?: number;
  }[];
  
  /**
   * Called when data is saved
   */
  onSave: (data: T) => Promise<void>;
  
  /**
   * Called when row is deleted
   */
  onDelete?: (data: T) => Promise<void>;
  
  /**
   * Called when edit is canceled
   */
  onCancel?: () => void;
  
  /**
   * Label for tooltips
   */
  entityName?: string;
  
  /**
   * Whether the row is read-only
   */
  readOnly?: boolean;
  
  /**
   * Optional additional actions to render in the actions cell
   */
  additionalActions?: (data: T, isEditMode: boolean) => React.ReactNode;

  /**
   * Optional className for the row
   */
  className?: string;
}

export function EditableTableRow<T>({
  data,
  initialData,
  isNewRow = false,
  isEmptyRow = false,
  emptyRowMessage = 'Add new item...',
  columns,
  onSave,
  onDelete,
  onCancel,
  entityName = 'item',
  readOnly = false,
  additionalActions,
  className
}: EditableTableRowProps<T>) {
  const [isEditMode, setIsEditMode] = useState(isNewRow);
  const [editData, setEditData] = useState<T>(isNewRow ? (initialData || data) : data);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const firstInputRef = useRef<HTMLInputElement>(null);
  
  // Focus first input when entering edit mode
  useEffect(() => {
    if (isEditMode && firstInputRef.current) {
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 10);
    }
  }, [isEditMode]);
  
  // Update edit data when props data changes
  useEffect(() => {
    if (!isEditMode) {
      setEditData(data);
    }
  }, [data, isEditMode]);

  const handleChange = (key: keyof T, value: any) => {
    setEditData(prev => ({ ...prev, [key]: value }));
    
    // Clear validation error when field is changed
    if (validationErrors[key as string]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key as string];
        return newErrors;
      });
    }
  };
  
  const validateAllFields = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    
    columns.forEach(column => {
      if (column.validate) {
        const error = column.validate(editData[column.key], editData);
        if (error) {
          errors[column.key as string] = error;
        }
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [columns, editData]);
  
  const handleEdit = useCallback(() => {
    if (readOnly || isEditMode) return;
    setIsEditMode(true);
    setEditData(data);
  }, [data, isEditMode, readOnly]);
  
  const handleCancel = useCallback(() => {
    if (isSaving) return;
    setIsEditMode(false);
    setValidationErrors({});
    setEditData(data);
    if (isNewRow && onCancel) {
      onCancel();
    }
  }, [data, isNewRow, isSaving, onCancel]);
  
  const handleSave = useCallback(async () => {
    if (isSaving || !validateAllFields()) {
      return;
    }
    
    setIsSaving(true);
    try {
      await onSave(editData);
      setIsEditMode(false);
      setValidationErrors({});
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsSaving(false);
    }
  }, [editData, isSaving, onSave, validateAllFields]);
  
  const handleDelete = useCallback(async () => {
    if (!onDelete || isDeleting) return;
    
    setIsDeleting(true);
    try {
      await onDelete(data);
      // We don't need to update state after deletion since the component will unmount
    } catch (error) {
      console.error('Error deleting:', error);
      setIsDeleting(false); // Only reset if there's an error
    }
  }, [data, isDeleting, onDelete]);
  
  // Render empty row placeholder
  if (isEmptyRow) {
    return (
      <TableRow 
        className={cn(
          "border-dashed border-t-0 hover:bg-muted/30 cursor-pointer transition-colors duration-200",
          className
        )}
        onClick={() => !readOnly && onSave(initialData as T)}
      >
        <TableCell 
          colSpan={columns.length + 1} 
          className="h-14 text-center text-muted-foreground py-4"
        >
          <div className="flex items-center justify-center gap-1.5">
            <Plus className="h-4 w-4 text-primary" />
            <span>{emptyRowMessage}</span>
          </div>
        </TableCell>
      </TableRow>
    );
  }
  
  // Animation variants
  const rowVariants = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, y: 10, transition: { duration: 0.2 } }
  };
  
  return (
    <motion.tr
      initial="initial"
      animate="animate"
      exit="exit"
      variants={rowVariants}
      className={cn(
        "data-[state=selected]:bg-primary/5",
        isEditMode && "bg-muted/50 shadow-sm",
        isNewRow && isEditMode && "border-b border-t border-primary/20 bg-primary/5",
        className
      )}
      key={isEditMode ? 'edit' : 'view'}
    >
      {columns.map((column, index) => (
        <TableCell 
          key={column.key as string} 
          colSpan={column.colSpan}
          className={cn(
            validationErrors[column.key as string] && "relative border-b-destructive"
          )}
        >
          <div className="min-h-[24px]">
            {isEditMode ? (
              <>
                {column.renderEditMode(
                  editData[column.key], 
                  handleChange, 
                  editData,
                  index === 0 ? firstInputRef : undefined
                )}
                {validationErrors[column.key as string] && (
                  <div className="text-xs text-destructive mt-1">
                    {validationErrors[column.key as string]}
                  </div>
                )}
              </>
            ) : (
              column.renderViewMode(data[column.key], data)
            )}
          </div>
        </TableCell>
      ))}
      
      {/* Actions cell */}
      <TableCell className="text-right w-[100px]">
        <div className="flex justify-end gap-1">
          {isEditMode ? (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={handleSave}
                      disabled={isSaving}
                      type="button"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Save changes</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={handleCancel}
                      disabled={isSaving}
                      type="button"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Cancel</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          ) : (
            !readOnly && (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={handleEdit}
                        type="button"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>Edit {entityName}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {onDelete && (
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={handleDelete}
                          disabled={isDeleting}
                          type="button"
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>Delete {entityName}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                
                {additionalActions?.(data, false)}
              </>
            )
          )}
        </div>
      </TableCell>
    </motion.tr>
  );
} 