import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import TabList from "@/features/common/components/TabList";
import { useProjectStore } from "@/store/project-store";
import { brandTabs } from "../data/tabs";
import { BrandEssentials } from './BrandEssentials';
import { VisualIdentity } from './VisualIdentity';
import { VoiceTone } from './VoiceTone';
import { BrandAssets } from './BrandAssets';
import { BrandGuidelines } from './BrandGuidelines';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Palette, 
  FileImage, 
  MessageSquare, 
  FileText, 
  BookOpen,
  Download,
  Info,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Share2,
  Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
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
import { BrandData, ValueItem, AudienceSegment } from '../types/brand-essentials.types';
import { BrandEssentials as OtherBrandEssentials } from './otherBrandEssentials';
import { Separator } from '@/components/ui/separator';

export function BrandIdentity() {
  const [activeTab, setActiveTab] = useState("essentials");
  const { currentData } = useProjectStore();
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState("pdf");
  const [isExporting, setIsExporting] = useState(false);
  
  // Memoize the project ID to ensure it doesn't change on every render
  const projectId = currentData?.project?.id;
  
  // Convert the existing assets data to the new format
  const mockBrandData: BrandData = {
    essentials: {
      name: "Kickoff",
      tagline: "Launch your ideas faster",
      mission: "To empower entrepreneurs and innovators to turn their ideas into successful projects with less friction and more confidence.",
      vision: "A world where great ideas can be easily transformed into impactful solutions.",
      values: [
        {
          id: "value-1",
          title: "Innovation",
          description: "We push boundaries and embrace new solutions",
          impact: "high" satisfies 'high' | 'medium' | 'low',
          examples: [
            "AI-powered project insights",
            "Real-time collaboration features",
            "Automated workflow suggestions"
          ],
          metrics: {
            alignment: 90,
            implementation: 85,
            impact: 95
          }
        },
        {
          id: "value-2",
          title: "Simplicity",
          description: "We make complex processes accessible and intuitive",
          impact: "high" satisfies 'high' | 'medium' | 'low',
          examples: [
            "One-click project setup",
            "Clear, guided workflows",
            "Minimalist interface design"
          ],
          metrics: {
            alignment: 95,
            implementation: 90,
            impact: 90
          }
        },
        {
          id: "value-3",
          title: "Quality",
          description: "We maintain high standards in everything we do",
          impact: "medium" satisfies 'high' | 'medium' | 'low',
          examples: [
            "Rigorous testing processes",
            "Regular performance audits",
            "User feedback integration"
          ],
          metrics: {
            alignment: 85,
            implementation: 80,
            impact: 85
          }
        },
        {
          id: "value-4",
          title: "Empowerment",
          description: "We give users the tools and confidence to succeed",
          impact: "high" satisfies 'high' | 'medium' | 'low',
          examples: [
            "Comprehensive learning resources",
            "Success story showcases",
            "Community support features"
          ],
          metrics: {
            alignment: 90,
            implementation: 85,
            impact: 90
          }
        }
      ] satisfies ValueItem[],
      targetAudience: [
        {
          id: "segment-1",
          name: "Startup Founders",
          description: "Early-stage entrepreneurs looking to validate and launch their ideas quickly",
          color: "#0066FF",
          size: 5000000,
          needs: [
            "Quick idea validation",
            "Cost-effective tools",
            "Scalable solutions"
          ],
          painPoints: [
            "Limited resources",
            "Time constraints",
            "Technical complexity"
          ],
          channels: [
            "Social media",
            "Startup communities",
            "Tech blogs"
          ],
          marketSize: 5000000,
          priority: 1,
          growthRate: 15
        },
        {
          id: "segment-2",
          name: "Product Managers",
          description: "Product leaders in established companies seeking efficient project management",
          color: "#10B981",
          size: 2000000,
          needs: [
            "Team collaboration",
            "Progress tracking",
            "Resource management"
          ],
          painPoints: [
            "Stakeholder alignment",
            "Feature prioritization",
            "Timeline management"
          ],
          channels: [
            "Professional networks",
            "Industry conferences",
            "PM communities"
          ],
          marketSize: 2000000,
          priority: 2,
          growthRate: 10
        },
        {
          id: "segment-3",
          name: "Innovation Teams",
          description: "Corporate innovation teams working on new initiatives",
          color: "#8B5CF6",
          size: 1000000,
          needs: [
            "Rapid prototyping",
            "Cross-team coordination",
            "Innovation metrics"
          ],
          painPoints: [
            "Corporate bureaucracy",
            "Risk management",
            "Innovation measurement"
          ],
          channels: [
            "Enterprise sales",
            "Innovation forums",
            "Industry events"
          ],
          marketSize: 1000000,
          priority: 3,
          growthRate: 20
        },
        {
          id: "segment-4",
          name: "Entrepreneurs",
          description: "Individual business owners and freelancers",
          color: "#F59E0B",
          size: 10000000,
          needs: [
            "Business planning",
            "Project organization",
            "Growth strategies"
          ],
          painPoints: [
            "Limited expertise",
            "Budget constraints",
            "Work-life balance"
          ],
          channels: [
            "Online communities",
            "Business networks",
            "Social platforms"
          ],
          marketSize: 10000000,
          priority: 2,
          growthRate: 12
        }
      ] satisfies AudienceSegment[],
      uniqueValueProposition: "Launch successful projects faster with guided workflows and AI-powered insights",
      completion: {
        core: 100,
        values: 100,
        audience: 100,
        overall: 100,
        lastUpdated: new Date().toISOString()
      }
    },
    visual: {
      colors: {
        primary: "#0066FF",
        secondary: "#6B7280",
        accent: "#10B981",
        background: "#FFFFFF",
        text: "#111827"
      },
      typography: {
        headingFont: "Inter",
        bodyFont: "Inter",
        sizes: {
          h1: "2.5rem",
          h2: "2rem",
          h3: "1.5rem",
          body: "1rem"
        }
      },
      logo: {
        primary: "/path/to/logo-primary.svg",
        alternative: "/path/to/logo-white.svg",
        favicon: "/path/to/favicon.ico",
        spacing: "2rem"
      },
      imagery: {
        style: "Modern, clean, and professional with a focus on productivity and innovation",
        examples: [
          "/path/to/example1.jpg",
          "/path/to/example2.jpg"
        ]
      }
    },
    voice: {
      personality: "Professional yet approachable, confident but not arrogant, helpful and encouraging",
      tone: "Conversational but precise. We avoid jargon when possible but are specific when needed.",
      examples: [
        {
          context: "Error message",
          good: "We couldn't save your changes. Please try again in a moment.",
          bad: "Error 500: Operation failed due to server-side exception."
        },
        {
          context: "Feature announcement",
          good: "Introducing our new analytics dashboard. Now you can track your project's progress with beautiful charts.",
          bad: "New feature: Analytics module with visual data representation functionality."
        }
      ],
      wordChoices: {
        use: ["simple", "clear", "helpful", "intuitive"],
        avoid: ["complex", "confusing", "difficult", "clunky"]
      }
    },
    brandAssets: {
      assets: [
        {
          id: "1",
          name: "Primary Logo",
          description: "Main brand logo for light backgrounds",
          type: "logo",
          category: "logos",
          collection: "core-assets",
          url: "/path/to/logo-primary.svg",
          thumbnailUrl: "/path/to/logo-primary-thumb.svg",
          metadata: {
            dimensions: "512x512",
            fileSize: "24 KB",
            fileType: "SVG",
            lastModified: "2024-01-15T08:00:00Z",
            version: "1.0.0",
            tags: ["logo", "primary", "branding"]
          },
          usageGuidelines: "Use on light backgrounds with adequate spacing. Do not modify colors or proportions.",
          permissions: {
            canEdit: true,
            canDelete: true,
            canDownload: true
          },
          versions: [
            {
              id: "v1",
              version: "1.0.0",
              url: "/path/to/logo-primary-v1.svg",
              createdAt: "2024-01-15T08:00:00Z",
              createdBy: "John Doe",
              notes: "Initial version"
            }
          ]
        },
        {
          id: "2",
          name: "White Logo",
          description: "Inverted logo for dark backgrounds",
          type: "logo",
          category: "logos",
          collection: "core-assets",
          url: "/path/to/logo-white.svg",
          thumbnailUrl: "/path/to/logo-white-thumb.svg",
          metadata: {
            dimensions: "512x512",
            fileSize: "22 KB",
            fileType: "SVG",
            lastModified: "2024-01-15T08:00:00Z",
            version: "1.0.0",
            tags: ["logo", "white", "branding"]
          },
          usageGuidelines: "Use on dark backgrounds with adequate spacing. Do not modify proportions.",
          permissions: {
            canEdit: true,
            canDelete: true,
            canDownload: true
          },
          versions: [
            {
              id: "v1",
              version: "1.0.0",
              url: "/path/to/logo-white-v1.svg",
              createdAt: "2024-01-15T08:00:00Z",
              createdBy: "John Doe",
              notes: "Initial version"
            }
          ]
        },
        {
          id: "3",
          name: "Brand Guidelines PDF",
          description: "Comprehensive brand style guide",
          type: "document",
          category: "documents",
          collection: "guidelines",
          url: "/path/to/brand-guide.pdf",
          thumbnailUrl: "/path/to/brand-guide-thumb.jpg",
          metadata: {
            fileSize: "2 MB",
            fileType: "PDF",
            lastModified: "2024-01-15T08:00:00Z",
            version: "1.0.0",
            tags: ["guidelines", "documentation", "branding"]
          },
          usageGuidelines: "Reference for all brand-related decisions. Share with partners and team members.",
          permissions: {
            canEdit: true,
            canDelete: false,
            canDownload: true
          },
          versions: [
            {
              id: "v1",
              version: "1.0.0",
              url: "/path/to/brand-guide-v1.pdf",
              createdAt: "2024-01-15T08:00:00Z",
              createdBy: "John Doe",
              notes: "Initial version"
            }
          ]
        }
      ],
      collections: [
        {
          id: "core-assets",
          name: "Core Assets",
          description: "Essential brand elements including logos and icons",
          assets: ["1", "2"]
        },
        {
          id: "guidelines",
          name: "Guidelines",
          description: "Brand documentation and style guides",
          assets: ["3"]
        }
      ],
      totalAssets: 3,
      totalCollections: 2
    },
    guidelines: {
      logoUsage: [
        "Do not alter the proportions of the logo",
        "Do not change the colors of the logo",
        "Ensure adequate spacing around the logo",
        "Do not place the logo on busy backgrounds"
      ],
      colorUsage: [
        "Use primary color for main actions and emphasis",
        "Use secondary color for supporting elements",
        "Maintain proper contrast ratios for accessibility",
        "Limit accent color usage to highlights and success states"
      ],
      typographyRules: [
        "Use Inter font family consistently",
        "Maintain hierarchy with defined font sizes",
        "Keep line heights proportional",
        "Use appropriate font weights for emphasis"
      ],
      accessibilityRequirements: [
        "Ensure text meets WCAG 2.1 contrast requirements",
        "Provide alt text for all images",
        "Make interactive elements keyboard accessible",
        "Design with color-blind users in mind"
      ]
    }
  };
  
  // Calculate brand analytics metrics
  const brandMetrics = useMemo(() => {
    // Calculate core completion percentages
    const essentialsCompletion = Object.values(mockBrandData.essentials).every(val => 
      val && (typeof val === 'string' ? val.trim() !== '' : val.toString().length > 0)
    ) ? 100 : 75;
    
    const visualCompletion = 
      Object.values(mockBrandData.visual.colors).every(c => c) &&
      Object.values(mockBrandData.visual.typography).every(t => 
        typeof t === 'string' ? t : Object.values(t).every(v => v)
      ) ? 100 : 80;
    
    const voiceCompletion = 
      mockBrandData.voice.personality && 
      mockBrandData.voice.tone && 
      mockBrandData.voice.examples.length > 0 && 
      mockBrandData.voice.wordChoices.use.length > 0 ? 100 : 60;
    
    const assetsCompletion = 
      mockBrandData.brandAssets.assets.length > 1 && 
      mockBrandData.brandAssets.assets[2].url ? 100 : 50;
      
    const guidelinesCompletion = Object.values(mockBrandData.guidelines)
      .every(arr => arr.length > 0) ? 100 : 70;
    
    // Calculate consistency metrics
    const consistencyIssues = [
      // Example consistency checks (in real implementation, these would check actual data)
      !mockBrandData.visual.colors.primary.startsWith("#"),
      mockBrandData.brandAssets.assets.length < 3,
      mockBrandData.guidelines.logoUsage.length < 3
    ].filter(Boolean).length;
    
    // Calculate overall brand health score
    const overallScore = Math.round(
      (essentialsCompletion + visualCompletion + voiceCompletion + assetsCompletion + guidelinesCompletion) / 5
    );

    // Calculate recommended improvements
    const improvements = [];
    
    if (essentialsCompletion < 100) {
      improvements.push({
        component: 'essentials',
        message: 'Complete missing core brand information',
        priority: 'high'
      });
    }
    
    if (mockBrandData.brandAssets.assets.length < 3) {
      improvements.push({
        component: 'assets',
        message: 'Add more logo variations (light/dark/icon)',
        priority: 'medium'
      });
    }
    
    if (mockBrandData.voice.examples.length < 3) {
      improvements.push({
        component: 'voice',
        message: 'Add more tone examples for common scenarios',
        priority: 'medium'
      });
    }
    
    // Calculate completeness trend
    const sectionScores = [
      essentialsCompletion,
      visualCompletion,
      voiceCompletion,
      assetsCompletion,
      guidelinesCompletion
    ];
    
    // Find least complete sections
    const leastCompleteSection = sectionScores.indexOf(Math.min(...sectionScores));
    const leastCompleteSectionName = ['essentials', 'visual', 'voice', 'assets', 'guidelines'][leastCompleteSection];
    
    return {
      overallScore,
      essentialsCompletion,
      visualCompletion,
      voiceCompletion,
      assetsCompletion,
      guidelinesCompletion,
      consistencyIssues,
      assetTypes: {
        logos: mockBrandData.brandAssets.assets.length,
        documents: mockBrandData.brandAssets.assets.length - 2,
        images: 2
      },
      totalAssets: mockBrandData.brandAssets.assets.length,
      improvements,
      leastCompleteSection: leastCompleteSectionName
    };
  }, [mockBrandData]);
  
  // Function to generate a style guide PDF (mock functionality)
  const handleGenerateStyleGuide = () => {
    setShowExportDialog(true);
  };

  // Function to handle the export of brand style guide
  const handleExport = () => {
    setIsExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      setShowExportDialog(false);
      
      toast({
        title: `Brand Style Guide ${exportFormat.toUpperCase()} Generated`,
        description: "Your brand style guide has been created and is ready for download."
      });
      
      // Simulate file download with a data URI for demo purposes
      // In a real implementation, this would create and download the actual file
      const link = document.createElement('a');
      link.href = `data:application/octet-stream,${encodeURIComponent(JSON.stringify(mockBrandData))}`;
      link.download = `brand-style-guide.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 2000);
  };

  // Function to copy brand assets link (mock functionality)
  const handleCopyBrandAssetsLink = () => {
    navigator.clipboard.writeText(`https://example.com/brand-assets/${projectId || 'demo'}`);
    toast({
      title: "Link Copied",
      description: "Brand assets link has been copied to clipboard."
    });
  };

  return (
    <div className="space-y-8">
      {/* Brand Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Brand Consistency
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {brandMetrics.consistencyIssues === 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                )}
                <span className="text-2xl font-bold">
                  {brandMetrics.consistencyIssues}
                </span>
                <span className="ml-2 text-sm text-gray-500">issues found</span>
              </div>
              <Badge
                variant="outline"
                className={
                  brandMetrics.consistencyIssues === 0
                    ? "bg-green-50 text-green-700"
                    : brandMetrics.consistencyIssues <= 2
                    ? "bg-yellow-50 text-yellow-700"
                    : "bg-red-50 text-red-700"
                }
              >
                {brandMetrics.consistencyIssues === 0
                  ? "Consistent"
                  : brandMetrics.consistencyIssues <= 2
                  ? "Minor Issues"
                  : "Needs Attention"}
              </Badge>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              {brandMetrics.consistencyIssues === 0
                ? "All brand elements are consistent."
                : `${brandMetrics.consistencyIssues} consistency issues need your attention.`}
            </div>
            <Separator className="my-2" />

            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={handleGenerateStyleGuide}
              >
                <FileText className="h-3 w-3 mr-1" />
                Generate Guide
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={handleCopyBrandAssetsLink}
              >
                <Share2 className="h-3 w-3 mr-1" />
                Share Assets
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Brand Assets
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-gray-50 rounded">
                <FileImage className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                <div className="text-xl font-bold">
                  {brandMetrics.assetTypes.logos}
                </div>
                <div className="text-xs text-gray-500">Logos</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <FileText className="h-4 w-4 text-purple-600 mx-auto mb-1" />
                <div className="text-xl font-bold">
                  {brandMetrics.assetTypes.documents}
                </div>
                <div className="text-xs text-gray-500">Documents</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <FileImage className="h-4 w-4 text-indigo-600 mx-auto mb-1" />
                <div className="text-xl font-bold">
                  {brandMetrics.assetTypes.images}
                </div>
                <div className="text-xs text-gray-500">Images</div>
              </div>
            </div>
            <Separator className="my-2" />
            <div className="mt-2 text-sm text-gray-500 flex justify-between items-center">
              <span>Total: {brandMetrics.totalAssets} assets</span>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center text-xs h-7"
                onClick={() => setActiveTab("assets")}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Manage Assets
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs
        defaultValue="essentials"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabList
          tabs={brandTabs.map((tab) => {
            const Icon = tab.icon;
            return {
              id: tab.id,
              label: tab.label,
              icon: <Icon className="h-4 w-4" />,
            };
          })}
          activeTab={activeTab}
        />

        <TabsContent value="essentials" className="mt-2 border-none p-0">
          <BrandEssentials
            initialData={mockBrandData.essentials}
            onSave={async (data) => {
              // Handle save
              toast({
                title: "Changes saved",
                description: "Your brand essentials have been updated.",
              });
            }}
          />
        </TabsContent>

        <TabsContent value="visual" className="mt-2 border-none p-0">
          <VisualIdentity data={mockBrandData.visual} />
        </TabsContent>

        <TabsContent value="voice" className="mt-2 border-none p-0">
          <VoiceTone data={mockBrandData.voice} />
        </TabsContent>

        <TabsContent value="assets" className="mt-2 border-none p-0">
          <BrandAssets data={mockBrandData.brandAssets} />
        </TabsContent>

        {/* <TabsContent value="guidelines" className="mt-2 border-none p-0">
          <BrandGuidelines data={mockBrandData.guidelines} />
        </TabsContent> */}
      </Tabs>

      {/* Export Style Guide Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Brand Style Guide</DialogTitle>
            <DialogDescription>
              Generate a comprehensive brand style guide that includes all your
              brand elements in one document.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Export Format</h4>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document (.pdf)</SelectItem>
                  <SelectItem value="docx">Word Document (.docx)</SelectItem>
                  <SelectItem value="html">Web Page (.html)</SelectItem>
                  <SelectItem value="json">JSON Data (.json)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">What to include</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="include-essentials"
                    className="rounded border-gray-300"
                    defaultChecked
                  />
                  <label htmlFor="include-essentials" className="text-sm">
                    Brand Essentials
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="include-visual"
                    className="rounded border-gray-300"
                    defaultChecked
                  />
                  <label htmlFor="include-visual" className="text-sm">
                    Visual Identity
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="include-voice"
                    className="rounded border-gray-300"
                    defaultChecked
                  />
                  <label htmlFor="include-voice" className="text-sm">
                    Voice & Tone
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="include-assets"
                    className="rounded border-gray-300"
                    defaultChecked
                  />
                  <label htmlFor="include-assets" className="text-sm">
                    Brand Assets
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="include-guidelines"
                    className="rounded border-gray-300"
                    defaultChecked
                  />
                  <label htmlFor="include-guidelines" className="text-sm">
                    Guidelines
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="include-examples"
                    className="rounded border-gray-300"
                    defaultChecked
                  />
                  <label htmlFor="include-examples" className="text-sm">
                    Usage Examples
                  </label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Generates a {exportFormat.toUpperCase()} document with all your
              brand identity elements.
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowExportDialog(false)}
                disabled={isExporting}
              >
                Cancel
              </Button>
              <Button onClick={handleExport} disabled={isExporting}>
                {isExporting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Generate & Download
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 