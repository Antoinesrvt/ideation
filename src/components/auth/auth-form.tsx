'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/ui/icons'
import { useSupabase } from '@/context/supabase-context'
import { AuthService } from '@/lib/services/core/auth-service'

interface AuthFormProps {
  type: 'signin' | 'signup'
}

export function AuthForm({ type }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { supabase } = useSupabase()
  const authService = new AuthService(supabase)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData(event.currentTarget)
      const email = formData.get('email') as string
      const password = formData.get('password') as string

      if (type === 'signin') {
        console.log('Attempting sign in...')
        const { data, error } = await authService.signIn(email, password)
        
        if (error) {
          // Check for verification needed
          if (error.message.toLowerCase().includes('verify') || 
              error.message.includes('confirmation') ||
              error.message.includes('verification')) {
            console.log('Email verification needed, redirecting...')
            router.push(`/verify-email?email=${encodeURIComponent(email)}`)
            return
          }

          setError(error.message)
          return
        }

        if (!data?.user) {
          console.error('No user data received')
          setError('An unexpected error occurred during sign in')
          return
        }

        // Always verify email confirmation status
        const { data: { user: verifiedUser } } = await authService.getUser()
        
        if (!verifiedUser?.email_confirmed_at) {
          console.log('Email not confirmed, redirecting to verification...')
          router.push(`/verify-email?email=${encodeURIComponent(email)}`)
          return
        }

        console.log('Sign in successful, redirecting to dashboard...')
        router.refresh()
        router.push('/dashboard')
      } else {
        const { data, error } = await authService.signUp(email, password)
        
        if (error) {
          // Handle already registered case
          if (error.message.includes('already registered')) {
            setError('This email is already registered. Please sign in instead.')
            return
          }

          setError(error.message)
          return
        }

        if (!data?.user) {
          setError('Failed to create account')
          return
        }

        // For new sign up, redirect to verify email page
        router.push(`/verify-email?email=${encodeURIComponent(email)}`)
      }
    } catch (error) {
      console.error('Auth error:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  async function signInWithProvider(provider: 'google' | 'github') {
    try {
      setIsLoading(true)
      setError(null)
      await authService.signInWithProvider(provider)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={onSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              required
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={type === 'signin' ? 'current-password' : 'new-password'}
              disabled={isLoading}
              required
            />
          </div>
          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}
          <Button disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            {type === 'signin' ? 'Sign In' : 'Sign Up'}
          </Button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          disabled={isLoading}
          onClick={() => signInWithProvider('google')}
        >
          {isLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.google className="mr-2 h-4 w-4" />
          )}
          Google
        </Button>
        <Button
          variant="outline"
          disabled={isLoading}
          onClick={() => signInWithProvider('github')}
        >
          {isLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.gitHub className="mr-2 h-4 w-4" />
          )}
          GitHub
        </Button>
      </div>
    </div>
  )
} 