import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Save, Plus, Trash2, PenTool } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  sectionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SectionInfo {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

export interface NotesPanelProps {
  currentSection: string;
  projectId: string;
  sectionInfo: SectionInfo;
  className?: string;
  notes?: NoteItem[];
  onCreateNote?: (note: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateNote?: (id: string, updates: Partial<NoteItem>) => Promise<void>;
  onDeleteNote?: (id: string) => Promise<void>;
}

export function NotesPanel({
  currentSection,
  projectId,
  sectionInfo,
  className,
  notes: propNotes,
  onCreateNote,
  onUpdateNote,
  onDeleteNote
}: NotesPanelProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'section'>('section');
  const [notes, setNotes] = useState<NoteItem[]>(propNotes || []);
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);
  const [newNoteContent, setNewNoteContent] = useState<string>('');
  const [showNewNote, setShowNewNote] = useState<boolean>(false);
  
  // Update notes from props if they change
  useEffect(() => {
    if (propNotes) {
      setNotes(propNotes);
    }
  }, [propNotes]);
  
  // If there are no prop notes, use localStorage as fallback
  useEffect(() => {
    if (!propNotes) {
      const storedNotes = localStorage.getItem(`notes-${projectId}`);
      if (storedNotes) {
        try {
          setNotes(JSON.parse(storedNotes));
        } catch (error) {
          console.error('Failed to parse stored notes', error);
          setNotes([]);
        }
      }
    }
  }, [projectId, propNotes]);
  
  // Save notes to localStorage if no external handlers
  useEffect(() => {
    if (!onCreateNote && !onUpdateNote && notes.length > 0) {
      localStorage.setItem(`notes-${projectId}`, JSON.stringify(notes));
    }
  }, [notes, projectId, onCreateNote, onUpdateNote]);
  
  // Filter notes based on active tab
  const filteredNotes = React.useMemo(() => {
    if (activeTab === 'all') {
      return notes;
    }
    return notes.filter(note => note.sectionId === currentSection);
  }, [notes, activeTab, currentSection]);
  
  // Create a new note
  const handleCreateNote = async () => {
    if (!newNoteContent.trim()) return;
    
    const now = new Date().toISOString();
    const newNote = {
      title: `Note - ${sectionInfo.name}`,
      content: newNoteContent,
      sectionId: currentSection,
      createdAt: now,
      updatedAt: now
    };
    
    if (onCreateNote) {
      try {
        await onCreateNote(newNote);
      } catch (error) {
        console.error('Failed to create note:', error);
      }
    } else {
      // Add note locally if no external handler
      const noteWithId = {
        ...newNote,
        id: `note-${Date.now()}`
      };
      setNotes([...notes, noteWithId]);
    }
    
    setNewNoteContent('');
    setShowNewNote(false);
  };
  
  // Update an existing note
  const handleUpdateNote = async () => {
    if (!editingNote) return;
    
    const updatedNote = {
      ...editingNote,
      updatedAt: new Date().toISOString()
    };
    
    if (onUpdateNote) {
      try {
        await onUpdateNote(editingNote.id, updatedNote);
      } catch (error) {
        console.error('Failed to update note:', error);
      }
    } else {
      // Update note locally if no external handler
      const updatedNotes = notes.map(note => 
        note.id === editingNote.id ? updatedNote : note
      );
      setNotes(updatedNotes);
    }
    
    setEditingNote(null);
  };
  
  // Delete a note
  const handleDeleteNote = async (noteId: string) => {
    if (onDeleteNote) {
      try {
        await onDeleteNote(noteId);
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    } else {
      // Delete note locally if no external handler
      setNotes(notes.filter(note => note.id !== noteId));
    }
    
    if (editingNote?.id === noteId) {
      setEditingNote(null);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString().slice(0, 5);
  };

  return (
    <div className={cn("h-full flex flex-col", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Personal Notes</CardTitle>
          <Badge variant="outline" className="ml-2 flex items-center gap-1.5">
            <span className={sectionInfo.color}>{sectionInfo.icon}</span>
            <span>{sectionInfo.name}</span>
          </Badge>
        </div>
        <CardDescription>
          Capture your thoughts and observations
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="section" value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid grid-cols-2 mb-2 mx-4">
          <TabsTrigger value="section">This Section</TabsTrigger>
          <TabsTrigger value="all">All Notes</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-3 p-4">
            {!editingNote && (
              <div className="mb-4">
                {showNewNote ? (
                  <Card>
                    <CardContent className="p-3">
                      <Textarea
                        placeholder="Type your note here..."
                        className="min-h-[100px] text-sm"
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                      />
                      <div className="flex justify-end space-x-2 mt-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setShowNewNote(false);
                            setNewNoteContent('');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleCreateNote}
                          disabled={!newNoteContent.trim()}
                        >
                          <Save className="w-3.5 h-3.5 mr-1" />
                          Save
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => setShowNewNote(true)}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add Note
                  </Button>
                )}
              </div>
            )}
            
            {editingNote ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card>
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground mb-1">
                      Editing note from {editingNote.sectionId}
                    </p>
                    <Textarea
                      placeholder="Type your note here..."
                      className="min-h-[100px] text-sm"
                      value={editingNote.content}
                      onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                    />
                    <div className="flex justify-end space-x-2 mt-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setEditingNote(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleUpdateNote}
                        disabled={!editingNote.content.trim()}
                      >
                        <Save className="w-3.5 h-3.5 mr-1" />
                        Update
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <Card key={note.id} className="overflow-hidden">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground">
                          {note.sectionId}
                        </h4>
                        <div className="text-xs text-muted-foreground/70">
                          {formatDate(note.updatedAt)}
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setEditingNote(note)}
                        >
                          <PenTool className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className={cn("rounded-full p-4 mb-4 bg-muted text-muted-foreground")}>
                  {sectionInfo.icon && React.cloneElement(sectionInfo.icon as React.ReactElement, { className: "h-8 w-8 opacity-40" })}
                </div>
                <p className="text-muted-foreground text-sm">No notes yet</p>
                <p className="text-muted-foreground text-xs mt-1">
                  {activeTab === 'section' 
                    ? `Click "Add Note" to create your first note for the ${sectionInfo.name} section.` 
                    : 'Notes from all sections will appear here when you create them.'}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </div>
  );
} 