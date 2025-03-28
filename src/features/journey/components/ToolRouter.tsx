'use client';

import React from 'react';
import MarketTool from '@/features/journey/components/market/MarketTool';
import BrandTool from '@/features/journey/components/brand/BrandTool';
import ProductTool from '@/features/journey/components/product/ProductTool';
import FinancialsTool from '@/features/journey/components/financials/FinancialsTool';
import { BarChart2, Palette, Package, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type AppType = 'market' | 'brand' | 'product' | 'financials';

export const APP_CONFIG = {
  market: {
    id: 'market',
    title: 'Market Analysis',
    description: 'Understand your market, competitors, and customers',
    icon: <BarChart2 className="h-5 w-5" />,
    color: '#0EA5E9'
  },
  brand: {
    id: 'brand',
    title: 'Brand Identity',
    description: 'Define your brand values, voice, and visual identity',
    icon: <Palette className="h-5 w-5" />,
    color: '#EC4899'
  },
  product: {
    id: 'product',
    title: 'Product Canvas',
    description: 'Design your product features and user experience',
    icon: <Package className="h-5 w-5" />,
    color: '#22C55E'
  },
  financials: {
    id: 'financials',
    title: 'Financial Model',
    description: 'Project your revenues, costs, and funding needs',
    icon: <CreditCard className="h-5 w-5" />,
    color: '#F59E0B'
  }
};

interface ToolRouterProps {
  activeApp: AppType | null;
  projectId: string;
  onBackToDashboard: () => void;
  onContentChange?: (hasChanges: boolean) => void;
}

export const ToolRouter: React.FC<ToolRouterProps> = ({
  activeApp,
  projectId,
  onBackToDashboard,
  onContentChange
}) => {
  // Early return for no active app
  if (!activeApp) return null;
  
  const appConfig = APP_CONFIG[activeApp];
  
  // Render the appropriate tool based on the active app
  const renderTool = () => {
    switch (activeApp) {
      case 'market':
        return (
          <MarketTool
            toolId="market"
            title={appConfig.title}
            icon={appConfig.icon}
            color={appConfig.color}
            onBackToDashboard={onBackToDashboard}
            projectId={projectId}
            onContentChange={onContentChange}
          />
        );
        
      case 'brand':
        return (
          <BrandTool
            toolId="brand"
            title={appConfig.title}
            icon={appConfig.icon}
            color={appConfig.color}
            onBackToDashboard={onBackToDashboard}
            projectId={projectId}
            onContentChange={onContentChange}
          />
        );
        
      case 'product':
        return (
          <ProductTool
            toolId="product"
            title={appConfig.title}
            icon={appConfig.icon}
            color={appConfig.color}
            onBackToDashboard={onBackToDashboard}
            projectId={projectId}
            onContentChange={onContentChange}
          />
        );
        
      case 'financials':
        return (
          <FinancialsTool
            toolId="financials"
            title={appConfig.title}
            icon={appConfig.icon}
            color={appConfig.color}
            onBackToDashboard={onBackToDashboard}
            projectId={projectId}
            onContentChange={onContentChange}
          />
        );
      
      default:
        return (
          <div className="p-8 bg-white rounded-lg border">
            <div className="text-center">
              <h2 className="text-xl font-medium text-red-500 mb-4">
                Unknown tool: {activeApp}
              </h2>
              <Button onClick={onBackToDashboard}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        );
    }
  };
  
  return renderTool();
};

export default ToolRouter; 