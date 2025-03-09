import React from 'react';
import { TeamMember, TeamTask } from '@/store/types';
import { Plus, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EnhancedMemberCard from './EnhancedMemberCard';
import { Role } from './RoleCard';
import { motion } from 'framer-motion';
import { staggerContainer } from './TeamManagement';

interface EnhancedMembersProps {
  members: TeamMember[];
  roles: Role[];
  tasks: TeamTask[];
  onAdd: (member: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdate: (id: string, data: Partial<TeamMember>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const EnhancedMembers = ({ 
  members, 
  roles, 
  tasks, 
  onAdd, 
  onUpdate, 
  onDelete 
}: EnhancedMembersProps) => {
  
  // Create a new member with default values
  const handleAddMember = async () => {
    // Default member data
    const newMember = {
      name: 'New Team Member',
      role: roles.length > 0 ? roles[0].title : 'Team Member',
      contact_info: { email: 'email@example.com' },
      expertise: ['Add skill'],
      responsibilities: ['Add responsibility'],
      availability: 'full-time',
      status: 'active',
      project_id: members.length > 0 ? members[0].project_id : '',
      user_id: null,
      created_by: null
    };

    try {
      await onAdd(newMember);
    } catch (error) {
      console.error('Failed to add team member:', error);
    }
  };

  return (
    <>
      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center">
          <AlertTriangle className="h-10 w-10 text-amber-500 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No team members yet</h3>
          <p className="text-gray-500 mb-4 max-w-md">
            Start building your team by adding members with their roles and responsibilities.
          </p>
          <Button onClick={handleAddMember}>
            <Plus className="h-4 w-4 mr-1" />
            Add First Member
          </Button>
        </div>
      ) : (
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"
        >
          {members.map((member) => (
            <EnhancedMemberCard 
              key={member.id} 
              member={member} 
              roles={roles} 
              tasks={tasks} 
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </motion.div>
      )}
    </>
  );
};

export default EnhancedMembers; 