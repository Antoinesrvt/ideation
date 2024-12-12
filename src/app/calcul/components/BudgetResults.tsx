 import React from "react";
 import { formatNumber } from "../utils";

 interface BudgetResultsProps {
   recettes: number;
   depenses: number;
   solde: number;
 }

 export const BudgetResults: React.FC<BudgetResultsProps> = ({
   recettes,
   depenses,
   solde,
 }) => {
   return (
     <div className="grid grid-cols-3 gap-4 p-4 bg-gray-100 rounded-lg">
       <div>
         <div className="text-sm font-medium">Recettes totales</div>
         <div className="text-xl font-bold text-green-600">
           {formatNumber(recettes)} M€
         </div>
       </div>
       <div>
         <div className="text-sm font-medium">Dépenses totales</div>
         <div className="text-xl font-bold text-red-600">
           {formatNumber(depenses)} M€
         </div>
       </div>
       <div>
         <div className="text-sm font-medium">Solde budgétaire</div>
         <div
           className={`text-xl font-bold ${
             solde >= 0 ? "text-green-600" : "text-red-600"
           }`}
         >
           {formatNumber(solde)} M€
         </div>
       </div>
     </div>
   );
 };