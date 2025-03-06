import { Database } from '../types/database';
import { ProjectState } from './types';

export type Tables = Database['public']['Tables'];

export type RealtimePostgresChangesPayload<T> = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T;
};

export type TableName = keyof Tables;
export type RowType<T extends TableName> = Tables[T]['Row'];

/**
 * Generic handler for real-time changes that updates the store state
 */
export function handleRealtimeChange<T extends TableName>(
  tableName: T,
  stateKey: keyof ProjectState['currentData'],
  payload: RealtimePostgresChangesPayload<RowType<T>>,
  currentData: RowType<T>[]
): RowType<T>[] {
  switch (payload.eventType) {
    case 'INSERT':
      return [...currentData, payload.new];
    
    case 'UPDATE':
      return currentData.map(item => 
        item.id === payload.new.id ? payload.new : item
      );
    
    case 'DELETE':
      return currentData.filter(item => item.id !== payload.old.id);
    
    default:
      return currentData;
  }
}

/**
 * Type guard to check if a payload is a RealtimePostgresChangesPayload
 */
export function isRealtimePayload<T>(
  payload: unknown
): payload is RealtimePostgresChangesPayload<T> {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'eventType' in payload &&
    'new' in payload &&
    'old' in payload
  );
} 