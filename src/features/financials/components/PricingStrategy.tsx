import React, { useState, useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/table';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Bar, Tooltip as RechartsTooltip } from 'recharts';
import { formatCurrency } from '../utils/dataProcessing';
import { FinancialPricingStrategy } from '@/store/types';
import { parseJsonbField } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { PricingStrategyCard } from './common/PricingStrategyCard';
import { PricingStrategy as IPricingStrategy, defaultPricingStrategy } from './common/EditablePricingRow';
import { EditablePricingRow } from './common/EditablePricingRow';
import { EditableCompetitorPriceRow, CompetitorPrice, defaultCompetitorPrice } from './common/EditableCompetitorPriceRow';
import { AnimatePresence, motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/components/ui/use-toast';
import { ExtendedPricingStrategy } from './common/PricingStrategyCard';

// Interface for competitor price data
interface PricingStrategyData {
    pricing: {
      strategies: FinancialPricingStrategy[];
      competitorPrices: CompetitorPrice[];
    };
}

interface PricingStrategyProps {
  data: PricingStrategyData;
  onUpdateStrategy?: (strategy: ExtendedPricingStrategy) => Promise<void>;
  onDeleteStrategy?: (id: string) => Promise<void>;
  onAddStrategy?: (strategy: ExtendedPricingStrategy) => Promise<void>;
  onUpdateCompetitor?: (competitor: CompetitorPrice) => Promise<void>;
  onDeleteCompetitor?: (id: string) => Promise<void>;
  readOnly?: boolean;
}

// Helper to get price from target_price_range
function getAveragePrice(strategy: FinancialPricingStrategy): number {
  const priceRange = parseJsonbField<{min: number, max: number}>(
    strategy.target_price_range, 
    {min: 0, max: 0}
  );
  return (priceRange.min + priceRange.max) / 2;
}

// Convert DB model to UI model for pricing strategy
function convertToUIPricingStrategy(strategy: FinancialPricingStrategy): ExtendedPricingStrategy {
  return {
    id: strategy.id,
    name: strategy.name || '',
    description: strategy.description || '',
    target_market: strategy.target_market || '',
    target_price_range: strategy.target_price_range ? 
      typeof strategy.target_price_range === 'string' ?
        strategy.target_price_range :
        JSON.stringify(strategy.target_price_range)
      : JSON.stringify({min: 0, max: 0}),
    considerations: strategy.considerations || '',
    project_id: strategy.project_id || undefined,
    strategy_type: strategy.strategy_type || 'value-based',
    updated_at: strategy.updated_at || undefined
  };
}

const PricingStrategy: React.FC<PricingStrategyProps> = ({ 
  data, 
  onUpdateStrategy,
  onDeleteStrategy,
  onAddStrategy,
  onUpdateCompetitor,
  onDeleteCompetitor,
  readOnly = false 
}) => {
  const { toast } = useToast();
  const [isAddingStrategy, setIsAddingStrategy] = useState(false);
  const [isAddingCompetitor, setIsAddingCompetitor] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<ExtendedPricingStrategy | null>(null);
  const [editingCompetitor, setEditingCompetitor] = useState<CompetitorPrice | null>(null);
  
  // Map financial pricing strategies to UI model
  const pricingStrategies = useMemo(() => {
    return data.pricing.strategies.map(strategy => convertToUIPricingStrategy(strategy));
  }, [data.pricing.strategies]);
  
  // Add new pricing strategy
  const handleAddStrategy = () => {
    const newStrategy: ExtendedPricingStrategy = {
      id: '', // Will be populated by the backend
      name: 'New Pricing Strategy',
      description: '',
      target_market: 'general',
      target_price_range: JSON.stringify({ min: 0, max: 0 }),
      considerations: '',
      strategy_type: 'value-based'
    };
    
    if (onAddStrategy) {
      onAddStrategy(newStrategy);
    }
  };
  
  // Update pricing strategy
  const handleUpdateStrategy = async (updatedStrategy: ExtendedPricingStrategy): Promise<void> => {
    if (onUpdateStrategy) {
      try {
        await onUpdateStrategy(updatedStrategy);
      } catch (error) {
        console.error('Error updating strategy:', error);
      }
    }
  };
  
  // Delete pricing strategy
  const handleDeleteStrategy = async (id: string): Promise<void> => {
    if (onDeleteStrategy) {
      try {
        await onDeleteStrategy(id);
      } catch (error) {
        console.error('Error deleting strategy:', error);
      }
    }
  };
  
  // Save competitor changes
  const handleSaveCompetitor = async (competitor: CompetitorPrice): Promise<void> => {
    if (competitor.id && onUpdateCompetitor) {
      try {
        await onUpdateCompetitor(competitor);
        setEditingCompetitor(null);
      } catch (error) {
        console.error('Error updating competitor:', error);
      }
    }
  };
  
  // Delete competitor
  const handleDeleteCompetitor = async (competitor: CompetitorPrice): Promise<void> => {
    if (competitor.id && onDeleteCompetitor) {
      try {
        await onDeleteCompetitor(competitor.id);
      } catch (error) {
        console.error('Error deleting competitor:', error);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Pricing Strategies Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Pricing Strategies</h3>
          {!readOnly && (
            <Button 
              onClick={handleAddStrategy} 
              size="sm"
              className="gap-1"
            >
              <Plus className="h-4 w-4" /> Add Strategy
            </Button>
          )}
        </div>
        
        {pricingStrategies.length === 0 ? (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-8 text-center">
            <h4 className="text-gray-500 font-medium mb-2">No pricing strategies yet</h4>
            <p className="text-gray-400 text-sm mb-4">Define your pricing approach to target specific market segments</p>
            {!readOnly && (
              <Button onClick={handleAddStrategy} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" /> Add your first pricing strategy
                </Button>
              )}
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {pricingStrategies.map((strategy) => (
              <PricingStrategyCard
                  key={strategy.id}
                strategy={strategy}
                onEdit={handleUpdateStrategy}
                    onDelete={handleDeleteStrategy}
                readOnly={readOnly}
                  />
              ))}
          </div>
        )}
      </div>

      {/* Competitor Pricing Section */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Competitor Pricing</h3>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Competitor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Map existing competitors or show empty state */}
                {data.pricing.competitorPrices.length > 0 ? (
                  data.pricing.competitorPrices.map((competitor) => (
                    <EditableCompetitorPriceRow
                      key={competitor.id}
                      competitorPrice={competitor}
                      onSave={handleSaveCompetitor}
                      onDelete={competitor.id ? async () => {
                        await handleDeleteCompetitor(competitor);
                      } : undefined}
                      readOnly={readOnly}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                      No competitor pricing information added yet.
                    </td>
                  </tr>
                )}
                
                {/* Always show an empty row for adding new competitors if not readOnly */}
                {!readOnly && onUpdateCompetitor && (
                  <EditableCompetitorPriceRow
                    competitorPrice={defaultCompetitorPrice}
                    isEmptyRow={true}
                    onSave={async (competitor) => {
                      if (onUpdateCompetitor) {
                        try {
                          await onUpdateCompetitor(competitor);
                        } catch (error) {
                          console.error('Error adding competitor price:', error);
                        }
                      }
                    }}
                    readOnly={readOnly}
                  />
                )}
              </tbody>
            </table>
          </div>
                      </div>
                    </div>
    </div>
  );
};

export default PricingStrategy;