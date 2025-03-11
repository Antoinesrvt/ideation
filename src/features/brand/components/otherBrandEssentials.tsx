import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Plus,
  Save,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  Users,
  Zap,
  Target,
  Lightbulb,
  MessageSquare,
  Palette,
  Compass,
  ArrowDown,
  Heart,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";

interface ValueItem {
  title: string;
  description: string;
  tag?: string;
}

interface AudienceSegment {
  name: string;
  description?: string;
  color: string;
}

interface BrandEssentialsData {
  name: string;
  tagline: string;
  mission: string;
  vision: string;
  values: ValueItem[];
  targetAudience: AudienceSegment[];
  uniqueValueProposition: string;
}

interface BrandEssentialsProps {
  data: any;
}

export function BrandEssentials({ data }: BrandEssentialsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<BrandEssentialsData>(data);
  const [newAudienceItem, setNewAudienceItem] = useState("");
  const [editingValue, setEditingValue] = useState<ValueItem | null>(null);
  const [newValue, setNewValue] = useState<ValueItem>({
    title: "",
    description: "",
  });
  const [activeView, setActiveView] = useState<string>("form");

  // Generate audience segments for visualization from the target audience
  const audienceSegments = formData.targetAudience.map((audience, index) => {
    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-purple-100 text-purple-800",
      "bg-amber-100 text-amber-800",
      "bg-rose-100 text-rose-800",
    ];
    return {
      name: audience.name,
      description: audience.description || "",
      color: colors[index % colors.length],
    };
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // Here you would save the data using a hook
    console.log("Saving brand essentials:", formData);

    toast({
      title: "Brand essentials updated",
      description: "Your changes have been saved successfully.",
    });

    setIsEditing(false);
  };

  const handleAddAudienceItem = () => {
    if (newAudienceItem.trim() === "") return;

    setFormData((prev) => ({
      ...prev,
      targetAudience: [
        ...prev.targetAudience,
        { name: newAudienceItem, description: "", color: "" },
      ],
    }));

    setNewAudienceItem("");
  };

  const handleRemoveAudienceItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      targetAudience: prev.targetAudience.filter((_, i) => i !== index),
    }));
  };

  const handleAddValue = () => {
    if (newValue.title.trim() === "" || newValue.description.trim() === "")
      return;

    setFormData((prev) => ({
      ...prev,
      values: [...prev.values, newValue],
    }));

    setNewValue({ title: "", description: "" });
  };

  const handleUpdateValue = () => {
    if (!editingValue) return;
    if (
      editingValue.title.trim() === "" ||
      editingValue.description.trim() === ""
    )
      return;

    setFormData((prev) => ({
      ...prev,
      values: prev.values.map((v, i) =>
        i === prev.values.findIndex((item) => item.title === editingValue.title)
          ? editingValue
          : v
      ),
    }));

    setEditingValue(null);
  };

  const handleRemoveValue = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      values: prev.values.filter((_, i) => i !== index),
    }));
  };

  const getValueColor = (value: string) => {
    const colors = [
      "bg-blue-100 text-blue-800 border-blue-200",
      "bg-green-100 text-green-800 border-green-200",
      "bg-purple-100 text-purple-800 border-purple-200",
      "bg-amber-100 text-amber-800 border-amber-200",
      "bg-rose-100 text-rose-800 border-rose-200",
    ];

    // Create a simple hash of the string to get a consistent color
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = value.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  const renderBrandConnections = () => {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Brand DNA Visualization</h3>
        <div className="bg-gray-50 rounded-lg p-6 border">
          <div className="flex flex-col items-center justify-center">
            {/* Brand Name at the Center */}
            <div className="bg-white border-2 border-purple-500 rounded-lg p-4 w-64 text-center mb-8 shadow-md">
              <h3 className="font-bold text-xl text-purple-700">
                {formData.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1 italic">
                {formData.tagline}
              </p>
            </div>

            {/* Connection Lines with Mission and Vision */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-12">
              <div className="flex flex-col items-center">
                <div className="h-10 border-r-2 border-dashed border-blue-400 mb-2"></div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 w-full h-full">
                  <div className="flex items-start mb-2">
                    <Zap className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <h4 className="font-semibold text-blue-700">Mission</h4>
                  </div>
                  <p className="text-sm text-gray-700">{formData.mission}</p>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="h-10 border-r-2 border-dashed border-purple-400 mb-2"></div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 w-full h-full">
                  <div className="flex items-start mb-2">
                    <Heart className="h-5 w-5 text-purple-600 mr-2 mt-0.5" />
                    <h4 className="font-semibold text-purple-700">Vision</h4>
                  </div>
                  <p className="text-sm text-gray-700">{formData.vision}</p>
                </div>
              </div>
            </div>

            {/* Brand Values */}
            <div className="w-full mb-8">
              <div className="text-center mb-6">
                <h4 className="font-semibold text-gray-700 inline-flex items-center">
                  <Heart className="h-5 w-5 text-rose-500 mr-2" />
                  Brand Values
                </h4>
                <div className="h-6 border-r-2 border-dashed border-gray-300 mx-auto w-1 mt-2"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {formData.values.map((value, index) => (
                  <div
                    key={index}
                    className={`rounded-lg p-4 border transition-transform transform hover:scale-105 ${getValueColor(
                      value.title
                    )}`}
                  >
                    <h5 className="font-bold text-center mb-2">
                      {value.title}
                    </h5>
                    <p className="text-sm">{value.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Value Proposition */}
            <div className="w-full mb-8">
              <div className="text-center mb-2">
                <div className="h-6 border-r-2 border-dashed border-gray-300 mx-auto w-1 mb-2"></div>
                <h4 className="font-semibold text-gray-700 inline-flex items-center">
                  <Lightbulb className="h-5 w-5 text-amber-500 mr-2" />
                  Value Proposition
                </h4>
              </div>

              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 mt-4">
                <p className="text-sm text-center font-medium text-gray-700">
                  {formData.uniqueValueProposition}
                </p>
              </div>
            </div>

            {/* Target Audience */}
            <div className="w-full">
              <div className="text-center mb-2">
                <div className="h-6 border-r-2 border-dashed border-gray-300 mx-auto w-1 mb-2"></div>
                <h4 className="font-semibold text-gray-700 inline-flex items-center">
                  <Target className="h-5 w-5 text-green-500 mr-2" />
                  Target Audience
                </h4>
              </div>

              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {formData.targetAudience.map((audience, index) => (
                  <Badge key={index} className={audience.color}>
                    {audience.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAudienceVisualization = () => {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Audience Analysis</h3>
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1 md:col-span-2">
                <div className="bg-gray-50 p-4 rounded-lg border h-full">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Audience Segments
                  </h4>
                  <div className="flex flex-col gap-3">
                    {audienceSegments.map((segment, index) => (
                      <div key={index} className="flex items-start">
                        <div
                          className={`w-3 h-3 rounded-full mt-1.5 ${
                            segment.color.split(" ")[0]
                          }`}
                        ></div>
                        <div className="ml-3 flex-1">
                          <h5 className="font-medium text-sm">
                            {segment.name}
                          </h5>
                          {segment.description && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {segment.description}
                            </p>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 whitespace-nowrap">
                          {Math.floor(100 / audienceSegments.length)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="col-span-1">
                <div className="bg-gray-50 p-4 rounded-lg border h-full flex flex-col">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Audience Breakdown
                  </h4>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="relative w-32 h-32">
                      {audienceSegments.map((segment, index) => {
                        const rotation =
                          (360 / audienceSegments.length) * index;
                        const percentage = 100 / audienceSegments.length;
                        return (
                          <div
                            key={index}
                            className={`absolute w-full h-full ${
                              segment.color.split(" ")[0]
                            }`}
                            style={{
                              clipPath: `conic-gradient(from ${rotation}deg, currentColor ${percentage}%, transparent ${percentage}%)`,
                            }}
                          ></div>
                        );
                      })}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center border">
                          <Users className="h-6 w-6 text-gray-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderMissionToMarket = () => {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Mission to Market Funnel</h3>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center max-w-2xl mx-auto">
              {/* Mission */}
              <div className="bg-blue-50 border border-blue-200 rounded-t-xl w-full p-4 text-center">
                <h4 className="text-blue-700 font-medium mb-1">Mission</h4>
                <p className="text-sm text-gray-700">{formData.mission}</p>
              </div>

              <ArrowDown className="text-gray-400 my-2" />

              {/* Vision */}
              <div className="bg-indigo-50 border border-indigo-200 w-[90%] p-4 text-center">
                <h4 className="text-indigo-700 font-medium mb-1">Vision</h4>
                <p className="text-sm text-gray-700">{formData.vision}</p>
              </div>

              <ArrowDown className="text-gray-400 my-2" />

              {/* Values */}
              <div className="bg-purple-50 border border-purple-200 w-[80%] p-4 text-center">
                <h4 className="text-purple-700 font-medium mb-1">Values</h4>
                <div className="flex flex-wrap justify-center gap-1 mt-2">
                  {formData.values.map((value, index) => (
                    <Badge key={index} variant="outline" className="bg-white">
                      {value.title}
                    </Badge>
                  ))}
                </div>
              </div>

              <ArrowDown className="text-gray-400 my-2" />

              {/* Value Proposition */}
              <div className="bg-fuchsia-50 border border-fuchsia-200 w-[70%] p-4 text-center">
                <h4 className="text-fuchsia-700 font-medium mb-1">
                  Value Proposition
                </h4>
                <p className="text-sm text-gray-700">
                  {formData.uniqueValueProposition}
                </p>
              </div>

              <ArrowDown className="text-gray-400 my-2" />

              {/* Target Audience */}
              <div className="bg-rose-50 border border-rose-200 rounded-b-xl w-[60%] p-4 text-center">
                <h4 className="text-rose-700 font-medium mb-1">
                  Target Audience
                </h4>
                <div className="flex flex-wrap justify-center gap-1 mt-2">
                  {formData.targetAudience.map((audience, index) => (
                    <Badge key={index} variant="outline" className="bg-white">
                      {audience.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Brand Essentials</h2>
          <p className="text-muted-foreground">
            Define your brand's core identity and values.
          </p>
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
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
              Edit Brand Essentials
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList className="mb-6">
          <TabsTrigger value="form">Details</TabsTrigger>
          <TabsTrigger value="connections">Brand DNA</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="funnel">Mission Funnel</TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Core Identity</CardTitle>
              <CardDescription>
                Define your brand's name, tagline, mission, and vision.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Brand Name</label>
                  {isEditing ? (
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your brand name"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded text-lg font-semibold text-gray-800">
                      {formData.name}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Tagline</label>
                  {isEditing ? (
                    <Input
                      name="tagline"
                      value={formData.tagline}
                      onChange={handleInputChange}
                      placeholder="Enter your brand tagline"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded italic text-gray-600">
                      {formData.tagline}
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <label className="text-sm font-medium">Mission Statement</label>
                {isEditing ? (
                  <Textarea
                    name="mission"
                    value={formData.mission}
                    onChange={handleInputChange}
                    placeholder="Why does your brand exist? What purpose does it serve?"
                    rows={3}
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded text-gray-600">
                    {formData.mission}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Vision Statement</label>
                {isEditing ? (
                  <Textarea
                    name="vision"
                    value={formData.vision}
                    onChange={handleInputChange}
                    placeholder="What future does your brand want to create?"
                    rows={3}
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded text-gray-600">
                    {formData.vision}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Unique Value Proposition
                </label>
                {isEditing ? (
                  <Textarea
                    name="uniqueValueProposition"
                    value={formData.uniqueValueProposition}
                    onChange={handleInputChange}
                    placeholder="What makes your brand different? Why should customers choose you?"
                    rows={3}
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded text-gray-600">
                    {formData.uniqueValueProposition}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Brand Values</CardTitle>
              <CardDescription>
                Define the core principles that guide your brand.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.values.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.values.map((value, index) => (
                      <div
                        key={index}
                        className={`border rounded-lg p-4 relative ${
                          isEditing ? "pr-10" : ""
                        }`}
                      >
                        <h3 className="font-semibold text-lg mb-1">
                          {value.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {value.description}
                        </p>

                        {isEditing && (
                          <div className="absolute top-3 right-3 flex flex-col gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-gray-400 hover:text-blue-600"
                              onClick={() => setEditingValue(value)}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-gray-400 hover:text-red-600"
                              onClick={() => handleRemoveValue(index)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border border-dashed rounded-lg text-gray-500">
                    No brand values defined yet.
                    {isEditing && (
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setNewValue({ title: "", description: "" })
                          }
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Value
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {isEditing && !editingValue && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="text-sm font-medium mb-3">Add New Value</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                          Value Title
                        </label>
                        <Input
                          value={newValue.title}
                          onChange={(e) =>
                            setNewValue({ ...newValue, title: e.target.value })
                          }
                          placeholder="e.g., Innovation, Quality, etc."
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                          Description
                        </label>
                        <Textarea
                          value={newValue.description}
                          onChange={(e) =>
                            setNewValue({
                              ...newValue,
                              description: e.target.value,
                            })
                          }
                          placeholder="Describe what this value means for your brand"
                          rows={2}
                        />
                      </div>
                      <Button
                        onClick={handleAddValue}
                        disabled={!newValue.title || !newValue.description}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Value
                      </Button>
                    </div>
                  </div>
                )}

                {isEditing && editingValue && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="text-sm font-medium mb-3">Edit Value</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                          Value Title
                        </label>
                        <Input
                          value={editingValue.title}
                          onChange={(e) =>
                            setEditingValue({
                              ...editingValue,
                              title: e.target.value,
                            })
                          }
                          placeholder="e.g., Innovation, Quality, etc."
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                          Description
                        </label>
                        <Textarea
                          value={editingValue.description}
                          onChange={(e) =>
                            setEditingValue({
                              ...editingValue,
                              description: e.target.value,
                            })
                          }
                          placeholder="Describe what this value means for your brand"
                          rows={2}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setEditingValue(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleUpdateValue}
                          disabled={
                            !editingValue.title || !editingValue.description
                          }
                        >
                          Update Value
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Target Audience</CardTitle>
              <CardDescription>
                Define who your brand serves and communicates with.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.targetAudience.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {formData.targetAudience.map((item, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="py-1.5 flex items-center"
                      >
                        {item.name}
                        {isEditing && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 ml-1 -mr-1 text-gray-500 hover:text-red-600"
                            onClick={() => handleRemoveAudienceItem(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border border-dashed rounded-lg text-gray-500">
                    No target audience defined yet.
                  </div>
                )}

                {isEditing && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium mb-3">
                      Add Target Audience
                    </h4>
                    <div className="flex gap-2">
                      <Input
                        value={newAudienceItem}
                        onChange={(e) => setNewAudienceItem(e.target.value)}
                        placeholder="e.g., Small business owners"
                        className="flex-1"
                      />
                      <Button
                        onClick={handleAddAudienceItem}
                        disabled={!newAudienceItem.trim()}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connections">
          {renderBrandConnections()}
        </TabsContent>

        <TabsContent value="audience">
          {renderAudienceVisualization()}
        </TabsContent>

        <TabsContent value="funnel">{renderMissionToMarket()}</TabsContent>
      </Tabs>
    </div>
  );
}
