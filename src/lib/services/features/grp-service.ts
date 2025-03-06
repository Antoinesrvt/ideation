import { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import type { 
  GrpCategory,
  GrpSection,
  GrpItem
} from '@/store/types';

export interface GRPModel {
  generation: {
    porteurs: GrpItem[];
    propositionValeur: GrpItem[];
    fabricationValeur: GrpItem[];
  };
  remuneration: {
    sourcesRevenus: GrpItem[];
    volumeRevenus: GrpItem[];
    performance: GrpItem[];
  };
  partage: {
    partiesPrenantes: GrpItem[];
    conventions: GrpItem[];
    ecosysteme: GrpItem[];
  };
}

export type GRPCategory = keyof GRPModel;
export type GRPSection<T extends GRPCategory> = keyof GRPModel[T];

export class GRPService {
  constructor(private supabase: SupabaseClient) {}

  protected handleError(error: PostgrestError | Error, context: string = ''): never {
    const errorMessage = error instanceof PostgrestError 
      ? `Database error: ${error.details} (${error.code})`
      : error.message;
    
    console.error(`GRP Service Error (${context}):`, errorMessage);
    throw new Error(errorMessage);
  }

  private getSectionId(category: GRPCategory, section: string): string {
    // Convert camelCase to snake_case for database
    const sectionType = section.replace(/([A-Z])/g, '_$1').toLowerCase();
    return `${category}_${sectionType}`;
  }

  // === Categories ===
  async getCategories(projectId: string): Promise<GrpCategory[]> {
    try {
      const { data, error } = await this.supabase
        .from('grp_categories')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) this.handleError(error, 'getCategories');
      return data || [];
    } catch (error) {
      this.handleError(error as Error, 'getCategories');
    }
  }

  // === Sections ===
  async getSections(projectId: string, categoryId: string): Promise<GrpSection[]> {
    try {
      const { data, error } = await this.supabase
        .from('grp_sections')
        .select('*')
        .eq('project_id', projectId)
        .eq('category_id', categoryId)
        .order('created_at', { ascending: false });

      if (error) this.handleError(error, 'getSections');
      return data || [];
    } catch (error) {
      this.handleError(error as Error, 'getSections');
    }
  }

  // === Items ===
  async getItems(projectId: string, sectionId: string): Promise<GrpItem[]> {
    try {
      const { data, error } = await this.supabase
        .from('grp_items')
        .select('*')
        .eq('project_id', projectId)
        .eq('section_id', sectionId)
        .order('order_index', { ascending: true });

      if (error) this.handleError(error, 'getItems');
      return data || [];
    } catch (error) {
      this.handleError(error as Error, 'getItems');
    }
  }

  async addItem(
    projectId: string, 
    category: GRPCategory,
    section: string,
    data: Omit<GrpItem, 'id' | 'created_at' | 'updated_at' | 'section_id' | 'project_id'>
  ): Promise<GrpItem> {
    try {
      const sectionId = this.getSectionId(category, section);
      const { data: item, error } = await this.supabase
        .from('grp_items')
        .insert({
          ...data,
          project_id: projectId,
          section_id: sectionId
        })
        .select()
        .single();

      if (error) this.handleError(error, 'addItem');
      return item;
    } catch (error) {
      this.handleError(error as Error, 'addItem');
    }
  }

  async updateItem(
    id: string,
    data: Partial<Omit<GrpItem, 'id' | 'created_at' | 'updated_at' | 'section_id' | 'project_id'>>
  ): Promise<GrpItem> {
    try {
      const { data: item, error } = await this.supabase
        .from('grp_items')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) this.handleError(error, 'updateItem');
      return item;
    } catch (error) {
      this.handleError(error as Error, 'updateItem');
    }
  }

  async deleteItem(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('grp_items')
        .delete()
        .eq('id', id);

      if (error) this.handleError(error, 'deleteItem');
    } catch (error) {
      this.handleError(error as Error, 'deleteItem');
    }
  }

  // === Batch Operations ===
  async getAllGRPData(projectId: string): Promise<GRPModel> {
    try {
      // Get all items for the project
      const { data: items, error } = await this.supabase
        .from('grp_items')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });

      if (error) this.handleError(error, 'getAllGRPData');

      // Initialize empty GRP model
      const model: GRPModel = {
        generation: {
          porteurs: [],
          propositionValeur: [],
          fabricationValeur: []
        },
        remuneration: {
          sourcesRevenus: [],
          volumeRevenus: [],
          performance: []
        },
        partage: {
          partiesPrenantes: [],
          conventions: [],
          ecosysteme: []
        }
      };

      // Organize items into their respective sections
      items?.forEach(item => {
        const [category, ...sectionParts] = item.section_id.split('_');
        const section = sectionParts
          .map((part: string, index: number) => index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1))
          .join('');

        if (category in model && section in model[category as keyof GRPModel]) {
          (model[category as keyof GRPModel] as any)[section].push(item);
        }
      });

      return model;
    } catch (error) {
      this.handleError(error as Error, 'getAllGRPData');
    }
  }
} 