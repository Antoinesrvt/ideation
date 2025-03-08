import React, { useState } from 'react'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { getInitials } from './TeamManagement'
import { TeamMember, TeamResponsibilityMatrix, RACIRole, RACIMatrixData, EnhancedTeamResponsibilityMatrix } from '@/store/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Plus, Info, Edit, Save, X } from 'lucide-react'
import { parseJsonbField, stringifyJsonbField, validateRACIMatrix } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from '@/components/ui/use-toast'

interface RACIMatrixProps {
  members: TeamMember[];
  raci: TeamResponsibilityMatrix[];
  onUpdate?: (id: string, updates: Partial<TeamResponsibilityMatrix>) => Promise<void>;
  onAdd?: (data: Omit<TeamResponsibilityMatrix, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

// Define with index signature to allow any RACIRole as key
const raciDescriptions: Record<string, string> = {
  'R': 'Responsible: Person who performs the work',
  'A': 'Accountable: Person ultimately answerable for the work',
  'C': 'Consulted: Person whose opinion is sought',
  'I': 'Informed: Person who is kept up-to-date on progress'
};

const RACIMatrix = ({ members, raci, onUpdate, onAdd, onDelete }: RACIMatrixProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newAreaOpen, setNewAreaOpen] = useState<boolean>(false);
  const [newArea, setNewArea] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [editMatrix, setEditMatrix] = useState<RACIMatrixData>({});

  // Helper function to get the RACI value for a member
  const getRaciValue = (raciMatrix: unknown, memberId: string): RACIRole => {
    if (!raciMatrix) return '';
    
    // Parse the matrix if it's a string or any other type
    const matrix = parseJsonbField<RACIMatrixData>(raciMatrix, {});
    
    return matrix[memberId] as RACIRole || '';
  }

  // Helper function to render the RACI cell with appropriate styling
  const getRaciTypeColor = (type: string) => {
    switch(type.toLowerCase()) {
      case 'r':
      case 'responsible':
        return <span className="font-bold text-blue-600">R</span>;
      case 'a':
      case 'accountable':
        return <span className="font-bold text-green-600">A</span>;
      case 'c':
      case 'consulted':
        return <span className="font-bold text-amber-600">C</span>;
      case 'i':
      case 'informed':
        return <span className="font-bold text-purple-600">I</span>;
      default:
        return <span className="text-gray-300">-</span>;
    }
  };

  // Start editing a RACI matrix
  const handleEdit = (item: TeamResponsibilityMatrix) => {
    setEditingId(item.id);
    setEditMatrix(parseJsonbField<RACIMatrixData>(item.raci_matrix, {}));
  };

  // Save RACI matrix changes
  const handleSave = async (id: string) => {
    if (!onUpdate) return;

    // Validate the matrix
    const validation = validateRACIMatrix(editMatrix);
    if (!validation.valid) {
      toast({
        title: "Invalid RACI Matrix",
        description: validation.errors.join('. '),
        variant: "destructive"
      });
      return;
    }

    try {
      await onUpdate(id, { raci_matrix: editMatrix });
      setEditingId(null);
      toast({
        title: "RACI matrix updated",
        description: "The responsibility matrix has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to update",
        description: "There was an error updating the RACI matrix.",
        variant: "destructive"
      });
    }
  };

  // Create a new area with a RACI matrix
  const handleAddArea = async () => {
    if (!onAdd || !newArea) return;

    // Create a default matrix with no assignments
    const newMatrix: RACIMatrixData = {};

    try {
      await onAdd({
        project_id: raci[0]?.project_id || '', // Get project_id from existing items
        area: newArea,
        description: newDescription,
        raci_matrix: newMatrix,
        created_by: null
      });
      
      setNewArea('');
      setNewDescription('');
      setNewAreaOpen(false);
      
      toast({
        title: "Area added",
        description: "A new area has been added to the RACI matrix.",
      });
    } catch (error) {
      toast({
        title: "Failed to add area",
        description: "There was an error adding the new area.",
        variant: "destructive"
      });
    }
  };

  // Handle RACI role selection
  const handleRoleSelect = (memberId: string, role: RACIRole) => {
    setEditMatrix(prev => {
      // If selecting the same role, remove it
      if (prev[memberId] === role) {
        const newMatrix = { ...prev };
        delete newMatrix[memberId];
        return newMatrix;
      }
      
      // If selecting A (Accountable), remove A from any other member
      if (role === 'A') {
        const newMatrix = { ...prev };
        
        // Find and remove existing A assignment
        Object.keys(newMatrix).forEach(id => {
          if (newMatrix[id] === 'A') {
            delete newMatrix[id];
          }
        });
        
        return { ...newMatrix, [memberId]: role };
      }
      
      // Normal assignment
      return { ...prev, [memberId]: role };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">RACI Responsibility Matrix</h3>
          <p className="text-sm text-gray-500">
            Assign responsibilities to team members using the RACI method
          </p>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setNewAreaOpen(true)}
                disabled={!onAdd}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Area
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add a new responsibility area</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="flex gap-2 mb-4">
        <TooltipProvider>
          {(['R', 'A', 'C', 'I'] as RACIRole[]).map(role => (
            <Tooltip key={role}>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="cursor-help">
                  <span className={
                    role === 'R' ? "text-blue-600" : 
                    role === 'A' ? "text-green-600" : 
                    role === 'C' ? "text-amber-600" : 
                    "text-purple-600"
                  }>
                    {role}
                  </span>
                  : {role === 'R' ? 'Responsible' : 
                     role === 'A' ? 'Accountable' : 
                     role === 'C' ? 'Consulted' : 
                     'Informed'}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{raciDescriptions[role]}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>

      <Table className="border">
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/4">Area</TableHead>
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
            {onUpdate && <TableHead className="w-20"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {raci.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                {item.area}
                {item.description && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 ml-1 text-gray-400 inline cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{item.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </TableCell>
              
              {members.map((member) => (
                <TableCell key={member.id} className="text-center">
                  {editingId === item.id ? (
                    <Select 
                      value={editMatrix[member.id] || ''} 
                      onValueChange={(value) => handleRoleSelect(member.id, value as RACIRole)}
                    >
                      <SelectTrigger className="w-14 h-8 mx-auto">
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        <SelectItem value="R">R</SelectItem>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="I">I</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    getRaciTypeColor(
                      getRaciValue(item.raci_matrix, member.id)
                    )
                  )}
                </TableCell>
              ))}
              
              {onUpdate && (
                <TableCell>
                  {editingId === item.id ? (
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleSave(item.id)}
                      >
                        <Save className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setEditingId(null)}
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="h-4 w-4 text-gray-500" />
                    </Button>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
          
          {raci.length === 0 && (
            <TableRow>
              <TableCell colSpan={members.length + (onUpdate ? 2 : 1)} className="text-center py-10 text-gray-500">
                No responsibility areas defined. Add an area to get started.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {/* Add New Area Dialog */}
      <Dialog open={newAreaOpen} onOpenChange={setNewAreaOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Responsibility Area</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="area" className="text-right">
                Area
              </label>
              <Input
                id="area"
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Product Development"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="description" className="text-right">
                Description
              </label>
              <Input
                id="description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="col-span-3"
                placeholder="e.g., All activities related to building the product"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewAreaOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddArea} disabled={!newArea}>
              Add Area
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Help card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">About RACI Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-blue-800">
            <p className="mb-2">The RACI matrix helps clarify roles and responsibilities:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>R - Responsible:</strong> Person who performs the work</li>
              <li><strong>A - Accountable:</strong> Person ultimately answerable for the work (one person only)</li>
              <li><strong>C - Consulted:</strong> Person whose opinion is sought</li>
              <li><strong>I - Informed:</strong> Person who is kept up-to-date on progress</li>
            </ul>
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  )
}

export default RACIMatrix