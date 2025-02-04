import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from '@/types/database'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    // Initialize Supabase with cookie handling
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          flowType: 'pkce',
          autoRefreshToken: true,
          detectSessionInUrl: true,
          persistSession: true,
        },
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    // Get user data - this is secure as it validates with Supabase server
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) {
      throw userError
    }

    const { pathname } = request.nextUrl

    // Auth routes handling (signin, signup, auth callbacks)
    const isAuthRoute = pathname.startsWith('/signin') || 
                       pathname.startsWith('/signup') || 
                       pathname.startsWith('/auth/') ||
                       pathname.startsWith('/verify-email')

    if (isAuthRoute) {
      if (user) {
        // If email is not verified, redirect to verification page
        if (!user.email_confirmed_at) {
          return NextResponse.redirect(new URL('/verify-email', request.url))
        }
        // If user is signed in and verified, redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      // Allow access to auth routes for non-authenticated users
      return response
    }

    // Protected routes handling
    const isProtectedRoute = pathname.startsWith('/dashboard')
    if (isProtectedRoute) {
      if (!user) {
        // If user is not signed in and tries to access protected routes
        return NextResponse.redirect(new URL('/signin', request.url))
      }
      
      // Check if email needs verification
      if (!user.email_confirmed_at) {
        return NextResponse.redirect(new URL('/verify-email', request.url))
      }
      
      // User is authenticated and verified, allow access
      return response
    }

    // Handle root path redirect for authenticated users
    if (pathname === '/' && user) {
      if (!user.email_confirmed_at) {
        return NextResponse.redirect(new URL('/verify-email', request.url))
      }
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    
    // On error, clear any invalid session cookies
    response = NextResponse.redirect(new URL('/signin', request.url))
    response.cookies.set({
      name: 'sb-auth-token',
      value: '',
      path: '/',
      maxAge: 0,
    })
    
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 