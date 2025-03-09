import React, { useState } from 'react';
import { TeamMember } from '@/store/types';
import { Plus, AlertTriangle, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EnhancedRoleCard, { Role } from './EnhancedRoleCard';
import { motion } from 'framer-motion';
import { staggerContainer } from './TeamManagement';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';

export interface EnhancedRolesProps {
  roles: Role[];
  members: TeamMember[];
  onAdd?: (role: Omit<Role, 'id'>) => Promise<void>;
  onUpdate?: (role: Role) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  readOnly?: boolean;
}

// Define form schema
const roleFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  responsibilities: z.string().optional(),
  requiredSkills: z.string().optional(),
});



export function EnhancedRoles({ roles, members, onAdd, onUpdate, onDelete, readOnly = false }: EnhancedRolesProps) {
  const [newRoleDialogOpen, setNewRoleDialogOpen] = useState(false);
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
            onClick={() => setNewRoleDialogOpen(true)}
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

      {/* New Role Dialog */}
      <Dialog open={newRoleDialogOpen} onOpenChange={setNewRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
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