import { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import type { 
  FinancialRevenueStream,
  FinancialCostStructure,
  FinancialPricingStrategy,
  FinancialProjection
} from '@/store/types';

export interface FinancialsData {
  revenueStreams: FinancialRevenueStream[];
  costStructure: FinancialCostStructure[];
  pricingStrategies: FinancialPricingStrategy[];
  projections: FinancialProjection[];
}

export class FinancialsService {
  constructor(private supabase: SupabaseClient) {}

  protected handleError(error: PostgrestError | Error, context: string = ''): never {
    const errorMessage = error instanceof PostgrestError 
      ? `Database error: ${error.details} (${error.code})`
      : error.message;
    
    console.error(`Financials Service Error (${context}):`, errorMessage);
    throw new Error(errorMessage);
  }

  // === Revenue Streams ===
  async getRevenueStreams(projectId: string): Promise<FinancialRevenueStream[]> {
    const { data, error } = await this.supabase
      .from('financial_revenue_streams')
      .select('*')
      .eq('project_id', projectId);

    if (error) this.handleError(error, 'getRevenueStreams');
    return data || [];
  }

  async addRevenueStream(projectId: string, data: Omit<FinancialRevenueStream, 'id' | 'created_at' | 'updated_at'>): Promise<FinancialRevenueStream> {
    const { data: stream, error } = await this.supabase
      .from('financial_revenue_streams')
      .insert({ ...data, project_id: projectId })
      .select()
      .single();

    if (error) this.handleError(error, 'addRevenueStream');
    return stream;
  }

  async updateRevenueStream(id: string, data: Partial<Omit<FinancialRevenueStream, 'id' | 'created_at' | 'updated_at'>>): Promise<FinancialRevenueStream> {
    const { data: stream, error } = await this.supabase
      .from('financial_revenue_streams')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) this.handleError(error, 'updateRevenueStream');
    return stream;
  }

  async deleteRevenueStream(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('financial_revenue_streams')
      .delete()
      .eq('id', id);

    if (error) this.handleError(error, 'deleteRevenueStream');
  }

  // === Cost Structure ===
  async getCostStructure(projectId: string): Promise<FinancialCostStructure[]> {
    const { data, error } = await this.supabase
      .from('financial_cost_structure')
      .select('*')
      .eq('project_id', projectId);

    if (error) this.handleError(error, 'getCostStructure');
    return data || [];
  }

  async addCostStructure(projectId: string, data: Omit<FinancialCostStructure, 'id' | 'created_at' | 'updated_at'>): Promise<FinancialCostStructure> {
    const { data: cost, error } = await this.supabase
      .from('financial_cost_structure')
      .insert({ ...data, project_id: projectId })
      .select()
      .single();

    if (error) this.handleError(error, 'addCostStructure');
    return cost;
  }

  async updateCostStructure(id: string, data: Partial<Omit<FinancialCostStructure, 'id' | 'created_at' | 'updated_at'>>): Promise<FinancialCostStructure> {
    const { data: cost, error } = await this.supabase
      .from('financial_cost_structure')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) this.handleError(error, 'updateCostStructure');
    return cost;
  }

  async deleteCostStructure(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('financial_cost_structure')
      .delete()
      .eq('id', id);

    if (error) this.handleError(error, 'deleteCostStructure');
  }

  // === Pricing Strategies ===
  async getPricingStrategies(projectId: string): Promise<FinancialPricingStrategy[]> {
    const { data, error } = await this.supabase
      .from('financial_pricing_strategies')
      .select('*')
      .eq('project_id', projectId);

    if (error) this.handleError(error, 'getPricingStrategies');
    return data || [];
  }

  async addPricingStrategy(projectId: string, data: Omit<FinancialPricingStrategy, 'id' | 'created_at' | 'updated_at'>): Promise<FinancialPricingStrategy> {
    const { data: strategy, error } = await this.supabase
      .from('financial_pricing_strategies')
      .insert({ ...data, project_id: projectId })
      .select()
      .single();

    if (error) this.handleError(error, 'addPricingStrategy');
    return strategy;
  }

  async updatePricingStrategy(id: string, data: Partial<Omit<FinancialPricingStrategy, 'id' | 'created_at' | 'updated_at'>>): Promise<FinancialPricingStrategy> {
    const { data: strategy, error } = await this.supabase
      .from('financial_pricing_strategies')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) this.handleError(error, 'updatePricingStrategy');
    return strategy;
  }

  async deletePricingStrategy(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('financial_pricing_strategies')
      .delete()
      .eq('id', id);

    if (error) this.handleError(error, 'deletePricingStrategy');
  }

  // === Financial Projections ===
  async getProjections(projectId: string): Promise<FinancialProjection[]> {
    const { data, error } = await this.supabase
      .from('financial_projections')
      .select('*')
      .eq('project_id', projectId);

    if (error) this.handleError(error, 'getProjections');
    return data || [];
  }

  async addProjection(projectId: string, data: Omit<FinancialProjection, 'id' | 'created_at' | 'updated_at'>): Promise<FinancialProjection> {
    const { data: projection, error } = await this.supabase
      .from('financial_projections')
      .insert({ ...data, project_id: projectId })
      .select()
      .single();

    if (error) this.handleError(error, 'addProjection');
    return projection;
  }

  async updateProjection(id: string, data: Partial<Omit<FinancialProjection, 'id' | 'created_at' | 'updated_at'>>): Promise<FinancialProjection> {
    const { data: projection, error } = await this.supabase
      .from('financial_projections')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) this.handleError(error, 'updateProjection');
    return projection;
  }

  async deleteProjection(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('financial_projections')
      .delete()
      .eq('id', id);

    if (error) this.handleError(error, 'deleteProjection');
  }

  // === Batch Operations ===
  async getAllFinancialsData(projectId: string): Promise<FinancialsData> {
    const [revenueStreams, costStructure, pricingStrategies, projections] = await Promise.all([
      this.getRevenueStreams(projectId),
      this.getCostStructure(projectId),
      this.getPricingStrategies(projectId),
      this.getProjections(projectId)
    ]);

    return {
      revenueStreams,
      costStructure,
      pricingStrategies,
      projections
    };
  }
} 