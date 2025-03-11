import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { GuidelineItem } from './GuidelineCategory';
import { Save, X, Image as ImageIcon, Link, List, Bold, Italic } from 'lucide-react';

interface GuidelineEditorProps {
  guideline?: GuidelineItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (guideline: Partial<GuidelineItem>) => void;
}

export function GuidelineEditor({
  guideline,
  isOpen,
  onClose,
  onSave
}: GuidelineEditorProps) {
  const [formData, setFormData] = useState<Partial<GuidelineItem>>(
    guideline || {
      content: '',
      status: 'draft',
      compliance: 'compliant'
    }
  );

  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving guideline:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTextFormat = (format: 'bold' | 'italic' | 'list') => {
    // In a real implementation, this would handle text formatting
    console.log('Format text:', format);
  };

  const handleAddImage = () => {
    // In a real implementation, this would handle image upload
    console.log('Add image');
  };

  const handleAddLink = () => {
    // In a real implementation, this would handle link insertion
    console.log('Add link');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {guideline ? 'Edit Guideline' : 'Create New Guideline'}
          </DialogTitle>
          <DialogDescription>
            Add or edit brand guidelines with rich formatting and media support.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Editor Toolbar */}
          <div className="flex items-center space-x-2 pb-2 border-b">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => handleTextFormat('bold')}
            >
              <Bold className="h-4 w-4" />
              <span className="sr-only">Bold</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => handleTextFormat('italic')}
            >
              <Italic className="h-4 w-4" />
              <span className="sr-only">Italic</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => handleTextFormat('list')}
            >
              <List className="h-4 w-4" />
              <span className="sr-only">List</span>
            </Button>
            <div className="h-4 w-px bg-gray-200" />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleAddImage}
            >
              <ImageIcon className="h-4 w-4" />
              <span className="sr-only">Add Image</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleAddLink}
            >
              <Link className="h-4 w-4" />
              <span className="sr-only">Add Link</span>
            </Button>
          </div>

          {/* Editor Content */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="min-h-[200px] mt-1.5"
                placeholder="Enter guideline content..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: GuidelineItem['status']) => 
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger id="status" className="mt-1.5">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="compliance">Compliance</Label>
                <Select
                  value={formData.compliance}
                  onValueChange={(value: GuidelineItem['compliance']) => 
                    setFormData({ ...formData, compliance: value })
                  }
                >
                  <SelectTrigger id="compliance" className="mt-1.5">
                    <SelectValue placeholder="Select compliance status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compliant">Compliant</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="violation">Violation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              Last edited: {new Date().toLocaleDateString()}
            </Badge>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 