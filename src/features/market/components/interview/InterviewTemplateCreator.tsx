import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { InterviewTemplateModal } from './InterviewTemplateModal';
import { useInterviewService } from '@/lib/hooks';

interface InterviewTemplateCreatorProps {
  projectId: string;
}

export function InterviewTemplateCreator({ projectId }: InterviewTemplateCreatorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | undefined>(undefined);
  
  const { fetchTemplates } = useInterviewService(projectId);

  const handleOpenModal = (templateId?: string) => {
    setEditingTemplateId(templateId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTemplateId(undefined);
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full" 
        onClick={() => handleOpenModal()}
      >
        <Plus className="h-4 w-4 mr-2" />
        Create New Template
      </Button>

      <InterviewTemplateModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        projectId={projectId}
        templateId={editingTemplateId}
      />
    </>
  );
} 