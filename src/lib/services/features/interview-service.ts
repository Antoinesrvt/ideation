import { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import type { 
  MarketInterview,
  InterviewTemplate,
  InterviewInsight,
  InterviewQuestion,
  Insert,
  Update
} from '@/store/types';
import type { Database } from '@/types/database';
import { 
  serializeTemplateQuestions, 
  deserializeTemplateQuestions,
  RuntimeTemplate,
  SerializedTemplate,
  Question,
  sanitizeQuestions
} from '@/lib/utils/interview-utils';

export interface InterviewData {
  interviews: MarketInterview[];
  templates: RuntimeTemplate[];
  insights: InterviewInsight[];
  questions: InterviewQuestion[];
}

export class InterviewService {
  constructor(private supabase: SupabaseClient<Database>) {}

  private handleError(error: PostgrestError | Error, operation: string): never {
    // Check if it's a PostgrestError
    if ('code' in error) {
      // This is a Postgrest Error object
      const pgError = error as PostgrestError;
      
      // Handle specific PostgreSQL error codes
      switch (pgError.code) {
        case '42501':
          // Permission denied / RLS policy violation
          throw new Error(`${operation} failed: Permission denied - Row level security policy violation. You may not have access to this resource. (Code: ${pgError.code})`);
        
        case '23503':
          // Foreign key violation
          throw new Error(`${operation} failed: Related record not found. A referenced item might not exist or you don't have access to it. (Code: ${pgError.code})`);
          
        case '23505':
          // Unique constraint violation
          throw new Error(`${operation} failed: Duplicate record. A record with the same unique identifier already exists. (Code: ${pgError.code})`);
          
        case '42P01':
          // Table doesn't exist
          throw new Error(`${operation} failed: Table not found. The database might not be fully set up. (Code: ${pgError.code})`);
        
        default:
          throw new Error(`${operation} failed: ${pgError.message} (Code: ${pgError.code})`);
      }
    } else {
      // Regular JS Error
      throw new Error(`${operation} failed: ${error.message}`);
    }
  }

  // Check if required tables exist
  async checkTablesExist(): Promise<{ 
    interviewTemplatesExists: boolean, 
    interviewInsightsExists: boolean,
    interviewQuestionsExists: boolean,
    marketInterviewsExists: boolean 
  }> {
    try {
      // We'll do a simple query to check if each table exists
      // If the query doesn't throw an error, the table exists
      
      let interviewTemplatesExists = true;
      let interviewInsightsExists = true;
      let interviewQuestionsExists = true;
      let marketInterviewsExists = true;
      
      try {
        await this.supabase.from('interview_templates').select('id').limit(1);
      } catch (error) {
        interviewTemplatesExists = false;
      }
      
      try {
        await this.supabase.from('interview_insights').select('id').limit(1);
      } catch (error) {
        interviewInsightsExists = false;
      }
      
      try {
        await this.supabase.from('interview_questions').select('id').limit(1);
      } catch (error) {
        interviewQuestionsExists = false;
      }
      
      try {
        await this.supabase.from('market_interviews').select('id').limit(1);
      } catch (error) {
        marketInterviewsExists = false;
      }
      
      return {
        interviewTemplatesExists,
        interviewInsightsExists,
        interviewQuestionsExists,
        marketInterviewsExists
      };
    } catch (error) {
      console.warn('Could not check table existence, assuming tables exist:', error);
      // Default to assuming tables exist to avoid blocking functionality
      return {
        interviewTemplatesExists: true,
        interviewInsightsExists: true,
        interviewQuestionsExists: true,
        marketInterviewsExists: true
      };
    }
  }

  // === Templates ===
  async getTemplates(projectId: string): Promise<RuntimeTemplate[]> {
    const { data, error } = await this.supabase
      .from('interview_templates')
      .select('*')
      .eq('project_id', projectId);

    if (error) this.handleError(error, 'getTemplates');
    
    // Deserialize the questions in each template
    return (data || []).map(template => deserializeTemplateQuestions(template as SerializedTemplate));
  }

  async getTemplate(id: string): Promise<RuntimeTemplate> {
    const { data, error } = await this.supabase
      .from('interview_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) this.handleError(error, 'getTemplate');
    
    // Deserialize the questions
    return deserializeTemplateQuestions(data as SerializedTemplate);
  }

  async addTemplate(projectId: string, data: Insert<'interview_templates'>): Promise<RuntimeTemplate> {
    try {
      // First check if the user has access to the project
      const { data: projectData, error: projectError } = await this.supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .single();
        
      if (projectError) {
        console.error('Error verifying project access:', projectError);
        throw new Error(`projectAccess failed: ${projectError.message} (Code: ${projectError.code})`);
      }
      
      if (!projectData) {
        throw new Error(`Project not found or no access: ${projectId}`);
      }
      
      // Clean and serialize questions for storage
      let formattedData: any = { ...data };
      
      if (formattedData.questions) {
        // If questions is an array, sanitize and serialize it
        if (Array.isArray(formattedData.questions)) {
          const sanitizedQuestions = sanitizeQuestions(formattedData.questions as Question[]);
          formattedData = serializeTemplateQuestions({
            ...formattedData,
            questions: sanitizedQuestions
          });
        } 
        // If questions is already a string, keep it as is
        else if (typeof formattedData.questions !== 'string') {
          // Handle any other case by converting to empty array
          formattedData = serializeTemplateQuestions({
            ...formattedData,
            questions: []
          });
        }
      } else {
        // No questions provided, set to empty array
        formattedData = serializeTemplateQuestions({
          ...formattedData,
          questions: []
        });
      }
      
      const { data: template, error } = await this.supabase
        .from('interview_templates')
        .insert(formattedData)
        .select()
        .single();
        
      if (error) {
        throw this.handleError(error, 'addTemplate');
      }
      
      // Deserialize for return
      return deserializeTemplateQuestions(template as SerializedTemplate);
    } catch (error) {
      throw this.handleError(error as Error, 'addTemplate');
    }
  }

  async updateTemplate(id: string, data: Update<'interview_templates'>): Promise<RuntimeTemplate> {
    try {
      // First fetch the template to get its project_id
      const { data: existingTemplate, error: fetchError } = await this.supabase
        .from('interview_templates')
        .select('project_id')
        .eq('id', id)
        .single();
        
      if (fetchError) {
        console.error('Error fetching template:', fetchError);
        throw new Error(`Template fetch failed: ${fetchError.message} (Code: ${fetchError.code})`);
      }
      
      if (!existingTemplate) {
        throw new Error(`Template not found: ${id}`);
      }
      
      // Verify project access
      const { data: projectData, error: projectError } = await this.supabase
        .from('projects')
        .select('id')
        .eq('id', existingTemplate.project_id)
        .single();
        
      if (projectError) {
        console.error('Error verifying project access:', projectError);
        throw new Error(`projectAccess failed: ${projectError.message} (Code: ${projectError.code})`);
      }
      
      if (!projectData) {
        throw new Error(`Project not found or no access: ${existingTemplate.project_id}`);
      }
      
      // Clean and serialize questions for storage
      let formattedData: any = { ...data };
      
      if (formattedData.questions) {
        // If questions is an array, sanitize and serialize it
        if (Array.isArray(formattedData.questions)) {
          const sanitizedQuestions = sanitizeQuestions(formattedData.questions as Question[]);
          formattedData = serializeTemplateQuestions({
            ...formattedData,
            questions: sanitizedQuestions
          });
        } 
        // If questions is already a string, keep it as is
        else if (typeof formattedData.questions !== 'string') {
          // Handle any other case by converting to empty array
          formattedData = serializeTemplateQuestions({
            ...formattedData,
            questions: []
          });
        }
      }
      
      const { data: template, error } = await this.supabase
        .from('interview_templates')
        .update(formattedData)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        throw this.handleError(error, 'updateTemplate');
      }
      
      // Deserialize for return
      return deserializeTemplateQuestions(template as SerializedTemplate);
    } catch (error) {
      throw this.handleError(error as Error, 'updateTemplate');
    }
  }

  async deleteTemplate(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('interview_templates')
      .delete()
      .eq('id', id);

    if (error) this.handleError(error, 'deleteTemplate');
  }

  // === Insights ===
  async getInsights(projectId: string): Promise<InterviewInsight[]> {
    const { data, error } = await this.supabase
      .from('interview_insights')
      .select('*')
      .eq('project_id', projectId);

    if (error) this.handleError(error, 'getInsights');
    return data || [];
  }

  async getInsightsForInterview(interviewId: string): Promise<InterviewInsight[]> {
    const { data, error } = await this.supabase
      .from('interview_insights')
      .select('*')
      .eq('interview_id', interviewId);

    if (error) this.handleError(error, 'getInsightsForInterview');
    return data || [];
  }

  async addInsight(interviewId: string, projectId: string, data: Insert<'interview_insights'>): Promise<InterviewInsight> {
    const { data: insight, error } = await this.supabase
      .from('interview_insights')
      .insert({ ...data, interview_id: interviewId, project_id: projectId })
      .select()
      .single();

    if (error) this.handleError(error, 'addInsight');
    return insight;
  }

  async updateInsight(id: string, data: Update<'interview_insights'>): Promise<InterviewInsight> {
    const { data: insight, error } = await this.supabase
      .from('interview_insights')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) this.handleError(error, 'updateInsight');
    return insight;
  }

  async deleteInsight(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('interview_insights')
      .delete()
      .eq('id', id);

    if (error) this.handleError(error, 'deleteInsight');
  }

  // === Questions ===
  async getQuestions(interviewId: string): Promise<InterviewQuestion[]> {
    const { data, error } = await this.supabase
      .from('interview_questions')
      .select('*')
      .eq('interview_id', interviewId)
      .order('question_order', { ascending: true });

    if (error) this.handleError(error, 'getQuestions');
    return data || [];
  }

  async addQuestion(interviewId: string, data: Insert<'interview_questions'>): Promise<InterviewQuestion> {
    const { data: question, error } = await this.supabase
      .from('interview_questions')
      .insert({ ...data, interview_id: interviewId })
      .select()
      .single();

    if (error) this.handleError(error, 'addQuestion');
    return question;
  }

  async updateQuestion(id: string, data: Update<'interview_questions'>): Promise<InterviewQuestion> {
    const { data: question, error } = await this.supabase
      .from('interview_questions')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) this.handleError(error, 'updateQuestion');
    return question;
  }

  async deleteQuestion(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('interview_questions')
      .delete()
      .eq('id', id);

    if (error) this.handleError(error, 'deleteQuestion');
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

  async getInterview(id: string): Promise<MarketInterview> {
    const { data, error } = await this.supabase
      .from('market_interviews')
      .select('*')
      .eq('id', id)
      .single();

    if (error) this.handleError(error, 'getInterview');
    return data;
  }

  async addInterview(projectId: string, data: Insert<'market_interviews'>): Promise<MarketInterview> {
    const { data: interview, error } = await this.supabase
      .from('market_interviews')
      .insert({ ...data, project_id: projectId, status: data.status || 'draft' })
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

  // === Audio/Transcript handling ===
  async uploadRecording(projectId: string, interviewId: string, file: File): Promise<string> {
    const filePath = `recordings/${projectId}/${interviewId}.${file.name.split('.').pop()}`;
    
    const { error: uploadError } = await this.supabase
      .storage
      .from('interview-recordings')
      .upload(filePath, file);

    if (uploadError) this.handleError(uploadError, 'uploadRecording');

    // Update the interview with the recording URL
    const { data: publicURL } = this.supabase
      .storage
      .from('interview-recordings')
      .getPublicUrl(filePath);

    await this.updateInterview(interviewId, { recording_url: publicURL.publicUrl });
    
    return publicURL.publicUrl;
  }

  async updateTranscript(interviewId: string, transcript: string): Promise<MarketInterview> {
    return this.updateInterview(interviewId, { transcript, status: 'conducted' });
  }

  async updateAnalysis(interviewId: string, analysis: any, sentiment: 'positive' | 'negative' | 'neutral'): Promise<MarketInterview> {
    return this.updateInterview(interviewId, { 
      analysis, 
      sentiment, 
      status: 'analyzed' 
    });
  }

  // === Batch Operations ===
  async getAllInterviewData(projectId: string): Promise<InterviewData> {
    // First check if required tables exist
    const tablesExist = await this.checkTablesExist();
    
    // Initialize with empty arrays
    let interviews: MarketInterview[] = [];
    let templates: RuntimeTemplate[] = [];
    let insights: InterviewInsight[] = [];
    
    // Only query tables that exist
    const promises = [];
    
    if (tablesExist.marketInterviewsExists) {
      promises.push(this.getInterviews(projectId).then(data => interviews = data).catch(() => []));
    }
    
    if (tablesExist.interviewTemplatesExists) {
      promises.push(this.getTemplates(projectId).then(data => templates = data).catch(() => []));
    }
    
    if (tablesExist.interviewInsightsExists) {
      promises.push(this.getInsights(projectId).then(data => insights = data).catch(() => []));
    }
    
    // Run queries in parallel if any tables exist
    if (promises.length > 0) {
      await Promise.all(promises);
    }
    
    // Return the data, with empty arrays for tables that don't exist
    return {
      interviews,
      templates,
      insights,
      questions: [] // We don't fetch questions in bulk
    };
  }
} 