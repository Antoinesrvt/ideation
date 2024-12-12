"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BudgetParams, DonneesReelles, ComparisonDataItem, RecettesData, DepensesData } from './types';
import { BudgetExplanations } from './components/BudgetExplanations';

const BudgetSimulator: React.FC = () => {
  const [params, setParams] = useState<BudgetParams>({
    // Recettes
    tvaRate: 20,           // TVA en %
    irRate: 14,           // Impôt sur le revenu moyen en %
    isRate: 27.5,         // Impôts sociaux en %
    isEntreprises: 27.2,  // Impôt sur les sociétés en %
    ticpe: 17.5,          // TICPE (carburants) en milliards
    droitsSuccession: 12.5,// Droits de succession en milliards
    autresRecettes: 45,   // Autres recettes en milliards
    
    // Dépenses
    retraites: 327,       // en milliards €
    sante: 230,           // en milliards €
    education: 110,       // en milliards €
    defense: 50,          // en milliards €
    services: 60,         // Services publics en milliards €
    interetsDette: 51,    // Intérêts de la dette en milliards €
    securite: 45,         // Sécurité intérieure en milliards €
    recherche: 28,        // Recherche en milliards €
    justice: 12,          // Justice en milliards €
    culture: 15,          // Culture en milliards €
    ecologie: 25,         // Transition écologique en milliards €
  });

  // Type the donneesReelles object
  const donneesReelles: DonneesReelles = {
    recettes: {
      tva: 185,
      ir: 90,
      is: 170,
      isEntreprises: 65,
      ticpe: 17.5,
      droitsSuccession: 12.5,
      autresRecettes: 45,
      total: 585
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
      total: 953
    }
  };

  // Type the calculation functions
  const calculRecettes = (): RecettesData => {
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
      total: tva + ir + is + isEntreprises + params.ticpe + 
             params.droitsSuccession + params.autresRecettes
    };
  };

  const calculDepenses = (): DepensesData => {
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
      total: Object.values(params).reduce((acc, val) => acc + val, 0)
    };
  };

  const recettes = calculRecettes();
  const depenses = calculDepenses();
  const solde = recettes.total - depenses.total;

  const comparaisonData: ComparisonDataItem[] = [
    { 
      name: 'Recettes',
      simulation: recettes.total,
      reel: donneesReelles.recettes.total
    },
    { 
      name: 'Dépenses',
      simulation: depenses.total,
      reel: donneesReelles.depenses.total
    }
  ];

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('fr-FR').format(Math.round(num));
  };

  const handleSliderChange = (key: keyof BudgetParams, value: number[]): void => {
    setParams(prev => ({
      ...prev,
      [key]: value[0]
    }));
  };

  return (
    <div className="w-full max-w-6xl space-y-6">
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
              <div className="grid grid-cols-2 gap-8">
                {/* Colonne des recettes */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Recettes</h3>
                  
                  {/* TVA */}
                  <div className="space-y-2">
                    <label className="text-sm">TVA ({params.tvaRate}%)</label>
                    <Slider 
                      value={[params.tvaRate]} 
                      min={5} 
                      max={30} 
                      step={0.5}
                      onValueChange={(value) => handleSliderChange('tvaRate', value)}
                    />
                    <div className="text-right text-sm">{formatNumber(recettes.tva)} M€</div>
                  </div>

                  {/* IR */}
                  <div className="space-y-2">
                    <label className="text-sm">Impôt sur le revenu ({params.irRate}%)</label>
                    <Slider 
                      value={[params.irRate]} 
                      min={5} 
                      max={25} 
                      step={0.5}
                      onValueChange={(value) => handleSliderChange('irRate', value)}
                    />
                    <div className="text-right text-sm">{formatNumber(recettes.ir)} M€</div>
                  </div>

                  {/* IS */}
                  <div className="space-y-2">
                    <label className="text-sm">Impôt sur les sociétés ({params.isEntreprises}%)</label>
                    <Slider 
                      value={[params.isEntreprises]} 
                      min={15} 
                      max={40} 
                      step={0.5}
                      onValueChange={(value) => handleSliderChange('isEntreprises', value)}
                    />
                    <div className="text-right text-sm">{formatNumber(recettes.isEntreprises)} M€</div>
                  </div>

                  {/* TICPE */}
                  <div className="space-y-2">
                    <label className="text-sm">TICPE (Mrd€)</label>
                    <Slider 
                      value={[params.ticpe]} 
                      min={10} 
                      max={30} 
                      step={0.5}
                      onValueChange={(value) => handleSliderChange('ticpe', value)}
                    />
                    <div className="text-right text-sm">{formatNumber(params.ticpe * 1000)} M€</div>
                  </div>
                </div>

                {/* Colonne des dépenses */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Dépenses</h3>
                  
                  {/* Retraites */}
                  <div className="space-y-2">
                    <label className="text-sm">Retraites (Mrd€)</label>
                    <Slider 
                      value={[params.retraites]} 
                      min={200} 
                      max={400} 
                      step={1}
                      onValueChange={(value) => handleSliderChange('retraites', value)}
                    />
                    <div className="text-right text-sm">{formatNumber(params.retraites * 1000)} M€</div>
                  </div>

                  {/* Santé */}
                  <div className="space-y-2">
                    <label className="text-sm">Santé (Mrd€)</label>
                    <Slider 
                      value={[params.sante]} 
                      min={150} 
                      max={300} 
                      step={1}
                      onValueChange={(value) => handleSliderChange('sante', value)}
                    />
                    <div className="text-right text-sm">{formatNumber(params.sante * 1000)} M€</div>
                  </div>

                  {/* Éducation */}
                  <div className="space-y-2">
                    <label className="text-sm">Éducation (Mrd€)</label>
                    <Slider 
                      value={[params.education]} 
                      min={80} 
                      max={150} 
                      step={1}
                      onValueChange={(value) => handleSliderChange('education', value)}
                    />
                    <div className="text-right text-sm">{formatNumber(params.education * 1000)} M€</div>
                  </div>

                  {/* Défense */}
                  <div className="space-y-2">
                    <label className="text-sm">Défense (Mrd€)</label>
                    <Slider 
                      value={[params.defense]} 
                      min={30} 
                      max={100} 
                      step={1}
                      onValueChange={(value) => handleSliderChange('defense', value)}
                    />
                    <div className="text-right text-sm">{formatNumber(params.defense * 1000)} M€</div>
                  </div>
                </div>
              </div>

              {/* Résultats */}
              <div className="mt-8 space-y-4">
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-100 rounded-lg">
                  <div>
                    <div className="text-sm font-medium">Recettes totales</div>
                    <div className="text-xl font-bold text-green-600">
                      {formatNumber(recettes.total)} M€
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Dépenses totales</div>
                    <div className="text-xl font-bold text-red-600">
                      {formatNumber(depenses.total)} M€
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Solde budgétaire</div>
                    <div className={`text-xl font-bold ${solde >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatNumber(solde)} M€
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Comparaison avec les données réelles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparaisonData}>
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
                <p>Recettes: {formatNumber(recettes.total - donneesReelles.recettes.total)} M€</p>
                <p>Dépenses: {formatNumber(depenses.total - donneesReelles.depenses.total)} M€</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="explanation">
          <BudgetExplanations />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BudgetSimulator;