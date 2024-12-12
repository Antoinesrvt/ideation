import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

export const BudgetExplanations: React.FC = () => {
  return (
     <Card>
       <CardHeader>
         <CardTitle>Explications des calculs</CardTitle>
       </CardHeader>
       <CardContent className="space-y-4">
         <div>
           <h4 className="font-semibold mb-2">Calcul des recettes</h4>
           <p className="text-sm">
             Les recettes sont calculées sur la base du PIB français (environ
             2500 milliards €) :
           </p>
           <ul className="list-disc pl-6 text-sm space-y-2 mt-2">
             <li>TVA : calculée sur 50% du PIB (consommation finale)</li>
             <li>
               Impôt sur le revenu : calculé sur 70% du PIB (masse salariale)
             </li>
             <li>
               Impôt sur les sociétés : calculé sur 30% du PIB (bénéfices)
             </li>
             <li>TICPE et autres taxes : montants fixes ajustables</li>
           </ul>
         </div>

         <div>
           <h4 className="font-semibold mb-2">Calcul des dépenses</h4>
           <p className="text-sm">
             Les dépenses sont basées sur les grands postes budgétaires de
             l'État :
           </p>
           <ul className="list-disc pl-6 text-sm space-y-2 mt-2">
             <li>
               Protection sociale (retraites, santé) : environ 50% du budget
             </li>
             <li>Éducation : environ 20% du budget</li>
             <li>
               Services régaliens (défense, sécurité) : environ 10% du budget
             </li>
             <li>Dette et intérêts : environ 5% du budget</li>
             <li>
               Autres dépenses (culture, recherche, etc.) : reste du budget
             </li>
           </ul>
         </div>

         <div>
           <h4 className="font-semibold mb-2">Limitations du modèle</h4>
           <p className="text-sm">
             Ce simulateur est une simplification du budget de l'État :
           </p>
           <ul className="list-disc pl-6 text-sm space-y-2 mt-2">
             <li>
               Les interactions entre paramètres ne sont pas modélisées (ex:
               impact d'une hausse de TVA sur la consommation)
             </li>
             <li>Certaines recettes et dépenses sont simplifiées ou omises</li>
             <li>
               Les données réelles peuvent varier selon les années et les
               méthodes de calcul
             </li>
             <li>
               Le modèle ne prend pas en compte les effets macroéconomiques des
               changements de politique fiscale
             </li>
           </ul>
         </div>

         <div>
           <h4 className="font-semibold mb-2">Sources des données</h4>
           <p className="text-sm">Les données réelles sont basées sur :</p>
           <ul className="list-disc pl-6 text-sm space-y-2 mt-2">
             <li>Loi de finances 2023</li>
             <li>Rapports de la Cour des comptes</li>
             <li>Documentation budgétaire du ministère des Finances</li>
           </ul>
         </div>
       </CardContent>
     </Card>
   );
 };