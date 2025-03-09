import React, { useCallback } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, AlertTriangle } from 'lucide-react';
import { Insert, TeamMember, TeamTask } from '@/store/types';
import EnhancedTaskRow from './EnhancedTaskRow';
import { useTeam } from '@/hooks/features/useTeam';
import { toast } from "@/components/ui/use-toast";


interface EnhancedTasksTableProps {
  tasks: TeamTask[];
  members: TeamMember[];
  projectId: string;
  readOnly?: boolean;
}

const EnhancedTasksTable = ({ 
  tasks, 
  members, 
  projectId,
  readOnly = false
}: EnhancedTasksTableProps) => {

  const {addTask, updateTask, deleteTask} = useTeam(projectId);

  
  // Adapter functions for EnhancedTasksTable component
  const onAdd = async () => {
    try {

      const task: Insert<'team_tasks'> = {
        title: "New Task",
        description: "This is a new task",
        project_id: projectId,
        status: "not_started",
        priority: "medium",
        due_date: null,
        team_member_id: null
      };

      // Use the appropriate method from the teamData API
      await addTask(task);

      // If successful, show a toast notification
      toast({
        title: "Task added",
        description: `${task.title} has been added successfully.`,
      });
    } catch (error) {
      console.error("Failed to add task:", error);

      // Show error toast
      toast({
        title: "Failed to add task",
        description: "There was an error adding the task.",
        variant: "destructive",
      });

      throw error;
    }
  };


  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => onAdd()} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Task
        </Button>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center">
          <AlertTriangle className="h-10 w-10 text-amber-500 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No tasks have been created yet
          </h3>
          <p className="text-gray-500 mb-4 max-w-md">
            Start by adding tasks to track team progress and manage workload.
          </p>
          <Button onClick={onAdd}>
            <Plus className="h-4 w-4 mr-1" />
            Add First Task
          </Button>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="text-right">Progress</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <EnhancedTaskRow
                  key={task.id}
                  task={task}
                  members={members}
                  updateTask={updateTask}
                  deleteTask={deleteTask}
                  readOnly={readOnly}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default EnhancedTasksTable; 