import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  Shield, 
  History, 
  Settings, 
  Sparkles, 
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  BarChart2,
  Plus,
  RotateCcw,
  MessageSquare,
  ArrowRight,
  PieChart,
  FileEdit,
  Trash
} from 'lucide-react';

import { SafeModeToggle } from './SafeModeToggle';
import { HistoryPanel } from './HistoryPanel';
import { DiffViewer } from './DiffViewer';
import { Badge } from '@/components/ui/badge';

interface AISettings {
  creativity: number;
  precision: number;
  speed: number;
}

interface HistoryItem {
  id: string;
  timestamp: Date;
  type: 'prompt' | 'response' | 'change' | 'system';
  content: string;
  status?: 'added' | 'modified' | 'removed';
}

interface ChangeItem {
  id: string;
  title: string;
  description: string;
  status: 'added' | 'modified' | 'removed';
  accepted?: boolean;
}

export function AIDashboard() {
  // Core state
  const [safeMode, setSafeMode] = useState(false);
  const [activeTab, setActiveTab] = useState('suggestions');
  
  // AI settings
  const [settings, setSettings] = useState<AISettings>({
    creativity: 50,
    precision: 70,
    speed: 60,
  });
  
  // Panels visibility state
  const [historyPanelOpen, setHistoryPanelOpen] = useState(false);
  const [diffViewerOpen, setDiffViewerOpen] = useState(false);
  
  // Change management state
  const [selectedChange, setSelectedChange] = useState<ChangeItem | null>(null);
  const [changes, setChanges] = useState<ChangeItem[]>([
    {
      id: 'conversion',
      title: 'Conversion Rate',
      description: 'Updated with segmented conversion data showing 4.8% for new users (previously averaged at 3.2%).',
      status: 'modified',
    },
    {
      id: 'revenue',
      title: 'Revenue Growth',
      description: 'Adjusted April data to reflect recent reconciliation and added forecast for June.',
      status: 'modified',
    },
    {
      id: 'segments',
      title: 'Customer Segments',
      description: 'New visualization showing revenue contribution by customer segment based on your CRM data.',
      status: 'added',
    }
  ]);

  // History events
  const [historyEvents, setHistoryEvents] = useState([
    {
      id: '1',
      timestamp: new Date(),
      title: 'Applied AI Suggestions',
      description: 'Applied 3 changes suggested by AI assistant to improve dashboard insights.',
      type: 'default' as const,
      isActive: true,
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      title: 'Updated Revenue Chart',
      description: 'Updated revenue data for Q1 and added growth indicators.',
      type: 'modified' as const,
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      title: 'Added Marketing Channels',
      description: 'Added new table showing marketing channel performance.',
      type: 'added' as const,
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      title: 'Dashboard Created',
      description: 'Initial dashboard setup with core metrics and visualizations.',
      type: 'default' as const,
    },
  ]);
  
  // Recent interactions
  const [interactionHistory] = useState<HistoryItem[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      type: 'prompt',
      content: 'Analyze our conversion rates and suggest improvements',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 4 * 60 * 1000),
      type: 'response',
      content: 'I found that your conversion rates for new users (4.8%) are significantly higher than your overall rate (3.2%). This suggests you should focus more acquisition resources on similar demographics.',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 3 * 60 * 1000),
      type: 'change',
      content: 'Updated conversion metric to show segmented data',
      status: 'modified',
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      type: 'system',
      content: 'Applied 3 changes to dashboard',
    },
  ]);

  // Handle AI settings change
  const handleSettingChange = (setting: keyof AISettings, value: number) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value,
    }));
  };
  
  // Open the diff viewer for a specific change
  const handleOpenDiffViewer = (change: ChangeItem) => {
    setSelectedChange(change);
    setDiffViewerOpen(true);
  };
  
  // Handle accepting a change
  const handleAcceptChange = (changeId: string) => {
    setChanges(prev => 
      prev.map(change => 
        change.id === changeId 
          ? { ...change, accepted: true } 
          : change
      )
    );
    
    // Add to history if not already there
    const changeToAccept = changes.find(c => c.id === changeId);
    if (changeToAccept) {
      const newHistoryEvent = {
        id: `accept-${Date.now()}`,
        timestamp: new Date(),
        title: `Accepted "${changeToAccept.title}" Change`,
        description: changeToAccept.description,
        type: changeToAccept.status as any,
      };
      
      setHistoryEvents(prev => [newHistoryEvent, ...prev]);
    }
  };
  
  // Handle rejecting a change
  const handleRejectChange = (changeId: string) => {
    setChanges(prev => 
      prev.map(change => 
        change.id === changeId 
          ? { ...change, accepted: false } 
          : change
      )
    );
  };
  
  // Accept all changes
  const handleAcceptAllChanges = () => {
    setChanges(prev => 
      prev.map(change => ({ ...change, accepted: true }))
    );
    
    // Add to history
    const newHistoryEvent = {
      id: `accept-all-${Date.now()}`,
      timestamp: new Date(),
      title: 'Accepted All AI Suggestions',
      description: `Applied ${changes.length} changes suggested by AI assistant.`,
      type: 'default' as const,
      isActive: true,
    };
    
    setHistoryEvents(prev => [newHistoryEvent, ...prev]);
  };
  
  // Reject all changes
  const handleRejectAllChanges = () => {
    setChanges(prev => 
      prev.map(change => ({ ...change, accepted: false }))
    );
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleString(undefined, {
      hour: 'numeric',
      minute: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Count changes by status
  const addedCount = changes.filter(c => c.status === 'added').length;
  const modifiedCount = changes.filter(c => c.status === 'modified').length;
  const removedCount = changes.filter(c => c.status === 'removed').length;
  
  // Calculate changes with decisions
  const acceptedChanges = changes.filter(c => c.accepted === true).length;
  const rejectedChanges = changes.filter(c => c.accepted === false).length;
  const pendingChanges = changes.length - acceptedChanges - rejectedChanges;

  return (
    <div className={`p-6 relative ${safeMode ? 'bg-blue-50 border-2 border-blue-200 rounded-lg transition-all duration-300' : ''}`}>
      {/* Header with summary */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-700 to-indigo-500 bg-clip-text text-transparent">
          AI Project Dashboard
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <div className="flex items-center">
            <span className="mr-2">Suggested Changes:</span>
            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">{addedCount} Added</Badge>
            <Badge variant="outline" className="ml-1 bg-blue-50 text-blue-700 hover:bg-blue-100">{modifiedCount} Modified</Badge>
            <Badge variant="outline" className="ml-1 bg-red-50 text-red-700 hover:bg-red-100">{removedCount} Removed</Badge>
          </div>
          <div className="w-px h-4 bg-slate-300 mx-2"></div>
          <div className="flex items-center">
            <span className="mr-2">Status:</span>
            {acceptedChanges > 0 && <Badge variant="outline" className="bg-green-50 text-green-700">{acceptedChanges} Accepted</Badge>}
            {rejectedChanges > 0 && <Badge variant="outline" className="ml-1 bg-red-50 text-red-700">{rejectedChanges} Rejected</Badge>}
            {pendingChanges > 0 && <Badge variant="outline" className="ml-1">{pendingChanges} Pending</Badge>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Safe Mode Toggle */}
          <SafeModeToggle 
            enabled={safeMode} 
            onToggle={setSafeMode}
          />
          
          {/* Main Tabs */}
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="suggestions" className="text-sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                AI Suggestions
                {pendingChanges > 0 && (
                  <Badge className="ml-2 bg-blue-500">{pendingChanges}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-sm">
                <Settings className="w-4 h-4 mr-2" />
                AI Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="suggestions" className="space-y-6">
              {/* Recent AI Changes */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="w-5 h-5 text-blue-500" />
                    Suggested Changes
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  {changes.length === 0 ? (
                    <div className="text-center py-6 text-slate-500">
                      No changes suggested yet. Ask the AI to analyze your data.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {changes.map((change) => (
                        <div 
                          key={change.id} 
                          className={`p-4 rounded-lg border-l-4 bg-white shadow-sm transition-all hover:shadow-md ${
                            change.accepted === true ? 'opacity-75 bg-green-50 border-green-500' :
                            change.accepted === false ? 'opacity-50 bg-slate-50 border-slate-300' :
                            change.status === 'modified' ? 'border-blue-500' : 
                            change.status === 'added' ? 'border-green-500' : 
                            'border-red-500'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold flex items-center gap-2">
                              {change.status === 'modified' ? <FileEdit className="w-4 h-4 text-blue-500" /> : 
                              change.status === 'added' ? <Plus className="w-4 h-4 text-green-500" /> : 
                              <Trash className="w-4 h-4 text-red-500" />}
                              {change.title}
                            </h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              change.status === 'modified' ? 'bg-blue-100 text-blue-700' : 
                              change.status === 'added' ? 'bg-green-100 text-green-700' : 
                              'bg-red-100 text-red-700'
                            }`}>
                              {change.status.charAt(0).toUpperCase() + change.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-3">{change.description}</p>
                          
                          {change.accepted === true ? (
                            <div className="flex items-center text-green-600 text-sm">
                              <CheckCircle className="w-4 h-4 mr-1.5" />
                              Change accepted
                            </div>
                          ) : change.accepted === false ? (
                            <div className="flex items-center text-red-600 text-sm">
                              <XCircle className="w-4 h-4 mr-1.5" />
                              Change rejected
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs"
                                onClick={() => handleOpenDiffViewer(change)}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View Change
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className={`text-xs text-green-600 border-green-200 hover:bg-green-50`}
                                onClick={() => handleAcceptChange(change.id)}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Accept
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => handleRejectChange(change.id)}
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                
                {changes.length > 0 && (
                  <CardFooter className="flex justify-between border-t pt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:bg-red-50 border-red-200"
                      onClick={handleRejectAllChanges}
                    >
                      <XCircle className="w-4 h-4 mr-1.5" />
                      Reject All
                    </Button>
                    <Button 
                      size="sm"
                      className="text-white bg-blue-600 hover:bg-blue-700"
                      onClick={handleAcceptAllChanges}
                    >
                      <CheckCircle className="w-4 h-4 mr-1.5" />
                      Accept All Changes
                    </Button>
                  </CardFooter>
                )}
              </Card>
              
              {/* Interaction History Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageSquare className="w-5 h-5 text-purple-500" />
                    Recent Interactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto">
                    {interactionHistory.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-lg ${
                          item.type === 'prompt'
                            ? 'bg-purple-50 border border-purple-100'
                            : item.type === 'response'
                            ? 'bg-blue-50 border border-blue-100'
                            : item.type === 'change'
                            ? (item.status === 'modified' 
                              ? 'bg-blue-50 border border-blue-100' 
                              : item.status === 'added'
                              ? 'bg-green-50 border border-green-100'
                              : 'bg-red-50 border border-red-100')
                            : 'bg-slate-50 border border-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {item.type === 'prompt' ? (
                            <Bot className="w-4 h-4 text-purple-500" />
                          ) : item.type === 'response' ? (
                            <Sparkles className="w-4 h-4 text-blue-500" />
                          ) : item.type === 'change' ? (
                            item.status === 'modified' ? (
                              <FileEdit className="w-4 h-4 text-blue-500" />
                            ) : item.status === 'added' ? (
                              <Plus className="w-4 h-4 text-green-500" />
                            ) : (
                              <Trash className="w-4 h-4 text-red-500" />
                            )
                          ) : (
                            <CheckCircle className="w-4 h-4 text-slate-500" />
                          )}
                          <span className="text-xs text-gray-500">
                            {formatDate(item.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm">{item.content}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-6">
              {/* AI Control Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    AI Control Panel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* AI Settings Sliders */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium">
                          <Sparkles className="w-4 h-4 text-purple-500" />
                          Creativity
                        </label>
                        <Slider
                          value={[settings.creativity]}
                          onValueChange={([value]) => handleSettingChange('creativity', value)}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-slate-500 mt-1 px-1">
                          <span>Conservative</span>
                          <span>Balanced</span>
                          <span>Creative</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium">
                          <Bot className="w-4 h-4 text-green-500" />
                          Precision
                        </label>
                        <Slider
                          value={[settings.precision]}
                          onValueChange={([value]) => handleSettingChange('precision', value)}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-slate-500 mt-1 px-1">
                          <span>Flexible</span>
                          <span>Balanced</span>
                          <span>Precise</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium">
                          <Settings className="w-4 h-4 text-orange-500" />
                          Processing Speed
                        </label>
                        <Slider
                          value={[settings.speed]}
                          onValueChange={([value]) => handleSettingChange('speed', value)}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-slate-500 mt-1 px-1">
                          <span>Thorough</span>
                          <span>Balanced</span>
                          <span>Fast</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Stats Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-blue-500" />
                    AI Usage Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold text-blue-600">12</div>
                      <div className="text-sm text-slate-600">Prompts This Week</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold text-purple-600">8</div>
                      <div className="text-sm text-slate-600">Changes Applied</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold text-green-600">83%</div>
                      <div className="text-sm text-slate-600">Acceptance Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Right Column */}
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant={historyPanelOpen ? "default" : "outline"}
              className="w-full flex items-center justify-center gap-2"
              onClick={() => setHistoryPanelOpen(!historyPanelOpen)}
            >
              <History className="w-4 h-4" />
              <span>{historyPanelOpen ? 'Hide History' : 'View History'}</span>
            </Button>
            
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => {
                if (changes.length > 0) {
                  handleOpenDiffViewer(changes[0]);
                }
              }}
              disabled={changes.length === 0}
            >
              <Eye className="w-4 h-4" />
              <span>Preview Changes</span>
            </Button>
          </div>
          
          {/* Custom Prompt Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Ask AI Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <textarea 
                  className="w-full border rounded-lg p-3 text-sm min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ask for help analyzing data, generating insights, or modifying your dashboard..."
                ></textarea>
                <Button className="self-end">
                  <SendIcon className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Suggested Prompts Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Suggested Prompts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start text-left text-sm" size="sm">
                  Analyze conversion rates across user segments
                </Button>
                <Button variant="outline" className="w-full justify-start text-left text-sm" size="sm">
                  Show revenue forecast for next quarter
                </Button>
                <Button variant="outline" className="w-full justify-start text-left text-sm" size="sm">
                  Compare ROI across all marketing channels
                </Button>
                <Button variant="outline" className="w-full justify-start text-left text-sm" size="sm">
                  Create visualizations for customer retention
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Floating Panels */}
      <HistoryPanel 
        isOpen={historyPanelOpen}
        onClose={() => setHistoryPanelOpen(false)}
        onRevert={() => alert('This would revert to the previous version in a real app')}
        events={historyEvents}
      />
      
      <DiffViewer 
        isOpen={diffViewerOpen && selectedChange !== null}
        onClose={() => {
          setDiffViewerOpen(false);
          setSelectedChange(null);
        }}
        onAccept={() => {
          if (selectedChange) {
            handleAcceptChange(selectedChange.id);
            setDiffViewerOpen(false);
          }
        }}
        onCancel={() => setDiffViewerOpen(false)}
        title={`Compare Changes: ${selectedChange?.title || ''}`}
        changeType={selectedChange?.status === 'added' ? 'added' : 
                    selectedChange?.status === 'modified' ? 'modified' : 'removed'}
        beforeContent={renderBeforeContent(selectedChange)}
        afterContent={renderAfterContent(selectedChange)}
      />
    </div>
  );
}

// Helper component for the Send icon
function SendIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}

// Helper functions to render content for the diff viewer
function renderBeforeContent(change: ChangeItem | null) {
  if (!change) return null;
  
  switch (change.id) {
    case 'conversion':
      return (
        <div className="text-center">
          <div className="text-4xl font-bold text-purple-700">3.2%</div>
          <div className="text-sm text-slate-500 mt-2">Average conversion rate</div>
        </div>
      );
    case 'revenue':
      return (
        <div className="flex items-end justify-around h-48 w-full">
          <div className="w-12 bg-purple-300 rounded-t-md" style={{height: '60%'}}></div>
          <div className="w-12 bg-purple-300 rounded-t-md" style={{height: '75%'}}></div>
          <div className="w-12 bg-purple-300 rounded-t-md" style={{height: '42%'}}></div>
          <div className="w-12 bg-purple-300 rounded-t-md" style={{height: '65%'}}></div>
          <div className="w-12 bg-purple-300 rounded-t-md" style={{height: '65%'}}></div>
        </div>
      );
    case 'segments':
      return (
        <div className="text-center text-slate-400 italic p-8">
          No customer segment visualization exists
        </div>
      );
    default:
      return null;
  }
}

function renderAfterContent(change: ChangeItem | null) {
  if (!change) return null;
  
  switch (change.id) {
    case 'conversion':
      return (
        <div className="text-center">
          <div className="text-4xl font-bold text-purple-700">4.8%</div>
          <div className="text-sm text-slate-500 mt-2">New user conversion rate</div>
        </div>
      );
    case 'revenue':
      return (
        <div className="flex items-end justify-around h-48 w-full">
          <div className="w-12 bg-purple-300 rounded-t-md" style={{height: '60%'}}></div>
          <div className="w-12 bg-purple-300 rounded-t-md" style={{height: '75%'}}></div>
          <div className="w-12 bg-purple-300 rounded-t-md" style={{height: '42%'}}></div>
          <div className="w-12 bg-blue-400 rounded-t-md" style={{height: '90%'}}></div>
          <div className="w-12 bg-purple-300 rounded-t-md" style={{height: '65%'}}></div>
          <div className="w-12 bg-green-400 rounded-t-md" style={{height: '85%'}}></div>
        </div>
      );
    case 'segments':
      return (
        <div className="flex items-end justify-around h-48 w-full">
          <div className="w-16 bg-green-400 rounded-t-md" style={{height: '85%'}}></div>
          <div className="w-16 bg-blue-400 rounded-t-md" style={{height: '60%'}}></div>
          <div className="w-16 bg-purple-400 rounded-t-md" style={{height: '40%'}}></div>
        </div>
      );
    default:
      return null;
  }
} 