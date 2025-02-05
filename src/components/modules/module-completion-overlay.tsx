import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ModuleCompletionOverlayProps {
  isVisible: boolean
  onNext?: () => void
  nextModuleName?: string
  onClose?: () => void
}

export function ModuleCompletionOverlay({
  isVisible,
  onNext,
  nextModuleName,
  onClose
}: ModuleCompletionOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative max-w-lg w-full mx-4 p-6 bg-card rounded-xl shadow-lg"
          >
            <div className="space-y-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="relative"
              >
                <div className="absolute inset-0 animate-pulse-slow">
                  <Sparkles className="h-12 w-12 mx-auto text-primary opacity-50" />
                </div>
                <Sparkles className="h-12 w-12 mx-auto text-primary" />
              </motion.div>
              
              <div className="space-y-2">
                <motion.h2 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold"
                >
                  Module Completed! 🎉
                </motion.h2>
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-muted-foreground"
                >
                  Great job! You've completed this module successfully.
                </motion.p>
              </div>
              
              {nextModuleName && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="pt-4"
                >
                  <Button
                    onClick={onNext}
                    className="group"
                    size="lg"
                  >
                    Continue to {nextModuleName}
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              )}
              
              {!nextModuleName && onClose && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="pt-4"
                >
                  <Button
                    onClick={onClose}
                    variant="outline"
                    size="lg"
                  >
                    Close
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 