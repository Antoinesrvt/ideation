import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from './TeamManagement';
import { TeamMember, TeamTask, ProjectRole } from '@/store/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Trash2, 
  Mail, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Users,
  Save,
  X,
  Plus,
  Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { itemVariants } from './TeamManagement';
import { Role } from './EnhancedRoleCard';
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

// Status colors
const statusColors = {
  active: 'bg-green-500',
  inactive: 'bg-gray-500',
  leave: 'bg-amber-500',
  pending: 'bg-sky-500'
};

// Availability options
const availabilityOptions = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' }
];

interface EnhancedMemberCardProps {
  member: TeamMember;
  roles: Role[];
  tasks: TeamTask[];
  projectRoles?: ProjectRole[];
  onUpdate: (id: string, data: Partial<TeamMember>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onChangeRole?: (member: TeamMember) => void;
  readOnly?: boolean;
}

const EnhancedMemberCard = ({ 
  member, 
  roles, 
  tasks, 
  projectRoles = [],
  onUpdate, 
  onDelete,
  onChangeRole,
  readOnly = false
}: EnhancedMemberCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: member.name,
    role: member.role,
    role_id: member.role_id || null,
    email: member.contact_info && typeof member.contact_info === 'object' ? 
           (member.contact_info as any).email || '' : '',
    expertise: [...(member.expertise || [])],
    responsibilities: [...(member.responsibilities || [])],
    availability: member.availability || 'full-time',
    status: member.status || 'active'
  });

  // Combine both legacy roles and project roles for the dropdown
  const combinedRoles = [...roles];
  
  // Add project roles that are not already in the legacy roles list
  projectRoles.forEach(projectRole => {
    // Check if this role is already in the legacy roles by title
    const exists = roles.some(role => role.title === projectRole.title);
    if (!exists) {
      // Convert ProjectRole to Role format for the UI
      combinedRoles.push({
        id: projectRole.id,
        title: projectRole.title,
        description: projectRole.description || '',
        responsibilities: Array.isArray(projectRole.responsibilities) 
          ? projectRole.responsibilities 
          : (typeof projectRole.responsibilities === 'string' 
              ? JSON.parse(projectRole.responsibilities) 
              : []),
        requiredSkills: Array.isArray(projectRole.required_skills) 
          ? projectRole.required_skills 
          : (typeof projectRole.required_skills === 'string' 
              ? JSON.parse(projectRole.required_skills) 
              : [])
      });
    }
  });

  // Get tasks assigned to this member
  const getMemberTasks = () => {
    return tasks.filter(task => task.team_member_id === member.id);
  };

  // Get role details - check both legacy roles and project roles
  const getRoleDetails = () => {
    // First try to find by role_id if available
    if (member.role_id) {
      const projectRole = projectRoles.find(r => r.id === member.role_id);
      if (projectRole) {
        // Convert ProjectRole to Role format for the UI
        return {
          id: projectRole.id,
          title: projectRole.title,
          description: projectRole.description || '',
          responsibilities: Array.isArray(projectRole.responsibilities) 
            ? projectRole.responsibilities 
            : (typeof projectRole.responsibilities === 'string' 
                ? JSON.parse(projectRole.responsibilities) 
                : []),
          requiredSkills: Array.isArray(projectRole.required_skills) 
            ? projectRole.required_skills 
            : (typeof projectRole.required_skills === 'string' 
                ? JSON.parse(projectRole.required_skills) 
                : [])
        };
      }
    }
    
    // Fallback to legacy roles by title
    return roles.find(r => r.title === member.role);
  };

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
    if (name === 'role') {
      // When role selection changes, we need to update both role and role_id
      const selectedRole = combinedRoles.find(r => r.title === value);
      setFormData(prev => ({
        ...prev,
        role: value,
        role_id: selectedRole?.id || null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Add expertise
  const addExpertise = () => {
    if (!formData.expertise) return;
    setFormData(prev => ({
      ...prev,
      expertise: [...prev.expertise, '']
    }));
  };

  // Add responsibility
  const addResponsibility = () => {
    if (!formData.responsibilities) return;
    setFormData(prev => ({
      ...prev,
      responsibilities: [...prev.responsibilities, '']
    }));
  };

  // Update expertise
  const updateExpertise = (index: number, value: string) => {
    const updatedExpertise = [...formData.expertise];
    updatedExpertise[index] = value;
    setFormData(prev => ({
      ...prev,
      expertise: updatedExpertise
    }));
  };

  // Update responsibility
  const updateResponsibility = (index: number, value: string) => {
    const updatedResponsibilities = [...formData.responsibilities];
    updatedResponsibilities[index] = value;
    setFormData(prev => ({
      ...prev,
      responsibilities: updatedResponsibilities
    }));
  };

  // Remove expertise
  const removeExpertise = (index: number) => {
    const updatedExpertise = [...formData.expertise];
    updatedExpertise.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      expertise: updatedExpertise
    }));
  };

  // Remove responsibility
  const removeResponsibility = (index: number) => {
    const updatedResponsibilities = [...formData.responsibilities];
    updatedResponsibilities.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      responsibilities: updatedResponsibilities
    }));
  };

  // Helper function to render status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-0">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case 'inactive':
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-0">
            <AlertCircle className="h-3 w-3 mr-1" />
            Inactive
          </Badge>
        );
      case 'on-leave':
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-0">
            <Calendar className="h-3 w-3 mr-1" />
            On Leave
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-0">
            {status}
          </Badge>
        );
    }
  };

  // Start editing
  const handleEdit = () => {
    setFormData({
      name: member.name,
      role: member.role,
      role_id: member.role_id || null,
      email: member.contact_info && typeof member.contact_info === 'object' ? 
             (member.contact_info as any).email || '' : '',
      expertise: [...(member.expertise || [])],
      responsibilities: [...(member.responsibilities || [])],
      availability: member.availability || 'full-time',
      status: member.status || 'active'
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
      // Filter out empty expertise and responsibilities
      const filteredExpertise = formData.expertise.filter(item => item.trim() !== '');
      const filteredResponsibilities = formData.responsibilities.filter(item => item.trim() !== '');

      await onUpdate(member.id, {
        name: formData.name,
        role: formData.role,
        role_id: formData.role_id,
        contact_info: { email: formData.email },
        expertise: filteredExpertise,
        responsibilities: filteredResponsibilities,
        availability: formData.availability,
        status: formData.status
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update team member:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm deletion
  const handleConfirmDelete = async () => {
    setIsSubmitting(true);
    try {
      await onDelete(member.id);
      setIsDeleting(false);
    } catch (error) {
      console.error('Failed to delete team member:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'on-leave', label: 'On Leave' }
  ];

  return (
    <>
      <motion.div variants={itemVariants}>
        <Card
          className={`overflow-hidden transition-all ${
            isEditing ? "shadow-md ring-2 ring-primary-200" : "hover:shadow-md"
          }`}
        >
          <div className="p-6 flex items-start">
            <Avatar className="h-12 w-12 mr-4">
              <AvatarFallback className="bg-blue-100 text-blue-700">
                {getInitials(member.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              {isEditing ? (
                /* Editing mode content */
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Input
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full"
                      type="email"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) =>
                        handleSelectChange("role", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {combinedRoles.map((role) => (
                          <SelectItem key={role.id} value={role.title}>
                            {role.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-sm font-medium text-gray-700">
                        Expertise/Skills
                      </label>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={addExpertise}
                        className="h-7 w-7 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.expertise.map((skill, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={skill}
                            onChange={(e) =>
                              updateExpertise(index, e.target.value)
                            }
                            className="flex-1"
                            placeholder="Add a skill"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeExpertise(index)}
                            className="h-7 w-7 p-0 text-red-500"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-sm font-medium text-gray-700">
                        Responsibilities
                      </label>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={addResponsibility}
                        className="h-7 w-7 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.responsibilities.map(
                        (responsibility, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={responsibility}
                              onChange={(e) =>
                                updateResponsibility(index, e.target.value)
                              }
                              className="flex-1"
                              placeholder="Add a responsibility"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => removeResponsibility(index)}
                              className="h-7 w-7 p-0 text-red-500"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">
                        Availability
                      </label>
                      <Select
                        value={formData.availability}
                        onValueChange={(value) =>
                          handleSelectChange("availability", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select availability" />
                        </SelectTrigger>
                        <SelectContent>
                          {availabilityOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) =>
                          handleSelectChange("status", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Edit mode footer */}
                  <div className="space-x-2 pt-2 flex justify-between gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-red-500 hover:text-red-700"
                      onClick={() => setIsDeleting(true)}
                      disabled={isSubmitting}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Delete
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleCancel}
                        className="h-8"
                        disabled={isSubmitting}
                      >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleSave}
                        className="h-8"
                        disabled={isSubmitting}
                      >
                        <Save className="h-3.5 w-3.5 mr-1" />
                        {isSubmitting ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                /* View mode content */
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{member.name}</h3>
                      {member.contact_info &&
                        typeof member.contact_info === "object" &&
                        "email" in member.contact_info && (
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Mail className="h-3.5 w-3.5 mr-1" />
                            {String(member.contact_info.email)}
                          </div>
                        )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div>
                              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">
                                <Users className="h-3 w-3 mr-1" />
                                {member.role}
                              </Badge>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-sm">Team Role</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {member.status && (
                        <div className="mt-1">
                          {getStatusBadge(member.status)}
                        </div>
                      )}

                      {member.availability && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {member.availability === "full-time"
                            ? "Full-time"
                            : member.availability === "part-time"
                            ? "Part-time"
                            : member.availability === "contract"
                            ? "Contract"
                            : member.availability === "consultant"
                            ? "Consultant"
                            : member.availability}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      SKILLS
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {member.expertise?.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {(!member.expertise || member.expertise.length === 0) && (
                        <span className="text-sm text-gray-400">
                          No skills added
                        </span>
                      )}
                    </div>
                  </div>

                  {member.responsibilities &&
                    member.responsibilities.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          RESPONSIBILITIES
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {member.responsibilities.map((resp, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {resp}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      ASSIGNED TASKS
                    </p>
                    <div className="space-y-1">
                      {getMemberTasks().map((task) => {
                        return (
                          <div key={task.id} className="flex items-center">
                            <div
                              className="w-2 h-2 rounded-full mr-2"
                              style={{
                                backgroundColor:
                                  task.status === "completed"
                                    ? "rgb(22, 163, 74)"
                                    : task.status === "in_progress"
                                    ? "rgb(37, 99, 235)"
                                    : task.status === "blocked"
                                    ? "rgb(220, 38, 38)"
                                    : "rgb(156, 163, 175)",
                              }}
                            />
                            <span className="text-sm">{task.title}</span>
                          </div>
                        );
                      })}
                      {getMemberTasks().length === 0 && (
                        <span className="text-sm text-gray-400">
                          No tasks assigned
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {!isEditing && (
            /* View mode footer */
            <div className="border-t border-gray-100 bg-gray-50 px-6 py-3 flex justify-end">
              {!readOnly && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-gray-500 hover:text-gray-700"
                  onClick={handleEdit}
                >
                  <Edit className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          )}
        </Card>
      </motion.div>

      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {member.name} from the team? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
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

export default EnhancedMemberCard; 