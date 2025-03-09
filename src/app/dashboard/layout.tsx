'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/project/Header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Top Navigation - Full width */}
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <Header isDashboard={true} />
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - starts after header */}
        <div className="hidden lg:block w-64 border-r">
          <Sidebar />
        </div>

        {/* Main Content Area - Scrollable */}
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
} 