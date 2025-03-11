import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DosDontsProps {
  dos: string[];
  donts: string[];
  className?: string;
  showIcons?: boolean;
}

export function DosDonts({
  dos,
  donts,
  className,
  showIcons = true
}: DosDontsProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
      {/* Do's */}
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="p-4 space-y-2">
          <h4 className="font-medium text-green-700 flex items-center mb-3">
            {showIcons && <Check className="h-4 w-4 mr-2" />}
            Do
          </h4>
          <ul className="space-y-2 pl-4">
            {dos.map((item, index) => (
              <li 
                key={index} 
                className="text-sm text-green-800 list-disc marker:text-green-500"
              >
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Don'ts */}
      <Card className="border-red-200 bg-red-50/50">
        <CardContent className="p-4 space-y-2">
          <h4 className="font-medium text-red-700 flex items-center mb-3">
            {showIcons && <X className="h-4 w-4 mr-2" />}
            Don't
          </h4>
          <ul className="space-y-2 pl-4">
            {donts.map((item, index) => (
              <li 
                key={index} 
                className="text-sm text-red-800 list-disc marker:text-red-500"
              >
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
} 