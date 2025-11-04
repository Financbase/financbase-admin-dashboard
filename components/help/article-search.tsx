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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { 
  Search, 
  BookOpen, 
  Video, 
  HelpCircle, 
  TrendingUp,
  Star,
  Clock,
  Filter,
  SortAsc,
  ChevronRight,
  FileText,
  Play
} from 'lucide-react';

interface ArticleSearchProps {
  query: string;
  onViewArticle: (article: any) => void;
}

export function ArticleSearch({ query, onViewArticle }: ArticleSearchProps) {
  const [searchQuery, setSearchQuery] = useState(query);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [isSearching, setIsSearching] = useState(false);

  // Search results
  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['helpSearch', searchQuery, selectedCategory, sortBy],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      
      const params = new URLSearchParams({
        query: searchQuery,
        category: selectedCategory,
        sort: sortBy,
      });
      
      const response = await fetch(`/api/help/search?${params}`);
      return response.json();
    },
    enabled: !!searchQuery.trim(),
  });

  // Fetch categories for filter
  const { data: categories = [] } = useQuery({
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

  useEffect(() => {
    if (query !== searchQuery) {
      setSearchQuery(query);
    }
  }, [query]);

  const handleSearch = (newQuery: string) => {
    setSearchQuery(newQuery);
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 1000);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'article': return <BookOpen className="h-4 w-4" />;
      case 'video': return <Play className="h-4 w-4" />;
      case 'faq': return <HelpCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getResultColor = (type: string) => {
    switch (type) {
      case 'article': return 'text-blue-600 bg-blue-100';
      case 'video': return 'text-red-600 bg-red-100';
      case 'faq': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search for help articles, FAQs, or videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(searchQuery);
                }
              }}
              className="text-lg"
            />
          </div>
          <Button onClick={() => handleSearch(searchQuery)}>
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Array.isArray(categories) && categories.map((category: any) => (
                <SelectItem key={category.id} value={category.slug}>
                  {category.name || 'Unnamed Category'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="helpful">Most Helpful</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Search Results for "{searchQuery}"
            </h2>
            <div className="text-sm text-muted-foreground">
              {isLoading ? 'Searching...' : `${searchResults.length} results found`}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : searchResults.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No results found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try adjusting your search terms or filters
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {searchResults.map((result: any, index: number) => (
                <Card 
                  key={`${result.type}-${result.id}`}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onViewArticle(result)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        getResultColor(result.type)
                      )}>
                        {getResultIcon(result.type)}
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium line-clamp-2">{result.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {result.excerpt}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Badge variant="outline" className="text-xs">
                              {result.type}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {result.category}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              <span>{result.viewCount} views</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              <span>{result.helpfulCount} helpful</span>
                            </div>
                            {result.tags && result.tags.length > 0 && (
                              <div className="flex items-center gap-1">
                                <span>Tags: {result.tags.slice(0, 2).join(', ')}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-muted-foreground">
                              Relevance: {Math.round(result.relevanceScore)}%
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Popular Searches */}
      {!searchQuery && (
        <Card>
          <CardHeader>
            <CardTitle>Popular Searches</CardTitle>
            <CardDescription>
              Common topics users are looking for help with
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                'Getting Started',
                'Invoice Management',
                'Payment Processing',
                'Expense Tracking',
                'Reporting',
                'Integrations',
                'User Management',
                'Security Settings',
                'API Documentation',
                'Troubleshooting'
              ].map((topic) => (
                <Button
                  key={topic}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSearch(topic)}
                  className="text-sm"
                >
                  {topic}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
