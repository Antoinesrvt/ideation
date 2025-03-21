import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/overview"
import { RecentActivity } from "@/components/recent-activity"
import ProjectsPage from "./projects/page"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <ProjectsPage />
    </div>
  )
} 