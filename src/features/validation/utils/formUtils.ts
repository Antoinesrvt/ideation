import { FormStep } from '../components/common/EnhancedFormModal';

/**
 * Calculates the completion percentage of a form based on filled fields
 * @param steps Form steps configuration
 * @param values Current form values
 * @returns Percentage of completion as a number from 0-100
 */
export function calculateFormCompletion(
  steps: FormStep[],
  values: Record<string, any>
): number {
  // Get all required fields from all steps
  const allFields = steps.flatMap(step => step.fields);
  
  // Skip fields that are empty strings, null, undefined, or empty arrays
  const filledFields = allFields.filter(field => {
    const value = values[field];
    if (value === undefined || value === null) return false;
    if (value === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  });
  
  return Math.round((filledFields.length / allFields.length) * 100);
}

/**
 * Creates template suggestions based on existing items
 * @param items Array of existing items to base templates on
 * @param excludeFields Fields to exclude from templates
 * @returns Array of form templates
 */
export function createTemplatesFromExisting<T extends Record<string, any>>(
  items: T[],
  excludeFields: (keyof T)[] = []
) {
  // Find the 3 most recently created items if available
  const recentItems = [...items]
    .sort((a, b) => {
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 3);
  
  return recentItems.map((item, index) => {
    const name = item.title || `Template ${index + 1}`;
    
    // Filter out excluded fields and create a cleaned template
    const values = Object.entries(item as Record<string, any>).reduce((acc, [key, value]) => {
      if (!excludeFields.includes(key as keyof T) && 
          key !== 'id' && 
          key !== 'created_at' && 
          key !== 'updated_at') {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);
    
    return {
      id: `template-${index}`,
      name,
      description: `Based on "${name}"`,
      values
    };
  });
}

/**
 * Tracks field usage for analytics
 * @param fieldId Identifier for the field
 * @param action Action performed on the field
 */
export function trackFieldInteraction(fieldId: string, action: 'focus' | 'change' | 'blur'): void {
  // Implement analytics tracking here
  // This is a placeholder for future implementation
}

/**
 * Formats date string for input fields
 * @param dateString Date string to format
 * @returns Formatted date string for date input
 */
export function formatDateForInput(dateString?: string | null): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch (e) {
    return '';
  }
}

/**
 * Safely parses a JSON string
 * @param jsonString String to parse
 * @param fallback Fallback value if parsing fails
 * @returns Parsed object or fallback
 */
export function safeJsonParse<T>(jsonString: string | null | undefined, fallback: T): T {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString) as T;
  } catch (e) {
    return fallback;
  }
} 