import React from "react";
import { Slider } from "@/components/ui/slider";

interface BudgetSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number[]) => void;
  formatValue: (value: number) => string;
  unit?: string;
}

export const BudgetSlider: React.FC<BudgetSliderProps> = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  formatValue,
  unit = "%",
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm">
        {label} ({value}
        {unit})
      </label>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={onChange}
      />
      <div className="text-right text-sm">{formatValue(value)}</div>
    </div>
  );
};
