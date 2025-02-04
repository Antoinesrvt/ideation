import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const activities = [
  {
    id: 1,
    user: {
      name: "John Doe",
      image: "/avatars/01.png",
      initials: "JD"
    },
    action: "created a new project",
    project: "E-commerce Platform",
    time: "2 hours ago"
  },
  {
    id: 2,
    user: {
      name: "Sarah Smith",
      image: "/avatars/02.png",
      initials: "SS"
    },
    action: "updated market analysis",
    project: "Mobile App",
    time: "5 hours ago"
  },
  {
    id: 3,
    user: {
      name: "Mike Johnson",
      image: "/avatars/03.png",
      initials: "MJ"
    },
    action: "completed validation phase",
    project: "SaaS Tool",
    time: "1 day ago"
  },
]

export function RecentActivity() {
  return (
    <div className="space-y-8">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={activity.user.image} alt={activity.user.name} />
            <AvatarFallback>{activity.user.initials}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {activity.user.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {activity.action} - {activity.project}
            </p>
            <p className="text-xs text-muted-foreground">
              {activity.time}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
} 