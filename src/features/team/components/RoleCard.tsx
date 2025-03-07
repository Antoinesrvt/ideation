import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { itemVariants, getInitials } from "./TeamManagement";
import { TeamMember } from '@/store/types';

export type Role = {
  id: string;
  title: string;
  description: string;
  responsibilities: string[];
  requiredSkills: string[];
}

interface RoleCardProps {
  role: Role;
  members: TeamMember[];
}

const RoleCard = ({ role, members }: RoleCardProps) => {

  const membersInRole = members.filter((member) => member.role === role.title);

  return (
    <motion.div key={role.id} variants={itemVariants}>
      <Card>
        <CardHeader>
          <CardTitle>{role.title}</CardTitle>
          <CardDescription>{role.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Responsibilities
              </h4>
              <ul className="list-disc pl-5 space-y-1">
                {role.responsibilities.map((responsibility, index) => (
                  <li key={index} className="text-sm">
                    {responsibility}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Required Skills
              </h4>
              <div className="flex flex-wrap gap-1">
                {role.requiredSkills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="mt-2">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Team Members in this Role
              </h4>
              <div className="flex flex-wrap gap-2">
                {membersInRole
                  .map((member) => (
                    <TooltipProvider key={member.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Avatar className="h-8 w-8">
                            {/* <AvatarImage src={member.avatarUrl} /> */}
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
                {membersInRole.length === 0 && (
                  <span className="text-sm text-gray-400">
                    No members assigned
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default RoleCard