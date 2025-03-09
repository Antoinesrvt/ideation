import React, { useState } from 'react';
import { TeamTask, TeamMember, Insert } from '@/store/types';
import { TableRow, TableCell } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from './TeamManagement';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Calendar
} from 'lucide-react';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';

interface EnhancedTaskRowProps {
  task: TeamTask;
  members: TeamMember[];
  updateTask: ({id, data}: {id: string, data: Insert<"team_tasks">}) => Promise<TeamTask | null>;
  deleteTask: (id: string) => Promise<boolean>;
  readOnly?: boolean;
}

const statusOptions = [
  { value: 'not-started', label: 'Not Started' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' }
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
];

// Helper function to get task status badge
const getTaskStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-0">
          Completed
        </Badge>
      );
    case "in-progress":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-0">
          In Progress
        </Badge>
      );
    case "on-hold":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-0">
          On Hold
        </Badge>
      );
    case "not-started":
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-0">
          Not Started
        </Badge>
      );
    // Handle legacy status values for backward compatibility
    case "in_progress":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-0">
          In Progress
        </Badge>
      );
    case "blocked":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-0">
          On Hold
        </Badge>
      );
    case "not_started":
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-0">
          Not Started
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-0">
          {status || "Unknown"}
        </Badge>
      );
  }
};

// Helper function to get task priority badge
const getTaskPriorityBadge = (priority: string) => {
  switch (priority) {
    case "urgent":
      return (
        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-0">
          Urgent
        </Badge>
      );
    case "high":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-0">
          High
        </Badge>
      );
    case "medium":
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-0">
          Medium
        </Badge>
      );
    case "low":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-0">
          Low
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-0">
          {priority || "Unknown"}
        </Badge>
      );
  }
};

// Calculate task progress
const getTaskProgress = (task: TeamTask) => {
  if (task.status === 'completed') return 100;
  if (task.status === 'in-progress' || task.status === 'in_progress') return 50;
  if (task.status === 'on-hold' || task.status === 'blocked') return 25;
  return 0; // not-started or not_started
};

const EnhancedTaskRow = ({ 
  task, 
  members, 
  updateTask,
  deleteTask,
  readOnly = false
}: EnhancedTaskRowProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form state
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    team_member_id: task.team_member_id || 'none',
    due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
    status: convertStatusToHyphenated(task.status) || 'not-started',
    priority: task.priority || 'medium'
  });

  // Helper function to convert underscore status to hyphenated format
  function convertStatusToHyphenated(status: string | null | undefined): string {
    if (!status) return 'not-started';
    
    // Convert from legacy underscore format if needed
    if (status === 'not_started') return 'not-started';
    if (status === 'in_progress') return 'in-progress';
    if (status === 'blocked') return 'on-hold';
    
    return status;
  }

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Get member by ID
  const getMemberById = (id: string) => {
    return members.find(member => member.id === id);
  };

  // Start editing
  const handleEdit = () => {
    setFormData({
      title: task.title,
      description: task.description || '',
      team_member_id: task.team_member_id || 'none',
      due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
      status: convertStatusToHyphenated(task.status) || 'not-started',
      priority: task.priority || 'medium'
    });
    setIsEditing(true);
  };

  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
  };

  // Save changes
  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      // Validate status to ensure it's one of the allowed values
      const validStatuses = statusOptions.map(option => option.value);
      let statusToSave = formData.status;
      if (!validStatuses.includes(statusToSave)) {
        console.error(`Invalid status: ${statusToSave}. Using default 'not-started'`);
        statusToSave = 'not-started';
      }
      
      // Validate priority
      const validPriorities = priorityOptions.map(option => option.value);
      let priorityToSave = formData.priority;
      if (!validPriorities.includes(priorityToSave)) {
        console.error(`Invalid priority: ${priorityToSave}. Using default 'medium'`);
        priorityToSave = 'medium';
      }

      // Convert 'none' to null for team_member_id
      const memberIdToSave = formData.team_member_id === 'none' ? null : formData.team_member_id;

      // Log what we're sending to the server
      console.log('Updating task with data:', {
        title: formData.title,
        description: formData.description || null,
        team_member_id: memberIdToSave,
        due_date: formData.due_date || null,
        status: statusToSave,
        priority: priorityToSave
      });

      await updateTask({
        id: task.id,
        data: {
          title: formData.title,
          description: formData.description || null,
          team_member_id: memberIdToSave,
          due_date: formData.due_date || null,
          status: statusToSave,
          priority: priorityToSave
        }
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm deletion
  const handleConfirmDelete = async () => {
    setIsSubmitting(true);
    try {
      await deleteTask(task.id);
      setIsDeleting(false);
    } catch (error) {
      console.error('Failed to delete task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <TableRow key={task.id} className={isEditing ? 'bg-primary-50' : ''}>
        {isEditing ? (
          // Editing mode cells
          <>
            <TableCell>
              <div className="space-y-2">
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full"
                  placeholder="Task title"
                />
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full text-xs h-20"
                  placeholder="Task description"
                />
              </div>
            </TableCell>
            <TableCell>
              <Select
                value={formData.team_member_id || "none"}
                onValueChange={(value) => handleSelectChange('team_member_id', value === "none" ? "" : value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Assign to" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {members.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              <Input
                name="due_date"
                type="date"
                value={formData.due_date}
                onChange={handleInputChange}
                className="w-full"
              />
            </TableCell>
            <TableCell>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleSelectChange('priority', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell className="text-right">
              <span>Pending</span>
            </TableCell>
            <TableCell>
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="h-8 w-8 p-0 text-gray-500"
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSave}
                  className="h-8 w-8 p-0 text-blue-500"
                  disabled={isSubmitting}
                >
                  <Save className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-500"
                  onClick={() => setIsDeleting(true)}
                  disabled={isSubmitting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </>
        ) : (
          // View mode cells
          <>
            <TableCell className="font-medium">
              <div>
                <p className="font-medium">{task.title}</p>
                {task.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex space-x-1">
                {task.team_member_id ? (
                  (() => {
                    const member = getMemberById(task.team_member_id);
                    return member ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Avatar className="h-8 w-8 border-2 border-white">
                              <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                                {getInitials(member.name)}
                              </AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{member.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : null;
                  })()
                ) : (
                  <span className="text-sm text-gray-400">Unassigned</span>
                )}
              </div>
            </TableCell>
            <TableCell>
              {task.due_date ? (
                <div className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 text-gray-500 mr-1" />
                  <span className="text-sm">
                    {new Date(task.due_date).toLocaleDateString()}
                  </span>
                </div>
              ) : (
                "-"
              )}
            </TableCell>
            <TableCell>{getTaskStatusBadge(task.status || "")}</TableCell>
            <TableCell>{getTaskPriorityBadge(task.priority || "")}</TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end">
                <span className="text-sm mr-2">{getTaskProgress(task)}%</span>
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${getTaskProgress(task)}%` }}
                  />
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex justify-end">
                {!readOnly && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={handleEdit}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TableCell>
          </>
        )}
      </TableRow>

      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the task "{task.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EnhancedTaskRow; 