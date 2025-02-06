import type { Metadata } from 'next'
import './globals.css'
import { createClient } from '@/lib/supabase/server'
import { SupabaseProvider } from '@/context/supabase-context'
import { ThemeProvider } from "@/components/theme-provider";
import { GeistSans } from "geist/font/sans";
import { Toaster } from '@/components/ui/toaster'
import { ProjectProvider } from '@/context/project-context'

export const metadata: Metadata = {
  title: 'Startup Builder',
  description: 'Build your startup with AI assistance',
}

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
          <SupabaseProvider initialSession={session?.user ?? null}>
              <ProjectProvider>{children}</ProjectProvider>
          </SupabaseProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
