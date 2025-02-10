
import { useCallback, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import { ChatService, ChatMessage, ChatOptions } from '@/lib/services/ai/chat-service'
import { ModuleType } from '@/types/project'
import { AIRequestContext } from '@/lib/services/ai/base-service'

interface UseChatOptions extends ChatOptions {
  onSuccess?: (response: string) => void
  onError?: (error: Error) => void
}

export function useAIChat(
  projectId: string,
  moduleType: ModuleType,
  options: UseChatOptions = {}
) {
  const { toast } = useToast()
  const chatServiceRef = useRef<ChatService>()

  // Initialize chat service if not exists
  if (!chatServiceRef.current) {
    chatServiceRef.current = new ChatService(projectId, moduleType, options)
  }

  // Chat mutation
  const { mutate: chat, isPending } = useMutation({
    mutationFn: async ({ 
      message, 
      context 
    }: { 
      message: string
      context?: AIRequestContext
    }) => {
      if (!chatServiceRef.current) {
        throw new Error('Chat service not initialized')
      }
      return chatServiceRef.current.chat(message, context)
    },
    onSuccess: (response) => {
      options.onSuccess?.(response)
    },
    onError: (error: Error) => {
      toast({
        title: 'Chat Error',
        description: error.message,
        variant: 'destructive'
      })
      options.onError?.(error)
    }
  })

  // Get chat history
  const getHistory = useCallback((): ChatMessage[] => {
    if (!chatServiceRef.current) {
      return []
    }
    return chatServiceRef.current.getHistory()
  }, [])

  // Clear chat history
  const clearHistory = useCallback((): void => {
    chatServiceRef.current?.clearHistory()
  }, [])

  return {
    chat,
    getHistory,
    clearHistory,
    isLoading: isPending
  }
} 