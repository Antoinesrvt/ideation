import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Download, Edit2, ExternalLink } from 'lucide-react';
import { formatFileSize, formatDate } from '@/lib/utils';
import type { AssetItem } from './types';

interface AssetDetailDialogProps {
  asset: AssetItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (asset: AssetItem) => void;
  onDownload?: (url: string) => void;
}

export function AssetDetailDialog({
  asset,
  open,
  onOpenChange,
  onEdit,
  onDownload
}: AssetDetailDialogProps) {
  if (!asset) return null;

  const handleDownload = () => {
    if (onDownload) {
      onDownload(asset.url);
    } else {
      window.open(asset.url, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{asset.name}</span>
            <div className="flex items-center gap-2">
              {asset.permissions?.canEdit && onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(asset)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              {asset.permissions?.canDownload && (
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-6">
          {/* Preview */}
          <div className="col-span-1">
            <div className="aspect-square rounded-lg overflow-hidden bg-slate-100">
              <img
                src={asset.thumbnailUrl}
                alt={asset.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Size</span>
                <span>{formatFileSize(asset.metadata.fileSize)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Type</span>
                <span>{asset.metadata.fileType}</span>
              </div>
              {asset.metadata.dimensions && (
                <div className="flex justify-between text-slate-500">
                  <span>Dimensions</span>
                  <span>
                    {`${asset.metadata.dimensions.width} × ${asset.metadata.dimensions.height}`}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Created</span>
                <span>{formatDate(asset.metadata.dateCreated)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Modified</span>
                <span>{formatDate(asset.metadata.dateModified)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Version</span>
                <span>{asset.metadata.version}</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="col-span-2">
            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="usage">Usage Guidelines</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Description</h3>
                  <p className="text-sm text-slate-500">
                    {asset.description || 'No description provided.'}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-1">Category</h3>
                  <Badge variant="secondary">{asset.category}</Badge>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-1">Collection</h3>
                  <Badge variant="outline">{asset.collection}</Badge>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-1">Tags</h3>
                  <div className="flex flex-wrap gap-1">
                    {asset.metadata.tags.map(tag => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                    {asset.metadata.tags.length === 0 && (
                      <span className="text-sm text-slate-500">No tags</span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-1">Asset URL</h3>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-slate-100 p-2 rounded flex-1 truncate">
                      {asset.url}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => window.open(asset.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="usage" className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  {asset.usageGuidelines ? (
                    <div dangerouslySetInnerHTML={{ __html: asset.usageGuidelines }} />
                  ) : (
                    <p className="text-sm text-slate-500">
                      No usage guidelines have been provided for this asset.
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 