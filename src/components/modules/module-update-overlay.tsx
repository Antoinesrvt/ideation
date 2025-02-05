import { motion, AnimatePresence } from 'framer-motion'
import { FileText, RefreshCw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ModuleUpdateOverlayProps {
  isVisible: boolean
  onGenerateDocument: () => void
  onSkip: () => void
  documentName?: string
}

export function ModuleUpdateOverlay({
  isVisible,
  onGenerateDocument,
  onSkip,
  documentName = 'document'
}: ModuleUpdateOverlayProps) {
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
              {/* Icon Animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="relative"
              >
                <div className="absolute inset-0 animate-pulse-slow">
                  <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary opacity-50" />
                  </div>
                </div>
                <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
              </motion.div>
              
              {/* Content */}
              <div className="space-y-2">
                <motion.h2 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold"
                >
                  Module Updated
                </motion.h2>
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-muted-foreground"
                >
                  Would you like to regenerate your {documentName} with the latest changes?
                </motion.p>
              </div>
              
              {/* Actions */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col gap-2 pt-4"
              >
                <Button
                  onClick={onGenerateDocument}
                  size="lg"
                  className="w-full group"
                >
                  <RefreshCw className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                  Regenerate Document
                </Button>
                <Button
                  onClick={onSkip}
                  variant="ghost"
                  size="lg"
                  className="w-full"
                >
                  Skip for Now
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 