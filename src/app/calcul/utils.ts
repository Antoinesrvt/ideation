import { BudgetParams, DepensesData, RecettesData } from "./types";

 export const formatNumber = (num: number): string => {
   return new Intl.NumberFormat("fr-FR").format(Math.round(num));
 };

 export const calculRecettes = (params: BudgetParams): RecettesData => {
   const pib = 2500; // PIB français approximatif en milliards €
   const tva = (pib * 0.5 * params.tvaRate) / 100;
   const ir = (pib * 0.7 * params.irRate) / 100;
   const is = (pib * 0.4 * params.isRate) / 100;
   const isEntreprises = (pib * 0.3 * params.isEntreprises) / 100;

   return {
     tva,
     ir,
     is,
     isEntreprises,
     ticpe: params.ticpe,
     droitsSuccession: params.droitsSuccession,
     autresRecettes: params.autresRecettes,
     total:
       tva +
       ir +
       is +
       isEntreprises +
       params.ticpe +
       params.droitsSuccession +
       params.autresRecettes,
   };
 };

 export const calculDepenses = (params: BudgetParams): DepensesData => {
   return {
     retraites: params.retraites,
     sante: params.sante,
     education: params.education,
     defense: params.defense,
     services: params.services,
     interetsDette: params.interetsDette,
     securite: params.securite,
     recherche: params.recherche,
     justice: params.justice,
     culture: params.culture,
     ecologie: params.ecologie,
     total: Object.values(params).reduce((acc, val) => acc + val, 0),
   };
 };