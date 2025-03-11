import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Download, Edit2, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatFileSize, formatDate } from '@/lib/utils';
import type { AssetItem } from './types';

interface AssetCardProps {
  asset: AssetItem;
  onView: (id: string) => void;
  onEdit: (asset: AssetItem) => void;
  onDelete?: (id: string) => void;
  onDownload?: (url: string) => void;
}

export function AssetCard({ 
  asset, 
  onView, 
  onEdit, 
  onDelete, 
  onDownload 
}: AssetCardProps) {
  const handleDownload = () => {
    if (onDownload) {
      onDownload(asset.url);
    } else {
      window.open(asset.url, '_blank');
    }
  };

  return (
    <Card className="overflow-hidden group">
      {/* Asset Preview */}
      <div 
        className="relative aspect-square bg-slate-100 cursor-pointer"
        onClick={() => onView(asset.id)}
      >
        <img
          src={asset.thumbnailUrl}
          alt={asset.name}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Eye className="w-8 h-8 text-white" />
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-medium text-sm truncate" title={asset.name}>
              {asset.name}
            </h3>
            {asset.description && (
              <p className="text-sm text-slate-500 line-clamp-2" title={asset.description}>
                {asset.description}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(asset.id)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              {asset.permissions?.canEdit && (
                <DropdownMenuItem onClick={() => onEdit(asset)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {asset.permissions?.canDownload && (
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
              )}
              {asset.permissions?.canDelete && onDelete && (
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => onDelete(asset.id)}
                >
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-xs">
            {asset.category}
          </Badge>
          {asset.metadata.tags.slice(0, 2).map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {asset.metadata.tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{asset.metadata.tags.length - 2}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="px-4 py-3 bg-slate-50 text-xs text-slate-500">
        <div className="flex items-center justify-between w-full">
          <span>{formatFileSize(asset.metadata.fileSize)}</span>
          <span>{formatDate(asset.metadata.dateModified)}</span>
        </div>
      </CardFooter>
    </Card>
  );
} 