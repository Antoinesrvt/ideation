import React from 'react'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { getInitials } from './TeamManagement'
import { TeamMember, TeamTask } from '@/store/types'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface TasksTableProps {
    tasks: TeamTask[];
    members: TeamMember[];
}

  const getTaskStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-0">
            Completed
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-0">
            In Progress
          </Badge>
        );
      case "blocked":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-0">
            Blocked
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-0">
            Not Started
          </Badge>
        );
    }
  };

  const getTaskPriorityBadge = (priority: string) => {
    switch (priority) {
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
      default:
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-0">
            Low
          </Badge>
        );
    }
  };

const TasksTable = ({ tasks, members }: TasksTableProps) => {
  const getMemberById = (id: string) => {
    return members.find((member) => member.id === id);
  };

  const getTaskProgress = (task: TeamTask) => {
    // TODO: Implement progress calculation
    return 0;
  };

  return (
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
          <TableRow key={task.id}>
            <TableCell className="font-medium">
              <div>
                <p>{task.title}</p>
                <p className="text-xs text-gray-500 mt-1">{task.description}</p>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex -space-x-2">
                {task.team_member_id && task.team_member_id.split(',').map((memberId) => {
                  const member = getMemberById(memberId);
                  return member ? (
                    <TooltipProvider key={memberId}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Avatar className="h-8 w-8 border-2 border-white">
                            {/* <AvatarImage src={member.avatarUrl} /> */}
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
                })}
                {task.team_member_id && task.team_member_id.split(',').length === 0 && (
                  <span className="text-sm text-gray-400">Unassigned</span>
                )}
              </div>
            </TableCell>
            <TableCell>
              {new Date(task.due_date || "").toLocaleDateString()}
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
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default TasksTable