import { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import type { 
  MarketPersona,
  MarketInterview,
  MarketCompetitor,
  MarketTrend
} from '@/store/types';

export interface MarketAnalysisData {
  personas: MarketPersona[];
  interviews: MarketInterview[];
  competitors: MarketCompetitor[];
  trends: MarketTrend[];
}

export class MarketAnalysisService {
  constructor(private supabase: SupabaseClient) {}

  protected handleError(error: PostgrestError | Error, context: string = ''): never {
    const errorMessage = error instanceof PostgrestError 
      ? `Database error: ${error.details} (${error.code})`
      : error.message;
    
    console.error(`Market Analysis Service Error (${context}):`, errorMessage);
    throw new Error(errorMessage);
  }

  // === Personas ===
  async getPersonas(projectId: string): Promise<MarketPersona[]> {
    const { data, error } = await this.supabase
      .from('market_personas')
      .select('*')
      .eq('project_id', projectId);

    if (error) this.handleError(error, 'getPersonas');
    return data || [];
  }

  async addPersona(projectId: string, data: Omit<MarketPersona, 'id' | 'created_at' | 'updated_at'>): Promise<MarketPersona> {
    const { data: persona, error } = await this.supabase
      .from('market_personas')
      .insert({ ...data, project_id: projectId })
      .select()
      .single();

    if (error) this.handleError(error, 'addPersona');
    return persona;
  }

  async updatePersona(id: string, data: Partial<Omit<MarketPersona, 'id' | 'created_at' | 'updated_at'>>): Promise<MarketPersona> {
    const { data: persona, error } = await this.supabase
      .from('market_personas')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) this.handleError(error, 'updatePersona');
    return persona;
  }

  async deletePersona(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('market_personas')
      .delete()
      .eq('id', id);

    if (error) this.handleError(error, 'deletePersona');
  }

  // === Interviews ===
  async getInterviews(projectId: string): Promise<MarketInterview[]> {
    const { data, error } = await this.supabase
      .from('market_interviews')
      .select('*')
      .eq('project_id', projectId);

    if (error) this.handleError(error, 'getInterviews');
    return data || [];
  }

  async addInterview(projectId: string, data: Omit<MarketInterview, 'id' | 'created_at' | 'updated_at'>): Promise<MarketInterview> {
    const { data: interview, error } = await this.supabase
      .from('market_interviews')
      .insert({ ...data, project_id: projectId })
      .select()
      .single();

    if (error) this.handleError(error, 'addInterview');
    return interview;
  }

  async updateInterview(id: string, data: Partial<Omit<MarketInterview, 'id' | 'created_at' | 'updated_at'>>): Promise<MarketInterview> {
    const { data: interview, error } = await this.supabase
      .from('market_interviews')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) this.handleError(error, 'updateInterview');
    return interview;
  }

  async deleteInterview(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('market_interviews')
      .delete()
      .eq('id', id);

    if (error) this.handleError(error, 'deleteInterview');
  }

  // === Competitors ===
  async getCompetitors(projectId: string): Promise<MarketCompetitor[]> {
    const { data, error } = await this.supabase
      .from('market_competitors')
      .select('*')
      .eq('project_id', projectId);

    if (error) this.handleError(error, 'getCompetitors');
    return data || [];
  }

  async addCompetitor(projectId: string, data: Omit<MarketCompetitor, 'id' | 'created_at' | 'updated_at'>): Promise<MarketCompetitor> {
    const { data: competitor, error } = await this.supabase
      .from('market_competitors')
      .insert({ ...data, project_id: projectId })
      .select()
      .single();

    if (error) this.handleError(error, 'addCompetitor');
    return competitor;
  }

  async updateCompetitor(id: string, data: Partial<Omit<MarketCompetitor, 'id' | 'created_at' | 'updated_at'>>): Promise<MarketCompetitor> {
    const { data: competitor, error } = await this.supabase
      .from('market_competitors')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) this.handleError(error, 'updateCompetitor');
    return competitor;
  }

  async deleteCompetitor(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('market_competitors')
      .delete()
      .eq('id', id);

    if (error) this.handleError(error, 'deleteCompetitor');
  }

  // === Trends ===
  async getTrends(projectId: string): Promise<MarketTrend[]> {
    const { data, error } = await this.supabase
      .from('market_trends')
      .select('*')
      .eq('project_id', projectId);

    if (error) this.handleError(error, 'getTrends');
    return data || [];
  }

  async addTrend(projectId: string, data: Omit<MarketTrend, 'id' | 'created_at' | 'updated_at'>): Promise<MarketTrend> {
    const { data: trend, error } = await this.supabase
      .from('market_trends')
      .insert({ ...data, project_id: projectId })
      .select()
      .single();

    if (error) this.handleError(error, 'addTrend');
    return trend;
  }

  async updateTrend(id: string, data: Partial<Omit<MarketTrend, 'id' | 'created_at' | 'updated_at'>>): Promise<MarketTrend> {
    const { data: trend, error } = await this.supabase
      .from('market_trends')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) this.handleError(error, 'updateTrend');
    return trend;
  }

  async deleteTrend(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('market_trends')
      .delete()
      .eq('id', id);

    if (error) this.handleError(error, 'deleteTrend');
  }

  // === Batch Operations ===
  async getAllMarketData(projectId: string): Promise<MarketAnalysisData> {
    const [personas, interviews, competitors, trends] = await Promise.all([
      this.getPersonas(projectId),
      this.getInterviews(projectId),
      this.getCompetitors(projectId),
      this.getTrends(projectId)
    ]);

    return {
        personas,
        interviews,
      competitors,
      trends
    };
  }
} 