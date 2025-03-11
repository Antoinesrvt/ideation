import React, { useState } from 'react';
import { FileText, Shield, Layout, Book, Image } from 'lucide-react';
import { GuidelineCategory, GuidelineItem } from './guidelines/GuidelineCategory';
import { GuidelineEditor } from './guidelines/GuidelineEditor';
import { DosDonts } from './guidelines/DosDonts';
import { ComplianceChecker, ComplianceIssue } from './guidelines/ComplianceChecker';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface BrandGuidelinesData {
  logoUsage: string[];
  colorUsage: string[];
  typographyRules: string[];
  accessibilityRequirements: string[];
}

interface BrandGuidelinesProps {
  data: BrandGuidelinesData;
}

export function BrandGuidelines({ data }: BrandGuidelinesProps) {
  // Transform the initial data into our new format
  const [guidelines, setGuidelines] = useState<Record<string, GuidelineItem[]>>({
    logoUsage: data.logoUsage.map((content, index) => ({
      id: `logo-${index}`,
      content,
      status: 'published',
      compliance: 'compliant',
      lastUpdated: new Date().toISOString()
    })),
    colorUsage: data.colorUsage.map((content, index) => ({
      id: `color-${index}`,
      content,
      status: 'published',
      compliance: 'compliant',
      lastUpdated: new Date().toISOString()
    })),
    typographyRules: data.typographyRules.map((content, index) => ({
      id: `typography-${index}`,
      content,
      status: 'published',
      compliance: 'compliant',
      lastUpdated: new Date().toISOString()
    })),
    accessibilityRequirements: data.accessibilityRequirements.map((content, index) => ({
      id: `accessibility-${index}`,
      content,
      status: 'published',
      compliance: 'compliant',
      lastUpdated: new Date().toISOString()
    }))
  });

  const [editingGuideline, setEditingGuideline] = useState<{
    category: string;
    guideline?: GuidelineItem;
  } | null>(null);

  const [complianceIssues] = useState<ComplianceIssue[]>([
    {
      id: 'issue-1',
      type: 'warning',
      message: 'Some logo usage guidelines lack specific dimensions',
      category: 'Logo Usage',
      suggestions: [
        'Add minimum size requirements',
        'Specify clear space rules',
        'Include file format preferences'
      ],
      impact: 'medium'
    },
    {
      id: 'issue-2',
      type: 'error',
      message: 'Missing contrast ratio requirements in accessibility guidelines',
      category: 'Accessibility',
      suggestions: [
        'Add WCAG 2.1 contrast requirements',
        'Specify minimum contrast ratios for text',
        'Include examples of compliant color combinations'
      ],
      impact: 'high'
    }
  ]);

  const handleAddGuideline = (category: string) => {
    setEditingGuideline({ category });
  };

  const handleEditGuideline = (category: string, guideline: GuidelineItem) => {
    setEditingGuideline({ category, guideline });
  };

  const handleSaveGuideline = async (guideline: Partial<GuidelineItem>) => {
    if (!editingGuideline) return;

    const { category } = editingGuideline;
    const isNew = !guideline.id;

    const updatedGuideline: GuidelineItem = {
      id: guideline.id || `${category}-${Date.now()}`,
      content: guideline.content || '',
      status: guideline.status || 'draft',
      compliance: guideline.compliance || 'compliant',
      lastUpdated: new Date().toISOString()
    };

    setGuidelines(prev => ({
      ...prev,
      [category]: isNew
        ? [...prev[category], updatedGuideline]
        : prev[category].map(g => g.id === updatedGuideline.id ? updatedGuideline : g)
    }));

    toast({
      title: `Guideline ${isNew ? 'Added' : 'Updated'}`,
      description: `The guideline has been successfully ${isNew ? 'added' : 'updated'}.`
    });
  };

  const handleArchiveGuideline = (category: string, id: string) => {
    setGuidelines(prev => ({
      ...prev,
      [category]: prev[category].filter(g => g.id !== id)
    }));

    toast({
      title: "Guideline Archived",
      description: "The guideline has been archived successfully."
    });
  };

  const handleFixIssue = (issueId: string) => {
    toast({
      title: "Issue Fix Initiated",
      description: "You'll be guided through the process of fixing this compliance issue."
    });
  };

  // Calculate compliance stats
  const complianceStats = {
    total: Object.values(guidelines).flat().length,
    compliant: Object.values(guidelines).flat().filter(g => g.compliance === 'compliant').length,
    warnings: complianceIssues.filter(i => i.type === 'warning').length,
    errors: complianceIssues.filter(i => i.type === 'error').length
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-2">Brand Guidelines</h2>
          <p className="text-gray-600">
            Comprehensive guidelines to ensure consistent brand application across all touchpoints.
          </p>
        </div>
      </div>

      {/* Guidelines Grid */}
      <div className="grid grid-cols-1 gap-6">
        <GuidelineCategory
          title="Logo Usage Guidelines"
          description="Rules and specifications for logo applications"
          icon={Image}
          guidelines={guidelines.logoUsage}
          onAdd={() => handleAddGuideline('logoUsage')}
          onEdit={(id) => handleEditGuideline('logoUsage', guidelines.logoUsage.find(g => g.id === id)!)}
          onArchive={(id) => handleArchiveGuideline('logoUsage', id)}
        />

        <GuidelineCategory
          title="Color Usage"
          description="Color palette application and combinations"
          icon={Layout}
          guidelines={guidelines.colorUsage}
          onAdd={() => handleAddGuideline('colorUsage')}
          onEdit={(id) => handleEditGuideline('colorUsage', guidelines.colorUsage.find(g => g.id === id)!)}
          onArchive={(id) => handleArchiveGuideline('colorUsage', id)}
        />

        <GuidelineCategory
          title="Typography Rules"
          description="Font usage and text styling guidelines"
          icon={FileText}
          guidelines={guidelines.typographyRules}
          onAdd={() => handleAddGuideline('typographyRules')}
          onEdit={(id) => handleEditGuideline('typographyRules', guidelines.typographyRules.find(g => g.id === id)!)}
          onArchive={(id) => handleArchiveGuideline('typographyRules', id)}
        />

        <GuidelineCategory
          title="Accessibility Requirements"
          description="Ensuring brand elements are accessible to all"
          icon={Shield}
          guidelines={guidelines.accessibilityRequirements}
          onAdd={() => handleAddGuideline('accessibilityRequirements')}
          onEdit={(id) => handleEditGuideline('accessibilityRequirements', guidelines.accessibilityRequirements.find(g => g.id === id)!)}
          onArchive={(id) => handleArchiveGuideline('accessibilityRequirements', id)}
        />
      </div>

      {/* Example Usage Section */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Example Usage</h3>
        <DosDonts
          dos={[
            "Use the logo with proper clear space",
            "Apply brand colors according to the hierarchy",
            "Maintain consistent typography across materials",
            "Ensure sufficient contrast for accessibility"
          ]}
          donts={[
            "Modify or distort the logo",
            "Use unapproved color combinations",
            "Mix different font families",
            "Create low-contrast text combinations"
          ]}
        />
      </div>

      {/* Compliance Checker */}
      <ComplianceChecker
        issues={complianceIssues}
        stats={complianceStats}
        onFixIssue={handleFixIssue}
        className="mt-8"
      />

      {/* Guideline Editor Dialog */}
      {editingGuideline && (
        <GuidelineEditor
          guideline={editingGuideline.guideline}
          isOpen={true}
          onClose={() => setEditingGuideline(null)}
          onSave={handleSaveGuideline}
        />
      )}
    </div>
  );
} 