 export interface BudgetParams {
   // Recettes
   tvaRate: number;
   irRate: number;
   isRate: number;
   isEntreprises: number;
   ticpe: number;
   droitsSuccession: number;
   autresRecettes: number;

   // Dépenses
   retraites: number;
   sante: number;
   education: number;
   defense: number;
   services: number;
   interetsDette: number;
   securite: number;
   recherche: number;
   justice: number;
   culture: number;
   ecologie: number;
 }

 export interface RecettesData {
   tva: number;
   ir: number;
   is: number;
   isEntreprises: number;
   ticpe: number;
   droitsSuccession: number;
   autresRecettes: number;
   total: number;
 }

 export interface DepensesData {
   retraites: number;
   sante: number;
   education: number;
   defense: number;
   services: number;
   interetsDette: number;
   securite: number;
   recherche: number;
   justice: number;
   culture: number;
   ecologie: number;
   total: number;
 }

 export interface DonneesReelles {
   recettes: RecettesData;
   depenses: DepensesData;
 }

 export interface ComparisonDataItem {
   name: string;
   simulation: number;
   reel: number;
 }