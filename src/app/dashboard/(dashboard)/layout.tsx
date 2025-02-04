'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { useSupabase } from '@/context/supabase-context'
import { LoadingScreen } from '@/components/ui/loading-screen'

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
    <div className="min-h-screen">
      <Navbar />
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar className="w-64 hidden lg:block" />
        <main className="flex-1 overflow-y-auto p-8 pt-6">
          {children}
        </main>
      </div>
    </div>
  )
} 