import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Users, Target, Activity, Edit3, PlusCircle } from 'lucide-react';
import { GRPModel as GRPModelType, GRPItem } from '@/types';
import { useAppStore } from '@/store';

interface GRPModelProps {
  data?: GRPModelType;
  onUpdate: (data: Partial<GRPModelType>) => void;
}

export const GRPModel: React.FC<GRPModelProps> = ({ 
  data = {
    generation: { porteurs: [], propositionValeur: [], fabricationValeur: [] },
    remuneration: { sourcesRevenus: [], volumeRevenus: [], performance: [] },
    partage: { partiesPrenantes: [], conventions: [], ecosysteme: [] }
  },
  onUpdate 
}) => {
  const { expandedCell, setExpandedCell } = useAppStore();
  
  const handleCellClick = (cell: string) => {
    setExpandedCell(expandedCell === cell ? null : cell);
  };
  
  const handleAddItem = (section: string, subsection: string) => {
    const newItem: GRPItem = {
      id: Math.random().toString(36).substring(2, 9),
      title: '',
      description: ''
    };
    
    const sectionData = data[section as keyof GRPModelType] || {};
    const subsectionData = sectionData[subsection as keyof typeof sectionData] || [];
    
    onUpdate({
      [section]: {
        ...sectionData,
        [subsection]: [...subsectionData, newItem]
      }
    });
  };
  
  const renderGRPCell = (
    section: 'generation' | 'remuneration' | 'partage',
    subsection: string,
    cellId: string,
    title: string,
    icon: React.ReactNode,
    color: string,
    prompt: string
  ) => {
    const sectionData = data[section] || {};
    const items = (sectionData[subsection as keyof typeof sectionData] || []) as GRPItem[];
    
    // Map color string to specific color utility classes
    const colorClasses = {
      yellow: {
        bg: "bg-yellow-100",
        border: "border-yellow-200",
        text: "text-yellow-500",
        title: "text-yellow-600",
        itemBg: "bg-yellow-50"
      },
      blue: {
        bg: "bg-blue-100",
        border: "border-blue-200", 
        text: "text-blue-500",
        title: "text-blue-600",
        itemBg: "bg-blue-50"
      },
      red: {
        bg: "bg-red-100",
        border: "border-red-200",
        text: "text-red-500",
        title: "text-red-600",
        itemBg: "bg-red-50"
      }
    };
    
    // Get the correct classes based on the color prop
    const classes = colorClasses[color as keyof typeof colorClasses] || colorClasses.yellow;
    
    return (
      <div 
        className={`bg-white border ${classes.border} rounded-lg p-4 cursor-pointer transition-all duration-200 ${expandedCell === cellId ? 'row-span-2 col-span-3' : ''}`}
        onClick={() => handleCellClick(cellId)}
      >
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className={`w-12 h-12 ${classes.bg} rounded-full flex items-center justify-center ${classes.text} mb-3`}>
            {icon}
          </div>
          <h3 className={`font-medium text-lg ${classes.title}`}>{title}</h3>
          
          {expandedCell === cellId && (
            <div className="mt-4 text-left w-full">
              <p className="text-sm text-gray-500 mb-3">{prompt}</p>
              
              <div className="space-y-2">
                {items.map((item: GRPItem) => (
                  <div key={item.id} className={`p-3 ${classes.itemBg} rounded-md border ${classes.border}`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{item.title || 'Untitled'}</p>
                      <Edit3 className="h-4 w-4 text-gray-400 cursor-pointer" />
                    </div>
                    <p className="text-xs text-gray-600">{item.description}</p>
                    {item.percentage && (
                      <p className={`text-xs ${classes.title} font-medium mt-1`}>{item.percentage}% of total</p>
                    )}
                  </div>
                ))}
                
                <div 
                  className="p-2 bg-gray-50 rounded-md border border-dashed border-gray-300 flex items-center cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddItem(section, subsection);
                  }}
                >
                  <p className="text-sm text-gray-500">Add {title.toLowerCase()}...</p>
                  <PlusCircle className="h-4 w-4 text-gray-400 ml-auto" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">GRP Model</h2>
        <p className="text-gray-600">Define your business model through Generation, Remuneration and Partage</p>
      </div>
      
      {/* GRP Model - Grid Layout */}
      <div className="space-y-4">
        {/* G Row - Génération de la valeur (yellow) */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-yellow-400 text-white p-6 rounded-lg flex flex-col items-center justify-center text-center">
            <span className="text-6xl font-bold">G</span>
            <div className="mt-2">
              <p className="font-semibold">Génération</p>
              <p>de la valeur</p>
            </div>
          </div>
          
          {renderGRPCell(
            'generation',
            'porteurs',
            'G1',
            'Porteur(s)',
            <Users className="h-6 w-6" />,
            'yellow',
            'Who are the project leaders and what are their roles?'
          )}
          
          {expandedCell !== 'G1' && (
            <>
              {renderGRPCell(
                'generation',
                'propositionValeur',
                'G2',
                'Proposition de valeur',
                <Target className="h-6 w-6" />,
                'yellow',
                'What value does your solution provide to customers?'
              )}
              
              {renderGRPCell(
                'generation',
                'fabricationValeur',
                'G3',
                'Fabrication de la valeur',
                <Activity className="h-6 w-6" />,
                'yellow',
                'How is your solution produced and delivered?'
              )}
            </>
          )}
        </div>
        
        {/* R Row - Rémunération de la valeur (blue) */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-blue-500 text-white p-6 rounded-lg flex flex-col items-center justify-center text-center">
            <span className="text-6xl font-bold">R</span>
            <div className="mt-2">
              <p className="font-semibold">Rémunération</p>
              <p>de la valeur</p>
            </div>
          </div>
          
          {renderGRPCell(
            'remuneration',
            'sourcesRevenus',
            'R1',
            'Sources de revenus',
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>,
            'blue',
            'What are your revenue streams?'
          )}
          
          {expandedCell !== 'R1' && (
            <>
              {renderGRPCell(
                'remuneration',
                'volumeRevenus',
                'R2',
                'Volume des revenus',
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>,
                'blue',
                'What is your revenue volume and projection?'
              )}
              
              {renderGRPCell(
                'remuneration',
                'performance',
                'R3',
                'Performance',
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>,
                'blue',
                'What are your key performance metrics?'
              )}
            </>
          )}
        </div>
        
        {/* P Row - Partage de la valeur (coral/red) */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-red-500 text-white p-6 rounded-lg flex flex-col items-center justify-center text-center">
            <span className="text-6xl font-bold">P</span>
            <div className="mt-2">
              <p className="font-semibold">Partage</p>
              <p>de la valeur</p>
            </div>
          </div>
          
          {renderGRPCell(
            'partage',
            'partiesPrenantes',
            'P1',
            'Parties prenantes',
            <Users className="h-6 w-6" />,
            'red',
            'Who are your stakeholders in your ecosystem?'
          )}
          
          {expandedCell !== 'P1' && (
            <>
              {renderGRPCell(
                'partage',
                'conventions',
                'P2',
                'Conventions',
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>,
                'red',
                'What agreements do you have with stakeholders?'
              )}
              
              {renderGRPCell(
                'partage',
                'ecosysteme',
                'P3',
                'Écosystème',
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>,
                'red',
                'How does your business fit into the broader ecosystem?'
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Info and Actions */}
      <div className="mt-6 flex items-center p-4 border border-blue-100 rounded-lg bg-blue-50">
        <AlertCircle className="h-5 w-5 text-blue-500 mr-3" />
        <div>
          <p className="text-sm text-blue-700">Click on any cell to expand and edit its content. The GRP model helps you structure your business model through Generation (how value is created), Remuneration (how value is monetized), and Partage (how value is shared).</p>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <Button variant="outline" className="text-gray-600 mr-2">
          Save Draft
        </Button>
        <Button variant="default" className="bg-blue-600 text-white">
          Complete GRP Model
        </Button>
      </div>
    </div>
  );
};