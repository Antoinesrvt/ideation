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
    try {
      // Directly attempt signup - Supabase will handle duplicate emails
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            email_verification_sent_at: new Date().toISOString(),
          }
        },
      })

      if (error) {
        // Handle specific error cases
        if (error.message.includes('User already registered')) {
          return {
            data: null,
            error: new Error('This email is already registered. Please sign in instead.') as AuthError
          }
        }
        throw error
      }

      // If signup successful but needs verification
      if (data.user && !data.session) {
        return {
          data: {
            user: data.user,
            session: null
          },
          error: null
        }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return {
        data: null,
        error: error instanceof Error ? error as AuthError : new Error('An unexpected error occurred') as AuthError
      }
    }
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      // First, get the current user state securely
      const { data: { user: currentUser } } = await this.supabase.auth.getUser()

      // If user exists but email not confirmed, handle verification
      if (currentUser?.email === email && !currentUser.email_confirmed_at) {
        console.log('Existing unverified user, sending verification email...')
        const { error: resendError } = await this.supabase.auth.resend({
          type: 'signup',
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (resendError) {
          console.error('Failed to resend verification email:', resendError)
          return {
            data: null,
            error: new Error('Failed to resend verification email. Please try again.') as AuthError
          }
        }

        return {
          data: {
            user: currentUser,
            session: null
          },
          error: new Error('Please verify your email. A new verification link has been sent to your inbox.') as AuthError
        }
      }

      // Attempt sign in
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Handle specific error cases
        if (error.message.includes('Invalid login credentials')) {
          return {
            data: null,
            error: new Error('Invalid email or password. Please try again.') as AuthError
          }
        }

        if (error.message.includes('Email not confirmed')) {
          console.log('New unverified user detected, sending verification email...')
          const { error: resendError } = await this.supabase.auth.resend({
            type: 'signup',
            email,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          })

          if (resendError) {
            console.error('Failed to resend verification email:', resendError)
            return {
              data: null,
              error: new Error('Failed to resend verification email. Please try again.') as AuthError
            }
          }

          return {
            data: {
              user: { email } as User,
              session: null
            },
            error: new Error('Please verify your email. A verification link has been sent to your inbox.') as AuthError
          }
        }

        throw error
      }

      // Double check email verification status using getUser
      const { data: { user: verifiedUser } } = await this.supabase.auth.getUser()
      
      if (verifiedUser && !verifiedUser.email_confirmed_at) {
        console.log('Email verification required, sending verification email...')
        const { error: resendError } = await this.supabase.auth.resend({
          type: 'signup',
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (resendError) {
          console.error('Failed to resend verification email:', resendError)
        }

        return {
          data: {
            user: verifiedUser,
            session: null
          },
          error: new Error('Please verify your email. A verification link has been sent to your inbox.') as AuthError
        }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return {
        data: null,
        error: error instanceof Error ? error as AuthError : new Error('An unexpected error occurred') as AuthError
      }
    }
  }

  async signInWithProvider(provider: 'google' | 'github') {
    return await this.supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
  }

  async resendVerificationEmail(email: string) {
    return await this.supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  async resetPassword(email: string) {
    return await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
  }

  async updatePassword(password: string) {
    return await this.supabase.auth.updateUser({
      password,
    })
  }

  async signOut() {
    return await this.supabase.auth.signOut()
  }

  async getSession() {
    return await this.supabase.auth.getSession()
  }

  async getUser() {
    return await this.supabase.auth.getUser()
  }
} 