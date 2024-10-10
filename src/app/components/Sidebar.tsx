"use client";

import React from 'react';
import { Home, Package, BarChart3, Users, Settings, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface SidebarProps {
  isMobile?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobile = false }) => {
  const router = useRouter();

  const SidebarContent = () => (
    <nav className="flex-grow">
      <ul className="p-4 space-y-2">
        <li>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => router.push("/")}
          >
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </li>
        <li>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => router.push("/offers")}
          >
            <Package className="mr-2 h-4 w-4" />
            Offers
          </Button>
        </li>
        <li>
          <Button
            variant="ghost"
            className="w-full justify-start"
            disabled
            onClick={() => router.push("/analytics")}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </Button>
        </li>
        <li>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => router.push("/your-business")}
          >
            <Users className="mr-2 h-4 w-4" />
            Your Business
          </Button>
        </li>
        <li>
          <Button
            variant="ghost"
            className="w-full justify-start"
            disabled onClick={() => router.push("/settings")}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </li>
      </ul>
    </nav>
  );

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <div className="flex items-center justify-center h-16 border-b">
            <span className="text-2xl font-semibold">Waste Marketplace</span>
          </div>
          <SidebarContent />
          <div className="p-4 border-t">
            <Button variant="ghost" className="w-full justify-start">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r">
      <div className="flex items-center justify-center h-16 border-b">
        <span className="text-2xl font-semibold">Waste Marketplace</span>
      </div>
      <SidebarContent />
      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;