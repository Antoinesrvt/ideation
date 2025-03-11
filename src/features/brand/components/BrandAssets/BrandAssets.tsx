import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileImage, Search, Upload } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from '@/components/ui/use-toast';
import { AssetCard } from './AssetCard';
import { AssetList } from './AssetList';
import { AssetUploadDialog } from './AssetUploadDialog';
import { AssetDetailDialog } from './AssetDetailDialog';
import type { AssetItem, BrandAssetsData, ViewMode } from './types';

interface BrandAssetsProps {
  data: BrandAssetsData;
}

export function BrandAssets({ data }: BrandAssetsProps) {
  // State management
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showAssetDetail, setShowAssetDetail] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetItem | null>(null);

  // Filter assets based on search and filters
  const filteredAssets = data.assets?.filter(asset => {
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.metadata.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    const matchesCollection = selectedCollection === 'all' || asset.collection === selectedCollection;
    
    return matchesSearch && matchesCategory && matchesCollection;
  });

  // Asset management functions
  const handleUploadAsset = async (assetData: Partial<AssetItem>) => {
    try {
      // Here you would implement the actual upload logic
      toast({
        title: "Asset uploaded",
        description: "Your asset has been uploaded successfully."
      });
      setShowUploadDialog(false);
    } catch (error) {
      toast({
        title: "Error uploading asset",
        description: "There was a problem uploading your asset.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateAsset = async (assetData: AssetItem) => {
    try {
      // Here you would implement the actual update logic
      toast({
        title: "Asset updated",
        description: "Your changes have been saved successfully."
      });
      setIsEditing(false);
      setEditingAsset(null);
    } catch (error) {
      toast({
        title: "Error updating asset",
        description: "There was a problem updating the asset.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    try {
      // Here you would implement the actual delete logic
      toast({
        title: "Asset deleted",
        description: "The asset has been deleted successfully."
      });
    } catch (error) {
      toast({
        title: "Error deleting asset",
        description: "There was a problem deleting the asset.",
        variant: "destructive"
      });
    }
  };

  // Add a ViewToggle component implementation
  const ViewToggle = ({ className = '' }: { className?: string }) => (
    <div className={`flex items-center space-x-1 ${className}`}>
      <Button
        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() => setViewMode('list')}
      >
        <FileImage className="h-4 w-4" />
        <span className="sr-only">List View</span>
      </Button>
      <Button
        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() => setViewMode('grid')}
      >
        <FileImage className="h-4 w-4" />
        <span className="sr-only">Grid View</span>
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Brand Assets</h2>
          <p className="text-slate-500 mt-1">
            Manage and organize your brand's digital assets
          </p>
        </div>
        <Button onClick={() => setShowUploadDialog(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Asset
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="logos">Logos</SelectItem>
            <SelectItem value="images">Images</SelectItem>
            <SelectItem value="documents">Documents</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedCollection} onValueChange={setSelectedCollection}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Collection" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Collections</SelectItem>
            {data.collections.map(collection => (
              <SelectItem key={collection.id} value={collection.id}>
                {collection.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ViewToggle />
      </div>

      {/* Assets Grid/List */}
      {filteredAssets?.length === 0 ? (
        <Card className="py-16">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <FileImage className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No assets found</h3>
            <p className="text-slate-500 max-w-sm">
              {searchQuery 
                ? "No assets match your search criteria. Try adjusting your filters or search query."
                : "Start by uploading your first brand asset using the upload button above."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "divide-y divide-slate-200"
        }>
          {filteredAssets?.map(asset => 
            viewMode === 'grid' ? (
              <AssetCard 
                key={asset.id}
                asset={asset}
                onView={(id) => setShowAssetDetail(id)}
                onEdit={(asset) => {
                  setEditingAsset(asset);
                  setIsEditing(true);
                }}
                onDelete={handleDeleteAsset}
              />
            ) : (
              <AssetList
                key={asset.id}
                asset={asset}
                onView={(id) => setShowAssetDetail(id)}
                onEdit={(asset) => {
                  setEditingAsset(asset);
                  setIsEditing(true);
                }}
                onDelete={handleDeleteAsset}
              />
            )
          )}
        </div>
      )}

      {/* Upload Dialog */}
      <AssetUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onUpload={handleUploadAsset}
        collections={data.collections}
      />

      {/* Asset Detail Dialog */}
      <AssetDetailDialog
        asset={showAssetDetail ? data.assets.find(a => a.id === showAssetDetail) || null : null}
        open={!!showAssetDetail}
        onOpenChange={(open) => !open && setShowAssetDetail(null)}
        onEdit={handleUpdateAsset}
      />
    </div>
  );
} 