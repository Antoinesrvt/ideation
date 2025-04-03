import { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import type { 
  MarketPersona,
  MarketInterview,
  MarketCompetitor,
  MarketTrend,
  Insert,
  Update
} from '@/store/types';
import type { Database } from '@/types/database';


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
    console.log('MarketAnalysisService - Getting personas for project:', projectId);
    const { data, error } = await this.supabase
      .from('market_personas')
      .select('*')
      .eq('project_id', projectId);

    if (error) this.handleError(error, 'getPersonas');
    console.log('MarketAnalysisService - Retrieved personas:', data);
    return data || [];
  }

  async addPersona(projectId: string, data: Insert<'market_personas'>): Promise<MarketPersona> {
    console.log('MarketAnalysisService - Adding persona with data:', data);
    // Prepare data with default values for new fields
    const personaData = {
      ...data,
      project_id: projectId,
      influence_score: data.influence_score || null,
      priority: data.priority || null,
      persona_segments: data.persona_segments || [],
      empathy_map: data.empathy_map || null
    };
    
    console.log('MarketAnalysisService - Sending to Supabase:', personaData);
    
    const { data: persona, error } = await this.supabase
      .from('market_personas')
      .insert(personaData)
      .select()
      .single();

    if (error) {
      console.error('MarketAnalysisService - Error in addPersona:', error);
      this.handleError(error, 'addPersona');
    }
    
    console.log('MarketAnalysisService - Persona created:', persona);
    return persona;
  }

  async updatePersona(id: string, data: Update<'market_personas'>): Promise<MarketPersona> {
    console.log('MarketAnalysisService - Updating persona:', id, 'with data:', data);
    // Prepare update data, making sure not to overwrite fields with undefined
    const updateData = { ...data };
    
    // Only set these fields if they're explicitly included in the data
    if ('influence_score' in data && data.influence_score === undefined) {
      updateData.influence_score = null;
    }
    
    if ('priority' in data && data.priority === undefined) {
      updateData.priority = null;
    }
    
    if ('persona_segments' in data && data.persona_segments === undefined) {
      updateData.persona_segments = [];
    }
    
    if ('empathy_map' in data && data.empathy_map === undefined) {
      updateData.empathy_map = null;
    }
    
    console.log('MarketAnalysisService - Sending update to Supabase:', updateData);
    
    const { data: persona, error } = await this.supabase
      .from('market_personas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('MarketAnalysisService - Error in updatePersona:', error);
      this.handleError(error, 'updatePersona');
    }
    
    console.log('MarketAnalysisService - Persona updated:', persona);
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

  async addInterview(projectId: string, data: Insert<'market_interviews'>): Promise<MarketInterview> {
    const { data: interview, error } = await this.supabase
      .from('market_interviews')
      .insert({ ...data, project_id: projectId })
      .select()
      .single();

    if (error) this.handleError(error, 'addInterview');
    return interview;
  }

  async updateInterview(id: string, data: Update<'market_interviews'>): Promise<MarketInterview> {
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

  // New methods for linking interviews to personas
  async linkInterviewToPersona(interviewId: string, personaId: string): Promise<MarketInterview> {
    const { data, error } = await this.supabase
      .from('market_interviews')
      .update({ persona_id: personaId })
      .eq('id', interviewId)
      .select()
      .single();

    if (error) this.handleError(error, 'linkInterviewToPersona');
    return data;
  }

  async getInterviewsByPersona(personaId: string): Promise<MarketInterview[]> {
    const { data, error } = await this.supabase
      .from('market_interviews')
      .select('*')
      .eq('persona_id', personaId);

    if (error) this.handleError(error, 'getInterviewsByPersona');
    return data || [];
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

  async addCompetitor(projectId: string, data: Insert<'market_competitors'>): Promise<MarketCompetitor> {
    const { data: competitor, error } = await this.supabase
      .from('market_competitors')
      .insert({ ...data, project_id: projectId })
      .select()
      .single();

    if (error) this.handleError(error, 'addCompetitor');
    return competitor;
  }

  async updateCompetitor(id: string, data: Update<'market_competitors'>): Promise<MarketCompetitor> {
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

  async addTrend(projectId: string, data: Insert<'market_trends'>): Promise<MarketTrend> {
    const { data: trend, error } = await this.supabase
      .from('market_trends')
      .insert({ ...data, project_id: projectId })
      .select()
      .single();

    if (error) this.handleError(error, 'addTrend');
    return trend;
  }

  async updateTrend(id: string, data: Update<'market_trends'>): Promise<MarketTrend> {
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