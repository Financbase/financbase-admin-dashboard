"use client";

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { sanitizeHtml } from '@/lib/utils/sanitize';
import { formatDistanceToNow } from 'date-fns';
import { 
  ArrowLeft, 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Share2, 
  Bookmark, 
  MessageSquare,
  Clock,
  User,
  Tag,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ArticleViewerProps {
  article: any;
  onBack: () => void;
  onRelatedArticle: (article: any) => void;
}

export function ArticleViewer({ article, onBack, onRelatedArticle }: ArticleViewerProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isHelpful, setIsHelpful] = useState<boolean | null>(null);
  const [showTableOfContents, setShowTableOfContents] = useState(true);
  
  const queryClient = useQueryClient();

  // Fetch related articles
  const { data: relatedArticles = [] } = useQuery({
    queryKey: ['relatedArticles', article?.id],
    queryFn: async () => {
      if (!article?.id) return [];
      const response = await fetch(`/api/help/articles/${article.id}/related`);
      return response.json();
    },
    enabled: !!article?.id,
  });

  // Submit feedback mutation
  const submitFeedbackMutation = useMutation({
    mutationFn: async (feedback: {
      isHelpful: boolean;
      rating?: number;
      comment?: string;
    }) => {
      const response = await fetch(`/api/help/articles/${article.id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['helpArticles']);
      setShowFeedback(false);
      setFeedbackComment('');
      setFeedbackRating(null);
    },
  });

  const handleFeedback = (helpful: boolean) => {
    setIsHelpful(helpful);
    submitFeedbackMutation.mutate({
      isHelpful: helpful,
      rating: feedbackRating || undefined,
      comment: feedbackComment || undefined,
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  const renderTableOfContents = () => {
    if (!article.tableOfContents || article.tableOfContents.length === 0) {
      return null;
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Table of Contents</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTableOfContents(!showTableOfContents)}
            >
              {showTableOfContents ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CardTitle>
        </CardHeader>
        {showTableOfContents && (
          <CardContent>
            <nav className="space-y-2">
              {article.tableOfContents.map((item: any, index: number) => (
                <a
                  key={index}
                  href={`#${item.id}`}
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.title}
                </a>
              ))}
            </nav>
          </CardContent>
        )}
      </Card>
    );
  };

  const renderAttachments = () => {
    if (!article.attachments || article.attachments.length === 0) {
      return null;
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Attachments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {article.attachments.map((attachment: any, index: number) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                  <ExternalLink className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{attachment.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {attachment.size} • {attachment.type}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Download
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderRelatedArticles = () => {
    if (!relatedArticles || relatedArticles.length === 0) {
      return null;
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Related Articles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {relatedArticles.map((relatedArticle: any) => (
              <div 
                key={relatedArticle.id}
                className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onRelatedArticle(relatedArticle)}
              >
                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                  <Bookmark className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{relatedArticle.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {relatedArticle.category.name} • {relatedArticle.viewCount} views
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!article) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Article not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{article.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{article.author.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>
                {article.publishedAt 
                  ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
                  : 'Draft'
                }
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              <span>{article.helpfulCount} helpful</span>
            </div>
            <div className="flex items-center gap-1">
              <Bookmark className="h-4 w-4" />
              <span>{article.viewCount} views</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Article Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Article Body */}
          <Card>
            <CardContent className="p-8">
              <div className="prose prose-gray max-w-none">
                <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }} />
              </div>
            </CardContent>
          </Card>

          {/* Feedback Section */}
          <Card>
            <CardHeader>
              <CardTitle>Was this article helpful?</CardTitle>
              <CardDescription>
                Your feedback helps us improve our documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Button
                  variant={isHelpful === true ? "default" : "outline"}
                  onClick={() => handleFeedback(true)}
                  disabled={submitFeedbackMutation.isPending}
                >
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  Yes
                </Button>
                <Button
                  variant={isHelpful === false ? "default" : "outline"}
                  onClick={() => handleFeedback(false)}
                  disabled={submitFeedbackMutation.isPending}
                >
                  <ThumbsDown className="mr-2 h-4 w-4" />
                  No
                </Button>
                <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Leave Feedback
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Article Feedback</DialogTitle>
                      <DialogDescription>
                        Help us improve this article by sharing your thoughts
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Rating (optional)</label>
                        <div className="flex items-center gap-1 mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Button
                              key={star}
                              variant="ghost"
                              size="sm"
                              onClick={() => setFeedbackRating(star)}
                              className={cn(
                                "p-1",
                                feedbackRating && star <= feedbackRating 
                                  ? "text-yellow-400" 
                                  : "text-muted-foreground"
                              )}
                            >
                              <Star className="h-4 w-4" />
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Comments (optional)</label>
                        <Textarea
                          placeholder="Share your thoughts about this article..."
                          value={feedbackComment}
                          onChange={(e) => setFeedbackComment(e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => submitFeedbackMutation.mutate({
                            isHelpful: true,
                            rating: feedbackRating || undefined,
                            comment: feedbackComment || undefined,
                          })}
                          disabled={submitFeedbackMutation.isPending}
                        >
                          {submitFeedbackMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
                        </Button>
                        <Button variant="outline" onClick={() => setShowFeedback(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Table of Contents */}
          {renderTableOfContents()}

          {/* Article Info */}
          <Card>
            <CardHeader>
              <CardTitle>Article Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Category</p>
                  <Badge variant="outline">{article.category.name}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Tags</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {article.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Version</p>
                  <p className="text-sm text-muted-foreground">{article.version}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(article.updatedAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attachments */}
          {renderAttachments()}

          {/* Related Articles */}
          {renderRelatedArticles()}
        </div>
      </div>
    </div>
  );
}
