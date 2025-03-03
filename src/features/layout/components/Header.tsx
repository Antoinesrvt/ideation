import React from 'react';
import { Layers, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlobalSearch } from '@/components/ui/search';

interface HeaderProps {
  onExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onExport }) => {
  return (
    <header className="bg-white border-b border-gray-200 p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Layers className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">LaunchPad</h1>
        </div>
        
        <div className="w-1/3">
          <GlobalSearch />
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            variant="default" 
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
            onClick={onExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Project
          </Button>
        </div>
      </div>
    </header>
  );
};