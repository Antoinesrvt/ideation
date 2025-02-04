'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthError } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type SupabaseContext = {
  user: User | null
  loading: boolean
  error: AuthError | null
  supabase: ReturnType<typeof createClient>
  signOut: () => Promise<void>
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export function SupabaseProvider({ 
  children,
  initialSession = null,
}: { 
  children: React.ReactNode
  initialSession?: User | null
}) {
  const [user, setUser] = useState<User | null>(initialSession)
  const [loading, setLoading] = useState(!initialSession)
  const [error, setError] = useState<AuthError | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Initial session check if no initialSession provided
    if (!initialSession) {
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          setError(error)
        } else {
          setUser(session?.user ?? null)
        }
        setLoading(false)
      })
    }

    return () => {
      subscription.unsubscribe()
    }
  }, [initialSession])

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
      setUser(null)
    } catch (error) {
      if (error instanceof AuthError) {
        setError(error)
      }
      console.error('Sign out error:', error)
    }
  }

  const value = {
    user,
    loading,
    error,
    supabase,
    signOut,
  }

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useSupabase() {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
} 