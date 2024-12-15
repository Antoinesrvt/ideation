"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BudgetParams, DonneesReelles, ComparisonDataItem } from "./types";
import { BudgetExplanations } from "./components/BudgetExplanations";
import { ComparisonChart } from "./components/ComparisonChart";
import { BudgetSimulatorForm } from "./components/BudgetSimulatorForm";
import { BudgetResults } from "./components/BudgetResults";
import { calculRecettes, calculDepenses } from "./utils";

const BudgetSimulator: React.FC = () => {
  const [params, setParams] = useState<BudgetParams>({
    // Recettes
    tvaRate: 20, // TVA en %
    irRate: 14, // Impôt sur le revenu moyen en %
    isRate: 27.5, // Impôts sociaux en %
    isEntreprises: 27.2, // Impôt sur les sociétés en %
    ticpe: 17.5, // TICPE (carburants) en milliards
    droitsSuccession: 12.5, // Droits de succession en milliards
    autresRecettes: 45, // Autres recettes en milliards

    // Dépenses
    retraites: 327, // en milliards €
    sante: 230, // en milliards €
    education: 110, // en milliards €
    defense: 50, // en milliards €
    services: 60, // Services publics en milliards €
    interetsDette: 51, // Intérêts de la dette en milliards €
    securite: 45, // Sécurité intérieure en milliards €
    recherche: 28, // Recherche en milliards €
    justice: 12, // Justice en milliards €
    culture: 15, // Culture en milliards €
    ecologie: 25, // Transition écologique en milliards €
  });

  const donneesReelles: DonneesReelles = {
    recettes: {
      tva: 185,
      ir: 90,
      is: 170,
      isEntreprises: 65,
      ticpe: 17.5,
      droitsSuccession: 12.5,
      autresRecettes: 45,
      total: 585,
    },
    depenses: {
      retraites: 327,
      sante: 230,
      education: 110,
      defense: 50,
      services: 60,
      interetsDette: 51,
      securite: 45,
      recherche: 28,
      justice: 12,
      culture: 15,
      ecologie: 25,
      total: 953,
    },
  };

  const recettes = calculRecettes(params);
  const depenses = calculDepenses(params);
  const solde = recettes.total - depenses.total;

  const comparaisonData: ComparisonDataItem[] = [
    {
      name: "Recettes",
      simulation: recettes.total,
      reel: donneesReelles.recettes.total,
    },
    {
      name: "Dépenses",
      simulation: depenses.total,
      reel: donneesReelles.depenses.total,
    },
  ];

  const handleParamChange = (
    key: keyof BudgetParams,
    value: number[]
  ): void => {
    setParams((prev) => ({
      ...prev,
      [key]: value[0],
    }));
  };

  return (
    <div className="w-full max-w-6xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Résultat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mt-8">
                <BudgetResults
                  recettes={recettes.total}
                  depenses={depenses.total}
                  solde={solde}
                />
              </div>
        </CardContent>
      </Card>
 

        <Tabs defaultValue="simulator">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="simulator">Simulateur</TabsTrigger>
            <TabsTrigger value="comparison">Comparaison</TabsTrigger>
            <TabsTrigger value="explanation">Explications</TabsTrigger>
        </TabsList>
        <TabsContent value="simulator">
          <Card>
            <CardHeader>
              <CardTitle>Simulateur du Budget de l'État Français</CardTitle>
            </CardHeader>
            <CardContent>
              <BudgetSimulatorForm
                params={params}
                recettes={recettes}
                onParamChange={handleParamChange}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Comparaison avec les données réelles</CardTitle>
            </CardHeader>
            <CardContent>
              <ComparisonChart
                data={comparaisonData}
                donneesReelles={donneesReelles}
                recettes={recettes}
                depenses={depenses}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="explanation">
          <Card>
            <CardHeader>
              <CardTitle>Explications des calculs</CardTitle>
            </CardHeader>
            <CardContent>
              <BudgetExplanations />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BudgetSimulator;
