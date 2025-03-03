import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, BarChart, TrendingUp, FileSpreadsheet, Search, Lightbulb } from 'lucide-react';

export const ExternalTools: React.FC = () => {
  const tools = [
    {
      id: 'market-research',
      name: 'Market Research',
      description: 'Access industry reports, market size data, and consumer trends',
      icon: <BarChart className="h-10 w-10 text-blue-500" />,
      url: '#'
    },
    {
      id: 'competitor-analysis',
      name: 'Competitor Analysis',
      description: 'Track competitors, analyze their strategies, and identify gaps',
      icon: <TrendingUp className="h-10 w-10 text-green-500" />,
      url: '#'
    },
    {
      id: 'financial-modeling',
      name: 'Financial Modeling',
      description: 'Create financial projections and analyze business metrics',
      icon: <FileSpreadsheet className="h-10 w-10 text-yellow-500" />,
      url: '#'
    },
    {
      id: 'patent-search',
      name: 'Patent Search',
      description: 'Search for existing patents and intellectual property',
      icon: <Search className="h-10 w-10 text-purple-500" />,
      url: '#'
    },
    {
      id: 'idea-validation',
      name: 'Idea Validation',
      description: 'Test your startup idea with potential customers',
      icon: <Lightbulb className="h-10 w-10 text-red-500" />,
      url: '#'
    }
  ];
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">External Tools</h2>
        <p className="text-gray-600">Connect with powerful tools to enhance your startup planning</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map(tool => (
          <Card key={tool.id} className="hover:shadow-md transition-all">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="bg-gray-100 p-3 rounded-lg">
                  {tool.icon}
                </div>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="mt-4">{tool.name}</CardTitle>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Connect Tool
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Integration Benefits</CardTitle>
          <CardDescription>Why connect external tools to your startup planning process</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start">
              <div className="bg-blue-100 p-1 rounded-full mr-2 mt-0.5">
                <svg className="h-3 w-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-gray-700">Access real-time market data to inform your business decisions</p>
            </li>
            <li className="flex items-start">
              <div className="bg-blue-100 p-1 rounded-full mr-2 mt-0.5">
                <svg className="h-3 w-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-gray-700">Streamline your workflow by connecting all your tools in one place</p>
            </li>
            <li className="flex items-start">
              <div className="bg-blue-100 p-1 rounded-full mr-2 mt-0.5">
                <svg className="h-3 w-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-gray-700">Generate more accurate projections and business plans</p>
            </li>
            <li className="flex items-start">
              <div className="bg-blue-100 p-1 rounded-full mr-2 mt-0.5">
                <svg className="h-3 w-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-gray-700">Save time by automating data collection and analysis</p>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};