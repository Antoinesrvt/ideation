'use client'

import { useEffect, useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { useProject } from '@/context/project-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { CreateProjectDialog } from '@/components/projects/create-project-dialog'
import { useRouter } from 'next/navigation'
import { ProjectRow, ModuleRow } from '@/types/project'

export default function ProjectsPage() {
  const { state: { projects, isLoading }, loadProjects } = useProject()
  const { toast } = useToast()

  useEffect(() => {
    // Only load projects once on mount
    loadProjects()
  }, []) // Empty dependency array

  if (isLoading) {
    return (
      <div className="h-full flex-1 flex flex-col gap-8 p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-8 w-[150px]" />
            <Skeleton className="h-4 w-[250px]" />
          </div>
          <Skeleton className="h-10 w-[120px]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[280px] rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex-1 flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage and track your startup projects
          </p>
        </div>
        <CreateProjectDialog onProjectCreated={loadProjects}>
          <Button size="sm" className="h-10">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </CreateProjectDialog>
      </div>

      {projects.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-8 h-[400px]">
          <div className="max-w-md text-center space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">No projects yet</h2>
            <p className="text-muted-foreground">
              Create your first project to get started with building your startup.
              We'll guide you through the process step by step.
            </p>
            <CreateProjectDialog onProjectCreated={loadProjects}>
              <Button size="lg" className="mt-4">
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Project
              </Button>
            </CreateProjectDialog>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project}
              onDeleted={loadProjects}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface ProjectCardProps {
  project: ProjectRow & { modules?: ModuleRow[] }
  onDeleted?: () => void
}

function ProjectCard({ project, onDeleted }: ProjectCardProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const { state: { isLoading }, loadProjects, deleteProject } = useProject()
  
  // Calculate progress based on module status
  const modules = project.modules || []
  const completedModules = modules.filter(m => m.status === 'completed').length
  const totalModules = modules.length
  const progress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0

  async function handleDelete() {
    try {
      setDeleting(true)
      await deleteProject(project.id)
      await loadProjects() // Refresh the projects list
      toast({
        title: 'Success',
        description: 'Project deleted successfully',
      })
      onDeleted?.()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleContinue = () => {
    router.push(`/project/${project.id}`)
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 group">
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-xl tracking-tight group-hover:text-primary transition-colors">
                {project.title}
              </h3>
              <span className={`capitalize px-3 py-1 rounded-full text-xs font-medium ${
                project.stage === 'idea'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                  : project.stage === 'mvp'
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
              }`}>
                {project.stage}
              </span>
            </div>
            <p className="text-muted-foreground text-sm line-clamp-2">
              {project.description || 'No description'}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={handleContinue}
              >
                Continue Project
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Project'
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-in-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {completedModules} of {totalModules} modules
          </div>
          
          <Button onClick={handleContinue} size="sm">
            Continue
          </Button>
        </div>
      </div>
    </Card>
  )
} 