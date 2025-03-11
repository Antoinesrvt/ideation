import React, { useState, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Copy, 
  Edit, 
  Plus, 
  Save, 
  Upload, 
  X, 
  Download, 
  Check, 
  Image as ImageIcon,
  Link,
  AlertTriangle,
  RefreshCw,
  Trash2,
  FileImage,
  Search,
  ShieldCheck
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface LogoAsset {
  name: string;
  url: string;
  type: string;
}

interface BrandComplianceIssue {
  type: 'warning' | 'error';
  message: string;
  component: string;
  fix?: () => void;
}

interface VisualIdentityProps {
  data: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
    typography: {
      headingFont: string;
      bodyFont: string;
      sizes: {
        h1: string;
        h2: string;
        h3: string;
        body: string;
      };
    };
    logo: {
      primary: string;
      alternative: string;
      favicon: string;
      spacing: string;
    };
    imagery: {
      style: string;
      examples: string[];
    };
  };
}

export function VisualIdentity({ data }: VisualIdentityProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(data);
  const [activeTab, setActiveTab] = useState('colors');
  const [showColorGenerator, setShowColorGenerator] = useState(false);
  const [newLogoAsset, setNewLogoAsset] = useState<LogoAsset>({ name: '', url: '', type: 'SVG' });
  const [logoAssets, setLogoAssets] = useState<LogoAsset[]>([
    { name: "Primary Logo", url: data.logo.primary, type: "SVG" },
    { name: "Alternative Logo", url: data.logo.alternative, type: "SVG" },
    { name: "Favicon", url: data.logo.favicon, type: "ICO" }
  ]);
  const [showAddLogoDialog, setShowAddLogoDialog] = useState(false);
  const [showAddImageDialog, setShowAddImageDialog] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [accessibilityResults, setAccessibilityResults] = useState<Record<string, { pass: boolean, ratio: number }>>({});
  const [showComplianceDialog, setShowComplianceDialog] = useState(false);
  const [complianceIssues, setComplianceIssues] = useState<BrandComplianceIssue[]>([]);
  const [isCheckingCompliance, setIsCheckingCompliance] = useState(false);

  // Calculate complementary, analogous, and monochromatic colors based on primary
  useEffect(() => {
    checkColorAccessibility();
  }, [formData.colors]);

  const handleColorChange = (colorKey: keyof typeof data.colors, value: string) => {
    setFormData(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value
      }
    }));
  };

  const handleTypographyChange = (key: string, value: string) => {
    if (key === 'headingFont' || key === 'bodyFont') {
      setFormData(prev => ({
        ...prev,
        typography: {
          ...prev.typography,
          [key]: value
        }
      }));
    } else {
      // Handle sizes nested object
      const [parent, child] = key.split('.');
      if (parent === 'sizes') {
        setFormData(prev => ({
          ...prev,
          typography: {
            ...prev.typography,
            sizes: {
              ...prev.typography.sizes,
              [child]: value
            }
          }
        }));
      }
    }
  };

  const handleLogoChange = (logoKey: keyof typeof data.logo, value: string) => {
    setFormData(prev => ({
      ...prev,
      logo: {
        ...prev.logo,
        [logoKey]: value
      }
    }));
  };

  const handleImageryChange = (imageryKey: keyof typeof data.imagery, value: any) => {
    setFormData(prev => ({
      ...prev,
      imagery: {
        ...prev.imagery,
        [imageryKey]: value
      }
    }));
  };

  const handleSave = () => {
    // Here you would save the data using a hook
    console.log('Saving visual identity data:', formData);
    toast({
      title: "Visual identity updated",
      description: "Your changes have been saved successfully."
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(data);
    setLogoAssets([
      { name: "Primary Logo", url: data.logo.primary, type: "SVG" },
      { name: "Alternative Logo", url: data.logo.alternative, type: "SVG" },
      { name: "Favicon", url: data.logo.favicon, type: "ICO" }
    ]);
    setIsEditing(false);
  };

  const copyColorToClipboard = (color: string) => {
    navigator.clipboard.writeText(color);
    toast({
      title: "Color copied",
      description: `${color} has been copied to clipboard.`
    });
  };

  const generateComplementaryPalette = () => {
    // Generate a complementary color scheme based on the primary color
    const primary = formData.colors.primary;
    
    // Convert hex to RGB
    const r = parseInt(primary.slice(1, 3), 16);
    const g = parseInt(primary.slice(3, 5), 16);
    const b = parseInt(primary.slice(5, 7), 16);
    
    // Generate complementary color (opposite on color wheel)
    const compR = 255 - r;
    const compG = 255 - g;
    const compB = 255 - b;
    
    // Convert back to hex
    const complementary = `#${compR.toString(16).padStart(2, '0')}${compG.toString(16).padStart(2, '0')}${compB.toString(16).padStart(2, '0')}`;
    
    // Update the color scheme
    setFormData(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        secondary: complementary,
        accent: lightenColor(primary, 30)
      }
    }));
    
    toast({
      title: "Complementary palette generated",
      description: "New color scheme created based on your primary color."
    });
  };
  
  // Helper function to lighten a color by a percentage
  const lightenColor = (color: string, percent: number) => {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    const newR = Math.min(255, r + Math.round(r * percent / 100));
    const newG = Math.min(255, g + Math.round(g * percent / 100));
    const newB = Math.min(255, b + Math.round(b * percent / 100));
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  };

  // Check color accessibility
  const checkColorAccessibility = () => {
    const results: Record<string, { pass: boolean, ratio: number }> = {};
    
    // Check text on background
    results['text-on-background'] = checkContrast(formData.colors.text, formData.colors.background);
    
    // Check primary on background
    results['primary-on-background'] = checkContrast(formData.colors.primary, formData.colors.background);
    
    // Check text on primary
    results['text-on-primary'] = checkContrast(formData.colors.text, formData.colors.primary);
    
    // Check text on secondary
    results['text-on-secondary'] = checkContrast(formData.colors.text, formData.colors.secondary);
    
    setAccessibilityResults(results);
  };
  
  // Calculate contrast ratio between two colors
  const checkContrast = (color1: string, color2: string) => {
    const getLuminance = (color: string) => {
      let r = parseInt(color.slice(1, 3), 16) / 255;
      let g = parseInt(color.slice(3, 5), 16) / 255;
      let b = parseInt(color.slice(5, 7), 16) / 255;
      
      r = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
      g = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
      b = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
      
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    
    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    
    return {
      pass: ratio >= 4.5, // WCAG AA standard for normal text
      ratio: Math.round(ratio * 100) / 100
    };
  };

  const handleAddLogo = () => {
    if (newLogoAsset.name.trim() === '' || newLogoAsset.url.trim() === '') {
      toast({
        title: "Missing information",
        description: "Please provide both a name and URL for the logo.",
        variant: "destructive"
      });
      return;
    }

    setLogoAssets(prev => [...prev, newLogoAsset]);
    
    // Update the main logo in formData if it's the primary logo
    if (newLogoAsset.name.toLowerCase().includes('primary')) {
      handleLogoChange('primary', newLogoAsset.url);
    } else if (newLogoAsset.name.toLowerCase().includes('alternative')) {
      handleLogoChange('alternative', newLogoAsset.url);
    } else if (newLogoAsset.name.toLowerCase().includes('favicon')) {
      handleLogoChange('favicon', newLogoAsset.url);
    }
    
    setNewLogoAsset({ name: '', url: '', type: 'SVG' });
    setShowAddLogoDialog(false);
    
    toast({
      title: "Logo added",
      description: `${newLogoAsset.name} has been added to your brand assets.`
    });
  };

  const handleRemoveLogo = (index: number) => {
    const logoToRemove = logoAssets[index];
    
    // Don't allow removing primary, alternative, or favicon
    if (logoToRemove.name === "Primary Logo" || 
        logoToRemove.name === "Alternative Logo" || 
        logoToRemove.name === "Favicon") {
      toast({
        title: "Cannot remove essential logo",
        description: "Primary Logo, Alternative Logo, and Favicon are required.",
        variant: "destructive"
      });
      return;
    }
    
    setLogoAssets(prev => prev.filter((_, i) => i !== index));
    
    toast({
      title: "Logo removed",
      description: `${logoToRemove.name} has been removed from your brand assets.`
    });
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a URL for the image.",
        variant: "destructive"
      });
      return;
    }

    // Add the new image URL to the examples array
    const updatedExamples = [...formData.imagery.examples, newImageUrl.trim()];
    handleImageryChange('examples', updatedExamples);
    
    // Reset form field and close dialog
    setNewImageUrl('');
    setShowAddImageDialog(false);
    
    toast({
      title: "Image added",
      description: "New example image has been added to your brand imagery."
    });
  };

  // Brand compliance checker
  const runBrandComplianceCheck = () => {
    setIsCheckingCompliance(true);
    
    // Simulate a check with a timeout to indicate processing
    setTimeout(() => {
      const issues: BrandComplianceIssue[] = [];
      
      // Check for color accessibility
      Object.entries(accessibilityResults).forEach(([key, result]) => {
        if (!result.pass) {
          issues.push({
            type: 'error',
            message: `Accessibility issue: ${formatAccessibilityKey(key)} has insufficient contrast (${result.ratio}:1)`,
            component: 'Colors',
            fix: () => {
              setActiveTab('colors');
              setShowComplianceDialog(false);
              toast({
                title: "Navigated to Colors",
                description: "Please adjust colors to improve contrast ratios."
              });
            }
          });
        }
      });
      
      // Check logo assets
      if (logoAssets.length < 3) {
        issues.push({
          type: 'warning',
          message: 'Missing essential logo variants. Recommendation: Include at least primary, alternative, and favicon logo versions.',
          component: 'Logos',
          fix: () => {
            setActiveTab('logos');
            setShowComplianceDialog(false);
            toast({
              title: "Navigated to Logos",
              description: "Please add the missing logo variants."
            });
          }
        });
      }
      
      // Check if primary and body fonts match (not recommended for readability)
      if (formData.typography.headingFont === formData.typography.bodyFont) {
        issues.push({
          type: 'warning',
          message: 'Using the same font for headings and body text reduces visual hierarchy. Consider using different fonts for better readability.',
          component: 'Typography',
          fix: () => {
            setActiveTab('typography');
            setShowComplianceDialog(false);
            toast({
              title: "Navigated to Typography",
              description: "Please select different fonts for headings and body text."
            });
          }
        });
      }
      
      // Check if imagery style is defined
      if (!formData.imagery.style || formData.imagery.style.length < 20) {
        issues.push({
          type: 'warning',
          message: 'Imagery style guidelines are minimal or missing. Well-defined imagery guidelines ensure visual consistency.',
          component: 'Imagery',
          fix: () => {
            setActiveTab('imagery');
            setShowComplianceDialog(false);
            toast({
              title: "Navigated to Imagery",
              description: "Please define more detailed imagery style guidelines."
            });
          }
        });
      }
      
      // Check if example images are included
      if (formData.imagery.examples.length < 2) {
        issues.push({
          type: 'warning',
          message: 'Insufficient example images. Recommendation: Include at least 3-5 examples that represent your brand imagery style.',
          component: 'Imagery',
          fix: () => {
            setActiveTab('imagery');
            setShowComplianceDialog(false);
            toast({
              title: "Navigated to Imagery",
              description: "Please add more example images."
            });
          }
        });
      }
      
      // Check if color scheme has sufficient differentiation
      const colorValues = Object.values(formData.colors);
      const uniqueColors = new Set(colorValues);
      if (uniqueColors.size < colorValues.length) {
        issues.push({
          type: 'warning',
          message: 'Some colors in your color scheme are identical, which limits visual distinction between elements.',
          component: 'Colors',
          fix: () => {
            setActiveTab('colors');
            setShowComplianceDialog(false);
            toast({
              title: "Navigated to Colors",
              description: "Please ensure each color in your palette serves a unique purpose."
            });
          }
        });
      }
      
      setComplianceIssues(issues);
      setIsCheckingCompliance(false);
      
      // If no issues, show success toast
      if (issues.length === 0) {
        toast({
          title: "Brand compliance check passed",
          description: "No issues found. Your brand identity elements meet best practices standards."
        });
      } else {
        setShowComplianceDialog(true);
      }
    }, 1500);
  };

  const fontOptions = [
    "Inter", "Roboto", "Open Sans", "Lato", "Montserrat", 
    "Poppins", "Source Sans Pro", "Raleway", "Oswald", "Merriweather"
  ];

  const fontPairings = [
    { name: "Inter and Source Sans Pro", heading: "Inter", body: "Source Sans Pro" },
    { name: "Roboto and Open Sans", heading: "Roboto", body: "Open Sans" },
    { name: "Lato and Montserrat", heading: "Lato", body: "Montserrat" },
    { name: "Poppins and Raleway", heading: "Poppins", body: "Raleway" },
    { name: "Oswald and Merriweather", heading: "Oswald", body: "Merriweather" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Visual Identity</h2>
          <p className="text-muted-foreground">Define your brand's visual style and assets.</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={runBrandComplianceCheck}
            disabled={isCheckingCompliance}
          >
            {isCheckingCompliance ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4 mr-2" />
                Check Compliance
              </>
            )}
          </Button>
          
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Visual Identity
            </Button>
          )}
        </div>
      </div>

      {/* Visual Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Visual Preview</CardTitle>
          <CardDescription>
            See how your brand colors and typography work together in common UI elements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 rounded-lg" style={{ backgroundColor: formData.colors.background }}>
            <div className="space-y-4">
              {/* Sample Header */}
              <div 
                className="p-4 rounded-lg flex justify-between items-center" 
                style={{ backgroundColor: formData.colors.primary }}
              >
                <h3 className="text-xl font-bold" style={{ 
                  color: 'white', 
                  fontFamily: formData.typography.headingFont 
                }}>
                  Sample Header
                </h3>
                <Button 
                  style={{ 
                    backgroundColor: formData.colors.accent,
                    color: formData.colors.text,
                    fontFamily: formData.typography.bodyFont,
                    border: 'none'
                  }}
                >
                  Call to Action
                </Button>
              </div>
              
              {/* Sample Content */}
              <div className="p-6 rounded-lg bg-white">
                <h3 style={{ 
                  color: formData.colors.text,
                  fontFamily: formData.typography.headingFont,
                  fontSize: formData.typography.sizes.h3
                }}>
                  Content Heading
                </h3>
                <p style={{ 
                  color: formData.colors.text,
                  fontFamily: formData.typography.bodyFont,
                  fontSize: formData.typography.sizes.body,
                  marginTop: '8px'
                }}>
                  This is sample content text that demonstrates how your typography choices look in 
                  a paragraph context. Good typography makes content readable and engaging.
                </p>
                <div className="flex gap-2 mt-4">
                  <span className="px-3 py-1 rounded-full text-sm" style={{
                    backgroundColor: formData.colors.secondary,
                    color: 'white',
                    fontFamily: formData.typography.bodyFont
                  }}>
                    Tag One
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm" style={{
                    backgroundColor: formData.colors.accent,
                    color: formData.colors.text,
                    fontFamily: formData.typography.bodyFont
                  }}>
                    Tag Two
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="logos">Logos</TabsTrigger>
          <TabsTrigger value="imagery">Imagery</TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Brand Colors</CardTitle>
                  <CardDescription>Define your brand's color palette</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={generateComplementaryPalette} 
                    variant="outline" 
                    size="sm"
                    disabled={!isEditing}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate Palette
                  </Button>
                  <Button 
                    onClick={() => checkColorAccessibility()} 
                    variant="outline" 
                    size="sm"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Check Accessibility
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Color swatches with better interaction */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => copyColorToClipboard(formData.colors.primary)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <div 
                        className="w-12 h-12 rounded border border-gray-200"
                        style={{ backgroundColor: formData.colors.primary }}
                      ></div>
                      <Input
                        id="primaryColor"
                        value={formData.colors.primary}
                        onChange={(e) => handleColorChange('primary', e.target.value)}
                        disabled={!isEditing}
                        type="text"
                        placeholder="#000000"
                      />
                      <Input
                        type="color"
                        value={formData.colors.primary}
                        onChange={(e) => handleColorChange('primary', e.target.value)}
                        disabled={!isEditing}
                        className="w-14 p-1 h-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="secondaryColor">Secondary Color</Label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => copyColorToClipboard(formData.colors.secondary)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <div 
                        className="w-12 h-12 rounded border border-gray-200"
                        style={{ backgroundColor: formData.colors.secondary }}
                      ></div>
                      <Input
                        id="secondaryColor"
                        value={formData.colors.secondary}
                        onChange={(e) => handleColorChange('secondary', e.target.value)}
                        disabled={!isEditing}
                        type="text"
                        placeholder="#000000"
                      />
                      <Input
                        type="color"
                        value={formData.colors.secondary}
                        onChange={(e) => handleColorChange('secondary', e.target.value)}
                        disabled={!isEditing}
                        className="w-14 p-1 h-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="accentColor">Accent Color</Label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => copyColorToClipboard(formData.colors.accent)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <div 
                        className="w-12 h-12 rounded border border-gray-200"
                        style={{ backgroundColor: formData.colors.accent }}
                      ></div>
                      <Input
                        id="accentColor"
                        value={formData.colors.accent}
                        onChange={(e) => handleColorChange('accent', e.target.value)}
                        disabled={!isEditing}
                        type="text"
                        placeholder="#000000"
                      />
                      <Input
                        type="color"
                        value={formData.colors.accent}
                        onChange={(e) => handleColorChange('accent', e.target.value)}
                        disabled={!isEditing}
                        className="w-14 p-1 h-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="backgroundColor">Background Color</Label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => copyColorToClipboard(formData.colors.background)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <div 
                        className="w-12 h-12 rounded border border-gray-200"
                        style={{ backgroundColor: formData.colors.background }}
                      ></div>
                      <Input
                        id="backgroundColor"
                        value={formData.colors.background}
                        onChange={(e) => handleColorChange('background', e.target.value)}
                        disabled={!isEditing}
                        type="text"
                        placeholder="#000000"
                      />
                      <Input
                        type="color"
                        value={formData.colors.background}
                        onChange={(e) => handleColorChange('background', e.target.value)}
                        disabled={!isEditing}
                        className="w-14 p-1 h-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="textColor">Text Color</Label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => copyColorToClipboard(formData.colors.text)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <div 
                        className="w-12 h-12 rounded border border-gray-200"
                        style={{ backgroundColor: formData.colors.text }}
                      ></div>
                      <Input
                        id="textColor"
                        value={formData.colors.text}
                        onChange={(e) => handleColorChange('text', e.target.value)}
                        disabled={!isEditing}
                        type="text"
                        placeholder="#000000"
                      />
                      <Input
                        type="color"
                        value={formData.colors.text}
                        onChange={(e) => handleColorChange('text', e.target.value)}
                        disabled={!isEditing}
                        className="w-14 p-1 h-9"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Accessibility Results */}
              {Object.keys(accessibilityResults).length > 0 && (
                <div className="mt-6 border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-medium mb-2">Accessibility Check Results</h3>
                  <div className="space-y-2">
                    {Object.entries(accessibilityResults).map(([key, result]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div className="flex items-center">
                          {result.pass ? (
                            <Check className="h-4 w-4 text-green-600 mr-2" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                          )}
                          <span className="text-sm">{formatAccessibilityKey(key)}</span>
                        </div>
                        <div>
                          <Badge 
                            variant="outline" 
                            className={result.pass ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}
                          >
                            {result.ratio}:1 {result.pass ? "Pass" : "Fail"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    WCAG AA requires a minimum contrast ratio of 4.5:1 for normal text.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Typography System</CardTitle>
                  <CardDescription>Define your brand's font selections and text styles</CardDescription>
                </div>
                {isEditing && (
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          typography: {
                            headingFont: "Inter",
                            bodyFont: "Source Sans Pro",
                            sizes: {
                              h1: "2.5rem",
                              h2: "2rem",
                              h3: "1.5rem",
                              body: "1rem"
                            }
                          }
                        }));
                        toast({
                          title: "Typography reset",
                          description: "Typography settings have been reset to recommended defaults."
                        });
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset to Defaults
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Font Family Selection */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Font Families</h3>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="headingFont">Heading Font</Label>
                        {isEditing ? (
                          <Select 
                            value={formData.typography.headingFont}
                            onValueChange={(value) => handleTypographyChange('headingFont', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select heading font" />
                            </SelectTrigger>
                            <SelectContent>
                              {fontOptions.map(font => (
                                <SelectItem key={font} value={font}>{font}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div 
                            className="p-3 bg-gray-50 rounded-md"
                            style={{ fontFamily: formData.typography.headingFont }}
                          >
                            {formData.typography.headingFont}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bodyFont">Body Font</Label>
                        {isEditing ? (
                          <Select 
                            value={formData.typography.bodyFont}
                            onValueChange={(value) => handleTypographyChange('bodyFont', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select body font" />
                            </SelectTrigger>
                            <SelectContent>
                              {fontOptions.map(font => (
                                <SelectItem key={font} value={font}>{font}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div 
                            className="p-3 bg-gray-50 rounded-md"
                            style={{ fontFamily: formData.typography.bodyFont }}
                          >
                            {formData.typography.bodyFont}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Font Sizes</h3>
                    <div className="space-y-4">
                      {Object.entries(formData.typography.sizes).map(([key, value]) => (
                        <div key={key} className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor={`size-${key}`} className="capitalize">{key}</Label>
                            <span className="text-sm text-gray-500">{value}</span>
                          </div>
                          {isEditing ? (
                            <Input
                              id={`size-${key}`}
                              value={value}
                              onChange={(e) => handleTypographyChange(`sizes.${key}`, e.target.value)}
                            />
                          ) : (
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500" 
                                style={{ 
                                  width: `${parseInt(value) * 5}%`,
                                  maxWidth: '100%'
                                }}
                              ></div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Typography Preview */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Typography Preview</h3>
                  <div 
                    className="p-6 bg-gray-50 rounded-lg space-y-6 border"
                    style={{ fontFamily: formData.typography.bodyFont }}
                  >
                    <div 
                      style={{ 
                        fontSize: formData.typography.sizes.h1, 
                        fontFamily: formData.typography.headingFont,
                        lineHeight: 1.2,
                        color: formData.colors.text
                      }}
                    >
                      Heading 1
                    </div>
                    <div 
                      style={{ 
                        fontSize: formData.typography.sizes.h2, 
                        fontFamily: formData.typography.headingFont,
                        lineHeight: 1.2,
                        color: formData.colors.text
                      }}
                    >
                      Heading 2
                    </div>
                    <div 
                      style={{ 
                        fontSize: formData.typography.sizes.h3, 
                        fontFamily: formData.typography.headingFont,
                        lineHeight: 1.3,
                        color: formData.colors.text
                      }}
                    >
                      Heading 3
                    </div>
                    <div 
                      style={{ 
                        fontSize: formData.typography.sizes.body,
                        lineHeight: 1.5,
                        color: formData.colors.text
                      }}
                    >
                      <p className="mb-2">
                        This is body text in {formData.typography.bodyFont}. Good typography improves readability, 
                        establishes hierarchy, and reinforces your brand identity.
                      </p>
                      <p>
                        The contrast between <span style={{ fontWeight: 'bold' }}>heading fonts</span> and 
                        body fonts helps create visual interest and improves scannability.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Font Pairing Recommendations */}
              <div>
                <h3 className="text-lg font-medium mb-4">Font Pairing Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {fontPairings.map((pair, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardHeader className="py-2 px-4 bg-gray-50">
                        <CardTitle className="text-sm font-medium">{pair.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-2">
                        <div 
                          className="text-lg" 
                          style={{ fontFamily: pair.heading }}
                        >
                          {pair.heading}
                        </div>
                        <div 
                          className="text-sm text-gray-600" 
                          style={{ fontFamily: pair.body }}
                        >
                          {pair.body}
                        </div>
                        {isEditing && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full mt-2 text-xs"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                typography: {
                                  ...prev.typography,
                                  headingFont: pair.heading,
                                  bodyFont: pair.body
                                }
                              }));
                              toast({
                                title: "Font pairing applied",
                                description: `Applied "${pair.name}" font pairing to your brand`
                              });
                            }}
                          >
                            Apply This Pairing
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logos" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Logo Assets</CardTitle>
                  <CardDescription>Manage your brand logo assets</CardDescription>
                </div>
                {isEditing && (
                  <Button 
                    size="sm"
                    onClick={() => setShowAddLogoDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Logo
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Logo assets display and management */}
                {logoAssets.map((logo, index) => (
                  <div 
                    key={index} 
                    className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center w-full sm:w-24 h-24">
                      {logo.url ? (
                        <img 
                          src={logo.url} 
                          alt={logo.name} 
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=No+Image';
                          }}
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{logo.name}</h3>
                      <div className="text-sm text-gray-500 mt-1 flex items-center">
                        <Link className="h-3 w-3 mr-1" />
                        {isEditing ? (
                          <Input 
                            value={logo.url} 
                            onChange={(e) => {
                              const newLogoAssets = [...logoAssets];
                              newLogoAssets[index].url = e.target.value;
                              setLogoAssets(newLogoAssets);
                              
                              // Update the main logo data if this is primary, alternative, or favicon
                              if (logo.name === "Primary Logo") {
                                handleLogoChange('primary', e.target.value);
                              } else if (logo.name === "Alternative Logo") {
                                handleLogoChange('alternative', e.target.value);
                              } else if (logo.name === "Favicon") {
                                handleLogoChange('favicon', e.target.value);
                              }
                            }}
                            className="mt-1"
                          />
                        ) : (
                          <a 
                            href={logo.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline truncate block max-w-md"
                          >
                            {logo.url}
                          </a>
                        )}
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Badge variant="outline">{logo.type}</Badge>
                        {logo.name === "Primary Logo" && (
                          <Badge className="bg-blue-100 text-blue-800">Primary</Badge>
                        )}
                      </div>
                    </div>
                    {isEditing && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRemoveLogo(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                
                {logoAssets.length === 0 && (
                  <div className="text-center py-8 border rounded-lg">
                    <ImageIcon className="h-8 w-8 mx-auto text-gray-400" />
                    <p className="mt-2 text-gray-500">No logo assets available</p>
                    {isEditing && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4"
                        onClick={() => setShowAddLogoDialog(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Logo
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logo Usage Guidelines</CardTitle>
              <CardDescription>
                Define how your logo should and shouldn't be used
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label htmlFor="logoSpacing">Logo Spacing Guidelines</Label>
                {isEditing ? (
                  <Textarea
                    id="logoSpacing"
                    value={formData.logo.spacing}
                    onChange={(e) => handleLogoChange('spacing', e.target.value)}
                    placeholder="Describe the required spacing around your logo..."
                    rows={4}
                  />
                ) : (
                  <p className="p-3 bg-gray-50 rounded-md">{formData.logo.spacing}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="imagery" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Brand Imagery Style</CardTitle>
                  <CardDescription>Define your brand's visual style for photos and illustrations</CardDescription>
                </div>
                {isEditing && (
                  <Button 
                    size="sm"
                    onClick={() => setShowAddImageDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Image
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="imageStyle">Style Description</Label>
                  {isEditing ? (
                    <Textarea
                      id="imageStyle"
                      value={formData.imagery.style}
                      onChange={(e) => handleImageryChange('style', e.target.value)}
                      placeholder="Describe your brand's imagery style, tone, and subject matter..."
                      rows={4}
                    />
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      {formData.imagery.style || "No imagery style defined yet."}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Style Guidelines</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 space-y-2">
                      <h4 className="font-medium text-blue-600 flex items-center">
                        <Check className="h-4 w-4 mr-2" />
                        Do
                      </h4>
                      <ul className="space-y-2 pl-6 list-disc">
                        <li>Use consistent lighting across all imagery</li>
                        <li>Match color filters to brand colors</li>
                        <li>Showcase diversity and inclusivity</li>
                        <li>Use high-quality images (300dpi minimum)</li>
                      </ul>
                    </div>
                    <div className="border rounded-lg p-4 space-y-2">
                      <h4 className="font-medium text-red-600 flex items-center">
                        <X className="h-4 w-4 mr-2" />
                        Don't
                      </h4>
                      <ul className="space-y-2 pl-6 list-disc">
                        <li>Mix photography styles dramatically</li>
                        <li>Use generic stock photos with no personality</li>
                        <li>Apply filters that conflict with brand colors</li>
                        <li>Use low-resolution or pixelated images</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Example Images</h3>
                    {isEditing && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowAddImageDialog(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Example
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.imagery.examples.map((image, index) => (
                      <div key={index} className="group relative border rounded-lg overflow-hidden aspect-video">
                        <img 
                          src={image} 
                          alt={`Example ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+Not+Found';
                          }}
                        />
                        {isEditing && (
                          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                const newExamples = [...formData.imagery.examples];
                                newExamples.splice(index, 1);
                                handleImageryChange('examples', newExamples);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {formData.imagery.examples.length === 0 && (
                      <div className="col-span-full text-center py-12 border border-dashed rounded-lg">
                        <FileImage className="h-8 w-8 mx-auto text-gray-400" />
                        <p className="mt-2 text-gray-500">No example images available</p>
                        {isEditing && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-4"
                            onClick={() => setShowAddImageDialog(true)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Example Image
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Add Logo Dialog */}
      <Dialog open={showAddLogoDialog} onOpenChange={setShowAddLogoDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Logo</DialogTitle>
            <DialogDescription>
              Add a new logo asset to your brand identity.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="logoName">Logo Name</Label>
              <Input 
                id="logoName" 
                value={newLogoAsset.name}
                onChange={(e) => setNewLogoAsset({...newLogoAsset, name: e.target.value})}
                placeholder="e.g., Horizontal Logo, Vertical Logo"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input 
                id="logoUrl" 
                value={newLogoAsset.url}
                onChange={(e) => setNewLogoAsset({...newLogoAsset, url: e.target.value})}
                placeholder="https://example.com/logo.svg"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="logoType">Logo Type</Label>
              <Select 
                value={newLogoAsset.type}
                onValueChange={(value) => setNewLogoAsset({...newLogoAsset, type: value})}
              >
                <SelectTrigger id="logoType">
                  <SelectValue placeholder="Select logo type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SVG">SVG</SelectItem>
                  <SelectItem value="PNG">PNG</SelectItem>
                  <SelectItem value="JPG">JPG</SelectItem>
                  <SelectItem value="ICO">ICO</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddLogoDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLogo}>
              Add Logo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Image Dialog */}
      <Dialog open={showAddImageDialog} onOpenChange={setShowAddImageDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Example Image</DialogTitle>
            <DialogDescription>
              Add an example image that represents your brand's visual style.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input 
                id="imageUrl"
                placeholder="https://example.com/image.jpg"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
              />
            </div>

            {newImageUrl && (
              <div className="relative mt-2 aspect-video border rounded-md overflow-hidden">
                <img 
                  src={newImageUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Invalid+Image+URL';
                  }}
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddImageDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddImage}>
              Add Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Brand Compliance Issues Dialog */}
      <Dialog open={showComplianceDialog} onOpenChange={setShowComplianceDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <ShieldCheck className="h-5 w-5 text-amber-500 mr-2" />
              Brand Compliance Check Results
            </DialogTitle>
            <DialogDescription>
              The following issues were found in your brand identity. Addressing these will improve brand consistency and effectiveness.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 max-h-[60vh] overflow-y-auto">
            <Accordion type="single" collapsible className="w-full">
              {complianceIssues.map((issue, index) => (
                <AccordionItem key={index} value={`issue-${index}`}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-start gap-2">
                      {issue.type === 'error' ? (
                        <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-medium">
                          {issue.component}: {issue.message.split(':')[0]}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={issue.type === 'error' ? 
                            "ml-2 bg-red-50 text-red-700 border-red-200" : 
                            "ml-2 bg-amber-50 text-amber-700 border-amber-200"
                          }
                        >
                          {issue.type}
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-7 space-y-3">
                      <p className="text-gray-600">
                        {issue.message.includes(':') ? issue.message.split(':').slice(1).join(':').trim() : issue.message}
                      </p>
                      {issue.fix && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={issue.fix}
                          className="mt-2"
                        >
                          <Search className="h-3 w-3 mr-1" />
                          Go to {issue.component}
                        </Button>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            
            {complianceIssues.length === 0 && (
              <div className="py-8 text-center">
                <Check className="h-12 w-12 mx-auto text-green-500 mb-2" />
                <h3 className="text-lg font-medium text-green-700">All Checks Passed!</h3>
                <p className="text-gray-500 mt-1">Your brand identity meets all compliance standards.</p>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {complianceIssues.filter(i => i.type === 'error').length} errors, {complianceIssues.filter(i => i.type === 'warning').length} warnings
            </div>
            <Button onClick={() => setShowComplianceDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper function to format accessibility key for display
function formatAccessibilityKey(key: string): string {
  return key
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
} 