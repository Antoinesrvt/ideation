import React from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { getInitials } from './TeamManagement'
import { TeamMember, TeamTask } from '@/store/types'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { itemVariants } from './TeamManagement'
import { Role } from './RoleCard'

interface MembersProps {
  members: TeamMember[];
  roles: Role[];
  tasks: TeamTask[];
}

const Members = ({ members, roles, tasks }: MembersProps) => {

    const getRoleById = (title: string) => {
      return roles.find((role) => role.title === title);
    };


    const getTaskOfMember = (memberId: string) => {
      return tasks.filter((task) => task.team_member_id === memberId);
    };


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
      {members.map((member) => (
        <motion.div key={member.id} variants={itemVariants}>
          <Card className="overflow-hidden">
            <div className="p-6 flex items-start">
              <Avatar className="h-12 w-12 mr-4">
                {
                  /* <AvatarImage src={member.avatarUrl} /> */
                  //TODO: Add avatarUrl
                }
                <AvatarFallback className="bg-blue-100 text-blue-700">
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{member.name}</h3>
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
                          {getRoleById(member.role)?.description ||
                            "No description available"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
                    {member.expertise?.length === 0 && (
                      <span className="text-sm text-gray-400">
                        No skills added
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    ASSIGNED TASKS
                  </p>
                  <div className="space-y-1">
                    {getTaskOfMember(member.id).map((task) => {
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
                      )
                    })}
                    {getTaskOfMember(member.id).length === 0 && (
                      <span className="text-sm text-gray-400">
                        No tasks assigned
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 bg-gray-50 px-6 py-3 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-gray-500 hover:text-gray-700"
              >
                <Edit className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Remove
              </Button>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

export default Members