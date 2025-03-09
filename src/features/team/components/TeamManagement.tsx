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
  UserCog,
  Briefcase,
  Table,
  X,
  Plus,
  Grid3X3,
  AlertTriangle
} from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { useTeam } from '@/hooks/features/useTeam';
import { useProjectStore } from '@/store';
import { 
  TeamMember, 
  TeamTask, 
  TeamResponsibilityMatrix, 
  Insert,
  ProjectRole 
} from '@/store/types';
import TabList from '@/features/common/components/TabList';
import { SectionTab } from '@/components/ui/section-tab';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import RoleCard, { Role } from './RoleCard';
import EnhancedMembers from './EnhancedMembers';
import EnhancedTasksTable from './EnhancedTasksTable';
import { EnhancedRoles } from './EnhancedRoles';
import { EnhancedRACIMatrix } from './EnhancedRACIMatrix';
import { toast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import EnhancedRoleCard, { Role as EnhancedRole } from './EnhancedRoleCard';
import RoleAssignmentDialog from './RoleAssignmentDialog';
import RoleTemplateSelector from './RoleTemplateSelector';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Types for team data
export interface TeamData {
  members: TeamMember[];
  roles: Role[];
  tasks: TeamTask[];
  raci: TeamResponsibilityMatrix[];
  projectRoles?: ProjectRole[];
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
  const uniqueRoles = new Map<string, Role>();
  
  responsibilities.forEach(resp => {
    // Only process entries that are marked as legacy roles or don't have an entry_type (for backwards compatibility)
    if ((resp.entry_type === 'legacy_role' || !resp.entry_type) && resp.area) {
      const roleTitle = resp.area;
      
      if (!uniqueRoles.has(roleTitle)) {
        // Extract metadata from raci_matrix if available
        const metadata = resp.raci_matrix?._metadata || {};
        
        uniqueRoles.set(roleTitle, {
        id: resp.id,
          title: roleTitle,
        description: resp.description || '',
          responsibilities: metadata.responsibilities || [],
          requiredSkills: metadata.requiredSkills || []
        });
      } else if (uniqueRoles.has(roleTitle)) {
        // If we already have this role, try to merge any additional data
        const role = uniqueRoles.get(roleTitle)!;
        const metadata = resp.raci_matrix?._metadata || {};
        
        // Add any additional responsibilities that aren't already included
        if (metadata.responsibilities) {
          metadata.responsibilities.forEach((responsibility: string) => {
            if (!role.responsibilities.includes(responsibility)) {
              role.responsibilities.push(responsibility);
            }
          });
        }
        
        // Add any additional required skills that aren't already included
        if (metadata.requiredSkills) {
          metadata.requiredSkills.forEach((skill: string) => {
            if (!role.requiredSkills.includes(skill)) {
              role.requiredSkills.push(skill);
            }
          });
        }
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
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
};

// Animation variants for child elements within each tab
export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
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
  const [activeTab, setActiveTab] = useState("members");
  
  // Role assignment dialog state
  const [roleAssignmentOpen, setRoleAssignmentOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  
  // Role template selection dialog state
  const [templateSelectOpen, setTemplateSelectOpen] = useState(false);
  
  // Custom role dialog state
  const [customRoleDialogOpen, setCustomRoleDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<{
    title: string;
    description: string;
    responsibilities: string[];
    requiredSkills: string[];
  }>({
    title: '',
    description: '',
    responsibilities: [],
    requiredSkills: []
  });
  
  // Handle input change for custom role creation
  const handleRoleInputChange = (field: 'title' | 'description', value: string) => {
    setNewRole(prev => ({ ...prev, [field]: value }));
  };
  
  // Handle array input change for responsibilities and skills
  const handleRoleArrayInputChange = (field: 'responsibilities' | 'requiredSkills', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(Boolean);
    setNewRole(prev => ({ ...prev, [field]: items }));
  };
  
  // Handle opening the role assignment dialog
  const handleOpenRoleAssignment = useCallback((member: TeamMember) => {
    setSelectedMember(member);
    setRoleAssignmentOpen(true);
  }, []);
  
  // Map database data to UI data
  const hookData = useMemo(
    () => ({
      members: teamData.data.members,
      tasks: teamData.data.tasks,
      roles: mapDBResponsibilitiesToRoles(teamData.data.responsibilities || []),
      raci: teamData.data.responsibilities || [], // Use responsibilities data as RACI
      projectRoles: teamData.data.projectRoles || [] // Include project roles
    }),
    [teamData.data.members, teamData.data.tasks, teamData.data.responsibilities, teamData.data.projectRoles]
  );

  // Use either provided data or hook data
  const safeData = useMemo(() => data || hookData, [data, hookData]);

  // Calculate team statistics
  const teamStats = useMemo(() => {
    const completedTasks = safeData.tasks.filter(
      (task) => task.status === "completed"
    ).length;
    const inProgressTasks = safeData.tasks.filter(
      (task) => task.status === "in_progress"
    ).length;
    const blockedTasks = safeData.tasks.filter(
      (task) => task.status === "blocked"
    ).length;
    
    // Get upcoming deadlines (tasks due in the next 7 days)
    const now = new Date();
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(now.getDate() + 7);
    
    const upcomingDeadlines = safeData.tasks.filter((task) => {
      const dueDate = new Date(task.due_date || "");
      return (
        dueDate >= now &&
        dueDate <= oneWeekFromNow &&
        task.status !== "completed"
      );
    }).length;
    
    return {
      totalMembers: safeData.members.length,
      completedTasks,
      inProgressTasks,
      blockedTasks,
      upcomingDeadlines,
    };
  }, [safeData.members, safeData.tasks]);
  
  // Calculate overall task progress
  const calculateTaskProgress = useCallback(() => {
    if (safeData.tasks.length === 0) return 0;
    
    const completedTasks = safeData.tasks.filter(
      (task) => task.status === "completed"
    ).length;
    return Math.round((completedTasks / safeData.tasks.length) * 100);
  }, [safeData.tasks]);

  const taskStatusOptions = [
    { value: "not_started", label: "Not Started" },
    { value: "in_progress", label: "In Progress" },
    { value: "blocked", label: "Blocked" },
    { value: "completed", label: "Completed" },
  ];

  const taskPriorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ];

  const raciTypes = [
    {
      value: "responsible",
      label: "Responsible",
      description: "Person who performs the work",
    },
    {
      value: "accountable",
      label: "Accountable",
      description: "Person ultimately answerable for the work",
    },
    {
      value: "consulted",
      label: "Consulted",
      description: "Person whose opinion is sought",
    },
    {
      value: "informed",
      label: "Informed",
      description: "Person kept up-to-date on progress",
    },
  ];

  const getMemberById = useCallback(
    (id: string) => {
      return safeData.members.find((member) => member.id === id);
    },
    [safeData.members]
  );

  // CRUD operations for team members
  const handleAddTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const name = formData.get("name") as string;
    const role = formData.get("role") as string;
    const email = formData.get("email") as string;

    if (!name || !role) return;

    // Create new member
    try {
      await teamData.addMember({
        name,
        role,
        expertise: [],
        responsibilities: [],
        availability: "full-time",
        contact_info: { email },
        status: "active",
        project_id: projectId || "",
        user_id: null,
        created_by: null,
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
        variant: "destructive",
      });
    }
  };

  // Handle RACI matrix operations
  const handleUpdateRaci = useCallback(
    async (id: string, updates: Partial<TeamResponsibilityMatrix>) => {
      try {
        // Ensure we have a valid ID
        if (!id) {
          console.error("Cannot update RACI: id is missing");
          throw new Error("RACI area ID is missing");
        }

        // Call the API to update the RACI
        await teamData.updateResponsibility({ id, data: updates });

        // Additionally, update our local state for immediate feedback
        const raciIndex = safeData.raci.findIndex((r) => r.id === id);
        if (raciIndex !== -1 && onUpdate) {
          const updatedRaciItems = [...safeData.raci];
          updatedRaciItems[raciIndex] = {
            ...updatedRaciItems[raciIndex],
            ...updates,
          };

          onUpdate({
            raci: updatedRaciItems,
          });
        }

        toast({
          title: "RACI updated",
          description: `The RACI area has been updated successfully.`,
        });
      } catch (error) {
        console.error("Failed to update RACI:", error);
        toast({
          title: "Failed to update RACI",
          description: "There was an error updating the RACI area.",
          variant: "destructive",
        });
        throw error;
      }
    },
    [safeData.raci, onUpdate, teamData]
  );

  const handleAddRaci = async (
    data?: Insert<"team_responsibility_matrix">
  ) => {
    try {
      // Ensure we have a projectId
      if (!projectId) {
        console.error("Cannot add RACI: projectId is missing");
        toast({
          title: "Failed to add area",
          description: "Project ID is missing. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (!data) {
        data = {
          area: "New Area",
          description: "New Area Description",
          project_id: projectId,
          raci_matrix: {
            _metadata: {
              responsibilities: [],
              requiredSkills: [],
            },
          },
        };
      }

      await teamData.addResponsibility(data);

      toast({
        title: "Area added",
        description: "A new area has been added to the RACI matrix.",
      });
    } catch (error) {
      console.error("Failed to add RACI area:", error);

      toast({
        title: "Failed to add area",
        description: "There was an error adding the new area.",
        variant: "destructive",
      });

      throw error;
    }
  };

  const handleDeleteRaci = useCallback(
    async (id: string) => {
      try {
        // Ensure we have a valid ID
        if (!id) {
          console.error("Cannot delete RACI: id is missing");
          throw new Error("RACI area ID is missing");
        }

        // Call the API to delete the RACI item
        await teamData.deleteResponsibility(id);

        // Also update our local state for immediate feedback
        if (onUpdate) {
          const updatedRaci = safeData.raci.filter((r) => r.id !== id);
          onUpdate({
            raci: updatedRaci,
          });
        }

        toast({
          title: "RACI area deleted",
          description: "The RACI area has been deleted successfully.",
        });
      } catch (error) {
        console.error("Failed to delete RACI area:", error);
        toast({
          title: "Failed to delete RACI area",
          description: "There was an error deleting the RACI area.",
          variant: "destructive",
        });
        throw error;
      }
    },
    [teamData, safeData.raci, onUpdate]
  );

  // Adapter functions for EnhancedMembers component
  const handleAddMember = useCallback(
    async (member?: Insert<"team_members">) => {
      try {
        if (!member) {
          // Find a default role - prefer project roles if available
          let defaultRole = "New Role";
          let defaultRoleId = null;
          
          if (hookData.projectRoles && hookData.projectRoles.length > 0) {
            defaultRole = hookData.projectRoles[0].title;
            defaultRoleId = hookData.projectRoles[0].id;
          } else if (hookData.roles.length > 0) {
            defaultRole = hookData.roles[0].title;
          }
          
          member = {
            name: "New Member",
            role: defaultRole,
            role_id: defaultRoleId,
            previous_role_id: null,
            contact_info: { email: "newmember@example.com" },
            status: "active",
            project_id: projectId || "",
            user_id: null,
            availability: "full-time",
            expertise: [],
            responsibilities: [],
          };
        }
        await teamData.addMember(member);
      } catch (error) {
        console.error("Failed to add team member:", error);
        throw error;
      }
    },
    [teamData]
  );

  const handleUpdateMember = useCallback(
    async (id: string, data: Partial<TeamMember>) => {
      try {
        await teamData.updateMember({ id, data });
      } catch (error) {
        console.error("Failed to update team member:", error);
        throw error;
      }
    },
    [teamData]
  );

  const handleDeleteMember = useCallback(
    async (id: string) => {
      try {
        await teamData.deleteMember(id);
      } catch (error) {
        console.error("Failed to delete team member:", error);
        throw error;
      }
    },
    [teamData]
  );

  // Adapter functions for EnhancedTasksTable component
  const handleAddTask = async (
    task?: Insert<"team_tasks">
  ) => {
    try {
      // Ensure we have a projectId
      if (!projectId) {
        console.error("Cannot add task: projectId is missing");
        toast({
          title: "Failed to add task",
          description: "Project ID is missing. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Create default task if one is not provided
      if (!task) {
        task = {
          title: "New Task",
          description: "New Task Description",
          team_member_id: null,
          due_date: null,
          status: "not_started", // Valid status value
          priority: "medium",    // Valid priority value
          project_id: projectId, // Ensure project_id is set
        };
      } else {
        // Ensure task has valid status and priority if provided
        if (!task.status) task.status = "not_started";
        if (!task.priority) task.priority = "medium";
        if (!task.project_id) task.project_id = projectId;
      }

      // Use the appropriate method from the teamData API
      await teamData.addTask(task);

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

  // Add these handlers for the role operations
  const handleAddRole = async (role?: Omit<Role, "id">) => {
    if (role) {
      // If a role was passed, create it
      try {
        // Ensure we have a projectId
        if (!projectId) {
          console.error('Cannot add role: projectId is missing');
          toast({
            title: "Failed to add role",
            description: "Project ID is missing. Please try again.",
            variant: "destructive"
          });
          return;
        }

        // Create a responsibility matrix entry for the role
        // The area will be the role title, and the responsibilities will be included in the description
        const roleResponsibility: Omit<
          TeamResponsibilityMatrix,
          "id" | "created_at" | "updated_at"
        > = {
          area: role.title,
          description: role.description,
          project_id: projectId,
          created_by: null,
          entry_type: 'legacy_role', // Add the entry type to distinguish it as a role
          role_id: null, // No associated role_id yet
          raci_matrix: {
            _metadata: {
              responsibilities: role.responsibilities,
              requiredSkills: role.requiredSkills
            }
          }
        };
        
        // Add to responsibility matrix
        await teamData.addResponsibility(roleResponsibility);
        
        // Show success toast
        toast({
          title: "Role added",
          description: `${role.title} role has been added successfully.`,
        });
        
        // Clear form
        setNewRole({
          title: '',
          description: '',
          responsibilities: [],
          requiredSkills: []
        });
        
        // Close dialog
        setCustomRoleDialogOpen(false);
      } catch (error) {
        console.error('Failed to add role:', error);
        
        // Show error toast
        toast({
          title: "Failed to add role",
          description: "There was an error adding the role.",
          variant: "destructive"
        });
        
        throw error;
      }
    } else {
      // If no role was passed, open the custom role dialog
      setCustomRoleDialogOpen(true);
    }
  };

  // Handle creating a role from a template
  const handleCreateRoleFromTemplate = async (templateId: string, customizations: Partial<ProjectRole>) => {
    try {
      if (!projectId) {
        console.error('Cannot create role from template: projectId is missing');
        toast({
          title: "Failed to create role",
          description: "Project ID is missing. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Use the createRoleFromTemplate function from teamData
      const result = await teamData.createRoleFromTemplate({
        templateId,
        customizations: {
          // Ensure all required fields are provided
          title: customizations.title || '',
          description: customizations.description || null,
          responsibilities: customizations.responsibilities || [],
          required_skills: customizations.required_skills || [],
          project_id: projectId
        } as Insert<'project_roles'>
      });

      if (result) {
        toast({
          title: "Role created",
          description: `${result.title} role has been created successfully.`,
        });
      }
    } catch (error) {
      console.error('Failed to create role from template:', error);
      
      toast({
        title: "Failed to create role",
        description: "There was an error creating the role from template.",
        variant: "destructive"
      });
      
      throw error;
    }
  };

  const handleUpdateRole = async (updatedRole: Role) => {
    try {
      // Find the responsibility matrix entry for this role
      const roleResponsibility = safeData.raci.find(
        (r) =>
          r.area === updatedRole.title || // New title matches
          r.id === updatedRole.id // Or the ID matches (if the title was changed)
      );

      if (!roleResponsibility) {
        throw new Error("Role not found in responsibility matrix");
      }

      // Create metadata to store role information
      const metadata = {
        responsibilities: updatedRole.responsibilities,
        requiredSkills: updatedRole.requiredSkills,
      };

      // Create a new JSON object for the raci_matrix, preserving any existing data
      let updatedMatrix = {};
      if (
        typeof roleResponsibility.raci_matrix === "object" &&
        roleResponsibility.raci_matrix !== null
      ) {
        updatedMatrix = { ...(roleResponsibility.raci_matrix as object) };
      }

      // Add our metadata
      updatedMatrix = {
        ...updatedMatrix,
        _metadata: metadata,
      };

      // Update the responsibility matrix entry
      const updates: Partial<TeamResponsibilityMatrix> = {
        area: updatedRole.title,
        description: updatedRole.description,
        raci_matrix: updatedMatrix,
      };

      // Call the API to update the responsibility
      await teamData.updateResponsibility({
        id: roleResponsibility.id,
        data: updates,
      });

      toast({
        title: "Role updated",
        description: `${updatedRole.title} has been updated successfully.`,
      });
    } catch (error) {
      console.error("Failed to update role:", error);
      toast({
        title: "Failed to update role",
        description: "There was an error updating the role.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteRole = useCallback(
    async (id: string) => {
      try {
        // Filter out the role to delete
        const updatedRoles = safeData.roles.filter((r) => r.id !== id);

        // If there's an onUpdate handler, use it
        if (onUpdate) {
          onUpdate({
            roles: updatedRoles,
          });
        }

        toast({
          title: "Role deleted",
          description: "The role has been deleted successfully.",
        });
      } catch (error) {
        console.error("Failed to delete role:", error);
        toast({
          title: "Failed to delete role",
          description: "There was an error deleting the role.",
          variant: "destructive",
        });
        throw error;
      }
    },
    [safeData.roles, onUpdate]
  );

  // Handle assigning a role to a team member
  const handleAssignRole = useCallback(
    async (member: TeamMember, roleId: string | null, roleTitle: string) => {
      try {
        // Update member with new role details
        const updates: Partial<TeamMember> = {
          role: roleTitle,
          role_id: roleId,
          // Save the previous role ID for history/tracking
          previous_role_id: member.role_id
        };
        
        await teamData.updateMember({
          id: member.id,
          data: updates
        });
      } catch (error) {
        console.error("Failed to assign role:", error);
        throw error;
      }
    },
    [teamData]
  );

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
                  <p className="text-sm">
                    Total number of team members across all roles.
                  </p>
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
                  <p className="text-sm">
                    Overall task completion progress across the team.
                  </p>
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
                  {
                    Array.from(
                      new Set(safeData.members.flatMap((m) => m.expertise))
                    ).length
                  }
                </span>
              </div>
              <HoverCard>
                <HoverCardTrigger>
                  <Info className="h-4 w-4 text-gray-400" />
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <p className="text-sm">
                    Unique skills available across your team members.
                  </p>
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
                  <p className="text-sm">
                    Number of defined roles in your team structure.
                  </p>
                </HoverCardContent>
              </HoverCard>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content */}
      <LayoutGroup id="team-management-tabs">
        <div className="space-y-6">
          <Tabs
            defaultValue="members"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex justify-between items-center mb-4">
              <TabList
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
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
                  <TabsContent
                    value="members"
                    className="mt-0 border-none shadow-none"
                    forceMount
                  >
                    <SectionTab
                      icon={<Users className="h-5 w-5 text-primary-700" />}
                      title="Team Members"
                      description="Manage your team members, their roles, and responsibilities."
                      onCreate={() => handleAddMember()}
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
                        ),
                      }}
                      hasItems={safeData.members.length > 0}
                      emptyState={{
                        description:
                          "Start building your team by adding members and assigning their roles.",
                      }}
                    >
                      <EnhancedMembers
                        members={safeData.members}
                        roles={safeData.roles}
                        tasks={safeData.tasks}
                        projectRoles={safeData.projectRoles}
                        onAdd={handleAddMember}
                        onUpdate={handleUpdateMember}
                        onDelete={handleDeleteMember}
                        onChangeRole={handleOpenRoleAssignment}
                      />
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
                  <TabsContent
                    value="tasks"
                    className="mt-0 border-none shadow-none"
                    forceMount
                  >
                    <SectionTab
                      icon={
                        <CheckSquare className="h-5 w-5 text-primary-700" />
                      }
                      title="Tasks"
                      description="Track and manage team tasks, assignments, and progress."
                      onCreate={() => handleAddTask()}
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
                        ),
                      }}
                      hasItems={safeData.tasks.length > 0}
                      emptyState={{
                        description:
                          "Create and assign tasks to track team progress and manage workload.",
                      }}
                    >
                      <EnhancedTasksTable
                        tasks={safeData.tasks}
                        members={safeData.members}
                        projectId={projectId || ""}
                        readOnly={false}
                      />
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
                  <TabsContent
                    value="roles"
                    className="mt-0 border-none shadow-none"
                    forceMount
                  >
                    <SectionTab
                      icon={<UserCog className="h-5 w-5 text-primary-700" />}
                      title="Roles"
                      description="Define team roles, responsibilities, and required skills."
                      onCreate={() => setTemplateSelectOpen(true)}
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
                        ),
                      }}
                      hasItems={safeData.roles.length > 0}
                      emptyState={{
                        description:
                          "Define roles to clarify responsibilities and required skills for your team.",
                      }}
                    >
                      <EnhancedRoles
                        roles={safeData.roles}
                        members={safeData.members}
                        onAdd={handleAddRole}
                        onUpdate={handleUpdateRole}
                        onDelete={handleDeleteRole}
                        onCreateFromTemplate={handleCreateRoleFromTemplate}
                      />
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
                  <TabsContent
                    value="raci"
                    className="mt-0 border-none shadow-none"
                    forceMount
                  >
                    <SectionTab
                      icon={<Grid className="h-5 w-5 text-primary-700" />}
                      title="RACI Matrix"
                      description="Assign responsibilities using the RACI framework (Responsible, Accountable, Consulted, Informed)."
                      onCreate={() => handleAddRaci()}
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
                              <li>
                                <b>R</b>esponsible: Who performs the work
                    </li>
                              <li>
                                <b>A</b>ccountable: Who approves the work
                    </li>
                              <li>
                                <b>C</b>onsulted: Whose input is needed
                    </li>
                              <li>
                                <b>I</b>nformed: Who needs updates
                              </li>
                              <li>One Accountable per activity</li>
                  </ul>
                </div>
                        ),
                      }}
                      hasItems={safeData.raci.length > 0}
                      emptyState={{
                        description:
                          "Create a RACI matrix to clarify roles and responsibilities for key activities.",
                      }}
                    >
                      <EnhancedRACIMatrix
                        members={safeData.members}
                        raci={safeData.raci}
                        onAdd={handleAddRaci}
                        onUpdate={handleUpdateRaci}
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
            <DialogTitle>Add Team Member</DialogTitle>
                  <DialogDescription>
              Add a new member to your team. You can specify their role,
              expertise, and contact information.
                  </DialogDescription>
                </DialogHeader>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="John Doe" />
                    </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" name="role" placeholder="Developer" />
                    </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
              />
                  </div>
                  <DialogFooter>
              <Button
                type="button"
                className="w-full"
                onClick={() => {
                  const name = (
                    document.getElementById("name") as HTMLInputElement
                  )?.value;
                  const role = (
                    document.getElementById("role") as HTMLInputElement
                  )?.value;
                  const email = (
                    document.getElementById("email") as HTMLInputElement
                  )?.value;

                  if (!name || !role) return;

                  // Create the team member object directly
                  const newMember: Insert<"team_members"> = {
                    name,
                    role,
                    expertise: [],
                    responsibilities: [],
                    availability: "full-time",
                    contact_info: { email },
                    status: "active",
                    project_id: projectId || "",
                    user_id: null,
                    created_by: null,
                  };

                  // Call the addMember function
                  handleAddMember(newMember)
                    .then(() => {
                      setNewMemberDialogOpen(false);
                      toast({
                        title: "Team member added",
                        description: `${name} has been added to the team.`,
                      });
                    })
                    .catch(() => {
                      toast({
                        title: "Failed to add team member",
                        description:
                          "There was an error adding the team member.",
                        variant: "destructive",
                      });
                    });
                }}
              >
                Add Member
              </Button>
            </DialogFooter>
                </div>
        </DialogContent>
      </Dialog>

      {/* Task Dialog */}
            <Dialog open={newTaskDialogOpen} onOpenChange={setNewTaskDialogOpen}>
              <DialogContent>
                <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
                  <DialogDescription>
              Create a new task and assign it to a team member.
                  </DialogDescription>
                </DialogHeader>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Complete wireframes"
              />
                    </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Design the user interface wireframes for the main dashboard..."
              />
                    </div>
            <div className="space-y-2">
              <Label htmlFor="team_member_id">Assigned To</Label>
              <Select name="team_member_id">
                <SelectTrigger>
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
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input id="due_date" name="due_date" type="date" />
                    </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue="pending">
                  <SelectTrigger>
                    <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select name="priority" defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
            <Button
              type="button"
              className="w-full"
              onClick={() => {
                const title = (
                  document.getElementById("title") as HTMLInputElement
                )?.value;
                const description = (
                  document.getElementById("description") as HTMLTextAreaElement
                )?.value;
                const dueDate = (
                  document.getElementById("due_date") as HTMLInputElement
                )?.value;
                const status = document.querySelector(
                  'select[name="status"]'
                ) as HTMLSelectElement;
                const priority = document.querySelector(
                  'select[name="priority"]'
                ) as HTMLSelectElement;
                const teamMember = document.querySelector(
                  'select[name="team_member_id"]'
                ) as HTMLSelectElement;

                if (!title) return;

                handleAddTask({
                  title,
                  description: description || null,
                  due_date: dueDate || null,
                  status: status?.value || "pending",
                  priority: priority?.value || "medium",
                  team_member_id: teamMember?.value || null,
                  project_id: projectId || "",
                  notes: null,
                  created_by: null,
                })
                  .then(() => {
                    setNewTaskDialogOpen(false);
                    toast({
                      title: "Task added",
                      description: `"${title}" has been added to the task list.`,
                    });
                  })
                  .catch(() => {
                    toast({
                      title: "Failed to add task",
                      description: "There was an error adding the task.",
                      variant: "destructive",
                    });
                  });
              }}
            >
              Add Task
              </Button>
                        </div>
        </DialogContent>
      </Dialog>

      {/* Role Assignment Dialog */}
      {selectedMember && (
        <RoleAssignmentDialog
          open={roleAssignmentOpen}
          onOpenChange={setRoleAssignmentOpen}
          member={selectedMember}
          legacyRoles={safeData.roles}
          projectRoles={safeData.projectRoles || []}
          onAssign={handleAssignRole}
        />
      )}
      
      {/* Role Template Selector Dialog */}
      <Dialog open={templateSelectOpen} onOpenChange={setTemplateSelectOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
          </DialogHeader>
          <RoleTemplateSelector 
            projectId={projectId}
            onSelectTemplate={(template) => {
              handleCreateRoleFromTemplate(template.id, {
                title: template.title,
                description: template.description,
                responsibilities: template.responsibilities,
                required_skills: template.required_skills
              });
              setTemplateSelectOpen(false);
            }}
            onCreateCustom={() => {
              setTemplateSelectOpen(false);
              handleAddRole();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Custom Role Dialog */}
      <Dialog open={customRoleDialogOpen} onOpenChange={setCustomRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Custom Role</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newRole.title}
                onChange={(e) => handleRoleInputChange('title', e.target.value)}
                placeholder="e.g. Project Manager"
              />
                        </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newRole.description}
                onChange={(e) => handleRoleInputChange('description', e.target.value)}
                placeholder="Describe the role's purpose and importance"
              />
                          </div>
            <div className="grid gap-2">
              <Label htmlFor="responsibilities">
                Responsibilities (comma separated)
              </Label>
              <Textarea
                id="responsibilities"
                value={newRole.responsibilities.join(', ')}
                onChange={(e) => handleRoleArrayInputChange('responsibilities', e.target.value)}
                placeholder="e.g. Planning, Scheduling, Resource allocation"
              />
                        </div>
            <div className="grid gap-2">
              <Label htmlFor="requiredSkills">
                Required Skills (comma separated)
              </Label>
              <Textarea
                id="requiredSkills"
                value={newRole.requiredSkills.join(', ')}
                onChange={(e) => handleRoleArrayInputChange('requiredSkills', e.target.value)}
                placeholder="e.g. Communication, Leadership, Technical knowledge"
              />
                          </div>
                        </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => handleAddRole({
                title: newRole.title,
                description: newRole.description,
                responsibilities: newRole.responsibilities,
                requiredSkills: newRole.requiredSkills
              })}
              disabled={!newRole.title}
            >
              Create Role
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 