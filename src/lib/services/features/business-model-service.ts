import { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import type { 
  CanvasSection,
  CanvasItem
} from '@/store/types';

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

  // === Sections ===
  async getSections(projectId: string): Promise<CanvasSection[]> {
    try {
      const { data, error } = await this.supabase
        .from('canvas_sections')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) this.handleError(error, 'getSections');
      return data || [];
    } catch (error) {
      this.handleError(error as Error, 'getSections');
    }
  }

  // === Items ===
  async getItems(projectId: string, sectionId: string): Promise<CanvasItem[]> {
    try {
      const { data, error } = await this.supabase
        .from('canvas_items')
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
    section: CanvasSectionKey,
    data: Omit<CanvasItem, 'id' | 'created_at' | 'updated_at' | 'section_id' | 'project_id'>
  ): Promise<CanvasItem> {
    try {
      const sectionId = this.getSectionId(section);
      const { data: item, error } = await this.supabase
        .from('canvas_items')
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
    data: Partial<Omit<CanvasItem, 'id' | 'created_at' | 'updated_at' | 'section_id' | 'project_id'>>
  ): Promise<CanvasItem> {
    try {
      const { data: item, error } = await this.supabase
        .from('canvas_items')
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
        .from('canvas_items')
        .delete()
        .eq('id', id);

      if (error) this.handleError(error, 'deleteItem');
    } catch (error) {
      this.handleError(error as Error, 'deleteItem');
    }
  }

  async moveItem(
    id: string,
    fromSection: CanvasSectionKey,
    toSection: CanvasSectionKey
  ): Promise<CanvasItem> {
    try {
      const toSectionId = this.getSectionId(toSection);
      const { data: item, error } = await this.supabase
        .from('canvas_items')
        .update({ section_id: toSectionId })
        .eq('id', id)
        .select()
        .single();

      if (error) this.handleError(error, 'moveItem');
      return item;
    } catch (error) {
      this.handleError(error as Error, 'moveItem');
    }
  }

  // === Batch Operations ===
  async getAllCanvasData(projectId: string): Promise<BusinessModelCanvas> {
    try {
      // Get all items for the project
      const { data: items, error } = await this.supabase
        .from('canvas_items')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });

      if (error) this.handleError(error, 'getAllCanvasData');

      // Initialize empty canvas
      const canvas: BusinessModelCanvas = {
        keyPartners: [],
        keyActivities: [],
        keyResources: [],
        valuePropositions: [],
        customerRelationships: [],
        channels: [],
        customerSegments: [],
        costStructure: [],
        revenueStreams: []
      };

      // Organize items into their respective sections
      items?.forEach(item => {
        const sectionId = item.section_id;
        const section = Object.keys(canvas).find(key => 
          this.getSectionId(key as CanvasSectionKey) === sectionId
        ) as keyof BusinessModelCanvas | undefined;

        if (section) {
          canvas[section].push(item);
        }
      });

      return canvas;
    } catch (error) {
      this.handleError(error as Error, 'getAllCanvasData');
    }
  }
} 