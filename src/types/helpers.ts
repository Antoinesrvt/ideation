import { Database } from './database';

/**
 * Type helper for getting the Row type of a table
 */
export type TableRow<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row'];

/**
 * Type helper for getting the Insert type of a table
 */
export type TableInsert<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert'];

/**
 * Type helper for getting the Update type of a table
 */
export type TableUpdate<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update'];

/**
 * Helper for omitting common fields in insert operations
 */
export type InsertData<T extends keyof Database['public']['Tables']> = 
  Omit<TableInsert<T>, 'id' | 'created_at' | 'updated_at'>;

/**
 * Helper for getting the relationships of a table
 */
export type TableRelationships<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Relationships'];

/**
 * Helper type for common fields in all tables
 */
export type CommonFields = {
  id: string;
  created_at?: string | null;
  updated_at?: string | null;
  project_id?: string | null;
  created_by?: string | null;
};

/**
 * Helper type for project-related tables
 */
export type ProjectTableRow<T> = T & {
  project_id: string;
} & CommonFields;

/**
 * Helper for converting snake_case database fields to camelCase
 */
export type ToCamelCase<S extends string> = S extends `${infer P}_${infer Q}`
  ? `${P}${Capitalize<ToCamelCase<Q>>}`
  : S;

/**
 * Helper for converting an object's keys from snake_case to camelCase
 */
export type CamelCaseKeys<T> = {
  [K in keyof T as ToCamelCase<K & string>]: T[K] extends object
    ? CamelCaseKeys<T[K]>
    : T[K];
};

/**
 * Helper type for metadata JSON
 */
export type JsonMetadata = {
  [key: string]: unknown;
}; 