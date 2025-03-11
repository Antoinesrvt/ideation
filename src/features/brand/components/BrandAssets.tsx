import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileImage, 
  FileText, 
  PresentationIcon,
  Download, 
  Edit, 
  Save, 
  Trash2, 
  Upload, 
  X,
  Search,
  Filter,
  Grid,
  List,
  Clock,
  Tag,
  Info,
  ExternalLink,
  History
} from 'lucide-react';

type ViewMode = 'grid' | 'list';

interface AssetVersion {
  id: string;
  url: string;
  createdAt: string;
  createdBy: string;
  notes?: string;
}

interface AssetMetadata {
  dimensions?: string;
  fileSize?: string;
  fileType?: string;
  lastModified: string;
  version: string;
  tags: string[];
}

interface AssetItem {
  id: string;
  name: string;
  url: string;
  type: string;
  category: string;
  description?: string;
  metadata: AssetMetadata;
  versions: AssetVersion[];
  collection?: string;
  usageGuidelines?: string;
}

interface AssetCollection {
  id: string;
  name: string;
  description?: string;
  assets: string[]; // Asset IDs
}

interface BrandAssetsData {
  assets: AssetItem[];
  collections: AssetCollection[];
}

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

  // Render functions
  const renderAssetCard = (asset: AssetItem) => (
    <Card key={asset.id} className="group relative overflow-hidden hover:shadow-lg transition-all">
      <div className="aspect-square relative overflow-hidden bg-slate-100">
        <img 
          src={asset.url} 
          alt={asset.name}
          className="object-cover w-full h-full transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowAssetDetail(asset.id)}>
            <Info className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="sm" onClick={() => window.open(asset.url, '_blank')}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="sm" onClick={() => {
            setEditingAsset(asset);
            setIsEditing(true);
          }}>
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium text-sm truncate">{asset.name}</h3>
            <p className="text-xs text-slate-500">{asset.metadata.fileType}</p>
          </div>
          <Badge variant="secondary" className="text-xs">
            {asset.category}
          </Badge>
        </div>
        {asset.metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {asset.metadata.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderAssetList = (asset: AssetItem) => (
    <div key={asset.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-lg group">
      <div className="h-16 w-16 rounded-lg overflow-hidden bg-slate-100">
        <img 
          src={asset.url} 
          alt={asset.name}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm">{asset.name}</h3>
        <p className="text-xs text-slate-500 truncate">{asset.description}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className="text-xs">
            {asset.category}
          </Badge>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-500">{asset.metadata.fileType}</span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-500">{asset.metadata.fileSize}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="sm" onClick={() => setShowAssetDetail(asset.id)}>
          <Info className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => window.open(asset.url, '_blank')}>
          <Download className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => {
          setEditingAsset(asset);
          setIsEditing(true);
        }}>
          <Edit className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  // Add a ViewToggle component implementation
  const ViewToggle = ({ className = '' }: { className?: string }) => (
    <div className={`flex items-center space-x-1 ${className}`}>
      <Button
        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() => setViewMode('list')}
      >
        <List className="h-4 w-4" />
        <span className="sr-only">List View</span>
      </Button>
      <Button
        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() => setViewMode('grid')}
      >
        <Grid className="h-4 w-4" />
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
      {filteredAssets.length === 0 ? (
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
          {filteredAssets.map(asset => 
            viewMode === 'grid' ? renderAssetCard(asset) : renderAssetList(asset)
          )}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Asset</DialogTitle>
            <DialogDescription>
              Add a new asset to your brand library
            </DialogDescription>
          </DialogHeader>
          {/* Upload form would go here */}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleUploadAsset({})}>
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Asset Detail Dialog */}
      <Dialog open={!!showAssetDetail} onOpenChange={() => setShowAssetDetail(null)}>
        <DialogContent className="sm:max-w-2xl">
          {showAssetDetail && data.assets.find(a => a.id === showAssetDetail) && (
            <>
              <DialogHeader>
                <DialogTitle>Asset Details</DialogTitle>
              </DialogHeader>
              {/* Asset details would go here */}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 