import React, { useState, useEffect } from 'react';
import { TeamMember, ProjectRole } from '@/store/types';
import { Role } from './EnhancedRoleCard';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserCog, CheckCircle, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';

interface RoleAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember;
  legacyRoles: Role[];
  projectRoles: ProjectRole[];
  onAssign: (member: TeamMember, roleId: string | null, roleTitle: string) => Promise<void>;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function RoleAssignmentDialog({ 
  open, 
  onOpenChange, 
  member, 
  legacyRoles, 
  projectRoles,
  onAssign 
}: RoleAssignmentDialogProps) {
  const [activeTab, setActiveTab] = useState<'template' | 'legacy'>('template');
  const [selectedRole, setSelectedRole] = useState<{id: string | null, title: string} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize selected role based on member's current role
  useEffect(() => {
    if (member) {
      if (member.role_id) {
        // Find matching project role
        const matchingProjectRole = projectRoles.find(r => r.id === member.role_id);
        if (matchingProjectRole) {
          setSelectedRole({
            id: matchingProjectRole.id,
            title: matchingProjectRole.title
          });
          setActiveTab('template');
          return;
        }
      }
      
      // Fall back to legacy role matching by title
      if (member.role) {
        const matchingLegacyRole = legacyRoles.find(r => r.title === member.role);
        if (matchingLegacyRole) {
          setSelectedRole({
            id: null,
            title: matchingLegacyRole.title
          });
          setActiveTab('legacy');
          return;
        }
      }
      
      // No matching role found
      setSelectedRole(null);
    }
  }, [member, projectRoles, legacyRoles]);

  const handleAssignRole = async () => {
    if (!selectedRole) return;
    
    setIsSubmitting(true);
    try {
      await onAssign(member, selectedRole.id, selectedRole.title);
      
      toast({
        title: "Role assigned",
        description: `${selectedRole.title} has been assigned to ${member.name}.`
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to assign role:", error);
      toast({
        title: "Error",
        description: "Failed to assign role.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectProjectRole = (role: ProjectRole) => {
    setSelectedRole({
      id: role.id,
      title: role.title
    });
  };

  const handleSelectLegacyRole = (role: Role) => {
    setSelectedRole({
      id: null,
      title: role.title
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Assign Role to {member?.name}</DialogTitle>
          <DialogDescription>
            Select a role to assign to this team member. Project roles provide additional features and better organization.
          </DialogDescription>
        </DialogHeader>

        <Tabs 
          defaultValue={activeTab} 
          onValueChange={(value) => setActiveTab(value as 'template' | 'legacy')}
          className="mt-2"
        >
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="template">Project Roles</TabsTrigger>
            <TabsTrigger value="legacy">Legacy Roles</TabsTrigger>
          </TabsList>

          <TabsContent value="template" className="space-y-4">
            <ScrollArea className="h-[300px] pr-4">
              {projectRoles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No project roles available. Use legacy roles or create a new project role.
                </div>
              ) : (
                <motion.div 
                  className="grid gap-3"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {projectRoles.map((role) => (
                    <ProjectRoleCard 
                      key={role.id}
                      role={role}
                      isSelected={selectedRole?.id === role.id}
                      onSelect={() => handleSelectProjectRole(role)}
                    />
                  ))}
                </motion.div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="legacy" className="space-y-4">
            <ScrollArea className="h-[300px] pr-4">
              {legacyRoles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No legacy roles available. Use project roles instead.
                </div>
              ) : (
                <motion.div 
                  className="grid gap-3"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {legacyRoles.map((role) => (
                    <LegacyRoleCard 
                      key={role.id}
                      role={role}
                      isSelected={selectedRole?.title === role.title && selectedRole?.id === null}
                      onSelect={() => handleSelectLegacyRole(role)}
                    />
                  ))}
                </motion.div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAssignRole}
            disabled={!selectedRole || isSubmitting}
          >
            {isSubmitting ? 'Assigning...' : 'Assign Role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ProjectRoleCardProps {
  role: ProjectRole;
  isSelected: boolean;
  onSelect: () => void;
}

function ProjectRoleCard({ role, isSelected, onSelect }: ProjectRoleCardProps) {
  // Parse responsibilities and required skills if they're in string format
  const responsibilities = Array.isArray(role.responsibilities) 
    ? role.responsibilities 
    : (typeof role.responsibilities === 'string' 
        ? JSON.parse(role.responsibilities) 
        : []);
  
  const requiredSkills = Array.isArray(role.required_skills) 
    ? role.required_skills 
    : (typeof role.required_skills === 'string' 
        ? JSON.parse(role.required_skills) 
        : []);

  return (
    <motion.div variants={itemVariants}>
      <Card 
        className={`overflow-hidden cursor-pointer transition-all duration-200 ${
          isSelected 
            ? 'border-primary ring-1 ring-primary' 
            : 'hover:border-primary/30'
        }`}
        onClick={onSelect}
      >
        <CardContent className="p-3">
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center">
              <UserCog className="h-5 w-5 text-primary mr-2" />
              <h3 className="font-medium">{role.title}</h3>
            </div>
            {isSelected && (
              <CheckCircle className="h-5 w-5 text-primary" />
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {role.description || 'No description provided'}
          </p>
          
          <div className="flex items-start gap-1">
            <Badge variant="outline" className="text-xs bg-primary/5">
              Project Role
            </Badge>
            {role.template_id && (
              <Badge variant="secondary" className="text-xs">
                From Template
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface LegacyRoleCardProps {
  role: Role;
  isSelected: boolean;
  onSelect: () => void;
}

function LegacyRoleCard({ role, isSelected, onSelect }: LegacyRoleCardProps) {
  return (
    <motion.div variants={itemVariants}>
      <Card 
        className={`overflow-hidden cursor-pointer transition-all duration-200 ${
          isSelected 
            ? 'border-primary ring-1 ring-primary' 
            : 'hover:border-primary/30'
        }`}
        onClick={onSelect}
      >
        <CardContent className="p-3">
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center">
              <UserCog className="h-5 w-5 text-muted-foreground mr-2" />
              <h3 className="font-medium">{role.title}</h3>
            </div>
            {isSelected && (
              <CheckCircle className="h-5 w-5 text-primary" />
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {role.description || 'No description provided'}
          </p>
          
          <Badge variant="outline" className="text-xs">
            Legacy Role
          </Badge>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default RoleAssignmentDialog; 