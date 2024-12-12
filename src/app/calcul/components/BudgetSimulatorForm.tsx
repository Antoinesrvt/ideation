 import React from "react";
 import { BudgetSlider } from "./BudgetSlider";
 import { BudgetParams, RecettesData } from "../types";
 import { formatNumber } from "../utils";

 interface BudgetSimulatorFormProps {
   params: BudgetParams;
   recettes: RecettesData;
   onParamChange: (key: keyof BudgetParams, value: number[]) => void;
 }

 export const BudgetSimulatorForm: React.FC<BudgetSimulatorFormProps> = ({
   params,
   recettes,
   onParamChange,
 }) => {
   return (
     <div className="grid grid-cols-2 gap-8">
       {/* Colonne des recettes */}
       <div className="space-y-6">
         <h3 className="text-lg font-semibold">Recettes</h3>

         <BudgetSlider
           label="TVA"
           value={params.tvaRate}
           min={5}
           max={30}
           step={0.5}
           onChange={(value) => onParamChange("tvaRate", value)}
           formatValue={(value) => formatNumber(recettes.tva)}
           unit="%"
         />

         <BudgetSlider
           label="Impôt sur le revenu"
           value={params.irRate}
           min={5}
           max={25}
           step={0.5}
           onChange={(value) => onParamChange("irRate", value)}
           formatValue={(value) => formatNumber(recettes.ir)}
           unit="%"
         />

         {/* Add other revenue sliders... */}
       </div>

       {/* Colonne des dépenses */}
       <div className="space-y-6">
         <h3 className="text-lg font-semibold">Dépenses</h3>

         <BudgetSlider
           label="Retraites"
           value={params.retraites}
           min={200}
           max={400}
           step={1}
           onChange={(value) => onParamChange("retraites", value)}
           formatValue={(value) => formatNumber(value * 1000)}
           unit=" Mrd€"
         />

         {/* Add other expense sliders... */}
       </div>
     </div>
   );
 };