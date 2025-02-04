'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { useSupabase } from '@/context/supabase-context'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const router = useRouter()
  const { user } = useSupabase()

  useEffect(() => {
    if (user?.email_confirmed_at) {
      router.push('/dashboard')
    }
  }, [user, router])

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
          <p className="px-8 text-center text-sm text-muted-foreground">
            Didn&apos;t receive the email?{' '}
            <Button
              variant="link"
              className="underline underline-offset-4 hover:text-primary"
              onClick={() => router.push('/signin')}
            >
              Go back to sign in
            </Button>
          </p>
        </div>
      </div>
    </div>
  )
} 