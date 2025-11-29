/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { 
  Zap, 
  Search, 
  Star, 
  Download, 
  Play,
  Users,
  Clock,
  CheckCircle,
  TrendingUp,
  Settings,
  Brain,
  Bell
} from 'lucide-react';

interface WorkflowTemplate {
  id: number;
  name: string;
  description: string;
  category: string;
  templateConfig: {
    steps: any[];
    triggers: any[];
    variables: Record<string, any>;
    settings: Record<string, any>;
  };
  isPopular: boolean;
  isOfficial: boolean;
  usageCount: number;
  authorId?: string;
  tags: string[];
  version: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface WorkflowTemplatesProps {
  onUseTemplate: (template: WorkflowTemplate) => void;
  onCreateFromTemplate: (template: WorkflowTemplate) => void;
}

const TEMPLATE_CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'invoice', label: 'Invoice Management' },
  { value: 'expense', label: 'Expense Management' },
  { value: 'reporting', label: 'Reporting' },
  { value: 'client', label: 'Client Management' },
  { value: 'automation', label: 'Automation' },
  { value: 'notification', label: 'Notifications' },
];

const TEMPLATE_ICONS = {
  invoice: CheckCircle,
  expense: TrendingUp,
  reporting: Settings,
  client: Users,
  automation: Zap,
  notification: Bell,
  general: Brain,
};

export function WorkflowTemplates({
  onUseTemplate,
  onCreateFromTemplate
}: WorkflowTemplatesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);

  // Fetch templates
  const { data, isLoading } = useQuery({
    queryKey: ['workflow-templates', categoryFilter, searchTerm, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(searchTerm && { search: searchTerm }),
        sortBy,
      });
      
      const response = await fetch(`/api/workflows/templates?${params}`);
      return response.json();
    },
  });

  // Ensure templates is always an array (handle null/undefined)
  const templates = data || [];

  const getCategoryIcon = (category: string) => {
    const Icon = TEMPLATE_ICONS[category as keyof typeof TEMPLATE_ICONS] || TEMPLATE_ICONS.general;
    return <Icon className="h-4 w-4" />;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      invoice: 'bg-blue-500',
      expense: 'bg-green-500',
      reporting: 'bg-purple-500',
      client: 'bg-orange-500',
      automation: 'bg-yellow-500',
      notification: 'bg-red-500',
      general: 'bg-gray-500',
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const filteredTemplates = templates.filter((template: WorkflowTemplate) => {
    if (categoryFilter !== 'all' && template.category !== categoryFilter) return false;
    if (searchTerm && !template.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !template.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Workflow Templates</h3>
          <p className="text-sm text-muted-foreground">
            Get started quickly with pre-built workflow templates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Import Template
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {TEMPLATE_CATEGORIES.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="usage">Most Used</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-medium mb-2">No Templates Found</h4>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template: WorkflowTemplate) => (
            <Card 
              key={template.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedTemplate(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className={cn("p-2 rounded-lg", getCategoryColor(template.category))}>
                    {getCategoryIcon(template.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      {template.isOfficial && (
                        <Badge variant="default" className="text-xs">
                          Official
                        </Badge>
                      )}
                      {template.isPopular && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                    <CardDescription className="text-sm">
                      {template.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Template Stats */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{template.usageCount} uses</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{template.templateConfig.steps.length} steps</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      <span>{template.templateConfig.triggers.length} triggers</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUseTemplate(template);
                      }}
                    >
                      <Play className="mr-2 h-3 w-3" />
                      Use Template
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreateFromTemplate(template);
                      }}
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Template Details Modal */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className={cn("p-2 rounded-lg", getCategoryColor(selectedTemplate.category))}>
                {getCategoryIcon(selectedTemplate.category)}
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">{selectedTemplate.name}</CardTitle>
                <CardDescription>{selectedTemplate.description}</CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{selectedTemplate.category}</Badge>
                  <Badge variant="outline">v{selectedTemplate.version}</Badge>
                  {selectedTemplate.isOfficial && (
                    <Badge variant="default">Official</Badge>
                  )}
                  {selectedTemplate.isPopular && (
                    <Badge variant="secondary">
                      <Star className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="steps">Steps</TabsTrigger>
                <TabsTrigger value="triggers">Triggers</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Template Stats</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Steps:</span>
                        <span className="font-medium">{selectedTemplate.templateConfig.steps.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Triggers:</span>
                        <span className="font-medium">{selectedTemplate.templateConfig.triggers.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Usage Count:</span>
                        <span className="font-medium">{selectedTemplate.usageCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Version:</span>
                        <span className="font-medium">{selectedTemplate.version}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedTemplate.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="steps" className="space-y-4">
                <div className="space-y-2">
                  {selectedTemplate.templateConfig.steps.map((step: any, index: number) => (
                    <div key={`step-${step.id || index}`} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{step.name}</div>
                        <div className="text-xs text-muted-foreground">{step.type}</div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {step.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="triggers" className="space-y-4">
                <div className="space-y-2">
                  {selectedTemplate.templateConfig.triggers.map((trigger: any, index: number) => (
                    <div key={`trigger-${trigger.id || index}`} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{trigger.eventType}</div>
                        <div className="text-xs text-muted-foreground">{trigger.description}</div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {trigger.eventType}
                      </Badge>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={() => onUseTemplate(selectedTemplate)}
                className="flex-1"
              >
                <Play className="mr-2 h-4 w-4" />
                Use This Template
              </Button>
              <Button
                variant="outline"
                onClick={() => onCreateFromTemplate(selectedTemplate)}
              >
                <Settings className="mr-2 h-4 w-4" />
                Customize
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedTemplate(null)}
              >
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
