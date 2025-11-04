/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  Filter,
  Clock,
  TrendingUp,
  FileText,
  Users,
  Building2,
  Receipt,
  BarChart3,
  Zap,
  Star,
  Calendar,
  Tag,
  ExternalLink,
  BookOpen,
  MessageCircle,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

interface SearchResult {
  entityType: string;
  entityId: string;
  title: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  relevanceScore: number;
  createdAt: Date;
}

interface SearchFilters {
  entityTypes?: string[];
  categories?: string[];
  dateFrom?: Date;
  dateTo?: Date;
}

const entityTypeIcons = {
  'invoice': Receipt,
  'client': Users,
  'transaction': BarChart3,
  'document': FileText,
  'report': BarChart3,
  'user': Users,
  'company': Building2,
  'workflow': Zap,
  'message': MessageCircle,
  'help': BookOpen,
};

const entityTypeColors = {
  'invoice': 'bg-blue-100 text-blue-800 border-blue-200',
  'client': 'bg-green-100 text-green-800 border-green-200',
  'transaction': 'bg-purple-100 text-purple-800 border-purple-200',
  'document': 'bg-gray-100 text-gray-800 border-gray-200',
  'report': 'bg-orange-100 text-orange-800 border-orange-200',
  'user': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'company': 'bg-teal-100 text-teal-800 border-teal-200',
  'workflow': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'message': 'bg-pink-100 text-pink-800 border-pink-200',
  'help': 'bg-cyan-100 text-cyan-800 border-cyan-200',
};

export function ContentSearchModule() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('search');

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  // Search query
  const { data: searchResults, isLoading: isSearching, refetch } = useQuery({
    queryKey: ['search', query, filters],
    queryFn: async () => {
      if (!query.trim()) return { results: [], total: 0, query: '', filters: {} };

      const params = new URLSearchParams({
        q: query,
        limit: String(filters.limit || 50),
        offset: String(filters.offset || 0),
      });

      if (filters.entityTypes?.length) {
        params.append('entityTypes', filters.entityTypes.join(','));
      }
      if (filters.categories?.length) {
        params.append('categories', filters.categories.join(','));
      }
      if (filters.tags?.length) {
        params.append('tags', filters.tags.join(','));
      }
      if (filters.dateFrom) {
        params.append('dateFrom', filters.dateFrom.toISOString());
      }
      if (filters.dateTo) {
        params.append('dateTo', filters.dateTo.toISOString());
      }

      const response = await fetch(`/api/search/content?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      const data = await response.json();
      return data.data;
    },
    enabled: query.length > 0,
  });

  // Popular queries
  const { data: popularQueries } = useQuery({
    queryKey: ['popular-queries'],
    queryFn: async () => {
      const response = await fetch('/api/search/content/popular?limit=10');
      if (!response.ok) {
        return [];
      }
      const data = await response.json();
      return data.data || [];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Search suggestions
  const { data: searchSuggestions } = useQuery({
    queryKey: ['suggestions', query],
    queryFn: async () => {
      if (query.length < 2) return [];

      const response = await fetch('/api/search/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          limit: 5,
        }),
      });
      if (!response.ok) {
        return [];
      }
      const data = await response.json();
      return data.data || [];
    },
    enabled: query.length >= 2,
  });

  // Handle search
  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setQuery(searchQuery);

    // Add to recent searches
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));

    // Search query logging is handled by the API route
    refetch();
  };

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    // Navigate to appropriate page based on entity type
    const routes = {
      'invoice': `/invoices/${result.entityId}`,
      'client': `/clients/${result.entityId}`,
      'transaction': `/transactions/${result.entityId}`,
      'document': `/documents/${result.entityId}`,
      'report': `/reports/${result.entityId}`,
      'user': `/users/${result.entityId}`,
      'company': `/companies/${result.entityId}`,
      'workflow': `/workflows/${result.entityId}`,
      'message': `/collaboration?message=${result.entityId}`,
      'help': `/help/${result.entityId}`,
    };

    const route = routes[result.entityType as keyof typeof routes];
    if (route) {
      router.push(route);
    }
  };

  // Get icon for entity type
  const getEntityIcon = (entityType: string) => {
    const IconComponent = entityTypeIcons[entityType as keyof typeof entityTypeIcons] || FileText;
    return <IconComponent className="h-4 w-4" />;
  };

  // Get color for entity type
  const getEntityColor = (entityType: string) => {
    return entityTypeColors[entityType as keyof typeof entityTypeColors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Search className="h-8 w-8" />
            Content & Search Hub
          </h1>
          <p className="text-muted-foreground">
            Intelligent search across all your financial data and content
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            // Toggle advanced filters - you can implement this functionality
            console.log('Advanced filters clicked');
          }}>
            <Filter className="mr-2 h-4 w-4" />
            Advanced Filters
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/help-center?topic=search">
              <BookOpen className="mr-2 h-4 w-4" />
              Search Help
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Global Search</CardTitle>
          <CardDescription>
            Search across invoices, clients, transactions, documents, and more
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for clients, invoices, transactions, documents..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(query);
                }
              }}
              className="pl-10 pr-10 h-12 text-lg"
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <Select
              value={filters.entityTypes?.[0] || 'all'}
              onValueChange={(value) => {
                setFilters(prev => ({
                  ...prev,
                  entityTypes: value === 'all' ? undefined : [value]
                }));
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="invoice">Invoices</SelectItem>
                <SelectItem value="client">Clients</SelectItem>
                <SelectItem value="transaction">Transactions</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
                <SelectItem value="report">Reports</SelectItem>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="company">Companies</SelectItem>
                <SelectItem value="workflow">Workflows</SelectItem>
                <SelectItem value="message">Messages</SelectItem>
                <SelectItem value="help">Help Articles</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.categories?.[0] || 'all'}
              onValueChange={(value) => {
                setFilters(prev => ({
                  ...prev,
                  categories: value === 'all' ? undefined : [value]
                }));
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => handleSearch(query)}
              disabled={!query.trim() || isSearching}
              className="ml-auto"
            >
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="search">Search Results</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
        </TabsList>

        {/* Search Results */}
        <TabsContent value="search" className="space-y-4">
          {query && searchResults && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    Search Results for "{query}"
                    {searchResults.total > 0 && (
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        ({searchResults.total} results)
                      </span>
                    )}
                  </span>
                  {searchResults.total > 0 && (
                    <Button variant="outline" size="sm">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View All
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : searchResults.results.length === 0 ? (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h4 className="text-lg font-medium mb-2">No results found</h4>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your search terms or filters
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setQuery('')}>
                        Clear Search
                      </Button>
                      <Button variant="outline" size="sm">
                        <Filter className="mr-2 h-4 w-4" />
                        Advanced Search
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {searchResults.results.map((result, index) => (
                      <div
                        key={`${result.entityType}-${result.entityId}-${result.title}`}
                        className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleResultClick(result)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleResultClick(result);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="flex-shrink-0">
                          <div className={`p-2 rounded-lg border ${getEntityColor(result.entityType)}`}>
                            {getEntityIcon(result.entityType)}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium truncate">{result.title}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {result.entityType}
                            </Badge>
                            {result.relevanceScore > 0.8 && (
                              <Badge className="text-xs bg-green-100 text-green-800 border-green-200">
                                <Star className="h-3 w-3 mr-1" />
                                High Match
                              </Badge>
                            )}
                          </div>

                          {result.excerpt && (
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {result.excerpt}
                            </p>
                          )}

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {result.category && (
                              <div className="flex items-center gap-1">
                                <Tag className="h-3 w-3" />
                                {result.category}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(result.createdAt).toLocaleDateString()}
                            </div>
                            {result.metadata && (
                              <div className="flex items-center gap-1">
                                <BarChart3 className="h-3 w-3" />
                                {result.relevanceScore.toFixed(2)} relevance
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Suggestions */}
        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Suggestions</CardTitle>
              <CardDescription>
                Based on your search history and popular queries
              </CardDescription>
            </CardHeader>
            <CardContent>
              {searchSuggestions && searchSuggestions.length > 0 ? (
                <div className="grid gap-2">
                  {searchSuggestions.map((suggestion) => (
                    <Button
                      key={suggestion.query}
                      variant="ghost"
                      onClick={() => handleSearch(suggestion.query)}
                      className="justify-between p-3 text-left border rounded-lg hover:bg-muted/50 transition-colors h-auto"
                    >
                      <span className="font-medium">{suggestion.query}</span>
                      <Badge variant="secondary">
                        {suggestion.count} searches
                      </Badge>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Start typing to see suggestions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Searches */}
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Searches</span>
                {recentSearches.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setRecentSearches([]);
                      localStorage.removeItem('recentSearches');
                    }}
                  >
                    Clear All
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentSearches.length > 0 ? (
                <div className="grid gap-2">
                  {recentSearches.map((search) => (
                    <div
                      key={search}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleSearch(search)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSearch(search);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1">{search}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          const updated = recentSearches.filter(s => s !== search);
                          setRecentSearches(updated);
                          localStorage.setItem('recentSearches', JSON.stringify(updated));
                        }}
                        className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent searches</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Popular Queries */}
        <TabsContent value="popular" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Popular Searches
              </CardTitle>
              <CardDescription>
                Most searched terms in the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {popularQueries && popularQueries.length > 0 ? (
                <div className="grid gap-2">
                  {popularQueries.map((query, index) => (
                    <Button
                      key={query.query}
                      variant="ghost"
                      onClick={() => handleSearch(query.query)}
                      className="justify-between p-3 text-left border rounded-lg hover:bg-muted/50 transition-colors h-auto"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
                          {index + 1}
                        </span>
                        <span className="font-medium">{query.query}</span>
                      </div>
                      <Badge variant="secondary">
                        {query.count} searches
                      </Badge>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No popular searches yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
