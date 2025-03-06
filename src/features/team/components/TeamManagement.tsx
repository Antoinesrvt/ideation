import React, { useState, useMemo, useCallback } from 'react';
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
  Clock,
  Info,
  AlertTriangle,
  Activity,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ListChecks,
  PlusCircle,
  UserCheck
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useTeam } from '@/hooks/useTeam';
import { useProjectStore } from '@/store';

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

// Helper function to map database team members to UI team members
function mapDBTeamMembersToUI(dbMembers: any[]): TeamMember[] {
  return dbMembers.map(member => ({
    id: member.id,
    name: member.name || '',
    email: member.contact_info?.email || '',
    role: member.role || '',
    avatarUrl: member.avatar_url || undefined,
    skills: member.expertise || [],
    tasksAssigned: []
  }));
}

// Helper function to map database tasks to UI tasks
function mapDBTasksToUI(dbTasks: any[]): Task[] {
  return dbTasks.map(task => ({
    id: task.id,
    title: task.title || '',
    description: task.description || '',
    assignedTo: task.team_member_id || [],
    dueDate: task.due_date || new Date().toISOString(),
    status: task.status || 'not_started',
    progress: task.progress || 0,
    priority: task.priority || 'medium'
  }));
}

// Helper function to map database responsibilities to UI roles
function mapDBResponsibilitiesToRoles(responsibilities: any[]): Role[] {
  // This is a simplified mapping, you may need to adapt based on your data structure
  const uniqueRoles = new Map<string, Role>();
  
  responsibilities.forEach(resp => {
    if (resp.role && !uniqueRoles.has(resp.role)) {
      uniqueRoles.set(resp.role, {
        id: resp.id,
        title: resp.role,
        description: resp.description || '',
        responsibilities: [resp.responsibility].filter(Boolean),
        requiredSkills: resp.required_skills || []
      });
    } else if (resp.role && uniqueRoles.has(resp.role)) {
      const role = uniqueRoles.get(resp.role);
      if (role && resp.responsibility) {
        role.responsibilities.push(resp.responsibility);
      }
    }
  });
  
  return Array.from(uniqueRoles.values());
}

interface TeamManagementProps {
  data?: TeamData;
  onUpdate?: (data: Partial<TeamData>) => void;
}


export const TeamManagement: React.FC<TeamManagementProps> = ({
  data,
  onUpdate
}) => {
  // Get the current project ID from the store
  const { currentData } = useProjectStore();
  const projectId = currentData.project?.id;
  
  // Use the hook if no onUpdate provided
  const teamData = useTeam(projectId);
  
  const [newMemberDialogOpen, setNewMemberDialogOpen] = useState(false);
  const [newTaskDialogOpen, setNewTaskDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('members');
  
  // State for help visibility
  const [expandedHelp, setExpandedHelp] = useState<{
    members: boolean;
    tasks: boolean;
    roles: boolean;
    raci: boolean;
  }>({
    members: false,
    tasks: false,
    roles: false,
    raci: false
  });
  
  // Map database data to UI data
  const hookData: TeamData = {
    members: mapDBTeamMembersToUI(teamData.members || []),
    tasks: mapDBTasksToUI(teamData.tasks || []),
    roles: mapDBResponsibilitiesToRoles(teamData.responsibilities || []),
    raci: [] // Initialize empty RACI data
  };
  
  // Ensure we have default values if data is undefined
  const safeData: TeamData = data || hookData;
  
  // Function to handle updates when onUpdate is not provided
  const handleDataUpdate = useCallback((updatedData: Partial<TeamData>) => {
    if (onUpdate) {
      onUpdate(updatedData);
    } else if (projectId) {
      // Handle updates using the hook functions
      // This is a simplified implementation
      if (updatedData.members) {
        // For simplicity, we're not handling complex diff updates here
        console.log('Would update members:', updatedData.members);
      }
      if (updatedData.tasks) {
        console.log('Would update tasks:', updatedData.tasks);
      }
      if (updatedData.roles) {
        console.log('Would update roles:', updatedData.roles);
      }
      if (updatedData.raci) {
        console.log('Would update raci:', updatedData.raci);
      }
    }
  }, [onUpdate, projectId]);

  // Calculate team statistics
  const teamStats = useMemo(() => {
    const completedTasks = safeData.tasks.filter(task => task.status === 'completed').length;
    const inProgressTasks = safeData.tasks.filter(task => task.status === 'in_progress').length;
    const blockedTasks = safeData.tasks.filter(task => task.status === 'blocked').length;
    
    // Get upcoming deadlines (tasks due in the next 7 days)
    const now = new Date();
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(now.getDate() + 7);
    
    const upcomingDeadlines = safeData.tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      return dueDate >= now && dueDate <= oneWeekFromNow && task.status !== 'completed';
    }).length;
    
    return {
      totalMembers: safeData.members.length,
      completedTasks,
      inProgressTasks,
      blockedTasks,
      upcomingDeadlines
    };
  }, [safeData.members, safeData.tasks]);
  
  // Calculate overall task progress
  const calculateTaskProgress = () => {
    if (safeData.tasks.length === 0) return 0;
    
    const totalProgress = safeData.tasks.reduce((sum, task) => sum + task.progress, 0);
    return Math.round(totalProgress / safeData.tasks.length);
  };

  const taskStatusOptions = [
    { value: 'not_started', label: 'Not Started' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'completed', label: 'Completed' }
  ];

  const taskPriorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  const raciTypes = [
    { value: 'responsible', label: 'Responsible', description: 'Person who performs the work' },
    { value: 'accountable', label: 'Accountable', description: 'Person ultimately answerable for the work' },
    { value: 'consulted', label: 'Consulted', description: 'Person whose opinion is sought' },
    { value: 'informed', label: 'Informed', description: 'Person kept up-to-date on progress' }
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const getMemberById = (id: string) => {
    return safeData.members.find(member => member.id === id);
  };

  const getRoleById = (title: string) => {
    return safeData.roles.find(role => role.title === title);
  };

  const handleAddTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    setNewMemberDialogOpen(false);
    // Implementation for adding team member
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    setNewTaskDialogOpen(false);
    // Implementation for adding task
  };

  const getTaskStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-0">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-0">In Progress</Badge>;
      case 'blocked':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-0">Blocked</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-0">Not Started</Badge>;
    }
  };

  const getTaskPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-0">High</Badge>;
      case 'medium':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-0">Medium</Badge>;
      default:
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-0">Low</Badge>;
    }
  };

  const getRaciTypeColor = (type: string) => {
    switch (type) {
      case 'responsible':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-0';
      case 'accountable':
        return 'bg-green-100 text-green-800 hover:bg-green-200 border-0';
      case 'consulted':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-0';
      case 'informed':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200 border-0';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-0';
    }
  };

  const toggleHelp = (section: keyof typeof expandedHelp) => {
    setExpandedHelp(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600">Organize your team, roles, tasks, and responsibilities</p>
        </div>
        
        {/* Help Menu */}
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1">
              <HelpCircle className="h-4 w-4" />
              <span>Help</span>
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <h3 className="font-semibold">Team Management Guide</h3>
              <p className="text-sm">Manage your project team effectively with these tools:</p>
              <ul className="text-sm space-y-1.5">
                <li className="flex gap-2">
                  <Users className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                  <span><strong>Team Members:</strong> Add and manage people working on your project</span>
                </li>
                <li className="flex gap-2">
                  <CheckSquare className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span><strong>Tasks:</strong> Track work items and their completion status</span>
                </li>
                <li className="flex gap-2">
                  <User className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />
                  <span><strong>Roles:</strong> Define responsibilities for each position</span>
                </li>
                <li className="flex gap-2">
                  <Grid className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>RACI Matrix:</strong> Clarify who's Responsible, Accountable, Consulted, or Informed</span>
                </li>
              </ul>
              <p className="text-sm text-muted-foreground">Click on a section tab to explore specific features.</p>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
      
      {/* Dashboard Overview */}
      {/* <Card className="border-0 shadow-md">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle>Team Dashboard</CardTitle>
          <CardDescription>Overview of your team's status and progress</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-5 gap-4">
            <Card className="p-4 border-l-4 border-l-blue-500">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500">Team Members</p>
                  <p className="text-2xl font-bold">{teamStats.totalMembers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500 opacity-70" />
              </div>
            </Card>
            
            <Card className="p-4 border-l-4 border-l-green-500">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500">Completed Tasks</p>
                  <p className="text-2xl font-bold">{teamStats.completedTasks}</p>
                </div>
                <Check className="h-8 w-8 text-green-500 opacity-70" />
              </div>
            </Card>
            
            <Card className="p-4 border-l-4 border-l-blue-500">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500">In Progress</p>
                  <p className="text-2xl font-bold">{teamStats.inProgressTasks}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500 opacity-70" />
              </div>
            </Card>
            
            <Card className="p-4 border-l-4 border-l-red-500">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500">Blocked Tasks</p>
                  <p className="text-2xl font-bold">{teamStats.blockedTasks}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500 opacity-70" />
              </div>
            </Card>
            
            <Card className="p-4 border-l-4 border-l-amber-500">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500">Upcoming Deadlines</p>
                  <p className="text-2xl font-bold">{teamStats.upcomingDeadlines}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-500 opacity-70" />
              </div>
            </Card>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium">Overall Progress</p>
              <p className="text-sm text-gray-500">{calculateTaskProgress()}%</p>
            </div>
            <Progress value={calculateTaskProgress()} className="h-2" />
          </div>
        </CardContent>
      </Card> */}
      
      <Tabs defaultValue="members" className="w-full" onValueChange={setActiveTab}>
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
        <TabsContent value="members" className="space-y-4">
          <Collapsible
            open={expandedHelp.members}
            onOpenChange={() => toggleHelp('members')}
            className="mb-4"
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex w-full justify-between p-2 text-sm border border-blue-100 bg-blue-50 hover:bg-blue-100 text-blue-800">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="font-medium">Building Your Team</span>
                </div>
                <ChevronDown className={`h-4 w-4 transform transition-transform ${expandedHelp.members ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3 border border-blue-100 border-t-0 bg-blue-50 rounded-b-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">Team Composition</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Include diverse skills and perspectives</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Consider both technical and soft skills</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Identify skill gaps early</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">Team Collaboration</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Define clear communication channels</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Establish regular check-ins and meetings</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Create opportunities for team bonding</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="flex justify-between items-center mb-4">
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
                      <Input id="skills" placeholder="e.g. React, Design, Marketing" className="col-span-3" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Add Member</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Empty state for when there are no team members */}
          {safeData.members.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-8 border border-dashed">
              <UserPlus className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No team members yet</h3>
              <p className="text-sm text-gray-500 mb-4 text-center max-w-md">
                Start building your team by adding members with their roles and responsibilities.
              </p>
              <Button onClick={() => setNewMemberDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add First Team Member
              </Button>
            </Card>
          ) : (
            <ScrollArea className="h-[calc(100vh-450px)]">
              <div className="grid grid-cols-2 gap-4">
                {safeData.members.map((member) => (
                  <Card key={member.id} className="overflow-hidden">
                    <div className="p-6 flex items-start">
                      <Avatar className="h-12 w-12 mr-4">
                        <AvatarImage src={member.avatarUrl} />
                        <AvatarFallback className="bg-blue-100 text-blue-700">{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{member.name}</h3>
                            <p className="text-sm text-gray-500">{member.email}</p>
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">
                                  {member.role}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="w-60">
                                  {getRoleById(member.role)?.description || 'No description available'}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        
                        <div className="mt-3">
                          <p className="text-xs font-medium text-gray-500 mb-1">SKILLS</p>
                          <div className="flex flex-wrap gap-1">
                            {member.skills.map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {member.skills.length === 0 && (
                              <span className="text-sm text-gray-400">No skills added</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <p className="text-xs font-medium text-gray-500 mb-1">ASSIGNED TASKS</p>
                          <div className="space-y-1">
                            {member.tasksAssigned.map((taskId) => {
                              const task = safeData.tasks.find(t => t.id === taskId);
                              return task ? (
                                <div key={taskId} className="flex items-center">
                                  <div className="w-2 h-2 rounded-full mr-2" 
                                    style={{ 
                                      backgroundColor: 
                                        task.status === 'completed' ? 'rgb(22, 163, 74)' : 
                                        task.status === 'in_progress' ? 'rgb(37, 99, 235)' : 
                                        task.status === 'blocked' ? 'rgb(220, 38, 38)' : 'rgb(156, 163, 175)'
                                    }}
                                  />
                                  <span className="text-sm">{task.title}</span>
                                </div>
                              ) : null;
                            })}
                            {member.tasksAssigned.length === 0 && (
                              <span className="text-sm text-gray-400">No tasks assigned</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-gray-100 bg-gray-50 px-6 py-3 flex justify-end">
                      <Button variant="ghost" size="sm" className="h-8 text-gray-500 hover:text-gray-700">
                        <Edit className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 text-red-500 hover:text-red-700">
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
        
        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <Collapsible
            open={expandedHelp.tasks}
            onOpenChange={() => toggleHelp('tasks')}
            className="mb-4"
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex w-full justify-between p-2 text-sm border border-purple-100 bg-purple-50 hover:bg-purple-100 text-purple-800">
                <div className="flex items-center">
                  <CheckSquare className="h-4 w-4 mr-2 text-purple-600" />
                  <span className="font-medium">Effective Task Management</span>
                </div>
                <ChevronDown className={`h-4 w-4 transform transition-transform ${expandedHelp.tasks ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3 border border-purple-100 border-t-0 bg-purple-50 rounded-b-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-purple-800 mb-2">Task Creation</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Make tasks specific and actionable</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Set clear deadlines and priorities</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Break down large tasks into smaller ones</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-800 mb-2">Task Tracking</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Update task status regularly</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Identify and address blockers quickly</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Review completed tasks for learnings</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Tasks</h2>
            <Dialog open={newTaskDialogOpen} onOpenChange={setNewTaskDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default">
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new task.
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
                      <Label htmlFor="assignedTo" className="text-right">
                        Assigned To
                      </Label>
                      <Select>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select team member" />
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
                      <Label htmlFor="status" className="text-right">
                        Status
                      </Label>
                      <Select>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {taskStatusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="priority" className="text-right">
                        Priority
                      </Label>
                      <Select>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select priority" />
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
                    <Button type="submit">Add Task</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Empty state for when there are no tasks */}
          {safeData.tasks.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-8 border border-dashed">
              <CheckSquare className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No tasks created yet</h3>
              <p className="text-sm text-gray-500 mb-4 text-center max-w-md">
                Break your project down into manageable tasks and assign them to team members.
              </p>
              <Button onClick={() => setNewTaskDialogOpen(true)}>
                <CheckSquare className="h-4 w-4 mr-2" />
                Create First Task
              </Button>
            </Card>
          ) : (
            <ScrollArea className="h-[calc(100vh-450px)]">
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
                  {safeData.tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">
                        <div>
                          <p>{task.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex -space-x-2">
                          {task.assignedTo.map((memberId) => {
                            const member = getMemberById(memberId);
                            return member ? (
                              <TooltipProvider key={memberId}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Avatar className="h-8 w-8 border-2 border-white">
                                      <AvatarImage src={member.avatarUrl} />
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
                          {task.assignedTo.length === 0 && (
                            <span className="text-sm text-gray-400">Unassigned</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>{getTaskStatusBadge(task.status)}</TableCell>
                      <TableCell>{getTaskPriorityBadge(task.priority)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end">
                          <span className="text-sm mr-2">{task.progress}%</span>
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500" 
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </TabsContent>
        
        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-4">
          <Collapsible
            open={expandedHelp.roles}
            onOpenChange={() => toggleHelp('roles')}
            className="mb-4"
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex w-full justify-between p-2 text-sm border border-amber-100 bg-amber-50 hover:bg-amber-100 text-amber-800">
                <div className="flex items-center">
                  <UserPlus className="h-4 w-4 mr-2 text-amber-600" />
                  <span className="font-medium">Defining Team Roles</span>
                </div>
                <ChevronDown className={`h-4 w-4 transform transition-transform ${expandedHelp.roles ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3 border border-amber-100 border-t-0 bg-amber-50 rounded-b-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-amber-800 mb-2">Creating Clear Roles</h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Define responsibilities and expectations</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Identify required skills and competencies</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Clarify reporting relationships</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-amber-800 mb-2">Avoiding Role Issues</h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Prevent role overlap and duplication</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Address gaps in responsibility</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Adapt roles as project needs change</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Empty state for when there are no roles */}
          {safeData.roles.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-8 border border-dashed">
              <User className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No roles defined yet</h3>
              <p className="text-sm text-gray-500 mb-4 text-center max-w-md">
                Define clear roles with responsibilities and required skills for your project.
              </p>
              <Button>
                <User className="h-4 w-4 mr-2" />
                Define Your First Role
              </Button>
            </Card>
          ) : (
            <ScrollArea className="h-[calc(100vh-450px)]">
              <div className="grid grid-cols-2 gap-6">
                {safeData.roles.map((role) => (
                  <Card key={role.id}>
                    <CardHeader>
                      <CardTitle>{role.title}</CardTitle>
                      <CardDescription>{role.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Responsibilities</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {role.responsibilities.map((responsibility, index) => (
                              <li key={index} className="text-sm">{responsibility}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Required Skills</h4>
                          <div className="flex flex-wrap gap-1">
                            {role.requiredSkills.map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="mt-2">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Team Members in this Role</h4>
                          <div className="flex flex-wrap gap-2">
                            {safeData.members
                              .filter(member => member.role === role.title)
                              .map(member => (
                                <TooltipProvider key={member.id}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Avatar className="h-8 w-8">
                                        <AvatarImage src={member.avatarUrl} />
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
                              ))}
                            {safeData.members.filter(member => member.role === role.title).length === 0 && (
                              <span className="text-sm text-gray-400">No members assigned</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
        
        {/* RACI Matrix Tab */}
        <TabsContent value="raci" className="space-y-4">
          <Collapsible
            open={expandedHelp.raci}
            onOpenChange={() => toggleHelp('raci')}
            className="mb-4"
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex w-full justify-between p-2 text-sm border border-green-100 bg-green-50 hover:bg-green-100 text-green-800">
                <div className="flex items-center">
                  <ListChecks className="h-4 w-4 mr-2 text-green-600" />
                  <span className="font-medium">Using the RACI Matrix</span>
                </div>
                <ChevronDown className={`h-4 w-4 transform transition-transform ${expandedHelp.raci ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3 border border-green-100 border-t-0 bg-green-50 rounded-b-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">RACI Explained</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span><b>R</b>esponsible: Who does the work</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span><b>A</b>ccountable: Who has final authority</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span><b>C</b>onsulted: Whose input is sought</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span><b>I</b>nformed: Who is kept updated</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">RACI Best Practices</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Only one person should be Accountable</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Ensure every task has someone Responsible</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Limit Consulted to avoid bottlenecks</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Keep Informed updated efficiently</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Empty state for when there are no RACI items */}
          {safeData.raci.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-8 border border-dashed">
              <Grid className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No RACI matrix defined</h3>
              <p className="text-sm text-gray-500 mb-4 text-center max-w-md">
                Create a RACI matrix to clearly define who is Responsible, Accountable, Consulted, and Informed for project activities.
              </p>
              <Button>
                <Grid className="h-4 w-4 mr-2" />
                Create RACI Matrix
              </Button>
            </Card>
          ) : (
            <ScrollArea className="h-[calc(100vh-450px)]">
              <Table className="border">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/4">Activity</TableHead>
                    {safeData.members.map((member) => (
                      <TableHead key={member.id} className="text-center w-1/5">
                        <div className="flex flex-col items-center">
                          <Avatar className="h-8 w-8 mb-1">
                            <AvatarImage src={member.avatarUrl} />
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]">
                            {member.name}
                          </span>
                          <span className="text-xs text-gray-500">{member.role}</span>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {safeData.raci.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.activity}</TableCell>
                      {safeData.members.map((member) => (
                        <TableCell key={member.id} className="text-center">
                          {getRaciTypeColor(item.assignments.find(a => a.memberId === member.id)?.type || '')}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}; 