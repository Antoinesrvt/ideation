import { type ClassValue, clsx } from "clsx"
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
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
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

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format a number as a currency string with specified currency, locale, and options
 */
export function formatCurrency(
  value: number, 
  currency = 'USD', 
  locale = 'en-US', 
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
    ...options
  }).format(value);
}

/**
 * Format a date into a relative time string (e.g., "3 days ago")
 */
export function formatRelativeDate(date: string | Date): string {
  const now = new Date();
  const inputDate = typeof date === 'string' ? new Date(date) : date;
  
  const diffInSeconds = Math.floor((now.getTime() - inputDate.getTime()) / 1000);
  
  if (isNaN(diffInSeconds)) {
    return 'Invalid date';
  }
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
}

/**
 * Format seconds into a MM:SS time format
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}