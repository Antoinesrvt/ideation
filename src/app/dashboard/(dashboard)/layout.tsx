'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { useSupabase } from '@/context/supabase-context'
import { LoadingScreen } from '@/components/ui/loading-screen'
import { UserNav } from '@/components/dashboard/user-nav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useSupabase()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin')
    }
  }, [user, loading, router])

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold">Waste Marketplace</span>
            <nav className="hidden md:flex items-center gap-6">
              <a href="/dashboard" className="text-sm font-medium hover:text-primary">Dashboard</a>
              <a href="/dashboard/projects" className="text-sm font-medium text-muted-foreground hover:text-primary">Projects</a>
              <a href="/dashboard/analytics" className="text-sm font-medium text-muted-foreground hover:text-primary">Analytics</a>
            </nav>
          </div>
          <UserNav user={user} />
        </div>
      </header>
      <div className="border-b">
        <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
          <Sidebar className="hidden md:block" />
          <main className="flex w-full flex-col overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
} 