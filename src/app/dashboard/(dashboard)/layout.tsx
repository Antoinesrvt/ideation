import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
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