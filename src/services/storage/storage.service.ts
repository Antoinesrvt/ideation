/**
 * Service for local storage operations
 */
export class StorageService {
  private prefix: string;

  constructor(prefix: string = process.env.NEXT_PUBLIC_STORAGE_PREFIX || 'app_') {
    this.prefix = prefix;
  }

  /**
   * Get an item from storage
   */
  getItem<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(this.getKey(key));
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error(`Error getting item ${key} from storage:`, error);
      return defaultValue || null;
    }
  }

  /**
   * Set an item in storage
   */
  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.getKey(key), JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item ${key} in storage:`, error);
    }
  }

  /**
   * Remove an item from storage
   */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.error(`Error removing item ${key} from storage:`, error);
    }
  }

  /**
   * Clear all items with the prefix
   */
  clear(): void {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  /**
   * Get all keys with the prefix
   */
  keys(): string[] {
    try {
      return Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.slice(this.prefix.length));
    } catch (error) {
      console.error('Error getting keys from storage:', error);
      return [];
    }
  }

  /**
   * Get the prefixed key
   */
  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }
}

// Create a singleton instance
export const storageService = new StorageService();