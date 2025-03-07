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
  UserCheck,
  CheckCircle,
  Award,
  UserCog
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
import TabList from '@/features/common/components/TabList';
import { SectionTab } from '@/components/ui/section-tab';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

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

const tabs = [
  {
    id: 'members',
    label: 'Team Members',
    icon: <Users className="h-4 w-4 mr-2" />
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: <CheckSquare className="h-4 w-4 mr-2" />
  },
  {
    id: 'roles',
    label: 'Roles',
    icon: <UserCog className="h-4 w-4 mr-2" />
  },
  {
    id: 'raci',
    label: 'RACI Matrix',
    icon: <Grid className="h-4 w-4 mr-2" />
  }
]

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

// Animation variants for the tab content
const tabContentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.2,
      ease: "easeIn",
      when: "afterChildren",
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

// Animation variants for child elements within each tab
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.2 }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: { duration: 0.1 }
  }
};

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
    members: mapDBTeamMembersToUI(teamData.data.members || []),
    tasks: mapDBTasksToUI(teamData.data.tasks || []),
    roles: mapDBResponsibilitiesToRoles(teamData.data.responsibilities || []),
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
    <div className="space-y-8">
      {/* Team Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Team Size Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Team Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-purple-600 mr-2" />
                <span className="text-2xl font-bold">
                  {safeData.members.length}
                </span>
              </div>
              <HoverCard>
                <HoverCardTrigger>
                  <Info className="h-4 w-4 text-gray-400" />
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <p className="text-sm">Total number of team members across all roles.</p>
                </HoverCardContent>
              </HoverCard>
            </div>
          </CardContent>
        </Card>

        {/* Task Progress Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Task Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-2xl font-bold">
                  {calculateTaskProgress()}%
                </span>
              </div>
              <HoverCard>
                <HoverCardTrigger>
                  <Info className="h-4 w-4 text-gray-400" />
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <p className="text-sm">Overall task completion progress across the team.</p>
                </HoverCardContent>
              </HoverCard>
            </div>
          </CardContent>
        </Card>

        {/* Skills Coverage Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Skills Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Award className="h-5 w-5 text-amber-500 mr-2" />
                <span className="text-2xl font-bold">
                  {Array.from(new Set(safeData.members.flatMap(m => m.skills))).length}
                </span>
              </div>
              <HoverCard>
                <HoverCardTrigger>
                  <Info className="h-4 w-4 text-gray-400" />
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <p className="text-sm">Unique skills available across your team members.</p>
                </HoverCardContent>
              </HoverCard>
            </div>
          </CardContent>
        </Card>

        {/* Roles Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Defined Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <UserCog className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-2xl font-bold">
                  {safeData.roles.length}
                </span>
              </div>
              <HoverCard>
                <HoverCardTrigger>
                  <Info className="h-4 w-4 text-gray-400" />
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <p className="text-sm">Number of defined roles in your team structure.</p>
                </HoverCardContent>
              </HoverCard>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content */}
      <LayoutGroup id="team-management-tabs">
        <div className="space-y-6">
          <Tabs defaultValue="members" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center mb-4">
              <TabList tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "members" && (
                <motion.div
                  key="members"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="w-full"
                  layoutId="tab-content"
                >
                  <TabsContent value="members" className="mt-0 border-none shadow-none" forceMount>
                    <SectionTab
                      icon={<Users className="h-5 w-5 text-primary-700" />}
                      title="Team Members"
                      description="Manage your team members, their roles, and responsibilities."
                      onCreate={() => setNewMemberDialogOpen(true)}
                      count={safeData.members.length}
                      helper={{
                        icon: <Info className="h-5 w-5" />,
                        title: "Building an Effective Team",
                        content: (
                          <div className="space-y-3">
                            <p className="text-dark-700">
                              Key aspects of team management:
                            </p>
                            <ul className="list-disc list-inside text-dark-600 space-y-1">
                              <li>Define clear roles and responsibilities</li>
                              <li>Ensure diverse skill coverage</li>
                              <li>Foster collaboration and communication</li>
                              <li>Track member workload and availability</li>
                              <li>Regular skill development and training</li>
                            </ul>
                          </div>
                        )
                      }}
                      hasItems={safeData.members.length > 0}
                      emptyState={{
                        description: "Start building your team by adding members and assigning their roles."
                      }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {safeData.members.map((member) => (
                          <motion.div
                            key={member.id}
                            variants={itemVariants}
                          >
                            <Card className="overflow-hidden">
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
                          </motion.div>
                        ))}
                      </div>
                    </SectionTab>
                  </TabsContent>
                </motion.div>
              )}

              {activeTab === "tasks" && (
                <motion.div
                  key="tasks"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="w-full"
                  layoutId="tab-content"
                >
                  <TabsContent value="tasks" className="mt-0 border-none shadow-none" forceMount>
                    <SectionTab
                      icon={<CheckSquare className="h-5 w-5 text-primary-700" />}
                      title="Tasks"
                      description="Track and manage team tasks, assignments, and progress."
                      onCreate={() => setNewTaskDialogOpen(true)}
                      count={safeData.tasks.length}
                      helper={{
                        icon: <Info className="h-5 w-5" />,
                        title: "Task Management Best Practices",
                        content: (
                          <div className="space-y-3">
                            <p className="text-dark-700">
                              Effective task management includes:
                            </p>
                            <ul className="list-disc list-inside text-dark-600 space-y-1">
                              <li>Clear task descriptions and objectives</li>
                              <li>Realistic deadlines and priorities</li>
                              <li>Balanced workload distribution</li>
                              <li>Regular progress tracking</li>
                              <li>Clear status communication</li>
                            </ul>
                          </div>
                        )
                      }}
                      hasItems={safeData.tasks.length > 0}
                      emptyState={{
                        description: "Create and assign tasks to track team progress and manage workload."
                      }}
                    >
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
                    </SectionTab>
                  </TabsContent>
                </motion.div>
              )}

              {activeTab === "roles" && (
                <motion.div
                  key="roles"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="w-full"
                  layoutId="tab-content"
                >
                  <TabsContent value="roles" className="mt-0 border-none shadow-none" forceMount>
                    <SectionTab
                      icon={<UserCog className="h-5 w-5 text-primary-700" />}
                      title="Roles"
                      description="Define team roles, responsibilities, and required skills."
                      onCreate={() => {/* Add role handler */}}
                      count={safeData.roles.length}
                      helper={{
                        icon: <Info className="h-5 w-5" />,
                        title: "Defining Clear Roles",
                        content: (
                          <div className="space-y-3">
                            <p className="text-dark-700">
                              Key elements of role definition:
                            </p>
                            <ul className="list-disc list-inside text-dark-600 space-y-1">
                              <li>Clear responsibilities and expectations</li>
                              <li>Required skills and competencies</li>
                              <li>Reporting relationships</li>
                              <li>Growth and development paths</li>
                              <li>Performance metrics</li>
                            </ul>
                          </div>
                        )
                      }}
                      hasItems={safeData.roles.length > 0}
                      emptyState={{
                        description: "Define roles to clarify responsibilities and required skills for your team."
                      }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {safeData.roles.map((role) => (
                          <motion.div
                            key={role.id}
                            variants={itemVariants}
                          >
                            <Card>
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
                          </motion.div>
                        ))}
                      </div>
                    </SectionTab>
                  </TabsContent>
                </motion.div>
              )}

              {activeTab === "raci" && (
                <motion.div
                  key="raci"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="w-full"
                  layoutId="tab-content"
                >
                  <TabsContent value="raci" className="mt-0 border-none shadow-none" forceMount>
                    <SectionTab
                      icon={<Grid className="h-5 w-5 text-primary-700" />}
                      title="RACI Matrix"
                      description="Define responsibility assignments for team activities."
                      onCreate={() => {/* Add RACI item handler */}}
                      count={safeData.raci.length}
                      helper={{
                        icon: <Info className="h-5 w-5" />,
                        title: "Using RACI Matrix",
                        content: (
                          <div className="space-y-3">
                            <p className="text-dark-700">
                              RACI matrix components:
                            </p>
                            <ul className="list-disc list-inside text-dark-600 space-y-1">
                              <li><b>R</b>esponsible: Who performs the work</li>
                              <li><b>A</b>ccountable: Who approves the work</li>
                              <li><b>C</b>onsulted: Whose input is needed</li>
                              <li><b>I</b>nformed: Who needs updates</li>
                              <li>One Accountable per activity</li>
                            </ul>
                          </div>
                        )
                      }}
                      hasItems={safeData.raci.length > 0}
                      emptyState={{
                        description: "Create a RACI matrix to clarify roles and responsibilities for key activities."
                      }}
                    >
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
                    </SectionTab>
                  </TabsContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Tabs>
        </div>
      </LayoutGroup>

      {/* Member Dialog */}
      <Dialog open={newMemberDialogOpen} onOpenChange={setNewMemberDialogOpen}>
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

      {/* Task Dialog */}
      <Dialog open={newTaskDialogOpen} onOpenChange={setNewTaskDialogOpen}>
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
  );
}; 