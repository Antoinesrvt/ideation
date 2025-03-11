export type ViewMode = 'grid' | 'list';

export interface AssetMetadata {
  fileSize: number;
  dimensions?: {
    width: number;
    height: number;
  };
  fileType: string;
  dateCreated: string;
  dateModified: string;
  tags: string[];
  version: string;
}

export interface AssetItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  collection: string;
  url: string;
  thumbnailUrl: string;
  metadata: AssetMetadata;
  usageGuidelines?: string;
  permissions?: {
    canEdit: boolean;
    canDelete: boolean;
    canDownload: boolean;
  };
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  assetCount: number;
}

export interface BrandAssetsData {
  assets: AssetItem[];
  collections: Collection[];
  totalAssets: number;
  totalCollections: number;
} 