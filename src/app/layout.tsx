import type { Metadata } from 'next'
import './globals.css'
import { createClient } from '@/lib/supabase/server'
import { SupabaseProvider } from '@/context/supabase-context'
import { ThemeProvider } from "@/components/theme-provider";
import { GeistSans } from "geist/font/sans";
import { Toaster } from '@/components/ui/toaster'
import { ProjectProvider } from '@/context/project-context'
import { ModuleProvider } from '@/context/module-context'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export const metadata: Metadata = {
  title: 'Startup Builder',
  description: 'Build your startup with AI assistance',
}

// Create a client
const queryClient = new QueryClient()

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={GeistSans.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryClientProvider client={queryClient}>
            <SupabaseProvider initialSession={session?.user ?? null}>
              <ProjectProvider>
                <ModuleProvider>
                  {children}
                </ModuleProvider>
              </ProjectProvider>
            </SupabaseProvider>
          </QueryClientProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
