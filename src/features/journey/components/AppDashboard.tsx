'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart2, 
  PieChart, 
  Grid, 
  FileCode, 
  Palette, 
  FileText, 
  ArrowUpRight,
  Users,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  ChevronRight,
  Network,
  BrainCircuit,
  Lightbulb
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AppDashboardProps {
  projectId: string;
  onAppSelect: (appId: string) => void;
}

// Define app areas
const MAIN_APPS = [
  {
    id: 'market',
    title: 'Marché',
    description: 'Analyse concurrentielle, tendances, personas',
    icon: <PieChart className="h-5 w-5" />,
    color: '#7209B7',
    colorLight: 'rgba(114, 9, 183, 0.1)',
    metrics: [
      { id: 'competitors', label: 'Concurrents', value: 5 },
      { id: 'personas', label: 'Personas', value: 3 },
      { id: 'trends', label: 'Tendances', value: 7 }
    ]
  },
  {
    id: 'brand',
    title: 'Marque',
    description: 'Mission, valeurs, proposition de valeur',
    icon: <Palette className="h-5 w-5" />,
    color: '#4361EE',
    colorLight: 'rgba(67, 97, 238, 0.1)',
    metrics: [
      { id: 'values', label: 'Valeurs', value: 4 },
      { id: 'mission', label: 'Mission', value: 1 },
      { id: 'positioning', label: 'Positionnement', value: 2 }
    ]
  },
  {
    id: 'product',
    title: 'Produit',
    description: 'Fonctionnalités, modèle d\'affaires, développement',
    icon: <FileCode className="h-5 w-5" />,
    color: '#4CC9F0',
    colorLight: 'rgba(76, 201, 240, 0.1)',
    metrics: [
      { id: 'features', label: 'Fonctionnalités', value: 12 },
      { id: 'bmc', label: 'Business Model', value: 1 },
      { id: 'milestones', label: 'Jalons', value: 4 }
    ]
  },
  {
    id: 'financials',
    title: 'Finances',
    description: 'Projections, roadmap, documents',
    icon: <BarChart2 className="h-5 w-5" />,
    color: '#F72585',
    colorLight: 'rgba(247, 37, 133, 0.1)',
    metrics: [
      { id: 'projections', label: 'Projections', value: 1 },
      { id: 'roadmap', label: 'Roadmap', value: 1 },
      { id: 'documents', label: 'Documents', value: 3 }
    ]
  }
];

// Define side panel tools
const SIDE_TOOLS = [
  {
    id: 'documents',
    title: 'Documents',
    icon: <FileText className="h-4 w-4" />,
    color: '#0EA5E9'
  },
  {
    id: 'ai',
    title: 'AI Assistant',
    icon: <BrainCircuit className="h-4 w-4" />,
    color: '#A855F7'
  },
  {
    id: 'decision',
    title: 'Décisions & Validation',
    icon: <Target className="h-4 w-4" />,
    color: '#059669'
  },
  {
    id: 'metrics',
    title: 'Visualisations',
    icon: <BarChart2 className="h-4 w-4" />,
    color: '#F59E0B'
  },
  {
    id: 'team',
    title: 'Équipe',
    icon: <Users className="h-4 w-4" />,
    color: '#EC4899'
  },
  {
    id: 'notes',
    title: 'Notes',
    icon: <FileText className="h-4 w-4" />,
    color: '#64748B'
  }
];

// Mock recent activities
const RECENT_ACTIVITIES = [
  {
    id: '1',
    text: 'Concurrent ajouté: SuperApp',
    timestamp: 'Il y a 2 heures',
    area: 'market',
    icon: <Target className="h-4 w-4" />,
    color: '#7209B7'
  },
  {
    id: '2',
    text: 'Modèle d\'affaires mis à jour',
    timestamp: 'Hier',
    area: 'product',
    icon: <Grid className="h-4 w-4" />,
    color: '#4CC9F0'
  },
  {
    id: '3',
    text: 'Nouvelle fonctionnalité ajoutée: Auth',
    timestamp: 'Il y a 2 jours',
    area: 'product',
    icon: <FileCode className="h-4 w-4" />,
    color: '#4CC9F0'
  }
];

// Mock suggestions
const SUGGESTIONS = [
  {
    id: '1',
    text: 'Analysez vos concurrents',
    description: 'Identifiez les forces et faiblesses de vos concurrents',
    appId: 'market',
    icon: <Target className="h-4 w-4" />,
    color: '#7209B7'
  },
  {
    id: '2',
    text: 'Définissez votre proposition de valeur',
    description: 'Clarifiez ce qui rend votre produit unique',
    appId: 'brand',
    icon: <Lightbulb className="h-4 w-4" />,
    color: '#4361EE'
  }
];

export function AppDashboard({ projectId, onAppSelect }: AppDashboardProps) {
  // Calculate mock progress percentages for each app
  const appProgress: Record<string, number> = {
    'market': 62,
    'brand': 35,
    'product': 18,
    'financials': 5
  };
  
  // Calculate overall project progress
  const overallProgress = 
    Object.values(appProgress).reduce((sum, value) => sum + value, 0) / 
    (Object.values(appProgress).length * 100);
  
  return (
    <div className="container mx-auto space-y-6 py-6 px-4">
      {/* Project Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre projet</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-1">
            <Users className="h-4 w-4 mr-1" />
            Inviter
          </Button>
          <Button className="flex items-center gap-1">
            <Lightbulb className="h-4 w-4 mr-1" />
            AI Insights
          </Button>
        </div>
      </div>
      
      {/* Progress Overview */}
      {/* <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between">
            <div>
              <CardTitle>Progression du projet</CardTitle>
              <CardDescription>Avancement global: {Math.round(overallProgress * 100)}%</CardDescription>
            </div>
            <Badge 
              variant="outline" 
              className="bg-green-50 text-green-600 border-green-100 flex items-center"
            >
              <TrendingUp className="h-3 w-3 mr-1" /> En progrès
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {MAIN_APPS.map((app) => (
              <div key={app.id} className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: app.color }}
                    ></div>
                    <span className="text-sm font-medium">{app.title}</span>
                  </div>
                  <span className="text-sm">
                    {appProgress[app.id]}%
                  </span>
                </div>
                <Progress 
                  value={appProgress[app.id]} 
                  className="h-2"
                  style={{ 
                    '--progress-color': app.color 
                  } as React.CSSProperties}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card> */}
      
      {/* Main App Grid */}
      {/* <h2 className="text-xl font-semibold mt-8">Applications</h2> */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {MAIN_APPS.map((app) => (
          <Card 
            key={app.id}
            className="hover:shadow-md transition-all cursor-pointer overflow-hidden group animate-slide-up-in"
            onClick={() => onAppSelect(app.id)}
          >
            <div 
              className="h-1.5" 
              style={{ backgroundColor: app.color }}
            ></div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div 
                  className="p-2 rounded-lg" 
                  style={{ backgroundColor: app.colorLight }}
                >
                  <div style={{ color: app.color }}>
                    {app.icon}
                  </div>
                </div>
                <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
              </div>
              <CardTitle className="mt-3">{app.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {app.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {app.metrics.map((metric) => (
                    <div 
                      key={metric.id}
                      className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium"
                      title={`${metric.label}: ${metric.value}`}
                    >
                      {metric.value}
                    </div>
                  ))}
                </div>
                <Progress 
                  value={appProgress[app.id]} 
                  className="h-2 w-16"
                  style={{ 
                    '--progress-color': app.color 
                  } as React.CSSProperties}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {RECENT_ACTIVITIES.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 group cursor-pointer hover:bg-gray-50 p-2 rounded-md -mx-2">
                  <div 
                    className="mt-1 h-8 w-8 rounded-full flex items-center justify-center" 
                    style={{ backgroundColor: `${activity.color}20` }}
                  >
                    <div style={{ color: activity.color }}>
                      {activity.icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-black">
                      {activity.text}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" /> {activity.timestamp}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-2 text-gray-500 hover:text-gray-800">
              Voir toute l'activité
            </Button>
          </CardContent>
        </Card>
        
        {/* Tools & Recommendations */}
        <div className="space-y-6">
          {/* Side Tools */}
          <Card>
            <CardHeader>
              <CardTitle>Outils</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {SIDE_TOOLS.map((tool) => (
                <Button 
                  key={tool.id}
                  variant="ghost" 
                  className="w-full justify-start group hover:bg-gray-100"
                  onClick={() => console.log('tool clicked (need to send back to the view)')}
                >
                  <div 
                    className="mr-2 h-7 w-7 rounded-md flex items-center justify-center" 
                    style={{ backgroundColor: `${tool.color}15` }}
                  >
                    <div style={{ color: tool.color }}>
                      {tool.icon}
                    </div>
                  </div>
                  <span>{tool.title}</span>
                  <ArrowUpRight className="ml-auto h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                </Button>
              ))}
            </CardContent>
          </Card>
          
          {/* Suggestions */}
          {/* <Card>
            <CardHeader>
              <CardTitle>Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {SUGGESTIONS.map((suggestion) => (
                  <div 
                    key={suggestion.id}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer group"
                    onClick={() => onAppSelect(suggestion.appId)}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="p-1.5 rounded-md" 
                        style={{ backgroundColor: `${suggestion.color}20` }}
                      >
                        <div style={{ color: suggestion.color }}>
                          {suggestion.icon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{suggestion.text}</p>
                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                          {suggestion.description}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  );
} 