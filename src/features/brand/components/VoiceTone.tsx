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
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  ChevronUp, 
  Edit, 
  Plus, 
  Save, 
  Trash2, 
  X, 
  MessageSquare, 
  Megaphone, 
  Mail, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  Facebook,
  Twitter,
  Instagram,
  LinkedinIcon,
  FileText,
  MessageCircle,
  HelpCircle,
  Send
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ToneExample {
  context: string;
  good: string;
  bad: string;
}

interface VoiceToneData {
  personality: string;
  tone: string;
  examples: ToneExample[];
  wordChoices: {
    use: string[];
    avoid: string[];
  };
}

interface VoiceToneProps {
  data: VoiceToneData;
}

export function VoiceTone({ data }: VoiceToneProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<VoiceToneData>(data);
  const [newUseWord, setNewUseWord] = useState('');
  const [newAvoidWord, setNewAvoidWord] = useState('');
  const [editingExample, setEditingExample] = useState<ToneExample | null>(null);
  const [newExample, setNewExample] = useState<ToneExample>({ context: '', good: '', bad: '' });
  const [activeTab, setActiveTab] = useState('overview');
  const [toneSimulatorInput, setToneSimulatorInput] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('website');
  const [selectedContext, setSelectedContext] = useState('neutral');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof VoiceToneData
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleExampleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    example: ToneExample,
    field: keyof ToneExample
  ) => {
    // If we're editing an existing example
    if (editingExample) {
      setEditingExample({
        ...editingExample,
        [field]: e.target.value
      });
    } else {
      // If we're creating a new example
      setNewExample({
        ...newExample,
        [field]: e.target.value
      });
    }
  };

  const handleAddUseWord = () => {
    if (newUseWord.trim() === '') return;
    
    setFormData(prev => ({
      ...prev,
      wordChoices: {
        ...prev.wordChoices,
        use: [...prev.wordChoices.use, newUseWord.trim()]
      }
    }));
    
    setNewUseWord('');
  };

  const handleRemoveUseWord = (index: number) => {
    setFormData(prev => ({
      ...prev,
      wordChoices: {
        ...prev.wordChoices,
        use: prev.wordChoices.use.filter((_, i) => i !== index)
      }
    }));
  };

  const handleAddAvoidWord = () => {
    if (newAvoidWord.trim() === '') return;
    
    setFormData(prev => ({
      ...prev,
      wordChoices: {
        ...prev.wordChoices,
        avoid: [...prev.wordChoices.avoid, newAvoidWord.trim()]
      }
    }));
    
    setNewAvoidWord('');
  };

  const handleRemoveAvoidWord = (index: number) => {
    setFormData(prev => ({
      ...prev,
      wordChoices: {
        ...prev.wordChoices,
        avoid: prev.wordChoices.avoid.filter((_, i) => i !== index)
      }
    }));
  };

  const handleAddExample = () => {
    if (newExample.context.trim() === '' || 
        newExample.good.trim() === '' || 
        newExample.bad.trim() === '') return;
    
    setFormData(prev => ({
      ...prev,
      examples: [...prev.examples, newExample]
    }));
    
    setNewExample({ context: '', good: '', bad: '' });
  };

  const handleUpdateExample = () => {
    if (!editingExample) return;
    if (editingExample.context.trim() === '' || 
        editingExample.good.trim() === '' || 
        editingExample.bad.trim() === '') return;
    
    setFormData(prev => ({
      ...prev,
      examples: prev.examples.map((example, i) => 
        i === prev.examples.findIndex(ex => ex.context === editingExample.context) ? editingExample : example
      )
    }));
    
    setEditingExample(null);
  };

  const handleRemoveExample = (index: number) => {
    setFormData(prev => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    // Here you would save the data using a hook
    console.log('Saving voice & tone data:', formData);
    
    toast({
      title: "Voice & Tone updated",
      description: "Your changes have been saved successfully."
    });
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(data);
    setIsEditing(false);
    setEditingExample(null);
  };

  // Function to transform text based on brand voice
  const transformTextToMatchVoice = (text: string): string => {
    if (!text) return '';
    
    let transformedText = text;
    
    // Apply word substitutions to match brand voice
    formData.wordChoices.avoid.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      
      // Find a preferred word to use instead if possible
      const preferredWord = formData.wordChoices.use.length > 0 
        ? formData.wordChoices.use[Math.floor(Math.random() * formData.wordChoices.use.length)]
        : null;
      
      if (preferredWord) {
        transformedText = transformedText.replace(regex, `<span class="text-green-600 font-medium">${preferredWord}</span>`);
      } else {
        transformedText = transformedText.replace(regex, `<span class="text-red-500 line-through">${word}</span>`);
      }
    });
    
    // Adjust tone based on personality traits
    if (formData.personality.toLowerCase().includes('friendly')) {
      transformedText = transformedText.replace(/\b(hi|hello)\b/gi, 'Hi there');
      transformedText = transformedText + ' 😊';
    }
    
    if (formData.personality.toLowerCase().includes('professional')) {
      transformedText = transformedText.replace(/\byeah\b/gi, 'yes');
      transformedText = transformedText.replace(/\bnope\b/gi, 'no');
    }
    
    if (formData.personality.toLowerCase().includes('expert')) {
      transformedText = transformedText.replace(/\bhappy\b/gi, 'delighted');
    }
    
    // Apply channel-specific modifications
    switch (selectedChannel) {
      case 'social':
        transformedText = transformedText.replace(/\.$/, '');  // Remove ending period
        // Add relevant hashtags
        const keywords = text.split(' ')
          .filter(word => word.length > 5)
          .slice(0, 2)
          .map(word => `#${word.toLowerCase().replace(/[^a-z0-9]/gi, '')}`);
        
        if (keywords.length) {
          transformedText += ` ${keywords.join(' ')}`;
        }
        break;
        
      case 'email':
        // Add formal greeting and signature
        transformedText = `Hello,\n\n${transformedText}\n\nBest regards,\nThe ${formData.personality.includes('friendly') ? 'Team' : 'Company'}`;
        break;
        
      case 'customer-support':
        // Add empathetic touch for support
        transformedText = `Thanks for reaching out. ${transformedText} Please let us know if you have any other questions.`;
        break;
    }
    
    // Apply context-specific modifications
    switch (selectedContext) {
      case 'positive':
        transformedText = `${transformedText}`;
        if (!transformedText.includes('thank')) {
          transformedText += ' Thank you for your support!';
        }
        break;
        
      case 'negative':
        transformedText = `We understand your concern. ${transformedText} We're here to help resolve this for you.`;
        break;
        
      case 'urgent':
        transformedText = `IMPORTANT: ${transformedText}`;
        break;
    }
    
    return transformedText;
  };

  // Get channel icon
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'website':
        return <FileText className="h-4 w-4" />;
      case 'social':
        return <Twitter className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'customer-support':
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  // Get context color
  const getContextColor = (context: string) => {
    switch (context) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      case 'urgent':
        return 'text-amber-600';
      default:
        return 'text-blue-600';
    }
  };

  // Render channels matrix to show voice adjustments across channels
  const renderChannelsMatrix = () => {
    const channels = [
      { id: 'website', name: 'Website', icon: <FileText className="h-4 w-4" /> },
      { id: 'social', name: 'Social Media', icon: <Twitter className="h-4 w-4" /> },
      { id: 'email', name: 'Email', icon: <Mail className="h-4 w-4" /> },
      { id: 'customer-support', name: 'Customer Support', icon: <MessageCircle className="h-4 w-4" /> }
    ];
    
    const toneAttributes = [
      { name: 'Formality', website: 'Medium', social: 'Low', email: 'Medium-High', 'customer-support': 'Medium' },
      { name: 'Personality', website: 'Balanced', social: 'Heightened', email: 'Subdued', 'customer-support': 'Empathetic' },
      { name: 'Technical Detail', website: 'Medium', social: 'Low', email: 'High', 'customer-support': 'Adaptable' },
      { name: 'Sentence Length', website: 'Medium', social: 'Short', email: 'Medium-Long', 'customer-support': 'Concise' }
    ];
    
    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Channel Voice Adaptation</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-2 bg-gray-50"></th>
                {channels.map(channel => (
                  <th key={channel.id} className="text-left p-2 bg-gray-50">
                    <div className="flex items-center">
                      {channel.icon}
                      <span className="ml-2">{channel.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {toneAttributes.map((attribute, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-2 font-medium">{attribute.name}</td>
                  <td className="p-2">{attribute.website}</td>
                  <td className="p-2">{attribute.social}</td>
                  <td className="p-2">{attribute.email}</td>
                  <td className="p-2">{attribute['customer-support']}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h4 className="font-medium text-blue-700 flex items-center">
            <HelpCircle className="h-4 w-4 mr-2" />
            Channel Adaptation Guidelines
          </h4>
          <ul className="mt-2 space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="font-bold mr-2 min-w-[120px]">Website:</span>
              <span>Clear, concise, and professional while maintaining brand personality</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2 min-w-[120px]">Social Media:</span>
              <span>More casual, conversational, and engaging; reflect platform-specific norms</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2 min-w-[120px]">Email:</span>
              <span>More formal and detailed structure with clear greeting and closing</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2 min-w-[120px]">Customer Support:</span>
              <span>Empathetic and solution-oriented, acknowledge concerns and provide clear next steps</span>
            </li>
          </ul>
        </div>
      </div>
    );
  };

  // Render tone simulator
  const renderToneSimulator = () => {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Voice & Tone Simulator</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="simulator-input" className="mb-2 block">Enter your message</Label>
              <Textarea 
                id="simulator-input"
                placeholder="Type a message to see how it would be expressed in your brand voice..."
                value={toneSimulatorInput}
                onChange={(e) => setToneSimulatorInput(e.target.value)}
                rows={5}
                className="min-h-[150px]"
              />
              
              <div className="mt-4 flex flex-wrap gap-3">
                <div>
                  <Label htmlFor="channel-select" className="mb-1 text-xs block">Communication Channel</Label>
                  <Select 
                    value={selectedChannel} 
                    onValueChange={setSelectedChannel}
                  >
                    <SelectTrigger id="channel-select" className="w-[140px]">
                      <SelectValue placeholder="Select Channel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="customer-support">Customer Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="context-select" className="mb-1 text-xs block">Communication Context</Label>
                  <Select 
                    value={selectedContext} 
                    onValueChange={setSelectedContext}
                  >
                    <SelectTrigger id="context-select" className="w-[140px]">
                      <SelectValue placeholder="Select Context" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="positive">Positive</SelectItem>
                      <SelectItem value="negative">Negative</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="flex items-center">
                  {getChannelIcon(selectedChannel)}
                  <span className="ml-2">
                    In your brand voice 
                    (<span className={getContextColor(selectedContext)}>
                      {selectedContext} context
                    </span>)
                  </span>
                </Label>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={() => setToneSimulatorInput('')}
                  disabled={!toneSimulatorInput}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              
              <div 
                className={`p-4 border rounded-md min-h-[150px] bg-white ${
                  selectedChannel === 'social' ? 'border-blue-200 bg-blue-50' : 
                  selectedChannel === 'email' ? 'border-purple-200 bg-purple-50' : 
                  selectedChannel === 'customer-support' ? 'border-green-200 bg-green-50' : 
                  'border-gray-200'
                }`}
              >
                {toneSimulatorInput ? (
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: transformTextToMatchVoice(toneSimulatorInput)
                    }}
                    className="whitespace-pre-line"
                  />
                ) : (
                  <div className="text-gray-400 italic">
                    Enter a message to see how it transforms in your brand voice
                  </div>
                )}
              </div>
              
              {toneSimulatorInput && (
                <div className="mt-2 text-xs text-gray-500">
                  <strong>Note:</strong> Simulator provides an approximation based on your brand voice settings
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Voice & Tone</h2>
          <p className="text-muted-foreground">Define how your brand communicates</p>
        </div>
        <div className="flex space-x-2">
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
              Edit Voice & Tone
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Core Elements</TabsTrigger>
          <TabsTrigger value="simulator">Tone Simulator</TabsTrigger>
          <TabsTrigger value="channels">Channel Adaptation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-6">
            {/* Brand Voice Card */}
            <Card>
              <CardHeader>
                <CardTitle>Brand Personality</CardTitle>
                <CardDescription>The character and style of your brand's communication</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Personality</h3>
                  {isEditing ? (
                    <Textarea
                      value={formData.personality}
                      onChange={(e) => handleInputChange(e, 'personality')}
                      placeholder="Describe your brand's personality (e.g., friendly, professional, authoritative, playful)"
                      rows={3}
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md">
                      {formData.personality || <span className="italic text-gray-500">No personality defined</span>}
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Tone of Voice</h3>
                  {isEditing ? (
                    <Textarea
                      value={formData.tone}
                      onChange={(e) => handleInputChange(e, 'tone')}
                      placeholder="Describe the tone your brand uses (e.g., conversational, formal, technical, simple)"
                      rows={3}
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md">
                      {formData.tone || <span className="italic text-gray-500">No tone defined</span>}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <h3 className="text-sm font-medium mb-3 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Words to Use
                    </h3>
                    {isEditing && (
                      <div className="flex space-x-2 mb-3">
                        <Input
                          value={newUseWord}
                          onChange={(e) => setNewUseWord(e.target.value)}
                          placeholder="Add word to use"
                          className="flex-1"
                        />
                        <Button onClick={handleAddUseWord} disabled={!newUseWord.trim()}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      {formData.wordChoices.use.map((word, index) => (
                        <Badge 
                          key={index}
                          variant="outline" 
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          {word}
                          {isEditing && (
                            <button
                              className="ml-1 text-green-500 hover:text-green-700"
                              onClick={() => handleRemoveUseWord(index)}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </Badge>
                      ))}
                      {formData.wordChoices.use.length === 0 && (
                        <div className="text-sm text-gray-500 italic">No preferred words defined</div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-3 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
                      Words to Avoid
                    </h3>
                    {isEditing && (
                      <div className="flex space-x-2 mb-3">
                        <Input
                          value={newAvoidWord}
                          onChange={(e) => setNewAvoidWord(e.target.value)}
                          placeholder="Add word to avoid"
                          className="flex-1"
                        />
                        <Button onClick={handleAddAvoidWord} disabled={!newAvoidWord.trim()}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      {formData.wordChoices.avoid.map((word, index) => (
                        <Badge 
                          key={index}
                          variant="outline" 
                          className="bg-red-50 text-red-700 border-red-200"
                        >
                          {word}
                          {isEditing && (
                            <button
                              className="ml-1 text-red-500 hover:text-red-700"
                              onClick={() => handleRemoveAvoidWord(index)}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </Badge>
                      ))}
                      {formData.wordChoices.avoid.length === 0 && (
                        <div className="text-sm text-gray-500 italic">No words to avoid defined</div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Examples Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Communication Examples</CardTitle>
                  <CardDescription>Examples of your brand voice in different contexts</CardDescription>
                </div>
                {isEditing && !editingExample && (
                  <Button variant="outline" size="sm" onClick={() => setNewExample({ context: '', good: '', bad: '' })}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Example
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {isEditing && (
                  <>
                    {!editingExample && newExample.context === '' && newExample.good === '' && newExample.bad === '' ? null : (
                      <div className="mb-6 space-y-4 p-4 border rounded-md bg-gray-50">
                        <h3 className="text-sm font-medium">
                          {editingExample ? 'Edit Example' : 'Add New Example'}
                        </h3>
                        <div>
                          <Label htmlFor="context" className="mb-1 block">Context</Label>
                          <Input
                            id="context"
                            value={editingExample ? editingExample.context : newExample.context}
                            onChange={(e) => handleExampleChange(e, editingExample || newExample, 'context')}
                            placeholder="e.g., Error message, Welcome email, Product description"
                          />
                        </div>
                        <div>
                          <Label htmlFor="good-example" className="mb-1 block">Good Example</Label>
                          <Textarea
                            id="good-example"
                            value={editingExample ? editingExample.good : newExample.good}
                            onChange={(e) => handleExampleChange(e, editingExample || newExample, 'good')}
                            placeholder="An example that aligns with your brand voice"
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor="bad-example" className="mb-1 block">Bad Example</Label>
                          <Textarea
                            id="bad-example"
                            value={editingExample ? editingExample.bad : newExample.bad}
                            onChange={(e) => handleExampleChange(e, editingExample || newExample, 'bad')}
                            placeholder="An example that does not align with your brand voice"
                            rows={3}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingExample(null);
                              setNewExample({ context: '', good: '', bad: '' });
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={editingExample ? handleUpdateExample : handleAddExample}
                            disabled={
                              (editingExample ? 
                                !editingExample.context || !editingExample.good || !editingExample.bad :
                                !newExample.context || !newExample.good || !newExample.bad)
                            }
                          >
                            {editingExample ? 'Update' : 'Add'} Example
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="space-y-4">
                  {formData.examples.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                      {formData.examples.map((example, index) => (
                        <AccordionItem key={index} value={`example-${index}`}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center text-left">
                              <span>{example.context}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-3 pt-2">
                              <div>
                                <h4 className="text-xs font-medium text-green-600 mb-1 flex items-center">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Good Example
                                </h4>
                                <div className="p-3 bg-green-50 text-green-800 rounded-md text-sm border border-green-100">
                                  {example.good}
                                </div>
                              </div>
                              <div>
                                <h4 className="text-xs font-medium text-red-600 mb-1 flex items-center">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Bad Example
                                </h4>
                                <div className="p-3 bg-red-50 text-red-800 rounded-md text-sm border border-red-100">
                                  {example.bad}
                                </div>
                              </div>
                              {isEditing && (
                                <div className="flex justify-end space-x-2 pt-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => setEditingExample(example)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleRemoveExample(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <div className="text-center py-8 border rounded-md">
                      <MessageSquare className="h-8 w-8 mx-auto text-gray-400" />
                      <p className="mt-2 text-gray-500">No communication examples defined</p>
                      {isEditing && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={() => setNewExample({ context: '', good: '', bad: '' })}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Example
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="simulator">
          {renderToneSimulator()}
        </TabsContent>
        
        <TabsContent value="channels">
          {renderChannelsMatrix()}
        </TabsContent>
      </Tabs>
    </div>
  );
} 