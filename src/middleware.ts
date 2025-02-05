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
    const { pathname } = request.nextUrl

    // Define auth-related routes - matching the @(auth) group structure
    const isAuthRoute = pathname === '/signin' || 
                       pathname === '/signup' || 
                       pathname === '/verify-email' ||
                       pathname.startsWith('/auth/')

    // Skip auth check for public routes and static assets
    const isPublicRoute = pathname === '/' || 
                         pathname.startsWith('/api/public') ||
                         pathname.startsWith('/_next') ||
                         pathname.match(/\.(ico|png|jpg|jpeg|gif|svg)$/)

    if (isPublicRoute) {
      return response
    }

    // Initialize Supabase client
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

    // Get session instead of user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    // Handle auth routes
    if (isAuthRoute) {
      if (session) {
        // Redirect authenticated users away from auth pages
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      return response
    }

    // Handle protected routes
    if (!session) {
      // Store the original URL to redirect back after login
      const redirectUrl = new URL('/signin', request.url)
      redirectUrl.searchParams.set('redirect', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    // User is authenticated, allow access
    return response
  } catch (error) {
    console.error('Middleware error:', error)
    
    // Only redirect to login if not already on an auth route
    const { pathname } = request.nextUrl
    const isAuthRoute = pathname === '/signin' || 
                       pathname === '/signup' || 
                       pathname === '/verify-email' ||
                       pathname.startsWith('/auth/')
    
    if (!isAuthRoute) {
      const redirectUrl = new URL('/signin', request.url)
      redirectUrl.searchParams.set('error', 'session_error')
      return NextResponse.redirect(redirectUrl)
    }
    
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
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
} 