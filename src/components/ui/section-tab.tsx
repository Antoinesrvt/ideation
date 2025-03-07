 import React, { ReactNode, useState } from "react";
 import {ChevronDown, ChevronUp, Info, Plus, PlusCircle } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Card, CardContent } from "@/components/ui/card";
 import { Badge } from "./badge";
 import {
   Collapsible,
   CollapsibleContent,
   CollapsibleTrigger,
 } from "@/components/ui/collapsible";
 import { ScrollArea } from "@/components/ui/scroll-area";

 export interface SectionTabProps {
   /**
    * Icon to display next to the title and in the empty state
    * @example <Users /> or <TrendingUp />
    */
   icon: ReactNode;

   /**
    * The title of the section
    * @example "Hypotheses" or "Market Trends"
    */
   title: string;

   /**
    * The number of items in the section
    */
   count: number;

   /**
    * Description text to display below the title
    */
   description?: string;

   /**
    * Function to call when the "New X" button is clicked
    * Will create a button saying "New {title.slice(0, -1)}" (removes plural)
    */
   onCreate?: () => void;

   /**
    * Helper dropdown configuration
    */
   helper?: {
     /**
      * Icon to display in the helper dropdown
      * @default <Info />
      */
     icon?: ReactNode;

     /**
      * Title of the helper dropdown
      * @example "Creating Effective Hypotheses"
      */
     title: string;

     /**
      * Content to display in the helper dropdown
      */
     content: ReactNode;
   };

   /**
    * Empty state customization
    */
   emptyState?: {
     /**
      * Custom empty state text (defaults to "No {title} Yet")
      */
     title?: string;

     /**
      * Additional helper text for the empty state
      */
     description?: string;
   };

   /**
    * Whether the section has any items
    * If false, will show the empty state
    * @default false
    */
   hasItems?: boolean;

   /**
    * The children content to render when there are items
    */
   children?: ReactNode;

   /**
    * Additional class names to apply to the root container
    */
   className?: string;
 }

 export function SectionTab({
   icon,
   title,
   description,
   onCreate,
   helper,
   emptyState,
   hasItems = false,
   count,
   children,
   className,
 }: SectionTabProps) {
   const [helperOpen, setHelperOpen] = useState(false);

   // Generate the singular form of the title for button text
   const singularTitle = title.endsWith("s") ? title.slice(0, -1) : title;

   return (
     <div className="mt-6 border-none shadow-none">
       {/* Header section with title, description, and action button */}
       <div className="flex items-center justify-between mb-4">
         <div className="flex items-center">
           <h2 className="text-xl font-heading font-semibold text-primary-800">
             {title}
           </h2>
           <div className="flex items-center gap-2">
             <Badge variant="outline" className="ml-2">
               {count}
             </Badge>
           </div>
         </div>
         <div className="flex items-center gap-2">
           {onCreate && (
             <Button onClick={onCreate}>
               <PlusCircle className="h-4 w-4 mr-2" />
               New {singularTitle}
             </Button>
           )}
         </div>
       </div>

       {/* Helper collapsible section */}
       {helper && (
         <Collapsible
           open={helperOpen}
           onOpenChange={setHelperOpen}
           className="bg-primary-50/70 rounded-md border border-primary-100 overflow-hidden transition-all"
         >
           <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2 text-primary-800 hover:bg-primary-100/50 transition-colors">
             <div className="flex items-center gap-2">
               {helper.icon || <Info className="h-4 w-4" />}
               <span className="font-medium">{helper.title}</span>
             </div>
             {helperOpen ? (
               <ChevronUp className="h-4 w-4" />
             ) : (
               <ChevronDown className="h-4 w-4" />
             )}
           </CollapsibleTrigger>
           <CollapsibleContent className="px-4 py-3 bg-white/70 backdrop-blur-sm">
             {helper.content}
           </CollapsibleContent>
         </Collapsible>
       )}

       {/* Main content or empty state */}
       <div className="min-h-[200px] pt-3">
         {hasItems ? (
           <ScrollArea className="h-full max-h-[calc(100vh-300px)]">
             {children}
           </ScrollArea>
         ) : (
           <Card
             variant="outline"
             className="border-dashed border-gray-300 bg-gray-50/50"
           >
             <CardContent className="flex flex-col items-center justify-center text-center py-12 px-4">
               <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
                 {icon}
               </div>
               <h3 className="text-xl font-heading font-medium text-dark-700 mb-2">
                 {emptyState?.title || `No ${title} Yet`}
               </h3>
               <p className="text-dark-500 max-w-md">
                 {emptyState?.description ||
                   `Formulate and track your key ${title.toLowerCase()} and their validation status`}
               </p>
               {onCreate && (
                 <Button variant="default" className="mt-6" onClick={onCreate}>
                   <PlusCircle className="h-4 w-4 mr-1.5" />
                   New {singularTitle}
                 </Button>
               )}
             </CardContent>
           </Card>
         )}
       </div>
     </div>
   );
 }