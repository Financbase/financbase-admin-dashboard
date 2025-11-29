/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { 
  Search, 
  BookOpen, 
  Video, 
  HelpCircle, 
  MessageSquare,
  Star,
  TrendingUp,
  Clock,
  Users,
  FileText,
  Play,
  ExternalLink,
  ChevronRight,
  Filter,
  SortAsc,
  Grid,
  List
} from 'lucide-react';
import { ArticleSearch } from './article-search';
import { ArticleViewer } from './article-viewer';
import { VideoTutorials } from './video-tutorials';
import { FAQSection } from './faq-section';
import { SupportTicketForm } from './support-ticket-form';
import { logger } from '@/lib/logger';

interface HelpCenterProps {
  onViewArticle: (article: any) => void;
  onCreateTicket: () => void;
}

export function HelpCenter({ onViewArticle, onCreateTicket }: HelpCenterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('search');

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['helpCategories'],
    queryFn: async () => {
      const response = await fetch('/api/help/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      // Ensure we return an array even if the API returns an error object
      return Array.isArray(data) ? data : [];
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch featured articles
  const { data: featuredArticles = [], isLoading: featuredLoading } = useQuery({
    queryKey: ['featuredArticles'],
    queryFn: async () => {
      const response = await fetch('/api/help/articles?featured=true&limit=6');
      return response.json();
    },
  });

  // Fetch recent articles
  const { data: recentArticles = [], isLoading: recentLoading } = useQuery({
    queryKey: ['recentArticles'],
    queryFn: async () => {
      const response = await fetch('/api/help/articles?limit=8&sort=recent');
      return response.json();
    },
  });

  // Fetch popular articles
  const { data: popularArticles = [], isLoading: popularLoading } = useQuery({
    queryKey: ['popularArticles'],
    queryFn: async () => {
      const response = await fetch('/api/help/articles?limit=8&sort=popular');
      return response.json();
    },
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setActiveTab('search');
  };

  const handleCategorySelect = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    setActiveTab('articles');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Help Center</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Find answers, learn how to use Financbase, and get support when you need it
        </p>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for help articles, FAQs, or videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(searchQuery);
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Help Articles</p>
                <p className="text-2xl font-bold">150+</p>
              </div>
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Video Tutorials</p>
                <p className="text-2xl font-bold">50+</p>
              </div>
              <Video className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">FAQ Items</p>
                <p className="text-2xl font-bold">100+</p>
              </div>
              <HelpCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Support Tickets</p>
                <p className="text-2xl font-bold">24h</p>
              </div>
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Browse by Category</CardTitle>
          <CardDescription>
            Find help content organized by topic
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categoriesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : categoriesError ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">Unable to load categories</p>
                <p className="text-sm text-muted-foreground">Please try again later</p>
              </div>
            </div>
          ) : !Array.isArray(categories) || categories.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-muted-foreground">No categories available</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category: any) => (
                <Card 
                  key={category.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleCategorySelect(category.slug)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white bg-muted"
                        style={{ backgroundColor: category.color || undefined }}
                      >
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{category.name || 'Unnamed Category'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {category.articleCount || 0} articles
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-4">
          <ArticleSearch 
            query={searchQuery}
            onViewArticle={onViewArticle}
          />
        </TabsContent>

        {/* Articles Tab */}
        <TabsContent value="articles" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Help Articles</h2>
              <p className="text-muted-foreground">
                Comprehensive guides and documentation
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Featured Articles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="mr-2 h-5 w-5" />
                Featured Articles
              </CardTitle>
            </CardHeader>
            <CardContent>
              {featuredLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className={cn(
                  "grid gap-4",
                  viewMode === 'grid' 
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                    : "grid-cols-1"
                )}>
                  {featuredArticles.map((article: any) => (
                    <Card 
                      key={article.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => onViewArticle(article)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h3 className="font-medium line-clamp-2">{article.title}</h3>
                            <Badge variant="secondary" className="text-xs">
                              Featured
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {article.excerpt}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{article.category.name}</span>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                <span>{article.helpfulCount}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                <span>{article.viewCount}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Articles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Recent Articles
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentArticles.map((article: any) => (
                    <div 
                      key={article.id}
                      className="flex items-center gap-4 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => onViewArticle(article)}
                    >
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{article.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {article.category.name} • {formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          <span>{article.viewCount}</span>
                        </div>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Videos Tab */}
        <TabsContent value="videos" className="space-y-4">
          <VideoTutorials onViewVideo={(video) => logger.info('View video:', video)} />
        </TabsContent>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-4">
          <FAQSection />
        </TabsContent>

        {/* Support Tab */}
        <TabsContent value="support" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Get Support</CardTitle>
              <CardDescription>
                Can't find what you're looking for? Contact our support team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Contact Options</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <MessageSquare className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Support Ticket</p>
                        <p className="text-sm text-muted-foreground">Get help from our team</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Users className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">Live Chat</p>
                        <p className="text-sm text-muted-foreground">Chat with support (9 AM - 6 PM EST)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <ExternalLink className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="font-medium">Community Forum</p>
                        <p className="text-sm text-muted-foreground">Ask questions to other users</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <Button onClick={onCreateTicket} className="w-full">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Create Support Ticket
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
