'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { useSupabase } from '@/context/supabase-context'
import { AuthService } from '@/lib/services/core/auth-service'

export default function VerifyEmailPage() {
  const [isResending, setIsResending] = useState(false)
  const [resendError, setResendError] = useState<string | null>(null)
  const [resendSuccess, setResendSuccess] = useState(false)
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const router = useRouter()
  const { user, supabase } = useSupabase()
  const authService = new AuthService(supabase)

  useEffect(() => {
    if (user?.email_confirmed_at) {
      router.push('/dashboard')
    }
  }, [user, router])

  const handleResendEmail = async () => {
    if (!email) return
    
    try {
      setIsResending(true)
      setResendError(null)
      setResendSuccess(false)
      await authService.resendVerificationEmail(email)
      setResendSuccess(true)
    } catch (error) {
      setResendError(error instanceof Error ? error.message : 'Failed to resend verification email')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <Icons.mail className="mx-auto h-6 w-6" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Check your email
          </h1>
          <p className="text-sm text-muted-foreground">
            We sent a verification link to{' '}
            <span className="font-medium">{email}</span>
          </p>
        </div>
        <div className="grid gap-2">
          <Button
            variant="outline"
            onClick={handleResendEmail}
            disabled={isResending || resendSuccess}
          >
            {isResending ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Resending...
              </>
            ) : resendSuccess ? (
              'Email sent!'
            ) : (
              'Resend verification email'
            )}
          </Button>
          {resendError && (
            <p className="text-sm text-red-500 text-center">
              {resendError}
            </p>
          )}
          {resendSuccess && (
            <p className="text-sm text-green-500 text-center">
              A new verification email has been sent to your inbox.
            </p>
          )}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => router.push('/signin')}
          >
            Back to sign in
          </Button>
        </div>
      </div>
    </div>
  )
} 