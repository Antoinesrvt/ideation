import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { UserCog, Award, Plus, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTeam } from '@/hooks/features/useTeam';
import { RoleTemplate, ProjectRole } from '@/store/types';


interface RoleTemplateSelectorProps {
  projectId?: string;
  onSelectTemplate: (template: RoleTemplate) => void;
  onCreateCustom: () => void;
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

export function RoleTemplateSelector({ projectId, onSelectTemplate, onCreateCustom }: RoleTemplateSelectorProps) {
  const [activeTab, setActiveTab] = useState<'templates' | 'custom'>('templates');
  const { data, isLoading } = useTeam(projectId);
  
  // Get role templates from the data
  const roleTemplates = data.roleTemplates || [];

  if (isLoading) {
    return <TemplatesLoadingSkeleton />;
  }

  return (
    <Tabs defaultValue="templates" className="w-full" onValueChange={(value) => setActiveTab(value as 'templates' | 'custom')}>
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="templates">Template Roles</TabsTrigger>
        <TabsTrigger value="custom">Custom Role</TabsTrigger>
      </TabsList>

      <TabsContent value="templates" className="space-y-4">
        <ScrollArea className="h-[400px] pr-4">
          {roleTemplates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No role templates available. Create a custom role instead.
            </div>
          ) : (
            <motion.div 
              className="grid gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {roleTemplates.map((template) => (
                <TemplateCard 
                  key={template.id} 
                  template={template} 
                  onSelect={() => onSelectTemplate(template)} 
                />
              ))}
            </motion.div>
          )}
        </ScrollArea>
      </TabsContent>

      <TabsContent value="custom">
        <div className="flex justify-center py-8">
          <Button onClick={onCreateCustom} size="lg" className="gap-2">
            <Plus size={18} />
            Create Custom Role
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}

interface TemplateCardProps {
  template: RoleTemplate;
  onSelect: () => void;
}

function TemplateCard({ template, onSelect }: TemplateCardProps) {
  // Parse JSON fields if they're strings
  const responsibilities = Array.isArray(template.responsibilities) 
    ? template.responsibilities 
    : (typeof template.responsibilities === 'string' 
        ? JSON.parse(template.responsibilities) 
        : []);
  
  const requiredSkills = Array.isArray(template.required_skills) 
    ? template.required_skills 
    : (typeof template.required_skills === 'string' 
        ? JSON.parse(template.required_skills) 
        : []);

  return (
    <motion.div variants={itemVariants}>
      <Card className="overflow-hidden cursor-pointer hover:border-primary/50 transition-all duration-200" onClick={onSelect}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center">
              <UserCog className="h-5 w-5 text-primary mr-2" />
              <h3 className="font-medium">{template.title}</h3>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <CheckCircle size={16} />
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {template.description || 'No description provided'}
          </p>
          
          {responsibilities && responsibilities.length > 0 && (
            <div className="mb-2">
              <span className="text-xs font-medium text-muted-foreground">Responsibilities:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {responsibilities.slice(0, 3).map((resp: string, idx: number) => (
                  <div key={idx}>
                    <Badge variant="outline" className="text-xs">
                      {resp}
                    </Badge>
                  </div>
                ))}
                {responsibilities.length > 3 && (
                  <div>
                    <Badge variant="outline" className="text-xs">
                      +{responsibilities.length - 3} more
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {requiredSkills && requiredSkills.length > 0 && (
            <div>
              <span className="text-xs font-medium text-muted-foreground">Required Skills:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {requiredSkills.slice(0, 3).map((skill: string, idx: number) => (
                  <div key={idx}>
                    <Badge variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  </div>
                ))}
                {requiredSkills.length > 3 && (
                  <div>
                    <Badge variant="secondary" className="text-xs">
                      +{requiredSkills.length - 3} more
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TemplatesLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex space-x-2 mb-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-10 w-1/2" />
      </div>
      
      {Array(3).fill(0).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <div className="flex space-x-2 mb-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="flex space-x-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default RoleTemplateSelector; 