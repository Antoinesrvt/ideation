# Common Components Architecture

This directory contains reusable components that can be shared across different tools in the application. The components are designed to be flexible, maintainable, and consistent with the application's design system.

## CyclingSidebar Architecture

The cornerstone of our tool UI is the CyclingSidebar component, which provides a consistent layout and user experience across all tools. It allows users to cycle through different panels of related functionality, including documents, AI assistance, validation, metrics, and notes.

### Key Components

1. **CyclingSidebar**: The main container component that handles panel navigation and animation
2. **DocumentsPanel**: Displays relevant documents and resources for the current section
3. **AIAssistantPanel**: Provides AI-powered assistance and suggestions
4. **ValidationPanel**: Manages hypotheses and their validation status
5. **MetricsPanel**: Displays relevant metrics and analytics for the current section
6. **NotesPanel**: Allows users to create and manage personal notes

## How to Use

### 1. Setting up the CyclingSidebar

To use the CyclingSidebar in a tool component, you need to:

```tsx
import { CyclingSidebar, PanelType, PanelConfig } from '@/features/common/components/CyclingSidebar';
import { FileText, Bot, CheckSquare, BarChart, StickyNote } from 'lucide-react';

// Import panel components
import { DocumentsPanel } from '@/features/common/components/DocumentsPanel';
import { AIAssistantPanel } from '@/features/common/components/AIAssistantPanel';
import { ValidationPanel } from '@/features/common/components/ValidationPanel';
import { MetricsPanel } from '@/features/common/components/MetricsPanel';
import { NotesPanel } from '@/features/common/components/NotesPanel';

// Define panel configurations
const panelConfigs: PanelConfig[] = [
  {
    id: 'documents',
    label: 'Documents',
    icon: <FileText className="h-4 w-4" />,
    color: 'text-blue-500'
  },
  // ... other panel configs
];

// Define section info
const sectionInfo = {
  id: currentSection,
  name: 'Section Name',
  icon: <FileText className="h-4 w-4" />,
  color: 'text-blue-500'
};

// Render panel content function
const renderPanelContent = (panelId: PanelType) => {
  switch (panelId) {
    case 'documents':
      return (
        <DocumentsPanel
          currentSection={currentSection}
          projectId={projectId}
          sectionInfo={sectionInfo}
          documents={[]} // Provide actual documents data
        />
      );
    // ... other panel cases
  }
};

// In your component return statement
return (
  <ToolComponent
    // ... other props
    sidebarConfig={{
      projectId: projectId,
      sectionId: currentSection,
      renderPanelContent: renderPanelContent,
      customPanels: panelConfigs
    }}
  >
    {/* Main content */}
  </ToolComponent>
);
```

### 2. ToolComponent Integration

The `ToolComponent` has been updated to accept a `sidebarConfig` prop, which configures the CyclingSidebar. The config includes:

- `projectId`: The ID of the current project
- `sectionId`: The ID of the current section
- `renderPanelContent`: A function that renders the appropriate panel content
- `customPanels`: (Optional) Custom panel configurations
- `defaultPanel`: (Optional) The default panel to show

## Component Details

### DocumentsPanel

Displays documents relevant to the current section. It accepts:

- `currentSection`: The active section ID
- `projectId`: The project ID
- `sectionInfo`: Information about the section (name, icon, color)
- `documents`: An array of document objects

### AIAssistantPanel

Provides an AI assistant interface, accepting:

- `currentSection`: The active section ID
- `projectId`: The project ID

### ValidationPanel

Manages hypotheses and their validation, accepting:

- `currentSection`: The active section ID
- `projectId`: The project ID
- `sectionInfo`: Information about the section
- `hypotheses`: An array of hypothesis objects

### MetricsPanel

Displays metrics and analytics, accepting:

- `currentSection`: The active section ID
- `projectId`: The project ID
- `sectionInfo`: Information about the section
- `metrics`: An array of metric objects

### NotesPanel

Allows users to create and manage notes, accepting:

- `currentSection`: The active section ID
- `projectId`: The project ID
- `sectionInfo`: Information about the section
- `notes`: (Optional) An array of note objects

## Design Principles

1. **Reusability**: Components are designed to be reused across different tools
2. **Flexibility**: Components accept configuration props to adapt to different contexts
3. **Consistency**: Components maintain a consistent design language
4. **Separation of Concerns**: Each component has a single responsibility
5. **Type Safety**: TypeScript interfaces ensure proper usage 