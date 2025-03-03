'use client';

import { useState } from 'react';
import { 
  Layout, 
  FileText, 
  Grid, 
  Activity, 
  Users, 
  FileCode, 
  ExternalLink,
  Clock,
  CheckSquare,
  BarChart2,
  UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { ActiveSection } from './ProjectWorkspace';

interface SidebarProps {
  projectName: string;
  lastEdited: string;
  completion: number;
  activeSection: ActiveSection;
  setActiveSection: (section: ActiveSection) => void;
}

export function Sidebar({ 
  projectName, 
  lastEdited, 
  completion,
  activeSection, 
  setActiveSection 
}: SidebarProps) {

  const [collapsed, setCollapsed] = useState(false);


  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'Not available';
      
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date unavailable';
    }
  };
  
  const navItems: { id: ActiveSection; icon: React.ElementType; label: string }[] = [
    { id: 'overview', icon: Layout, label: 'Overview' },
    { id: 'canvas', icon: Grid, label: 'Business Model Canvas' },
    { id: 'grp', icon: Activity, label: 'Business Model GRP' },
    { id: 'market', icon: Users, label: 'Market Research' },
    { id: 'product-design', icon: FileCode, label: 'Product Design' },
    { id: 'validation', icon: CheckSquare, label: 'Validation' },
    { id: 'financials', icon: BarChart2, label: 'Financial Projections' },
    { id: 'team', icon: UserPlus, label: 'Team Management' },
    { id: 'documents', icon: FileText, label: 'Documents' },
    { id: 'external-tools', icon: ExternalLink, label: 'External Tools' },
  ];


   const toggleSidebar = () => {
     setCollapsed(!collapsed);
   };

  return (
    <aside
      className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      } sticky top-0`}
    >
      <div
        className={`p-4 flex ${
          collapsed ? "justify-center" : "justify-between"
        } items-center`}
      >
        {!collapsed && (
          <div>
            <h2 className="text-lg font-semibold text-gray-700 truncate">
              {projectName ?? "Untitled Project"}
            </h2>
            {/* <p className="text-sm text-gray-500">
              Last edited: {formatDate(lastEdited)}
            </p> */}
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-gray-700"
          onClick={toggleSidebar}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>
      <div className="border-b border-slate-200" />

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  activeSection === item.id
                    ? "bg-slate-100 text-slate-900 font-medium"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
                onClick={() => setActiveSection(item.id)}
              >
                <item.icon className={collapsed ? "h-5 w-5" : "h-4 w-4"} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-700">Completion</h3>
            <span className="text-sm text-blue-600 font-medium">
              {completion}%
            </span>
          </div>
          <Progress value={completion} className="h-2 bg-gray-200" />
        </div>
      )}
    </aside>
  );
} 