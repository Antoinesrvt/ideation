'use client';

import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  ArrowLeft, 
  BookOpen, 
  Target, 
  GitFork, 
  AlertTriangle, 
  Network 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DecisionJournal } from './decision-support/DecisionJournal';
import { VentureViabilityRadar } from './decision-support/VentureViabilityRadar';
import { GoNoGoFramework } from './decision-support/GoNoGoFramework';
import { RiskAssessmentDashboard } from './decision-support/RiskAssessmentDashboard';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DecisionSupportHubProps {
  projectId: string;
  onBackToOverview: () => void;
  initialToolId?: string;
}

export const DECISION_TOOLS = [
  {
    id: 'decision-journal',
    name: 'Journal de décisions',
    description: 'Documentez et tracez vos décisions clés tout au long du projet',
    icon: <BookOpen className="h-5 w-5" />,
    color: '#7209B7',
    colorLight: 'rgba(114, 9, 183, 0.1)'
  },
  {
    id: 'viability-radar',
    name: 'Radar de viabilité',
    description: 'Évaluez visuellement la viabilité de votre venture sur plusieurs dimensions',
    icon: <Target className="h-5 w-5" />,
    color: '#4361EE',
    colorLight: 'rgba(67, 97, 238, 0.1)'
  },
  {
    id: 'go-no-go',
    name: 'Framework Go/No-Go',
    description: 'Prenez des décisions structurées pour avancer ou pivoter',
    icon: <GitFork className="h-5 w-5" />,
    color: '#4CC9F0',
    colorLight: 'rgba(76, 201, 240, 0.1)'
  },
  {
    id: 'risk-assessment',
    name: 'Évaluation des risques',
    description: 'Identifiez, catégorisez et gérez les risques business potentiels',
    icon: <AlertTriangle className="h-5 w-5" />,
    color: '#F72585',
    colorLight: 'rgba(247, 37, 133, 0.1)'
  },
];

export function DecisionSupportHub({ 
  projectId, 
  onBackToOverview,
  initialToolId = 'decision-journal'
}: DecisionSupportHubProps) {
  const [activeTab, setActiveTab] = useState(initialToolId || 'decision-journal');

  return (
    <div className="animate-slide-left-in">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onBackToOverview}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour au parcours
          </Button>
          <h1 className="text-2xl font-bold">Centre d'aide à la décision</h1>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Sidebar with tool selection */}
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Outils disponibles</CardTitle>
              <CardDescription>
                Sélectionnez un outil d'aide à la décision
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="space-y-1 p-3">
                  {DECISION_TOOLS.map((tool) => (
                    <Button
                      key={tool.id}
                      variant={activeTab === tool.id ? "secondary" : "ghost"}
                      className={`w-full justify-start mb-1 ${activeTab === tool.id ? 'bg-gray-100' : ''}`}
                      onClick={() => setActiveTab(tool.id)}
                    >
                      <div 
                        className="p-1 rounded-md mr-2" 
                        style={{ 
                          backgroundColor: activeTab === tool.id ? tool.colorLight : 'transparent',
                          color: tool.color 
                        }}
                      >
                        {tool.icon}
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{tool.name}</div>

                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main content area */}
        <div className="col-span-3">
          <Card className="h-[calc(100vh-200px)]">
            <CardContent className="p-0">
              {activeTab === 'decision-journal' && (
                <DecisionJournal projectId={projectId} />
              )}
              {activeTab === 'viability-radar' && (
                <VentureViabilityRadar projectId={projectId} />
              )}
              {activeTab === 'go-no-go' && (
                <GoNoGoFramework stageId={activeTab} projectId={projectId} />
              )}
              {activeTab === 'risk-assessment' && (
                <RiskAssessmentDashboard projectId={projectId} />
              )}
              {/* {activeTab === 'dependency-matrix' && (
                <DependencyMatrix projectId={projectId} />
              )} */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 