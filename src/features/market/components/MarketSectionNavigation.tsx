import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, LayoutDashboard, Users, Building2, Handshake, TrendingUp, Building } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MarketSection = 'overview' | 'business' | 'trends' | 'customers' | 'competitors' | 'partners';

interface MarketSectionNavigationProps {
  currentSection: MarketSection;
  onSectionSelect: (section: MarketSection) => void;
  className?: string;
}

interface NavigationItem {
  id: MarketSection;
  label: string;
  icon: React.ReactNode;
  description: string;
}

export function MarketSectionNavigation({ currentSection, onSectionSelect, className }: MarketSectionNavigationProps) {
  const sections: NavigationItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="h-5 w-5" />,
      description: 'Market landscape visualization',
    },
    {
      id: 'business',
      label: 'Your Business',
      icon: <Building className="h-5 w-5" />,
      description: 'Define your business position in the market',
    },
    {
      id: 'trends',
      label: 'Market Trends',
      icon: <TrendingUp className="h-5 w-5" />,
      description: 'Track emerging market trends',
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: <Users className="h-5 w-5" />,
      description: 'Create personas and record customer interviews',
    },
    {
      id: 'competitors',
      label: 'Competitors',
      icon: <Building2 className="h-5 w-5" />,
      description: 'Track and analyze your competition',
    },
    {
      id: 'partners',
      label: 'Partners',
      icon: <Handshake className="h-5 w-5" />,
      description: 'Map your business ecosystem partners',
    },
  ];

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      {sections.map((section) => (
        <Button
          key={section.id}
          variant={currentSection === section.id ? "default" : "ghost"}
          className={cn(
            "justify-start px-3 py-6 h-auto",
            currentSection === section.id 
              ? "bg-primary text-primary-foreground" 
              : "hover:bg-muted"
          )}
          onClick={() => onSectionSelect(section.id)}
        >
          <div className="flex items-start w-full">
            <div className={cn(
              "mr-3 rounded-md p-1.5",
              currentSection === section.id ? "bg-primary-foreground/20" : "bg-muted"
            )}>
              {section.icon}
            </div>
            <div className="flex-1 text-left mr-2">
              <div className="font-medium">{section.label}</div>
              <div className="text-xs opacity-70 mt-0.5 line-clamp-1">
                {section.description}
              </div>
            </div>
            {currentSection === section.id && (
              <ChevronRight className="h-5 w-5 self-center opacity-70" />
            )}
          </div>
        </Button>
      ))}
    </div>
  );
} 