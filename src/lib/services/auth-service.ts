import { AuthError, SupabaseClient, User, Session } from '@supabase/supabase-js'
import { Database } from '@/types/database'

interface AuthResponse {
  data: {
    user: User | null
    session: Session | null
  } | null
  error: AuthError | null
}

export class AuthService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async signUp(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    return { data: { user: data.user, session: data.session }, error }
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    })

    return { data: { user: data.user, session: data.session }, error }
  }

  async signInWithProvider(provider: 'google' | 'github') {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      throw error
    }

    return data
  }

  async resetPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      throw error
    }
  }

  async updatePassword(password: string) {
    const { error } = await this.supabase.auth.updateUser({
      password,
    })

    if (error) {
      throw error
    }
  }

  async getSession() {
    const { data: { session }, error } = await this.supabase.auth.getSession()

    if (error) {
      throw error
    }

    return session
  }

  async getUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser()

    if (error) {
      throw error
    }

    return user
  }
} 