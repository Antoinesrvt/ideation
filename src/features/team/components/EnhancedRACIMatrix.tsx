import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { PlusCircle, MoreVertical, Pencil, Trash2, Plus } from 'lucide-react';
import { TeamMember, TeamResponsibilityMatrix } from '@/store/types';

// Use same RACI role type as in original component
type RACIRole = 'R' | 'A' | 'C' | 'I' | null;

export interface EnhancedRACIMatrixProps {
  members: TeamMember[];
  raci: TeamResponsibilityMatrix[];
  onUpdate?: (id: string, updates: Partial<TeamResponsibilityMatrix>) => Promise<void>;
  onAdd?: (data: Omit<TeamResponsibilityMatrix, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  readOnly?: boolean;
}

const RaciTypeOptions = [
  { value: 'R', label: 'Responsible', description: 'Does the work to complete the task' },
  { value: 'A', label: 'Accountable', description: 'Ultimately answerable for the correct completion of the task' },
  { value: 'C', label: 'Consulted', description: 'Provides input before the task can be completed' },
  { value: 'I', label: 'Informed', description: 'Must be kept up-to-date on progress' },
];

export function EnhancedRACIMatrix({ members, raci, onUpdate, onAdd, onDelete, readOnly = false }: EnhancedRACIMatrixProps) {
  const [newRaciDialogOpen, setNewRaciDialogOpen] = useState(false);
  const [editRaciDialogOpen, setEditRaciDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  
  const [currentRaci, setCurrentRaci] = useState<TeamResponsibilityMatrix | null>(null);
  const [newArea, setNewArea] = useState('');
  const [newDescription, setNewDescription] = useState('');
  
  const [currentAssignment, setCurrentAssignment] = useState<{
    raciId: string;
    memberId: string;
    type: RACIRole;
  } | null>(null);

  // Get RACI value from the matrix, similar to original component
  const getRaciValue = (raciMatrix: unknown, memberId: string): RACIRole => {
    if (!raciMatrix || typeof raciMatrix !== 'object') return null;
    
    // Handle array of objects format
    if (Array.isArray(raciMatrix)) {
      const assignment = raciMatrix.find((item: any) => item.member_id === memberId);
      return assignment ? assignment.type as RACIRole : null;
    }
    
    // Handle object format
    const matrix = raciMatrix as Record<string, string>;
    return (matrix[memberId] as RACIRole) || null;
  };

  const handleAddRaci = () => {
    if (!onAdd) return;
    
    const newRaciData = {
      area: newArea,
      description: newDescription,
      project_id: raci.length > 0 ? raci[0].project_id : '',
      created_by: null,
      raci_matrix: [] // Empty matrix to start
    };
    
    onAdd(newRaciData)
      .then(() => {
        setNewRaciDialogOpen(false);
        setNewArea('');
        setNewDescription('');
        toast({
          title: "Area added",
          description: "New area has been added to RACI matrix."
        });
      })
      .catch((error) => {
        console.error("Failed to add area:", error);
        toast({
          title: "Error",
          description: "Failed to add area to RACI matrix.",
          variant: "destructive"
        });
      });
  };

  const handleUpdateRaci = () => {
    if (!currentRaci || !onUpdate) return;
    
    const updates: Partial<TeamResponsibilityMatrix> = {
      area: currentRaci.area,
      description: currentRaci.description
    };
    
    onUpdate(currentRaci.id, updates)
      .then(() => {
        setEditRaciDialogOpen(false);
        toast({
          title: "Area updated",
          description: "RACI area has been updated successfully."
        });
      })
      .catch((error) => {
        console.error("Failed to update area:", error);
        toast({
          title: "Error",
          description: "Failed to update RACI area.",
          variant: "destructive"
        });
      });
  };

  const handleDeleteRaci = () => {
    if (!currentRaci || !onDelete) return;
    
    onDelete(currentRaci.id)
      .then(() => {
        setDeleteDialogOpen(false);
        setCurrentRaci(null);
        toast({
          title: "Area deleted",
          description: "RACI area has been removed from the matrix."
        });
      })
      .catch((error) => {
        console.error("Failed to delete area:", error);
        toast({
          title: "Error",
          description: "Failed to delete RACI area.",
          variant: "destructive"
        });
      });
  };

  const handleAssignMember = () => {
    if (!currentAssignment || !onUpdate) return;
    
    const item = raci.find(r => r.id === currentAssignment.raciId);
    if (!item) return;
    
    // Prepare the updated RACI matrix
    let updatedMatrix: any[] = [];
    
    // If the matrix is already an array, use that as a base
    if (Array.isArray(item.raci_matrix)) {
      updatedMatrix = [...item.raci_matrix];
      
      // Check if assignment already exists
      const existingIndex = updatedMatrix.findIndex(a => 
        a.member_id === currentAssignment.memberId && a.type === currentAssignment.type
      );
      
      if (existingIndex >= 0) {
        // Assignment already exists, don't duplicate
      } else {
        // New assignment
        updatedMatrix.push({ 
          member_id: currentAssignment.memberId, 
          type: currentAssignment.type 
        });
      }
    } else {
      // Create a new array with the assignment
      updatedMatrix = [{ 
        member_id: currentAssignment.memberId, 
        type: currentAssignment.type 
      }];
    }
    
    // Update the RACI matrix
    onUpdate(currentAssignment.raciId, { raci_matrix: updatedMatrix })
      .then(() => {
        setAssignDialogOpen(false);
        setCurrentAssignment(null);
        toast({
          title: "Assignment added",
          description: "Member has been assigned to the area."
        });
      })
      .catch((error) => {
        console.error("Failed to assign member:", error);
        toast({
          title: "Error",
          description: "Failed to assign member to the area.",
          variant: "destructive"
        });
      });
  };

  const removeAssignment = (raciId: string, memberId: string, type: RACIRole) => {
    if (!onUpdate) return;
    
    const item = raci.find(r => r.id === raciId);
    if (!item || !Array.isArray(item.raci_matrix)) return;
    
    // Filter out the assignment to remove
    const updatedMatrix = item.raci_matrix.filter((a: any) => 
      !(a.member_id === memberId && a.type === type)
    );
    
    // Update the RACI matrix
    onUpdate(raciId, { raci_matrix: updatedMatrix })
      .then(() => {
        toast({
          title: "Assignment removed",
          description: "Member assignment has been removed from the area."
        });
      })
      .catch((error) => {
        console.error("Failed to remove assignment:", error);
        toast({
          title: "Error",
          description: "Failed to remove member assignment.",
          variant: "destructive"
        });
      });
  };

  const getRaciLabel = (type: RACIRole) => {
    if (!type) return '';
    const option = RaciTypeOptions.find(o => o.value === type);
    return option ? option.label.charAt(0) : type;
  };
  
  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    return member ? member.name : 'Unknown';
  };

  const getAssignmentsForMember = (raciItem: TeamResponsibilityMatrix, memberId: string): RACIRole[] => {
    if (!raciItem.raci_matrix) return [];
    
    // Handle array format
    if (Array.isArray(raciItem.raci_matrix)) {
      return raciItem.raci_matrix
        .filter((a: any) => a.member_id === memberId)
        .map((a: any) => a.type as RACIRole);
    }
    
    // Handle object format
    const matrix = raciItem.raci_matrix as Record<string, string>;
    const value = matrix[memberId] as RACIRole;
    return value ? [value] : [];
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>RACI Responsibility Matrix</CardTitle>
          <CardDescription>
            Assign responsibilities across team members
          </CardDescription>
        </div>
        {!readOnly && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setNewRaciDialogOpen(true)}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Area
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {raci.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            No RACI items defined yet. Add an area to start defining responsibilities.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Area</TableHead>
                  {members.map(member => (
                    <TableHead key={member.id}>{member.name}</TableHead>
                  ))}
                  {!readOnly && <TableHead className="w-[50px]"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {raci.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div>{item.area}</div>
                      <div className="text-sm text-muted-foreground">{item.description}</div>
                    </TableCell>
                    
                    {members.map(member => (
                      <TableCell key={member.id}>
                        <div className="flex gap-1">
                          {getAssignmentsForMember(item, member.id).map(type => (
                            <span 
                              key={`${item.id}-${member.id}-${type}`}
                              className="inline-flex items-center justify-center w-6 h-6 bg-primary/10 text-primary font-medium rounded"
                              title={RaciTypeOptions.find(o => o.value === type)?.description}
                              onClick={() => {
                                if (!readOnly) {
                                  removeAssignment(item.id, member.id, type);
                                }
                              }}
                              style={{ cursor: readOnly ? 'default' : 'pointer' }}
                            >
                              {type}
                            </span>
                          ))}
                          {!readOnly && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => {
                                setCurrentAssignment({
                                  raciId: item.id,
                                  memberId: member.id,
                                  type: 'R'
                                });
                                setAssignDialogOpen(true);
                              }}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    ))}
                    
                    {!readOnly && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setCurrentRaci(item);
                                setEditRaciDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit Area
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setCurrentRaci(item);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Area
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Add New RACI Area Dialog */}
      <Dialog open={newRaciDialogOpen} onOpenChange={setNewRaciDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add RACI Area</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="area" className="text-right">
                Area
              </Label>
              <Input
                id="area"
                className="col-span-3"
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                className="col-span-3"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewRaciDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRaci} disabled={!newArea}>
              Add Area
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit RACI Area Dialog */}
      <Dialog open={editRaciDialogOpen} onOpenChange={setEditRaciDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit RACI Area</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-area" className="text-right">
                Area
              </Label>
              <Input
                id="edit-area"
                className="col-span-3"
                value={currentRaci?.area || ''}
                onChange={(e) => setCurrentRaci(prev => prev ? {...prev, area: e.target.value} : null)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="edit-description"
                className="col-span-3"
                value={currentRaci?.description || ''}
                onChange={(e) => setCurrentRaci(prev => prev ? {...prev, description: e.target.value} : null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRaciDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRaci}>
              Update Area
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Member Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Member</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="raci-type" className="text-right">
                RACI Type
              </Label>
              <Select
                value={currentAssignment?.type || ''}
                onValueChange={(value) => setCurrentAssignment(prev => prev ? {...prev, type: value as RACIRole} : null)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {RaciTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <span className="font-bold">{option.value} - {option.label}</span>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignMember}>
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the RACI area "{currentRaci?.area}" and all its assignments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRaci} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
} 