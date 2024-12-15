 import React from "react";
 import {
   BarChart,
   Bar,
   XAxis,
   YAxis,
   Tooltip,
   ResponsiveContainer,
   Legend,
 } from "recharts";
 import { ComparisonDataItem } from "../types";
 import { formatNumber } from "../utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

 interface ComparisonChartProps {
   data: ComparisonDataItem[];
   donneesReelles: {
     recettes: { total: number };
     depenses: { total: number };
   };
   recettes: { total: number };
   depenses: { total: number };
 }

 export const ComparisonChart: React.FC<ComparisonChartProps> = ({
   data,
   donneesReelles,
   recettes,
   depenses,
 }) => {
   return (
         <>
           <div className="h-96">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={data}>
                 <XAxis dataKey="name" />
                 <YAxis />
                 <Tooltip />
                 <Legend />
                 <Bar dataKey="simulation" fill="#4ade80" name="Simulation" />
                 <Bar dataKey="reel" fill="#60a5fa" name="Réel (2023)" />
               </BarChart>
             </ResponsiveContainer>
           </div>
           <div className="mt-4 p-4 bg-gray-100 rounded-lg">
             <h4 className="font-semibold mb-2">Écarts avec la réalité</h4>
             <p>
               Recettes:{" "}
               {formatNumber(recettes.total - donneesReelles.recettes.total)} M€
             </p>
             <p>
               Dépenses:{" "}
               {formatNumber(depenses.total - donneesReelles.depenses.total)} M€
             </p>
           </div>
         </>
   );
 };