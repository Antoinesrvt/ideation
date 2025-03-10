import React from 'react';
import { 
  DollarSign, 
  Wallet, 
  Target, 
  LineChart, 
  BarChart 
} from "lucide-react";

export const financialTabs = [
  {
    id: "revenue",
    label: "Revenue Streams",
    icon: React.createElement(DollarSign, { className: "h-4 w-4 mr-2" }),
    description: "Manage your income sources"
  },
  {
    id: "costs",
    label: "Cost Structure",
    icon: React.createElement(Wallet, { className: "h-4 w-4 mr-2" }),
    description: "Track fixed and variable costs"
  },
  {
    id: "pricing",
    label: "Pricing Strategies",
    icon: React.createElement(BarChart, { className: "h-4 w-4 mr-2" }),
    description: "Define your pricing models"
  },
  {
    id: "breakeven",
    label: "Break-even Analysis",
    icon: React.createElement(Target, { className: "h-4 w-4 mr-2" }),
    description: "Calculate your break-even point"
  },
  {
    id: "projections",
    label: "Financial Projections",
    icon: React.createElement(LineChart, { className: "h-4 w-4 mr-2" }),
    description: "Forecast your financial future"
  }
]; 