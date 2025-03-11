import React from 'react';
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

interface AssetListProps {
  asset: AssetItem;
  onView: (id: string) => void;
  onEdit: (asset: AssetItem) => void;
  onDelete?: (id: string) => void;
  onDownload?: (url: string) => void;
}

export function AssetList({
  asset,
  onView,
  onEdit,
  onDelete,
  onDownload
}: AssetListProps) {
  const handleDownload = () => {
    if (onDownload) {
      onDownload(asset.url);
    } else {
      window.open(asset.url, '_blank');
    }
  };

  return (
    <div className="flex items-center gap-4 py-4 px-6 hover:bg-slate-50">
      {/* Thumbnail */}
      <div 
        className="relative w-16 h-16 rounded overflow-hidden bg-slate-100 cursor-pointer flex-shrink-0"
        onClick={() => onView(asset.id)}
      >
        <img
          src={asset.thumbnailUrl}
          alt={asset.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex-grow min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="font-medium text-sm truncate" title={asset.name}>
              {asset.name}
            </h3>
            {asset.description && (
              <p className="text-sm text-slate-500 truncate" title={asset.description}>
                {asset.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-sm text-slate-500">
              {formatFileSize(asset.metadata.fileSize)} • {formatDate(asset.metadata.dateModified)}
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
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-xs">
            {asset.category}
          </Badge>
          {asset.metadata.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {asset.metadata.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{asset.metadata.tags.length - 3}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
} 