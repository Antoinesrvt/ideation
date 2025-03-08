import { createClient } from '@/lib/supabase/client';
import { ProductDesignService } from './features/product-design-service';
import { BusinessModelService } from './features/business-model-service';
import { ProjectService } from './core/project-service';
import { GRPService } from './features/grp-service';
import { MarketAnalysisService } from './features/market-analysis-service';
import { ValidationService } from './features/validation-service';
import { FinancialsService } from './features/financials-service';
import { TeamService } from './features/team-service';
import { DocumentService } from './document/document-service';
import { apiClient } from '@/services/api/client';
import { DocumentService as ApiDocumentService } from '@/services/api/document.service';

// Create a single Supabase client to be shared across all services
const supabaseClient = createClient();

// Create singleton instances of all services
export const productDesignService = new ProductDesignService(supabaseClient);
export const businessModelService = new BusinessModelService(supabaseClient);
export const projectService = new ProjectService(supabaseClient);
export const grpService = new GRPService(supabaseClient);
export const marketAnalysisService = new MarketAnalysisService(supabaseClient);
export const validationService = new ValidationService(supabaseClient);
export const financialsService = new FinancialsService(supabaseClient);
export const teamService = new TeamService(supabaseClient);
export const documentService = new DocumentService(supabaseClient);

// For API-based services
export const apiDocumentService = new ApiDocumentService(); 