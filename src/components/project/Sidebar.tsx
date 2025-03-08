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
  BarChart2,
  UserPlus,
  PieChart,
  TrendingUp,
  Clock,
  ArrowRight,
  Bot,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ActiveSection } from './ProjectWorkspace';

interface SidebarProps {
  projectName: string;
  lastEdited: string;
  completion: number;
  activeSection: ActiveSection;
  setActiveSection: (section: ActiveSection) => void;
  collapsed?: boolean;
  toggleCollapse?: () => void;
}

// Define a type for navigation categories
type NavCategory = {
  title: string;
  items: {
    id: ActiveSection;
    icon: React.ElementType;
    label: string;
  }[];
};

export function Sidebar({ 
  projectName, 
  lastEdited, 
  completion,
  activeSection, 
  setActiveSection,
  collapsed = false,
  toggleCollapse
}: SidebarProps) {

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
  
  // Organize navigation items into categories
  const navCategories: NavCategory[] = [
    {
      title: 'Analytics',
      items: [
        { id: 'overview', icon: Layout, label: 'Dashboard' },
        { id: 'ai', icon: Bot, label: 'AI Dashboard' },
        { id: 'financials', icon: BarChart2, label: 'Financials' },
        { id: 'validation', icon: CheckCircle, label: 'Validation' },
        { id: 'market', icon: PieChart, label: 'Market Research' },
      ]
    },
    {
      title: 'Project Setup',
      items: [
        { id: 'canvas', icon: Grid, label: 'Business Model Canvas' },
        { id: 'grp', icon: Activity, label: 'Business Model GRP' },
      ]
    },
    {
      title: 'Development',
      items: [
        { id: 'product-design', icon: FileCode, label: 'Product Design' },
        { id: 'team', icon: UserPlus, label: 'Team' },
      ]
    },
    {
      title: 'Resources',
      items: [
        { id: 'documents', icon: FileText, label: 'Documents' },
        { id: 'external-tools', icon: ExternalLink, label: 'External Tools' },
      ]
    },
  ];

  return (
    <aside
      className={`bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      } h-[calc(100vh-56px)] overflow-y-auto`}
    >
      <nav className="flex-1 py-5">
        {navCategories.map((category) => (
          <div key={category.title} className="mb-6">
            {!collapsed && (
              <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider px-4 mb-2">
                {category.title}
              </h3>
            )}
            <ul className="space-y-1 px-2">
              {category.items.map((item) => (
                <li key={item.id}>
                  <button
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                      activeSection === item.id
                        ? "bg-[#7209B7]/10 text-[#7209B7] font-medium"
                        : "text-slate-600 hover:text-[#7209B7] hover:bg-purple-50"
                    }`}
                    onClick={() => setActiveSection(item.id)}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className={`${collapsed ? "h-5 w-5" : "h-4 w-4"} ${
                      activeSection === item.id ? "text-[#7209B7]" : "text-slate-500"
                    }`} />
                    {!collapsed && <span>{item.label}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      
      {!collapsed && (
        <div className="p-4 border-t border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-slate-700">Completion</h3>
            <span className="text-sm text-[#4CC9F0] font-medium">
              {completion}%
            </span>
          </div>
          <Progress 
            value={completion} 
            className="h-2 bg-slate-100" 
            indicatorClassName="bg-gradient-to-r from-[#7209B7] to-[#4CC9F0]" 
          />
        </div>
      )}
      
      {collapsed && (
        <div className="py-4 px-2 border-t border-slate-200 flex justify-center">
          <div 
            className="flex items-center justify-center text-xs font-medium text-[#4CC9F0]" 
            title="Completion"
          >
            {completion}%
          </div>
        </div>
      )}
    </aside>
  );
} 