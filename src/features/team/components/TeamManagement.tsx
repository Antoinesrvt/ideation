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
import { 
  UserPlus, 
  Users, 
  CheckSquare, 
  Grid, 
  Trash2, 
  Edit, 
  Info,
  CheckCircle,
  Award,
  UserCog
} from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { useTeam } from '@/hooks/features/useTeam';
import { useProjectStore } from '@/store';
import { TeamMember, TeamTask, TeamResponsibilityMatrix } from "@/store/types";
import TabList from '@/features/common/components/TabList';
import { SectionTab } from '@/components/ui/section-tab';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import RoleCard, { Role } from './RoleCard';
import RACIMatrix from './RACIMatrix';
import Members from './Members';
import TasksTable from './TasksTable';
import { toast } from '@/components/ui/use-toast';

// Types for team data
export interface TeamData {
  members: TeamMember[];
  roles: Role[];
  tasks: TeamTask[];
  raci: TeamResponsibilityMatrix[];
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
export const itemVariants = {
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

  export const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
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
    members: teamData.data.members,
    tasks: teamData.data.tasks,
    roles: mapDBResponsibilitiesToRoles(teamData.data.responsibilities || []),
    raci: teamData.data.responsibilities || [], // Use responsibilities data as RACI
  };
  
  // Use either provided data or hook data
  const safeData = data || hookData;
  

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
      const dueDate = new Date(task.due_date || '');
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
    //TODO: Add task progress calculation
    return 0;
    // if (safeData.tasks.length === 0) return 0;
    
    // const totalProgress = safeData.tasks.reduce((sum, task) => sum + task.progress, 0);
    // return Math.round(totalProgress / safeData.tasks.length);
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


  const getMemberById = (id: string) => {
    return safeData.members.find(member => member.id === id);
  };



  // CRUD operations for team members
  const handleAddTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const name = formData.get('name') as string;
    const role = formData.get('role') as string;
    const email = formData.get('email') as string;
    
    if (!name || !role) return;
    
    // Create new member
    try {
      await teamData.addMember({
        name,
        role,
        expertise: [],
        responsibilities: [],
        availability: 'full-time',
        contact_info: { email },
        status: 'active',
        project_id: projectId || '',
        user_id: null,
        created_by: null
      });
      
      setNewMemberDialogOpen(false);
      form.reset();
      
      toast({
        title: "Team member added",
        description: `${name} has been added to the team.`,
      });
    } catch (error) {
      toast({
        title: "Failed to add team member",
        description: "There was an error adding the team member.",
        variant: "destructive"
      });
    }
  };

  // Handle RACI matrix operations
  const handleUpdateRaci = async (id: string, updates: Partial<TeamResponsibilityMatrix>) => {
    try {
      await teamData.updateResponsibility({ id, data: updates });
      
      toast({
        title: "RACI matrix updated",
        description: "The responsibility matrix has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to update RACI matrix",
        description: "There was an error updating the RACI matrix.",
        variant: "destructive"
      });
    }
  };

  const handleAddRaci = async (data: Omit<TeamResponsibilityMatrix, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await teamData.addResponsibility(data);
      
      toast({
        title: "Area added",
        description: "A new area has been added to the RACI matrix.",
      });
    } catch (error) {
      toast({
        title: "Failed to add area",
        description: "There was an error adding the new area.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteRaci = async (id: string) => {
    try {
      await teamData.deleteResponsibility(id);
      
      toast({
        title: "Area removed",
        description: "The area has been removed from the RACI matrix.",
      });
    } catch (error) {
      toast({
        title: "Failed to remove area",
        description: "There was an error removing the area.",
        variant: "destructive"
      });
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    setNewTaskDialogOpen(false);
    // Implementation for adding task
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
                  {Array.from(new Set(safeData.members.flatMap(m => m.expertise))).length}
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
                        <Members members={safeData.members} roles={safeData.roles} tasks={safeData.tasks} />
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
                      <TasksTable tasks={safeData.tasks} members={safeData.members} />
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
                          <RoleCard key={role.id} role={role} members={safeData.members} />
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
                      <RACIMatrix 
                        members={safeData.members} 
                        raci={safeData.raci} 
                        onUpdate={handleUpdateRaci}
                        onAdd={handleAddRaci}
                        onDelete={handleDeleteRaci}
                      />
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