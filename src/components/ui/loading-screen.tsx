import { Icons } from '@/components/ui/icons'

export function LoadingScreen() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Icons.spinner className="h-8 w-8 animate-spin" />
    </div>
  )
} 