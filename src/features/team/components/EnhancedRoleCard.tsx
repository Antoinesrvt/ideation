import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, UserCog, CheckCircle2, ListChecks, Award, Save, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { itemVariants, getInitials } from "./TeamManagement";
import { TeamMember } from '@/store/types';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

export type Role = {
  id: string;
  title: string;
  description: string;
  responsibilities: string[];
  requiredSkills: string[];
}

interface EnhancedRoleCardProps {
  role: Role;
  members: TeamMember[];
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

type RoleFormValues = z.infer<typeof roleFormSchema>;

const EnhancedRoleCard = ({ role, members, onUpdate, onDelete, readOnly = false }: EnhancedRoleCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editedRole, setEditedRole] = useState<Role>({ ...role });

  const membersInRole = members.filter((member) => member.role === role.title);

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      title: role.title,
      description: role.description,
      responsibilities: role.responsibilities ? role.responsibilities.join(', ') : '',
      requiredSkills: role.requiredSkills ? role.requiredSkills.join(', ') : '',
    }
  });

  const handleInputChange = (field: keyof Role, value: string) => {
    setEditedRole(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayInputChange = (field: 'responsibilities' | 'requiredSkills', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(Boolean);
    setEditedRole(prev => ({ ...prev, [field]: items }));
  };

  const handleSave = async () => {
    if (!onUpdate) return;
    
    try {
      await onUpdate(editedRole);
      setIsEditing(false);
      toast({
        title: "Role updated",
        description: `${editedRole.title} has been updated successfully.`
      });
    } catch (error) {
      console.error("Failed to update role:", error);
      toast({
        title: "Error",
        description: "Failed to update role.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    try {
      await onDelete(role.id);
      setIsDeleting(false);
      toast({
        title: "Role deleted",
        description: `${role.title} has been deleted.`
      });
    } catch (error) {
      console.error("Failed to delete role:", error);
      toast({
        title: "Error",
        description: "Failed to delete role.",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setEditedRole({ ...role });
    setIsEditing(false);
  };

  return (
    <>
      <motion.div key={role.id} variants={itemVariants}>
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <UserCog className="h-5 w-5 text-primary-600 mr-2" />
                  {isEditing ? (
                    <Input
                      value={editedRole.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="font-semibold text-xl"
                      placeholder="Role title"
                    />
                  ) : (
                    <span>{role.title}</span>
                  )}
                </CardTitle>
                <CardDescription className="mt-1">{role.description}</CardDescription>
              </div>
              {membersInRole.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {membersInRole.length} {membersInRole.length === 1 ? 'member' : 'members'}
                </Badge>
              )}
              {!isEditing && !readOnly && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditing(true)}
                    title="Edit role"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-1 block text-muted-foreground">
                Description
              </Label>
              {isEditing ? (
                <Textarea
                  value={editedRole.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="min-h-[80px]"
                  placeholder="Role description"
                />
              ) : (
                <div className="text-sm">
                  {role.description || (
                    <span className="text-muted-foreground italic">No description provided</span>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium mb-1 block text-muted-foreground">
                Responsibilities
              </Label>
              {isEditing ? (
                <Textarea
                  value={editedRole.responsibilities.join(', ')}
                  onChange={(e) => handleArrayInputChange('responsibilities', e.target.value)}
                  className="min-h-[80px]"
                  placeholder="Enter responsibilities, separated by commas"
                />
              ) : (
                <div className="flex flex-wrap gap-1 pt-1">
                  {role.responsibilities && role.responsibilities.length > 0 ? (
                    role.responsibilities.map((resp, index) => (
                      <Badge key={index} variant="outline" className="bg-primary/5">
                        {resp}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground italic">
                      No responsibilities defined
                    </span>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium mb-1 block text-muted-foreground">
                Required Skills
              </Label>
              {isEditing ? (
                <Textarea
                  value={editedRole.requiredSkills.join(', ')}
                  onChange={(e) => handleArrayInputChange('requiredSkills', e.target.value)}
                  className="min-h-[80px]"
                  placeholder="Enter required skills, separated by commas"
                />
              ) : (
                <div className="flex flex-wrap gap-1 pt-1">
                  {role.requiredSkills && role.requiredSkills.length > 0 ? (
                    role.requiredSkills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="bg-secondary/10">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground italic">
                      No required skills defined
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="mt-2">
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-1 text-primary-500" />
                Team Members
              </h4>
              <div className="flex flex-wrap gap-2">
                {membersInRole.map((member) => (
                  <TooltipProvider key={member.id}>
                    <Tooltip>
                      <TooltipTrigger>
                        <div>
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{member.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
                {membersInRole.length === 0 && (
                  <span className="text-sm text-gray-400">
                    No members assigned
                  </span>
                )}
              </div>
            </div>
          </CardContent>
          
          {isEditing && (
            <CardFooter className="flex justify-between border-t pt-4">
              <Button 
                variant="ghost" 
                onClick={handleCancel}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="destructive" 
                  onClick={() => setIsDeleting(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      </motion.div>

      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the {role.title} role? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EnhancedRoleCard; 