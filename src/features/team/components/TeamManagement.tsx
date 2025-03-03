import React, { useState } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  UserPlus, 
  Users, 
  CheckSquare, 
  Grid, 
  Plus, 
  User, 
  Calendar, 
  Mail, 
  Trash2, 
  Edit, 
  Check,
  AlertCircle,
  Clock
} from 'lucide-react';

// Types for team data
export interface TeamData {
  members: TeamMember[];
  roles: Role[];
  tasks: Task[];
  raci: RaciItem[];
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  skills: string[];
  tasksAssigned: string[];
}

interface Role {
  id: string;
  title: string;
  description: string;
  responsibilities: string[];
  requiredSkills: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string[];
  dueDate: string;
  status: 'not_started' | 'in_progress' | 'blocked' | 'completed';
  priority: 'low' | 'medium' | 'high';
  progress: number;
}

interface RaciItem {
  id: string;
  activity: string;
  assignments: RaciAssignment[];
}

interface RaciAssignment {
  memberId: string;
  type: 'responsible' | 'accountable' | 'consulted' | 'informed';
}

interface TeamManagementProps {
  data?: TeamData;
  onUpdate: (data: Partial<TeamData>) => void;
}

// Sample data generator
const generateSampleData = (): TeamData => {
  return {
    members: [
      { 
        id: '1', 
        name: 'Alex Johnson', 
        email: 'alex@example.com', 
        role: 'Project Manager', 
        avatarUrl: '', 
        skills: ['Leadership', 'Risk Management', 'Planning'],
        tasksAssigned: ['1', '4'] 
      },
      { 
        id: '2', 
        name: 'Sam Williams', 
        email: 'sam@example.com', 
        role: 'UI/UX Designer', 
        avatarUrl: '', 
        skills: ['UI Design', 'Figma', 'User Research'],
        tasksAssigned: ['2'] 
      },
      { 
        id: '3', 
        name: 'Jordan Lee', 
        email: 'jordan@example.com', 
        role: 'Full Stack Developer', 
        avatarUrl: '', 
        skills: ['React', 'Node.js', 'TypeScript'],
        tasksAssigned: ['3'] 
      },
      { 
        id: '4', 
        name: 'Taylor Smith', 
        email: 'taylor@example.com', 
        role: 'Product Owner', 
        avatarUrl: '', 
        skills: ['Product Strategy', 'Market Analysis', 'Stakeholder Management'],
        tasksAssigned: ['5'] 
      },
    ],
    roles: [
      {
        id: '1',
        title: 'Project Manager',
        description: 'Oversees the entire project execution and delivery',
        responsibilities: [
          'Create and manage project plans',
          'Facilitate team meetings',
          'Manage risks and issues',
          'Track progress and report to stakeholders'
        ],
        requiredSkills: ['Leadership', 'Risk Management', 'Planning', 'Communication']
      },
      {
        id: '2',
        title: 'UI/UX Designer',
        description: 'Creates the visual design and user experience',
        responsibilities: [
          'Design user interfaces',
          'Create wireframes and prototypes',
          'Conduct user research',
          'Maintain design system'
        ],
        requiredSkills: ['UI Design', 'Figma', 'User Research', 'Creative Thinking']
      },
      {
        id: '3',
        title: 'Full Stack Developer',
        description: 'Builds and maintains both frontend and backend systems',
        responsibilities: [
          'Develop frontend components',
          'Implement APIs and backend services',
          'Write tests and documentation',
          'Review code'
        ],
        requiredSkills: ['React', 'Node.js', 'TypeScript', 'Git']
      },
      {
        id: '4',
        title: 'Product Owner',
        description: 'Represents user needs and business requirements',
        responsibilities: [
          'Define product roadmap',
          'Prioritize backlog items',
          'Validate product increments',
          'Engage with stakeholders'
        ],
        requiredSkills: ['Product Strategy', 'Market Analysis', 'Stakeholder Management']
      },
    ],
    tasks: [
      {
        id: '1',
        title: 'Project Plan Creation',
        description: 'Create a detailed project plan with milestones and deliverables',
        assignedTo: ['1'],
        dueDate: '2023-12-31',
        status: 'in_progress',
        priority: 'high',
        progress: 40
      },
      {
        id: '2',
        title: 'Design System Development',
        description: 'Create a comprehensive design system for the application',
        assignedTo: ['2'],
        dueDate: '2023-12-15',
        status: 'in_progress',
        priority: 'high',
        progress: 60
      },
      {
        id: '3',
        title: 'API Implementation',
        description: 'Implement backend APIs for the application',
        assignedTo: ['3'],
        dueDate: '2023-12-20',
        status: 'not_started',
        priority: 'medium',
        progress: 0
      },
      {
        id: '4',
        title: 'Team Weekly Sync',
        description: 'Facilitate weekly team synchronization meeting',
        assignedTo: ['1'],
        dueDate: '2023-12-10',
        status: 'not_started',
        priority: 'medium',
        progress: 0
      },
      {
        id: '5',
        title: 'Product Requirements Documentation',
        description: 'Document detailed product requirements',
        assignedTo: ['4'],
        dueDate: '2023-12-05',
        status: 'completed',
        priority: 'high',
        progress: 100
      },
    ],
    raci: [
      {
        id: '1',
        activity: 'Project Planning',
        assignments: [
          { memberId: '1', type: 'responsible' },
          { memberId: '4', type: 'accountable' },
          { memberId: '2', type: 'consulted' },
          { memberId: '3', type: 'consulted' }
        ]
      },
      {
        id: '2',
        activity: 'UI/UX Design',
        assignments: [
          { memberId: '2', type: 'responsible' },
          { memberId: '1', type: 'accountable' },
          { memberId: '4', type: 'consulted' },
          { memberId: '3', type: 'informed' }
        ]
      },
      {
        id: '3',
        activity: 'Backend Development',
        assignments: [
          { memberId: '3', type: 'responsible' },
          { memberId: '1', type: 'accountable' },
          { memberId: '2', type: 'informed' },
          { memberId: '4', type: 'informed' }
        ]
      },
      {
        id: '4',
        activity: 'Product Release',
        assignments: [
          { memberId: '1', type: 'responsible' },
          { memberId: '4', type: 'accountable' },
          { memberId: '2', type: 'consulted' },
          { memberId: '3', type: 'consulted' }
        ]
      },
    ]
  };
};

export const TeamManagement: React.FC<TeamManagementProps> = ({
  data,
  onUpdate
}) => {
  const safeData = data || generateSampleData();
  const [newMemberDialogOpen, setNewMemberDialogOpen] = useState(false);
  const [newTaskDialogOpen, setNewTaskDialogOpen] = useState(false);
  
  // Task status options for select
  const taskStatusOptions = [
    { value: 'not_started', label: 'Not Started' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'completed', label: 'Completed' }
  ];
  
  // Task priority options for select
  const taskPriorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];
  
  // RACI matrix options
  const raciOptions = [
    { value: 'responsible', label: 'Responsible (R)', description: 'Does the work to complete the task' },
    { value: 'accountable', label: 'Accountable (A)', description: 'Ultimately answerable for the task' },
    { value: 'consulted', label: 'Consulted (C)', description: 'Provides input or expertise' },
    { value: 'informed', label: 'Informed (I)', description: 'Kept up-to-date on progress' }
  ];
  
  // Event handlers
  const handleAddTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    // This would typically capture form data
    const newMember: TeamMember = {
      id: Math.random().toString(36).substring(2, 9),
      name: 'New Team Member',
      email: 'new.member@example.com',
      role: 'Team Member',
      skills: [],
      tasksAssigned: []
    };
    
    onUpdate({
      members: [...safeData.members, newMember]
    });
    
    setNewMemberDialogOpen(false);
  };
  
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    // This would typically capture form data
    const newTask: Task = {
      id: Math.random().toString(36).substring(2, 9),
      title: 'New Task',
      description: 'Task description',
      assignedTo: [],
      dueDate: new Date().toISOString().split('T')[0],
      status: 'not_started',
      priority: 'medium',
      progress: 0
    };
    
    onUpdate({
      tasks: [...safeData.tasks, newTask]
    });
    
    setNewTaskDialogOpen(false);
  };
  
  // Helper functions
  const getTaskStatusBadge = (status: Task['status']) => {
    switch (status) {
      case 'not_started':
        return <Badge variant="outline" className="bg-gray-100">Not Started</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-700">In Progress</Badge>;
      case 'blocked':
        return <Badge variant="outline" className="bg-red-100 text-red-700">Blocked</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-700">Completed</Badge>;
    }
  };
  
  const getTaskPriorityBadge = (priority: Task['priority']) => {
    switch (priority) {
      case 'low':
        return <Badge variant="outline" className="bg-gray-100">Low</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-700">Medium</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-red-100 text-red-700">High</Badge>;
    }
  };
  
  const getMemberById = (id: string): TeamMember | undefined => {
    return safeData.members.find(member => member.id === id);
  };
  
  const getRoleById = (roleTitle: string): Role | undefined => {
    return safeData.roles.find(role => role.title === roleTitle);
  };
  
  const getRaciCellContent = (memberId: string, activity: RaciItem) => {
    const assignment = activity.assignments.find(a => a.memberId === memberId);
    if (!assignment) return null;
    
    switch (assignment.type) {
      case 'responsible':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">R</Badge>;
      case 'accountable':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">A</Badge>;
      case 'consulted':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">C</Badge>;
      case 'informed':
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200">I</Badge>;
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Team Management</h1>
      
      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="members" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Team Members
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center">
            <CheckSquare className="h-4 w-4 mr-2" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="raci" className="flex items-center">
            <Grid className="h-4 w-4 mr-2" />
            RACI Matrix
          </TabsTrigger>
        </TabsList>
        
        {/* Team Members Tab */}
        <TabsContent value="members">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Team Members</h2>
            <Dialog open={newMemberDialogOpen} onOpenChange={setNewMemberDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Team Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Team Member</DialogTitle>
                  <DialogDescription>
                    Fill in the details to add a new team member to the project.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddTeamMember}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input id="name" placeholder="Full Name" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">
                        Email
                      </Label>
                      <Input id="email" placeholder="email@example.com" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="role" className="text-right">
                        Role
                      </Label>
                      <Select>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {safeData.roles.map((role) => (
                            <SelectItem key={role.id} value={role.title}>
                              {role.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="skills" className="text-right">
                        Skills
                      </Label>
                      <Input id="skills" placeholder="Skills (comma separated)" className="col-span-3" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Add Member</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safeData.members.map((member) => {
              const memberRole = getRoleById(member.role);
              const memberTasks = safeData.tasks.filter(task => 
                task.assignedTo.includes(member.id)
              );
              
              return (
                <Card key={member.id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <Avatar className="h-12 w-12 mr-4">
                          <AvatarImage src={member.avatarUrl} alt={member.name} />
                          <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{member.name}</CardTitle>
                          <CardDescription className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {member.email}
                          </CardDescription>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="mb-2">
                      <Badge className="bg-blue-100 text-blue-800">{member.role}</Badge>
                    </div>
                    
                    {memberRole && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Responsibilities:</h4>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {memberRole.responsibilities.slice(0, 2).map((resp, idx) => (
                            <li key={idx}>{resp}</li>
                          ))}
                          {memberRole.responsibilities.length > 2 && (
                            <li className="text-xs text-gray-500">
                              +{memberRole.responsibilities.length - 2} more
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                    
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Skills:</h4>
                      <div className="flex flex-wrap gap-1">
                        {member.skills.map((skill, idx) => (
                          <Badge key={idx} variant="outline" className="bg-gray-100 text-gray-800">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {memberTasks.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Assigned Tasks:</h4>
                        <ul className="text-sm text-gray-600">
                          {memberTasks.map((task) => (
                            <li key={task.id} className="flex items-center justify-between mb-1">
                              <span className="flex items-center">
                                {task.status === 'completed' ? (
                                  <Check className="h-3 w-3 text-green-500 mr-1" />
                                ) : (
                                  <Clock className="h-3 w-3 text-blue-500 mr-1" />
                                )}
                                {task.title}
                              </span>
                              {getTaskStatusBadge(task.status)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        
        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Tasks</h2>
            <Dialog open={newTaskDialogOpen} onOpenChange={setNewTaskDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                  <DialogDescription>
                    Create a new task and assign team members.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddTask}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">
                        Title
                      </Label>
                      <Input id="title" placeholder="Task title" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Description
                      </Label>
                      <Input id="description" placeholder="Task description" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="assignees" className="text-right">
                        Assignees
                      </Label>
                      <Select>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Assign to" />
                        </SelectTrigger>
                        <SelectContent>
                          {safeData.members.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="dueDate" className="text-right">
                        Due Date
                      </Label>
                      <Input id="dueDate" type="date" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="priority" className="text-right">
                        Priority
                      </Label>
                      <Select>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Set priority" />
                        </SelectTrigger>
                        <SelectContent>
                          {taskPriorityOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Create Task</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px] w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Assignees</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {safeData.tasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div className="font-medium">{task.title}</div>
                          <div className="text-sm text-muted-foreground">{task.description}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex -space-x-2">
                            {task.assignedTo.map((memberId) => {
                              const member = getMemberById(memberId);
                              return member ? (
                                <Avatar key={memberId} className="h-8 w-8 border-2 border-background">
                                  <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                                </Avatar>
                              ) : null;
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                            {task.dueDate}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getTaskPriorityBadge(task.priority)}
                        </TableCell>
                        <TableCell>
                          {getTaskStatusBadge(task.status)}
                        </TableCell>
                        <TableCell>
                          <div className="w-[100px]">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium">{task.progress}%</span>
                            </div>
                            <Progress value={task.progress} max={100} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Roles Tab */}
        <TabsContent value="roles">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Roles & Responsibilities</h2>
            <Button variant="default">
              <Plus className="h-4 w-4 mr-2" />
              Add Role
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {safeData.roles.map((role) => (
              <Card key={role.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{role.title}</CardTitle>
                      <CardDescription>{role.description}</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Responsibilities</h4>
                      <ul className="text-sm space-y-1 list-disc list-inside">
                        {role.responsibilities.map((responsibility, idx) => (
                          <li key={idx}>{responsibility}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Required Skills</h4>
                      <div className="flex flex-wrap gap-1">
                        {role.requiredSkills.map((skill, idx) => (
                          <Badge key={idx} variant="outline" className="bg-gray-100">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Team Members with this Role</h4>
                      <div className="flex -space-x-2">
                        {safeData.members
                          .filter(member => member.role === role.title)
                          .map(member => (
                            <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                            </Avatar>
                          ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* RACI Matrix Tab */}
        <TabsContent value="raci">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">RACI Responsibility Matrix</h2>
            <p className="text-gray-600">
              The RACI matrix clarifies the role of each team member for each project activity.
            </p>
            <div className="flex flex-wrap gap-3 mt-3">
              {raciOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Badge className={
                    option.value === 'responsible' ? 'bg-green-100 text-green-700' :
                    option.value === 'accountable' ? 'bg-blue-100 text-blue-700' :
                    option.value === 'consulted' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }>
                    {option.value === 'responsible' ? 'R' :
                     option.value === 'accountable' ? 'A' :
                     option.value === 'consulted' ? 'C' : 'I'}
                  </Badge>
                  <span className="text-sm font-medium">{option.label}</span>
                  <span className="text-xs text-gray-500">{option.description}</span>
                </div>
              ))}
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-white">Activity</TableHead>
                    {safeData.members.map((member) => (
                      <TableHead key={member.id}>
                        <div className="whitespace-nowrap">{member.name}</div>
                        <div className="text-xs text-gray-500">{member.role}</div>
                      </TableHead>
                    ))}
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {safeData.raci.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="sticky left-0 bg-white font-medium">
                        {activity.activity}
                      </TableCell>
                      {safeData.members.map((member) => (
                        <TableCell key={member.id} className="text-center">
                          {getRaciCellContent(member.id, activity)}
                        </TableCell>
                      ))}
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-center p-4">
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Activity
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 