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
      // Explicitly use one of the valid statuses that match the database constraint
      const task: Insert<'team_tasks'> = {
        title: "New Task",
        description: "This is a new task",
        project_id: projectId,
        status: "not-started", // Must match database constraint: "not-started", "in-progress", "on-hold", "completed"
        priority: "medium",     // Must be one of: "low", "medium", "high", "urgent"
        due_date: null,
        team_member_id: null
      };

      // Ensure task has required fields
      if (!task.status || !task.priority || !task.project_id) {
        console.error("Missing required fields for task creation");
        return;
      }

      // Verify status is one of the allowed values
      const validStatuses = ['not-started', 'in-progress', 'on-hold', 'completed'];
      
      // Convert from legacy underscore format if needed
      if (task.status === 'not_started') task.status = 'not-started';
      if (task.status === 'in_progress') task.status = 'in-progress';
      if (task.status === 'blocked') task.status = 'on-hold';
      
      if (!validStatuses.includes(task.status)) {
        console.error(`Invalid status: ${task.status}. Using default 'not-started'`);
        task.status = "not-started";
      }
      
      // Verify priority is one of the allowed values
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      if (!validPriorities.includes(task.priority)) {
        console.error(`Invalid priority: ${task.priority}. Using default 'medium'`);
        task.priority = "medium";
      }

      // Log the task we're about to create for debugging
      console.log("Creating task with data:", JSON.stringify(task));

      // Attempt to create the task
      const newTask = await addTask(task);
      
      if (newTask) {
        toast({
          title: "Task created",
          description: "New task has been added successfully."
        });
      } else {
        // If no result, show error
        throw new Error("Failed to create task. No result returned.");
      }
    } catch (error) {
      console.error("Failed to add task:", error);
      toast({
        title: "Error creating task",
        description: "There was a problem creating the task.",
        variant: "destructive"
      });
    }
  };


  return (
    <div>

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