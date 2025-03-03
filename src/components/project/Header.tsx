'use client';

import Link from 'next/link';
import { Download, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onExport?: () => void;
}

export function Header({ onExport }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 py-3 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard" className="text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold text-slate-900">Project Workspace</h1>
      </div>
      <div className="flex items-center space-x-3">
        {onExport && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center space-x-1"
            onClick={onExport}
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        )}
      </div>
    </header>
  );
} 