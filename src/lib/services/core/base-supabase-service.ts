import { SupabaseClient, PostgrestError } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { BaseError, ServiceError } from '@/lib/errors/base-error'

export class BaseSupabaseService {
  constructor(protected supabase: SupabaseClient<Database>) {}

  protected handleError(error: PostgrestError | Error, context: string = ''): never {
    console.error('Supabase operation error:', {
      error,
      context,
      message: error instanceof PostgrestError ? error.message : error.message,
      code: error instanceof PostgrestError ? error.code : undefined,
      details: error instanceof PostgrestError ? error.details : undefined,
      hint: error instanceof PostgrestError ? error.hint : undefined,
      timestamp: new Date().toISOString()
    })

    if (error instanceof PostgrestError) {
      // Handle specific Supabase errors
      switch (error.code) {
        case '23505': // Unique violation
          throw new ServiceError(
            'DuplicateError',
            'A record with these details already exists.',
            { originalError: error }
          )
        case '23503': // Foreign key violation
          throw new ServiceError(
            'ReferenceError',
            'Referenced record does not exist.',
            { originalError: error }
          )
        case '42P01': // Undefined table
          throw new ServiceError(
            'DatabaseError',
            'Database table not found.',
            { originalError: error }
          )
        case '42703': // Undefined column
          throw new ServiceError(
            'DatabaseError',
            'Database column not found.',
            { originalError: error }
          )
        default:
          throw new ServiceError(
            'DatabaseError',
            error.message,
            { originalError: error }
          )
      }
    }

    // Handle other types of errors
    if (error instanceof BaseError) {
      throw error
    }

    throw new ServiceError(
      'UnknownError',
      'An unexpected error occurred during the database operation.',
      { originalError: error }
    )
  }

  protected async handleDatabaseOperation<T>(
    operation: () => Promise<{ data: T | null; error: PostgrestError | null }>,
    context: string = ''
  ): Promise<T> {
    try {
      const { data, error } = await operation()
      if (error) this.handleError(error, context)
      if (!data) throw new Error('No data returned from operation')
      return data
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error(String(error)), context)
    }
  }

  protected async handleStorageOperation<T>(
    operation: () => Promise<{ data: T | null; error: Error | null }>,
    context: string = ''
  ): Promise<T> {
    try {
      const { data, error } = await operation()
      if (error) this.handleError(error, context)
      if (!data) throw new Error('No data returned from operation')
      return data
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error(String(error)), context)
    }
  }
} 