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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Grid, 
  BarChart3, 
  Table, 
  TrendingUp, 
  DollarSign,
  FileText,
  Image,
  Globe,
  Star,
  Download,
  Plus
} from 'lucide-react';

interface WidgetLibraryProps {
  onSelectWidget: (widget: any) => void;
}

export function WidgetLibrary({ onSelectWidget }: WidgetLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch widget templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['widgetTemplates', selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams({
        category: selectedCategory,
      });
      const response = await fetch(`/api/dashboards/widgets/templates?${params}`);
      return response.json();
    },
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial': return <DollarSign className="h-4 w-4" />;
      case 'analytics': return <BarChart3 className="h-4 w-4" />;
      case 'operational': return <Table className="h-4 w-4" />;
      case 'custom': return <Grid className="h-4 w-4" />;
      default: return <Grid className="h-4 w-4" />;
    }
  };

  const getWidgetIcon = (type: string) => {
    switch (type) {
      case 'chart': return <BarChart3 className="h-4 w-4" />;
      case 'table': return <Table className="h-4 w-4" />;
      case 'metric': return <TrendingUp className="h-4 w-4" />;
      case 'text': return <FileText className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'iframe': return <Globe className="h-4 w-4" />;
      default: return <Grid className="h-4 w-4" />;
    }
  };

  const filteredTemplates = templates.filter((template: any) => {
    const matchesSearch = !searchQuery || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', name: 'All Categories', icon: <Grid className="h-4 w-4" /> },
    { id: 'financial', name: 'Financial', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'analytics', name: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'operational', name: 'Operational', icon: <Table className="h-4 w-4" /> },
    { id: 'custom', name: 'Custom', icon: <Grid className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search widgets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
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
            <Table className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Categories */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-5">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
              {category.icon}
              <span className="hidden sm:inline">{category.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Templates */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-8">
          <Grid className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No widgets found</p>
          <p className="text-sm text-muted-foreground mt-2">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className={cn(
          "grid gap-4",
          viewMode === 'grid' 
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
            : "grid-cols-1"
        )}>
          {filteredTemplates.map((template: any) => (
            <Card 
              key={template.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onSelectWidget(template)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                        {getWidgetIcon(template.type)}
                      </div>
                      <div>
                        <h3 className="font-medium">{template.name}</h3>
                        <p className="text-xs text-muted-foreground">{template.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {template.isOfficial && (
                        <Badge variant="secondary" className="text-xs">
                          Official
                        </Badge>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3" />
                        <span>{template.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {template.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                  )}

                  {/* Category and Usage */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {template.usageCount} uses
                    </div>
                  </div>

                  {/* Size Info */}
                  <div className="text-xs text-muted-foreground">
                    Default size: {template.defaultSize.w} × {template.defaultSize.h}
                  </div>

                  {/* Add Button */}
                  <Button 
                    className="w-full" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectWidget(template);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Widget
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Popular Widgets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="mr-2 h-5 w-5" />
            Popular Widgets
          </CardTitle>
          <CardDescription>
            Most used widgets by other users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates
              .sort((a: any, b: any) => b.usageCount - a.usageCount)
              .slice(0, 4)
              .map((template: any) => (
                <div 
                  key={template.id}
                  className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onSelectWidget(template)}
                >
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                    {getWidgetIcon(template.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{template.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {template.category} • {template.usageCount} uses
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
