import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'
  const error = requestUrl.searchParams.get('error')
  const error_description = requestUrl.searchParams.get('error_description')
  const provider = requestUrl.searchParams.get('provider')

  // Handle OAuth errors
  if (error) {
    const errorMessage = error_description || error
    return NextResponse.redirect(
      new URL(
        `/auth/auth-error?error=${encodeURIComponent(errorMessage)}`,
        request.url
      )
    )
  }

  // Handle missing code
  if (!code) {
    return NextResponse.redirect(
      new URL('/auth/auth-error?error=No authorization code provided', request.url)
    )
  }

  try {
    const supabase = createClient()

    // Exchange the code for a session
    const { data: { session }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('Exchange error:', exchangeError)
      return NextResponse.redirect(
        new URL(
          `/auth/auth-error?error=${encodeURIComponent(exchangeError.message)}`,
          request.url
        )
      )
    }

    // No session means something went wrong
    if (!session) {
      return NextResponse.redirect(
        new URL('/auth/auth-error?error=Failed to create session', request.url)
      )
    }

    // For email signup, check verification status
    if (!provider && !session.user.email_confirmed_at) {
      return NextResponse.redirect(
        new URL(
          `/verify-email?email=${encodeURIComponent(session.user.email || '')}`,
          request.url
        )
      )
    }

    // Successful authentication
    return NextResponse.redirect(new URL(next, request.url))
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(
      new URL(
        `/auth/auth-error?error=${encodeURIComponent(
          error instanceof Error ? error.message : 'An unexpected error occurred'
        )}`,
        request.url
      )
    )
  }
} 