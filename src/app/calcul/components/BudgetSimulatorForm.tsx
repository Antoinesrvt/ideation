import React, { useState } from "react";
import { BudgetSlider } from "./BudgetSlider";
import { BudgetParams, RecettesData } from "../types";
import { formatNumber } from "../utils";
import { BUDGET_CATEGORIES, PARAM_CONFIG } from "../constants";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";

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
  const [activeCategory, setActiveCategory] = useState<"RECETTES" | "DEPENSES">("RECETTES");

  const renderSliders = (category: any, type: "RECETTES" | "DEPENSES") => {
    return Object.entries(category).map(([key, value]: [string, any]) => (
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{value.icon}</span>
              <h3 className="text-lg font-semibold">{value.title}</h3>
            </div>
            <div className="space-y-6">
              {value.items.map((item: keyof BudgetParams) => (
                <div key={item} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {PARAM_CONFIG[item].label}
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <InfoCircledIcon className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs text-sm">
                            {value.descriptions[item]}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <BudgetSlider
                    label={PARAM_CONFIG[item].label}
                    value={params[item]}
                    min={PARAM_CONFIG[item].min}
                    max={PARAM_CONFIG[item].max}
                    step={PARAM_CONFIG[item].step}
                    onChange={(value) => onParamChange(item, value)}
                    formatValue={(value) => 
                      formatNumber(type === "RECETTES" ? recettes[item as keyof RecettesData] : value * 1000)
                    }
                    unit={type === "RECETTES" && !item.includes("Rate") ? " Mrd€" : "%"}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    ));
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeCategory} onValueChange={(value: any) => setActiveCategory(value)}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="RECETTES" className="text-lg">
            💰 Recettes
          </TabsTrigger>
          <TabsTrigger value="DEPENSES" className="text-lg">
            💳 Dépenses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="RECETTES" className="space-y-6">
          {renderSliders(BUDGET_CATEGORIES.RECETTES, "RECETTES")}
        </TabsContent>

        <TabsContent value="DEPENSES" className="space-y-6">
          {renderSliders(BUDGET_CATEGORIES.DEPENSES, "DEPENSES")}
        </TabsContent>
      </Tabs>
    </div>
  );
};
