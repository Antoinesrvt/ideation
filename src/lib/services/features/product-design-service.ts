import { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import type { 
  ProductWireframe,
  ProductFeature,
  ProductJourneyStage,
  ProductJourneyAction,
  ProductJourneyPainPoint
} from '@/store/types';

export interface ProductDesignData {
  wireframes: ProductWireframe[];
  features: ProductFeature[];
  journey: {
    stages: ProductJourneyStage[];
    actions: ProductJourneyAction[];
    painPoints: ProductJourneyPainPoint[];
  };
}

export class ProductDesignService {
  constructor(private supabase: SupabaseClient) {}

  protected handleError(error: PostgrestError | Error, context: string = ''): never {
    const errorMessage = error instanceof PostgrestError 
      ? `Database error: ${error.details} (${error.code})`
      : error.message;
    
    console.error(`Product Design Service Error (${context}):`, errorMessage);
    throw new Error(errorMessage);
  }

  // === Wireframes ===
  async getWireframes(projectId: string): Promise<ProductWireframe[]> {
    const { data, error } = await this.supabase
      .from('product_wireframes')
      .select('*')
      .eq('project_id', projectId);

    if (error) this.handleError(error, 'getWireframes');
    return data || [];
  }

  async addWireframe(projectId: string, data: Omit<ProductWireframe, 'id' | 'created_at' | 'updated_at'>): Promise<ProductWireframe> {
    const { data: wireframe, error } = await this.supabase
      .from('product_wireframes')
      .insert({ ...data, project_id: projectId })
      .select()
      .single();

    if (error) this.handleError(error, 'addWireframe');
    return wireframe;
  }

  async updateWireframe(id: string, data: Partial<Omit<ProductWireframe, 'id' | 'created_at' | 'updated_at'>>): Promise<ProductWireframe> {
    const { data: wireframe, error } = await this.supabase
      .from('product_wireframes')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) this.handleError(error, 'updateWireframe');
    return wireframe;
  }

  async deleteWireframe(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('product_wireframes')
      .delete()
      .eq('id', id);

    if (error) this.handleError(error, 'deleteWireframe');
  }

  // === Features ===
  async getFeatures(projectId: string): Promise<ProductFeature[]> {
    const { data, error } = await this.supabase
      .from('product_features')
      .select('*')
      .eq('project_id', projectId);

    if (error) this.handleError(error, 'getFeatures');
    return data || [];
  }

  async addFeature(projectId: string, data: Omit<ProductFeature, 'id' | 'created_at' | 'updated_at'>): Promise<ProductFeature> {
    const { data: feature, error } = await this.supabase
      .from('product_features')
      .insert({ ...data, project_id: projectId })
      .select()
      .single();

    if (error) this.handleError(error, 'addFeature');
    return feature;
  }

  async updateFeature(id: string, data: Partial<Omit<ProductFeature, 'id' | 'created_at' | 'updated_at'>>): Promise<ProductFeature> {
    const { data: feature, error } = await this.supabase
      .from('product_features')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) this.handleError(error, 'updateFeature');
    return feature;
  }

  async deleteFeature(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('product_features')
      .delete()
      .eq('id', id);

    if (error) this.handleError(error, 'deleteFeature');
  }

  // === Journey Stages ===
  async getJourneyStages(projectId: string): Promise<ProductJourneyStage[]> {
    const { data, error } = await this.supabase
      .from('product_journey_stages')
      .select('*')
      .eq('project_id', projectId);

    if (error) this.handleError(error, 'getJourneyStages');
    return data || [];
  }

  async addJourneyStage(projectId: string, data: Omit<ProductJourneyStage, 'id' | 'created_at' | 'updated_at'>): Promise<ProductJourneyStage> {
    const { data: stage, error } = await this.supabase
      .from('product_journey_stages')
      .insert({ ...data, project_id: projectId })
      .select()
      .single();

    if (error) this.handleError(error, 'addJourneyStage');
    return stage;
  }

  async updateJourneyStage(id: string, data: Partial<Omit<ProductJourneyStage, 'id' | 'created_at' | 'updated_at'>>): Promise<ProductJourneyStage> {
    const { data: stage, error } = await this.supabase
      .from('product_journey_stages')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) this.handleError(error, 'updateJourneyStage');
    return stage;
  }

  async deleteJourneyStage(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('product_journey_stages')
      .delete()
      .eq('id', id);

    if (error) this.handleError(error, 'deleteJourneyStage');
  }

  // === Journey Actions ===
  async getJourneyActions(projectId: string): Promise<ProductJourneyAction[]> {
    const { data, error } = await this.supabase
      .from('product_journey_actions')
      .select('*')
      .eq('project_id', projectId);

    if (error) this.handleError(error, 'getJourneyActions');
    return data || [];
  }

  async addJourneyAction(projectId: string, data: Omit<ProductJourneyAction, 'id' | 'created_at' | 'updated_at'>): Promise<ProductJourneyAction> {
    const { data: action, error } = await this.supabase
      .from('product_journey_actions')
      .insert({ ...data, project_id: projectId })
      .select()
      .single();

    if (error) this.handleError(error, 'addJourneyAction');
    return action;
  }

  async updateJourneyAction(id: string, data: Partial<Omit<ProductJourneyAction, 'id' | 'created_at' | 'updated_at'>>): Promise<ProductJourneyAction> {
    const { data: action, error } = await this.supabase
      .from('product_journey_actions')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) this.handleError(error, 'updateJourneyAction');
    return action;
  }

  async deleteJourneyAction(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('product_journey_actions')
      .delete()
      .eq('id', id);

    if (error) this.handleError(error, 'deleteJourneyAction');
  }

  // === Journey Pain Points ===
  async getJourneyPainPoints(projectId: string): Promise<ProductJourneyPainPoint[]> {
    const { data, error } = await this.supabase
      .from('product_journey_pain_points')
      .select('*')
      .eq('project_id', projectId);

    if (error) this.handleError(error, 'getJourneyPainPoints');
    return data || [];
  }

  async addJourneyPainPoint(projectId: string, data: Omit<ProductJourneyPainPoint, 'id' | 'created_at' | 'updated_at'>): Promise<ProductJourneyPainPoint> {
    const { data: painPoint, error } = await this.supabase
      .from('product_journey_pain_points')
      .insert({ ...data, project_id: projectId })
      .select()
      .single();

    if (error) this.handleError(error, 'addJourneyPainPoint');
    return painPoint;
  }

  async updateJourneyPainPoint(id: string, data: Partial<Omit<ProductJourneyPainPoint, 'id' | 'created_at' | 'updated_at'>>): Promise<ProductJourneyPainPoint> {
    const { data: painPoint, error } = await this.supabase
      .from('product_journey_pain_points')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) this.handleError(error, 'updateJourneyPainPoint');
    return painPoint;
  }

  async deleteJourneyPainPoint(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('product_journey_pain_points')
      .delete()
      .eq('id', id);

    if (error) this.handleError(error, 'deleteJourneyPainPoint');
  }

  // === Batch Operations ===
  async getAllProductDesignData(projectId: string): Promise<ProductDesignData> {
    const [wireframes, features, stages, actions, painPoints] = await Promise.all([
      this.getWireframes(projectId),
      this.getFeatures(projectId),
      this.getJourneyStages(projectId),
      this.getJourneyActions(projectId),
      this.getJourneyPainPoints(projectId)
    ]);

    return {
      wireframes,
      features,
      journey: {
        stages,
        actions,
        painPoints
      }
    };
  }
} 