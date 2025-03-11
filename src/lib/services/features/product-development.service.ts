import { SupabaseClient } from '@supabase/supabase-js';
import { 
  Insert, 
  Update, 
  ProductProblem, 
  ProductSolution, 
  ProductEvidence, 
  ProductEvidenceLink, 
  ProductMVP, 
  ProductMVPFeature 
} from '@/store/types';

export class ProductDevelopmentService {
  constructor(private readonly supabase: SupabaseClient) {}

  // ========= Problems =========
  async getProblems(projectId: string): Promise<ProductProblem[]> {
    const { data, error } = await this.supabase
      .from('product_problems')
      .select('*')
      .eq('project_id', projectId);

    if (error) {
      throw error;
    }

    return data || [];
  }

  async createProblem(problem: Insert<'product_problems'>): Promise<ProductProblem> {
    const { data, error } = await this.supabase
      .from('product_problems')
      .insert(problem)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async updateProblem(id: string, updates: Update<'product_problems'>): Promise<ProductProblem> {
    const { data, error } = await this.supabase
      .from('product_problems')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async deleteProblem(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('product_problems')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }

  // ========= Solutions =========
  async getSolutions(projectId: string): Promise<ProductSolution[]> {
    const { data, error } = await this.supabase
      .from('product_solutions')
      .select('*')
      .eq('project_id', projectId);

    if (error) {
      throw error;
    }

    return data || [];
  }

  async createSolution(solution: Insert<'product_solutions'>): Promise<ProductSolution> {
    const { data, error } = await this.supabase
      .from('product_solutions')
      .insert(solution)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async updateSolution(id: string, updates: Update<'product_solutions'>): Promise<ProductSolution> {
    const { data, error } = await this.supabase
      .from('product_solutions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async deleteSolution(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('product_solutions')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }

  // ========= Evidence =========
  async getEvidence(projectId: string): Promise<ProductEvidence[]> {
    const { data, error } = await this.supabase
      .from('product_evidence')
      .select('*')
      .eq('project_id', projectId);

    if (error) {
      throw error;
    }

    return data || [];
  }

  async createEvidence(evidence: Insert<'product_evidence'>): Promise<ProductEvidence> {
    const { data, error } = await this.supabase
      .from('product_evidence')
      .insert(evidence)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async updateEvidence(id: string, updates: Update<'product_evidence'>): Promise<ProductEvidence> {
    const { data, error } = await this.supabase
      .from('product_evidence')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async deleteEvidence(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('product_evidence')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }

  // ========= Evidence Links =========
  async getEvidenceLinks(): Promise<ProductEvidenceLink[]> {
    const { data, error } = await this.supabase
      .from('product_evidence_links')
      .select('*');

    if (error) {
      throw error;
    }

    return data || [];
  }

  async createEvidenceLink(link: Insert<'product_evidence_links'>): Promise<ProductEvidenceLink> {
    const { data, error } = await this.supabase
      .from('product_evidence_links')
      .insert(link)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async updateEvidenceLink(id: string, updates: Update<'product_evidence_links'>): Promise<ProductEvidenceLink> {
    const { data, error } = await this.supabase
      .from('product_evidence_links')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async deleteEvidenceLink(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('product_evidence_links')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }

  // ========= MVPs =========
  async getMVPs(projectId: string): Promise<ProductMVP[]> {
    const { data, error } = await this.supabase
      .from('product_mvps')
      .select('*')
      .eq('project_id', projectId);

    if (error) {
      throw error;
    }

    return data || [];
  }

  async createMVP(mvp: Insert<'product_mvps'>): Promise<ProductMVP> {
    const { data, error } = await this.supabase
      .from('product_mvps')
      .insert(mvp)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async updateMVP(id: string, updates: Update<'product_mvps'>): Promise<ProductMVP> {
    const { data, error } = await this.supabase
      .from('product_mvps')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async deleteMVP(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('product_mvps')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }

  // ========= MVP Features =========
  async getMVPFeatures(): Promise<ProductMVPFeature[]> {
    const { data, error } = await this.supabase
      .from('product_mvp_features')
      .select('*');

    if (error) {
      throw error;
    }

    return data || [];
  }

  async createMVPFeature(feature: Insert<'product_mvp_features'>): Promise<ProductMVPFeature> {
    const { data, error } = await this.supabase
      .from('product_mvp_features')
      .insert(feature)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async updateMVPFeature(id: string, updates: Update<'product_mvp_features'>): Promise<ProductMVPFeature> {
    const { data, error } = await this.supabase
      .from('product_mvp_features')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async deleteMVPFeature(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('product_mvp_features')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }

  // ========= Batch Operations =========
  async fetchAllData(projectId: string): Promise<{
    problems: ProductProblem[],
    solutions: ProductSolution[],
    evidence: ProductEvidence[],
    evidenceLinks: ProductEvidenceLink[],
    mvps: ProductMVP[],
    mvpFeatures: ProductMVPFeature[]
  }> {
    const [problems, solutions, evidence, evidenceLinks, mvps, mvpFeatures] = await Promise.all([
      this.getProblems(projectId),
      this.getSolutions(projectId),
      this.getEvidence(projectId),
      this.getEvidenceLinks(),
      this.getMVPs(projectId),
      this.getMVPFeatures()
    ]);

    return {
      problems,
      solutions,
      evidence,
      evidenceLinks,
      mvps,
      mvpFeatures
    };
  }
} 