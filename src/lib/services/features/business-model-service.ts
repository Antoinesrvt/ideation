import { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import type { 
  CanvasSection,
  CanvasItem,
  Insert,
  Update
} from '@/store/types';
import type { Database } from '@/types/database';


export interface BusinessModelCanvas {
  keyPartners: CanvasItem[];
  keyActivities: CanvasItem[];
  keyResources: CanvasItem[];
  valuePropositions: CanvasItem[];
  customerRelationships: CanvasItem[];
  channels: CanvasItem[];
  customerSegments: CanvasItem[];
  costStructure: CanvasItem[];
  revenueStreams: CanvasItem[];
}

export type CanvasSectionKey = keyof BusinessModelCanvas;

export interface BusinessModelData {
  sections: CanvasSection[];
  items: CanvasItem[];
}

export class BusinessModelService {
  constructor(private supabase: SupabaseClient) {}

  protected handleError(error: PostgrestError | Error, context: string = ''): never {
    const errorMessage = error instanceof PostgrestError 
      ? `Database error: ${error.details} (${error.code})`
      : error.message;
    
    console.error(`Business Model Service Error (${context}):`, errorMessage);
    throw new Error(errorMessage);
  }

  private getSectionId(section: CanvasSectionKey): string {
    // Convert camelCase to snake_case for database
    return section.replace(/([A-Z])/g, '_$1').toLowerCase();
  }

  // === Canvas Sections ===
  async getCanvasSections(projectId: string): Promise<CanvasSection[]> {
    try {
      const { data, error } = await this.supabase
        .from('canvas_sections')
        .select('*')
        .eq('project_id', projectId)
        .order('position');

      if (error) this.handleError(error, 'getCanvasSections');
      return data || [];
    } catch (error) {
      this.handleError(error as Error, 'getCanvasSections');
    }
  }

  async addCanvasSection(projectId: string, data: Insert<'canvas_sections'>): Promise<CanvasSection> {
    try {
      const { data: section, error } = await this.supabase
        .from('canvas_sections')
        .insert({ ...data, project_id: projectId })
        .select()
        .single();
      
      if (error) this.handleError(error, 'addCanvasSection');
      return section;
    } catch (error) {
      this.handleError(error as Error, 'addCanvasSection');
    }
  }

  async updateCanvasSection(id: string, data: Update<'canvas_sections'>): Promise<CanvasSection> {
    try {
      const { data: section, error } = await this.supabase
        .from('canvas_sections')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) this.handleError(error, 'updateCanvasSection');
      return section;
    } catch (error) {
      this.handleError(error as Error, 'updateCanvasSection');
    }
  }

  async deleteCanvasSection(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('canvas_sections')
        .delete()
        .eq('id', id);
      
      if (error) this.handleError(error, 'deleteCanvasSection');
    } catch (error) {
      this.handleError(error as Error, 'deleteCanvasSection');
    }
  }

  // === Canvas Items ===
  async getCanvasItems(projectId: string): Promise<CanvasItem[]> {
    try {
      const { data, error } = await this.supabase
        .from('canvas_items')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) this.handleError(error, 'getCanvasItems');
      return data || [];
    } catch (error) {
      this.handleError(error as Error, 'getCanvasItems');
    }
  }

  async addCanvasItem(projectId: string, data: Insert<'canvas_items'>): Promise<CanvasItem> {
    try {
      const { data: item, error } = await this.supabase
        .from('canvas_items')
        .insert({ ...data, project_id: projectId })
        .select()
        .single();
      
      if (error) this.handleError(error, 'addCanvasItem');
      return item;
    } catch (error) {
      this.handleError(error as Error, 'addCanvasItem');
    }
  }

  async updateCanvasItem(id: string, data: Update<'canvas_items'>): Promise<CanvasItem> {
    try {
      const { data: item, error } = await this.supabase
        .from('canvas_items')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) this.handleError(error, 'updateCanvasItem');
      return item;
    } catch (error) {
      this.handleError(error as Error, 'updateCanvasItem');
    }
  }

  async deleteCanvasItem(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('canvas_items')
        .delete()
        .eq('id', id);
      
      if (error) this.handleError(error, 'deleteCanvasItem');
    } catch (error) {
      this.handleError(error as Error, 'deleteCanvasItem');
    }
  }

  // === Batch Operations ===
  async getAllBusinessModelData(projectId: string): Promise<BusinessModelData> {
    try {
      const [sections, items] = await Promise.all([
        this.getCanvasSections(projectId),
        this.getCanvasItems(projectId)
      ]);

      return {
        sections,
        items
      };
    } catch (error) {
      this.handleError(error as Error, 'getAllBusinessModelData');
    }
  }
} 