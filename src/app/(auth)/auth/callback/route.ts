import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'
  const error = requestUrl.searchParams.get('error')
  const error_description = requestUrl.searchParams.get('error_description')

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/auth/auth-error?error=${encodeURIComponent(error_description || error)}`,
        request.url
      )
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/auth/auth-error?error=No code provided', request.url)
    )
  }

  try {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      return NextResponse.redirect(
        new URL(
          `/auth/auth-error?error=${encodeURIComponent(error.message)}`,
          request.url
        )
      )
    }

    return NextResponse.redirect(new URL(next, request.url))
  } catch (error) {
    return NextResponse.redirect(
      new URL(
        `/auth/auth-error?error=${encodeURIComponent(
          error instanceof Error ? error.message : 'Unknown error occurred'
        )}`,
        request.url
      )
    )
  }
} 