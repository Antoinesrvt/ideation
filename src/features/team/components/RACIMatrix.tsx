import React from 'react'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { getInitials } from './TeamManagement'
import { TeamMember, TeamResponsibilityMatrix } from '@/store/types'

interface RACIMatrixProps {
  members: TeamMember[];
  raci: TeamResponsibilityMatrix[];
}

const RACIMatrix = ({ members, raci }: RACIMatrixProps) => {
  return (
    <Table className="border">
      <TableHeader>
        <TableRow>
          <TableHead className="w-1/4">Activity</TableHead>
          {members.map((member) => (
            <TableHead key={member.id} className="text-center w-1/5">
              <div className="flex flex-col items-center">
                <Avatar className="h-8 w-8 mb-1">
                  {/* <AvatarImage src={member.avatarUrl} /> */}
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]">
                  {member.name}
                </span>
                <span className="text-xs text-gray-500">{member.role}</span>
              </div>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {raci.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.activity}</TableCell>
            {safeData.members.map((member) => (
              <TableCell key={member.id} className="text-center">
                {getRaciTypeColor(
                  item.raci_matrix?.toString() || "responsible"
                )}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default RACIMatrix