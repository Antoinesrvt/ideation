import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronUp, ChevronDown, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CurrencyInputProps {
  id: string;
  label?: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

export function CurrencyInput({
  id,
  label,
  value,
  onChange,
  placeholder = '0.00',
  helperText,
  className = '',
  min,
  max,
  step = 1000,
  disabled = false
}: CurrencyInputProps) {
  // Track whether the input is focused
  const [isFocused, setIsFocused] = useState(false);
  
  // Format value for display
  const formatValue = (val: string | number): string => {
    if (!val && val !== 0) return '';
    
    // Convert to number and handle errors
    let numValue: number;
    if (typeof val === 'string') {
      // Remove currency formatting for parsing
      const cleanVal = val.replace(/[$,]/g, '');
      numValue = parseFloat(cleanVal);
      if (isNaN(numValue)) return '';
    } else {
      numValue = val;
    }
    
    // Format number as currency
    if (isFocused) {
      // When focused, show unformatted number
      return numValue.toString();
    } else {
      // When not focused, show formatted currency
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(numValue);
    }
  };
  
  // Parse input value
  const parseInputValue = (val: string): number => {
    return parseFloat(val.replace(/[$,]/g, ''));
  };
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    // Remove non-numeric characters except for decimal point
    const sanitized = rawValue.replace(/[^0-9.]/g, '');
    onChange(sanitized);
  };
  
  // Handle increment/decrement
  const handleIncrement = () => {
    if (disabled) return;
    
    const currentValue = typeof value === 'string' ? parseInputValue(value) || 0 : value;
    const newValue = currentValue + (step || 1000);
    
    // Check if exceeding max
    if (max !== undefined && newValue > max) {
      onChange(max.toString());
      return;
    }
    
    onChange(newValue.toString());
  };
  
  const handleDecrement = () => {
    if (disabled) return;
    
    const currentValue = typeof value === 'string' ? parseInputValue(value) || 0 : value;
    const newValue = currentValue - (step || 1000);
    
    // Check if below min
    if (min !== undefined && newValue < min) {
      onChange(min.toString());
      return;
    }
    
    onChange(newValue.toString());
  };
  
  // Formatted display value
  const displayValue = formatValue(value);
  
  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label htmlFor={id}>{label}</Label>}
      
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          <DollarSign className="h-4 w-4" />
        </div>
        
        <Input
          id={id}
          type="text"
          className={`pl-9 pr-14 ${isFocused ? 'border-primary' : ''}`}
          placeholder={placeholder}
          value={displayValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            // Ensure we're storing a number
            if (value) {
              const numValue = typeof value === 'string' ? parseInputValue(value) : value;
              if (!isNaN(numValue)) {
                onChange(numValue.toString());
              }
            }
          }}
          disabled={disabled}
        />
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex flex-col">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 text-gray-500 hover:text-gray-700"
            onClick={handleIncrement}
            disabled={disabled || (max !== undefined && (typeof value === 'string' ? parseInputValue(value) : value) >= max)}
          >
            <ChevronUp className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 text-gray-500 hover:text-gray-700"
            onClick={handleDecrement}
            disabled={disabled || (min !== undefined && (typeof value === 'string' ? parseInputValue(value) : value) <= min)}
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      {helperText && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
} 