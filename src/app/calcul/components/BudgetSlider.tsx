import React from "react";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";

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
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">{label}</label>
        <motion.div
          key={value}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-sm font-medium text-blue-600"
        >
          {value}
          {unit}
        </motion.div>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={onChange}
        className="py-4"
      />
      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          {min}
          {unit}
        </div>
        <motion.div
          key={formatValue(value)}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-sm font-semibold"
        >
          {formatValue(value)} M€
        </motion.div>
        <div className="text-xs text-gray-500">
          {max}
          {unit}
        </div>
      </div>
      <motion.div
        className="h-1 bg-gray-100 rounded-full mt-1"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.3 }}
        style={{
          background: `linear-gradient(90deg, #3b82f6 ${percentage}%, #e5e7eb ${percentage}%)`,
        }}
      />
    </div>
  );
};
