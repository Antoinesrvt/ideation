import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { RACIMatrixData, RACIRole } from "@/store/types"

/**
 * Combines multiple class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string to a human-readable format
 */
export function formatDate(date: string | Date): string {
  try {
    if (!date) return 'Not available';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date unavailable';
  }
}

/**
 * Generates a random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Safely access nested object properties
 */
export function get<T>(obj: any, path: string, defaultValue: T): T {
  const travel = (regexp: RegExp) =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce(
        (res, key) => (res !== null && res !== undefined ? res[key] : res),
        obj
      );
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

/**
 * Parses a JSONB field safely
 */
export function parseJsonbField<T>(field: unknown, defaultValue: T): T {
  if (!field) return defaultValue;
  
  try {
    if (typeof field === 'string') {
      return JSON.parse(field) as T;
    }
    return field as T;
  } catch (error) {
    console.error('Error parsing JSONB field:', error);
    return defaultValue;
  }
}

/**
 * Converts data to JSON string for JSONB fields
 */
export function stringifyJsonbField<T>(data: T): string {
  try {
    return JSON.stringify(data);
  } catch (error) {
    console.error('Error stringifying data for JSONB field:', error);
    return '{}';
  }
}

/**
 * Validates a RACI matrix to ensure it follows the proper structure
 * - Each area should have exactly one Accountable (A)
 * - Each member should have at most one role per area
 */
export function validateRACIMatrix(raciMatrix: RACIMatrixData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const accountableCount = Object.values(raciMatrix).filter(role => role === 'A').length;
  
  if (accountableCount === 0) {
    errors.push('There must be at least one person Accountable (A) for this area');
  } else if (accountableCount > 1) {
    errors.push('There can only be one person Accountable (A) for this area');
  }
  
  // Add any other validation rules as needed
  
  return {
    valid: errors.length === 0,
    errors
  };
}