import React from 'react';
import { EnhancedValidationUserFeedback } from '../../types';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  FileText,
  User,
  Building,
  Tag,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Clock,
  BarChart
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export interface UserFeedbackDetailsProps {
  feedback: EnhancedValidationUserFeedback;
}

export function UserFeedbackDetails({ feedback }: UserFeedbackDetailsProps) {
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSentimentColor = (sentiment: string | null) => {
    if (!sentiment) return 'default';
    switch (sentiment) {
      case 'positive':
        return 'success';
      case 'negative':
        return 'destructive';
      case 'neutral':
      default:
        return 'default';
    }
  };

  const getSentimentIcon = (sentiment: string | null) => {
    if (!sentiment) return <HelpCircle className="h-4 w-4" />;
    switch (sentiment) {
      case 'positive':
        return <ThumbsUp className="h-4 w-4" />;
      case 'negative':
        return <ThumbsDown className="h-4 w-4" />;
      case 'neutral':
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string | null) => {
    if (!impact) return 'default';
    switch (impact) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      case 'low':
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string | null) => {
    if (!status) return 'default';
    switch (status) {
      case 'addressed':
      case 'implemented':
        return 'success';
      case 'in_progress':
      case 'planned':
        return 'warning';
      case 'rejected':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string | null) => {
    if (!status) return <HelpCircle className="h-4 w-4" />;
    switch (status) {
      case 'addressed':
      case 'implemented':
        return <CheckCircle className="h-4 w-4" />;
      case 'in_progress':
      case 'planned':
        return <Clock className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Main content */}
      <div>
        <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-green-500" />
          User Feedback
        </h3>
        <Card>
          <CardContent className="p-4">
            <p className="text-base whitespace-pre-line">{feedback.content}</p>
          </CardContent>
        </Card>
      </div>

      {/* Sentiment and impact */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sentiment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getSentimentIcon(feedback.sentiment)}
              <Badge variant={getSentimentColor(feedback.sentiment) as any} className="capitalize">
                {feedback.sentiment || 'Not set'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <Badge variant={getImpactColor(feedback.impact) as any} className="capitalize">
                {feedback.impact || 'Not set'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User info */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{feedback.source || 'Anonymous'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Source</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{feedback.source || 'Not specified'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Status */}
      <div>
        <h3 className="text-sm font-medium mb-2 flex items-center gap-2 text-muted-foreground">
          <CheckCircle className="h-4 w-4" />
          Status
        </h3>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {getStatusIcon(feedback.status)}
              <Badge variant={getStatusColor(feedback.status) as any} className="capitalize">
                {feedback.status ? feedback.status.replace('_', ' ') : 'Not set'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis */}
      {feedback.analysis && (
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2 text-muted-foreground">
            <BarChart className="h-4 w-4" />
            Analysis
          </h3>
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                {feedback.analysis.sentiment && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Sentiment Score</p>
                    <div className="flex items-center gap-2">
                      {getSentimentIcon(feedback.analysis.sentiment)}
                      <span className="text-sm">{feedback.sentimentScore ? `${feedback.sentimentScore.toFixed(2)}` : 'N/A'}</span>
                    </div>
                  </div>
                )}
                
                {feedback.analysis.tags && feedback.analysis.tags.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {feedback.analysis.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {feedback.analysis.response && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Response</p>
                    <p className="text-sm whitespace-pre-line">{feedback.analysis.response}</p>
                  </div>
                )}
                
                {feedback.analysis.responseTime !== undefined && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Response Time</p>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{feedback.analysis.responseTime} hours</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <h3 className="text-xs font-medium mb-1 flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Created
          </h3>
          <p className="text-sm">{formatDate(feedback.created_at)}</p>
        </div>
        <div>
          <h3 className="text-xs font-medium mb-1 flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Last Updated
          </h3>
          <p className="text-sm">{formatDate(feedback.updated_at)}</p>
        </div>
      </div>
    </div>
  );
} 