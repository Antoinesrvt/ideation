import React, { useState, useCallback } from 'react';
import { TeamMember, ProjectRole, RoleTemplate, Insert } from '@/store/types';
import { Plus, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EnhancedRoleCard, { Role } from './EnhancedRoleCard';
import { motion } from 'framer-motion';
import { staggerContainer } from './TeamManagement';
import { 
  Dialog, 
  DialogContent,
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { useProjectStore } from '@/store/project-store';
import RoleTemplateSelector from './RoleTemplateSelector';

export interface EnhancedRolesProps {
  roles: Role[];
  members: TeamMember[];
  onAdd?: (role: Omit<Role, 'id'>) => Promise<void>;
  onUpdate?: (role: Role) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onCreateFromTemplate?: (templateId: string, customizations: Partial<ProjectRole>) => Promise<void>;
  readOnly?: boolean;
}

// Define form schema
const roleFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  responsibilities: z.string().optional(),
  requiredSkills: z.string().optional(),
});

export function EnhancedRoles({ roles, members, onAdd, onUpdate, onDelete, onCreateFromTemplate, readOnly = false }: EnhancedRolesProps) {
  const { currentData } = useProjectStore();
  const projectId = currentData.project?.id;
  
  const [newRoleDialogOpen, setNewRoleDialogOpen] = useState(false);
  const [templateSelectOpen, setTemplateSelectOpen] = useState(false);
  const [newRole, setNewRole] = useState<Omit<Role, 'id'>>({
    title: '',
    description: '',
    responsibilities: [],
    requiredSkills: []
  });

  const handleInputChange = (field: keyof Omit<Role, 'id'>, value: string) => {
    setNewRole(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayInputChange = (field: 'responsibilities' | 'requiredSkills', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(Boolean);
    setNewRole(prev => ({ ...prev, [field]: items }));
  };

  const handleCreateRole = async () => {
    if (!onAdd) return;
    
    try {
      await onAdd(newRole);
      
      setNewRoleDialogOpen(false);
      setNewRole({
        title: '',
        description: '',
        responsibilities: [],
        requiredSkills: []
      });
      
      toast({
        title: "Role created",
        description: `${newRole.title} role has been created successfully.`
      });
    } catch (error) {
      console.error("Failed to create role:", error);
      toast({
        title: "Error",
        description: "Failed to create new role.",
        variant: "destructive"
      });
    }
  };
  
  const handleSelectTemplate = useCallback(async (template: RoleTemplate) => {
    if (!onCreateFromTemplate) return;
    
    try {
      // Extract the string arrays from the template
      const responsibilities = Array.isArray(template.responsibilities) 
        ? template.responsibilities 
        : (typeof template.responsibilities === 'string' 
            ? JSON.parse(template.responsibilities) 
            : []);
      
      const requiredSkills = Array.isArray(template.required_skills) 
        ? template.required_skills 
        : (typeof template.required_skills === 'string' 
            ? JSON.parse(template.required_skills) 
            : []);
      
      // Create role from template
      await onCreateFromTemplate(template.id, {
        title: template.title,
        description: template.description,
        // Convert to JSON format for database
        responsibilities: responsibilities,
        required_skills: requiredSkills
      });
      
      setTemplateSelectOpen(false);
      
      toast({
        title: "Role created from template",
        description: `${template.title} role has been created successfully.`
      });
    } catch (error) {
      console.error("Failed to create role from template:", error);
      toast({
        title: "Error",
        description: "Failed to create role from template.",
        variant: "destructive"
      });
    }
  }, [onCreateFromTemplate]);
  
  const handleStartRoleCreation = useCallback(() => {
    // Show template selector first
    setTemplateSelectOpen(true);
  }, []);
  
  const handleCreateCustomRole = useCallback(() => {
    // Close template dialog and open custom role dialog
    setTemplateSelectOpen(false);
    setNewRoleDialogOpen(true);
  }, []);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Team Roles</CardTitle>
          <CardDescription>Define and manage roles for your team</CardDescription>
        </div>
        {!readOnly && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleStartRoleCreation}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Role
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {roles.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            No roles defined yet. Add a role to start defining team responsibilities.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {roles.map(role => (
              <EnhancedRoleCard
                key={role.id}
                role={role}
                members={members}
                onUpdate={onUpdate}
                onDelete={onDelete}
                readOnly={readOnly}
              />
            ))}
          </div>
        )}
      </CardContent>

      {/* Template Selection Dialog */}
      <Dialog open={templateSelectOpen} onOpenChange={setTemplateSelectOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
          </DialogHeader>
          <RoleTemplateSelector 
            projectId={projectId}
            onSelectTemplate={handleSelectTemplate}
            onCreateCustom={handleCreateCustomRole}
          />
        </DialogContent>
      </Dialog>

      {/* Custom Role Dialog */}
      <Dialog open={newRoleDialogOpen} onOpenChange={setNewRoleDialogOpen}>
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
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g. Project Manager"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newRole.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
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
                onChange={(e) => handleArrayInputChange('responsibilities', e.target.value)}
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
                onChange={(e) => handleArrayInputChange('requiredSkills', e.target.value)}
                placeholder="e.g. Communication, Leadership, Technical knowledge"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateRole}
              disabled={!newRole.title}
            >
              Create Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default EnhancedRoles; 