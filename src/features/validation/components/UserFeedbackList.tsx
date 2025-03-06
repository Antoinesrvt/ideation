import React, { useState } from 'react';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Edit, 
  Trash2, 
  Calendar,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Tag,
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle2,
  CheckSquare,
  XCircle,
  PlusCircle,
  Plus,
  Trash
} from 'lucide-react';
import { ValidationUserFeedback } from '@/store/types';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';

interface UserFeedbackListProps {
  feedback: ValidationUserFeedback[];
  onUpdate: (params: { id: string; data: Partial<Omit<ValidationUserFeedback, 'id' | 'created_at' | 'updated_at'>> }) => void;
  onDelete: (id: string) => void;
}

interface UserFeedbackFormValues {
  source: string;
  date: string;
  type: 'feature-request' | 'bug-report' | 'testimonial' | 'criticism' | 'suggestion';
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  impact: 'high' | 'medium' | 'low';
  status: 'new' | 'in-review' | 'accepted' | 'rejected' | 'implemented';
  response: string;
  tags: string[];
}

export function UserFeedbackList({ feedback, onUpdate, onDelete }: UserFeedbackListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<ValidationUserFeedback | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  
  const form = useForm<UserFeedbackFormValues>({
    defaultValues: {
      source: '',
      date: '',
      type: 'suggestion',
      content: '',
      sentiment: 'neutral',
      impact: 'medium',
      status: 'new',
      response: '',
      tags: []
    }
  });
  
  const handleEdit = (item: ValidationUserFeedback) => {
    setEditingFeedback(item);
    
    form.reset({
      source: item.source || '',
      date: item.date || '',
      type: (item.type as UserFeedbackFormValues['type']) || 'suggestion',
      content: item.content || '',
      sentiment: (item.sentiment as UserFeedbackFormValues['sentiment']) || 'neutral',
      impact: (item.impact as UserFeedbackFormValues['impact']) || 'medium',
      status: (item.status as UserFeedbackFormValues['status']) || 'new',
      response: item.response || '',
      tags: item.tags || []
    });
    
    setTags(item.tags || []);
    setIsDialogOpen(true);
  };
  
  const handleSave = (values: UserFeedbackFormValues) => {
    if (!editingFeedback) return;

    onUpdate({
      id: editingFeedback.id,
      data: {
        ...values,
        tags
      }
    });

    setIsDialogOpen(false);
    setEditingFeedback(null);
    form.reset();
    setTags([]);
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      onDelete(id);
    }
  };
  
  const getSentimentColor = (sentiment: ValidationUserFeedback['sentiment']) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getSentimentIcon = (sentiment: ValidationUserFeedback['sentiment']) => {
    switch (sentiment) {
      case 'positive':
        return <ThumbsUp className="h-3 w-3" />;
      case 'negative':
        return <ThumbsDown className="h-3 w-3" />;
      default:
        return null;
    }
  };
  
  const getStatusColor = (status: ValidationUserFeedback['status']) => {
    switch (status) {
      case 'implemented':
        return 'bg-green-100 text-green-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'in-review':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusIcon = (status: ValidationUserFeedback['status']) => {
    switch (status) {
      case 'new':
        return <MessageSquare className="h-3 w-3" />;
      case 'in-review':
        return <Clock className="h-3 w-3" />;
      case 'accepted':
        return <CheckCircle2 className="h-3 w-3" />;
      case 'rejected':
        return <XCircle className="h-3 w-3" />;
      case 'implemented':
        return <CheckSquare className="h-3 w-3" />;
      default:
        return null;
    }
  };
  
  const getTypeColor = (type: ValidationUserFeedback['type']) => {
    switch (type) {
      case 'feature-request':
        return 'bg-purple-100 text-purple-800';
      case 'bug-report':
        return 'bg-red-100 text-red-800';
      case 'testimonial':
        return 'bg-green-100 text-green-800';
      case 'criticism':
        return 'bg-orange-100 text-orange-800';
      case 'suggestion':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getImpactColor = (impact: ValidationUserFeedback['impact']) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const handleAddTag = () => {
    const tag = window.prompt('Enter a new tag:');
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {feedback.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="pt-6 pb-4 flex flex-col items-center text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No User Feedback Yet</h3>
            <p className="text-sm text-gray-500 max-w-md mb-4">
              Collect and organize customer insights to improve your product
            </p>
          </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Feedback</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Source & Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feedback.map(item => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <Badge className={getSentimentColor(item.sentiment)}>
                        <span className="flex items-center gap-1">
                          {getSentimentIcon(item.sentiment)}
                          {item.sentiment}
                        </span>
                      </Badge>
                      <Badge className={getImpactColor(item.impact)}>
                        {item.impact} impact
                      </Badge>
                    </div>
                    <span className="mt-1 text-sm line-clamp-2">
                      {item.content || "No content provided"}
                    </span>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                            #{tag}
                          </span>
                        ))}
                        {item.tags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{item.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getTypeColor(item.type)}>
                    {item.type?.replace('-', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    <span className="font-medium">{item.source || "Unknown"}</span>
                    <span className="text-gray-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {formatDate(item.date || undefined)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(item.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(item.status)}
                      {item.status?.replace('-', ' ')}
                    </span>
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingFeedback?.id ? 'Edit User Feedback' : 'Add User Feedback'}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source</FormLabel>
                      <FormControl>
                        <Input placeholder="Customer name or identifier" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="feature-request">Feature Request</SelectItem>
                          <SelectItem value="bug-report">Bug Report</SelectItem>
                          <SelectItem value="testimonial">Testimonial</SelectItem>
                          <SelectItem value="criticism">Criticism</SelectItem>
                          <SelectItem value="suggestion">Suggestion</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="sentiment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sentiment</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select sentiment" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="positive">Positive</SelectItem>
                          <SelectItem value="neutral">Neutral</SelectItem>
                          <SelectItem value="negative">Negative</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="impact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Impact</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select impact" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feedback Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="What did the user say?" 
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="in-review">In Review</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="implemented">Implemented</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="response"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Response</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="How did you respond to this feedback?" 
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-2">
                <FormLabel>Tags</FormLabel>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Add tag"
                    value={tags.join(', ')}
                    onChange={(e) => setTags(e.target.value.split(','))}
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddTag}
                    size="sm"
                  >
                    Add
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <Trash className="h-3 w-3 text-red-500" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
              
              <DialogFooter>
                <Button type="submit">Save Feedback</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 