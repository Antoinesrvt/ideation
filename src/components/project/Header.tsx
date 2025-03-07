'use client';

import Link from 'next/link';
import { useState } from 'react';
import { 
  ArrowLeft, 
  BellRing, 
  User, 
  ChevronDown,
  Settings,
  LogOut,
  Home,
  Sparkles,
  ChevronRight,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSupabase } from "@/context/supabase-context";
import { useRouter } from 'next/navigation';
import { ActiveSection } from './ProjectWorkspace';
import { useAppStore } from '@/store';

interface HeaderProps {
  activeSection?: ActiveSection;
  projectName?: string;
  sidebarCollapsed?: boolean;
  toggleSidebar?: () => void;
}

// Map section IDs to human-readable titles
const sectionTitles: Record<ActiveSection, string> = {
  'overview': 'Project Overview',
  'canvas': 'Business Model Canvas',
  'grp': 'Business Model GRP',
  'market': 'Market Research',
  'product-design': 'Product Design',
  'validation': 'Validation',
  'financials': 'Financial Projections',
  'team': 'Team',
  'documents': 'Documents',
  'external-tools': 'External Tools'
};

export function Header({ 
  activeSection = 'overview', 
  projectName = "",
  sidebarCollapsed = false,
  toggleSidebar 
}: HeaderProps) {
  const [isBackHover, setIsBackHover] = useState(false);
  const { user } = useSupabase();
  const router = useRouter();

  // Get current section title
  const sectionTitle = sectionTitles[activeSection];

  return (
    <header className="bg-white border-b border-slate-200 h-14 sticky top-0 z-50 shadow-sm flex items-center">
      <div className={`flex-none ${sidebarCollapsed ? 'w-16' : 'w-64'} h-full transition-all duration-300 flex items-center justify-between px-4 border-r border-slate-200 bg-white`}>
        <div className="flex items-center">
          <Link
            href="/dashboard"
            className="flex items-center group"
            onMouseEnter={() => setIsBackHover(true)}
            onMouseLeave={() => setIsBackHover(false)}
          >
            <div className="relative w-8 h-8 flex items-center justify-center mr-2">
              {isBackHover ? (
                <ArrowLeft className="h-5 w-5 text-[#7209B7] absolute transition-opacity duration-300 opacity-100" />
              ) : (
                <div className="flex items-center absolute transition-opacity duration-300 opacity-100">
                  <Sparkles className="h-5 w-5 text-[#7209B7]" />
                </div>
              )}
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <span className="font-semibold text-[#1A1A2A] text-sm">Kickoff</span>
                <div className="flex items-center">
                  <span className="text-xs text-slate-500 truncate max-w-[120px]">{projectName}</span>
                  <ChevronRight className="h-3 w-3 text-slate-400 ml-0.5" />
                </div>
              </div>
            )}
          </Link>
        </div>
        
        {toggleSidebar && (
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-500 hover:text-[#7209B7] hover:bg-purple-50 -mr-1.5"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      <div className="flex-1 flex items-center justify-between px-6">
        <h1 className="text-lg font-bold text-[#1A1A2A]">
          {sectionTitle}
        </h1>

        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-slate-600 hover:text-[#7209B7] hover:bg-purple-50"
              >
                <BellRing className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#F72585] rounded-full"></span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="py-2 px-4 text-sm text-center text-slate-500">
                No new notifications
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 hover:bg-purple-50"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#7209B7] to-[#4CC9F0] flex items-center justify-center text-white font-medium">
                  {user?.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt={user.user_metadata.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    user?.user_metadata?.name?.charAt(0)
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-slate-800">
                    {user?.user_metadata?.name}
                  </p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => router.push("/profile")}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => router.push("/dashboard")}
              >
                <Home className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => router.push("/settings")}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
} 