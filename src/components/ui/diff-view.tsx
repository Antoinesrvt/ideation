'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// Define types for the DiffView component
interface DiffViewProps {
  currentValue: string;
  newValue: string;
  className?: string;
}

/**
 * DiffView component
 * Shows differences between current and new values
 */
export function DiffView({ currentValue, newValue, className }: DiffViewProps) {
  // If the values are the same, show no diff
  if (currentValue === newValue) {
    return <div className={className}>{newValue}</div>;
  }
  
  // Simple word-based diff algorithm
  const currentWords = currentValue.split(/(\s+)/);
  const newWords = newValue.split(/(\s+)/);
  
  // Find the differences
  const result = [];
  let i = 0, j = 0;
  
  while (i < currentWords.length && j < newWords.length) {
    if (currentWords[i] === newWords[j]) {
      // Words match - add as is
      result.push({ text: newWords[j], type: 'unchanged' });
      i++;
      j++;
    } else {
      // Words differ - find the next matching word
      let foundMatch = false;
      
      // Look ahead in the new text
      for (let k = j + 1; k < newWords.length; k++) {
        if (currentWords[i] === newWords[k]) {
          // Found a match later - words before are added
          for (let l = j; l < k; l++) {
            result.push({ text: newWords[l], type: 'added' });
          }
          result.push({ text: newWords[k], type: 'unchanged' });
          i++;
          j = k + 1;
          foundMatch = true;
          break;
        }
      }
      
      if (!foundMatch) {
        // No match found - this word was removed
        result.push({ text: currentWords[i], type: 'removed' });
        i++;
      }
    }
  }
  
  // Add any remaining words
  while (j < newWords.length) {
    result.push({ text: newWords[j], type: 'added' });
    j++;
  }
  
  while (i < currentWords.length) {
    result.push({ text: currentWords[i], type: 'removed' });
    i++;
  }
  
  return (
    <div className={cn("font-mono text-sm", className)}>
      {result.map((item, index) => {
        if (item.type === 'unchanged') {
          return <span key={index}>{item.text}</span>;
        } else if (item.type === 'added') {
          return (
            <span key={index} className="bg-green-100 text-green-800 px-0.5 rounded">
              {item.text}
            </span>
          );
        } else if (item.type === 'removed') {
          return (
            <span key={index} className="bg-red-100 text-red-800 line-through px-0.5 rounded">
              {item.text}
            </span>
          );
        }
        return null;
      })}
    </div>
  );
} 