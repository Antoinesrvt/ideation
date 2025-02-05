"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, RefreshCw, ArrowLeft, Home } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from "next/navigation"

interface ModuleErrorBoundaryProps {
  children: React.ReactNode
  onRetry?: () => void
  onBack?: () => void
}

export function ModuleErrorBoundary({ children, onRetry, onBack }: ModuleErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const [errorDetails, setErrorDetails] = useState<{ message: string; timestamp: string } | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    function handleError(event: ErrorEvent) {
      const timestamp = new Date().toISOString()
      console.error('Module error:', {
        error: event.error,
        message: event.message,
        timestamp,
        stack: event.error?.stack
      })
      
      setHasError(true)
      setErrorDetails({
        message: event.error?.message || event.message,
        timestamp
      })
      
      toast({
        title: "Module Error",
        description: "There was an error loading this module. Please try the suggested actions below.",
        variant: "destructive"
      })
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [toast])

  if (hasError) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Module</AlertTitle>
          <AlertDescription>
            We encountered an issue while loading this module. This could be due to:
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Temporary connection issues</li>
              <li>Server unavailability</li>
              <li>Data loading problems</li>
            </ul>
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Suggested Actions</CardTitle>
            <CardDescription>
              Here are some steps you can take to resolve this issue:
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center gap-4">
                <RefreshCw className="h-5 w-5 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Refresh the page</p>
                  <p className="text-sm text-muted-foreground">
                    This will reload all module data and might resolve temporary issues
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Go back to previous module</p>
                  <p className="text-sm text-muted-foreground">
                    You can continue working on other modules while this issue is resolved
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Home className="h-5 w-5 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Return to selection screen</p>
                  <p className="text-sm text-muted-foreground">
                    Start fresh from the module selection screen
                  </p>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex gap-4 justify-end">
            {onBack && (
              <Button
                variant="outline"
                onClick={onBack}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Page
            </Button>
            
            {onRetry && (
              <Button
                variant="default"
                onClick={() => {
                  setHasError(false)
                  setErrorDetails(null)
                  onRetry()
                }}
                className="gap-2"
              >
                Try Again
              </Button>
            )}
          </CardFooter>
        </Card>

        {errorDetails && (
          <div className="text-xs text-muted-foreground">
            Error ID: {errorDetails.timestamp}
          </div>
        )}
      </div>
    )
  }

  return <>{children}</>
} 