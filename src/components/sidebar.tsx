"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  ListTodo,
  BarChart3,
  Settings,
  Users,
  HelpCircle,
} from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  const pathname = usePathname()

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      color: "text-sky-500",
    },
    {
      label: "Projects",
      icon: ListTodo,
      href: "/dashboard/projects",
      color: "text-violet-500",
    },
    {
      label: "Analytics",
      icon: BarChart3,
      href: "/dashboard/analytics",
      color: "text-pink-700",
    },
    {
      label: "Team",
      icon: Users,
      href: "/dashboard/team",
      color: "text-orange-700",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
    },
    {
      label: "Help",
      icon: HelpCircle,
      href: "/dashboard/help",
    },
  ]

  return (
    <div className={cn("pb-12", className)} {...props}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                  pathname === route.href
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground",
                )}
              >
                <div className="flex items-center flex-1">
                  <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                  {route.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 