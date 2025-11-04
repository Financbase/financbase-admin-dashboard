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
import { useAuthenticatedFetch } from '@/hooks/use-authenticated-fetch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Search,
  Grid,
  List,
  Star,
  Download,
  Zap,
  BarChart3,
  Plug,
  Shield,
  Code,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Building2,
  Users,
  CreditCard,
  FileText,
  Bot,
  Network,
  Briefcase,
  Home,
  Calculator,
  Globe,
  Database,
  Eye,
  Target,
  MessageSquare,
  Settings,
  Plus,
  Award,
  Activity,
  Store,
} from 'lucide-react';
import { PluginCard } from './plugin-card';
import { PluginDetails } from './plugin-details';

interface Plugin {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  version: string;
  author: string;
  category: string;
  tags: string[];
  icon: string;
  screenshots: string[];
  features: string[];
  isFree: boolean;
  price?: number;
  currency: string;
  license: string;
  downloadCount: number;
  installCount: number;
  rating: number;
  reviewCount: number;
  isOfficial: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

interface InstalledPlugin {
  id: number;
  plugin: Plugin;
  isActive: boolean;
  isEnabled: boolean;
  installedAt: string;
  lastUsedAt?: string;
  usageCount: number;
}

export function MarketplaceSystem() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedView, setSelectedView] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [activeTab, setActiveTab] = useState('browse');

  // Get authenticated fetch function and session status
  const { authenticatedFetch, isLoaded, isSignedIn } = useAuthenticatedFetch();

  // Fetch available plugins
  const { data: pluginsData, isLoading: pluginsLoading } = useQuery({
    queryKey: ['marketplacePlugins', { category: selectedCategory, search: searchTerm, sort: sortBy }],
    queryFn: async () => {
      // Wait for auth to load
      if (!isLoaded) {
        return { plugins: [], pagination: { total: 0, limit: 20, offset: 0, hasMore: false } };
      }

      // Check if user is signed in
      if (!isSignedIn) {
        console.warn('User is not authenticated');
        return { plugins: [], pagination: { total: 0, limit: 20, offset: 0, hasMore: false } };
      }

      try {
        const params = new URLSearchParams({
          category: selectedCategory,
          search: searchTerm,
          sort: sortBy,
        });
        const response = await authenticatedFetch(`/api/marketplace/plugins?${params}`);
        if (!response.ok) {
          if (response.status === 401) {
            console.error('Unauthorized - authentication token may be invalid');
            throw new Error('Your session has expired. Please sign in again.');
          }
          throw new Error(`Failed to fetch plugins: ${response.statusText}`);
        }
        const data = await response.json();
        return data.plugins ? data : { plugins: Array.isArray(data) ? data : [], pagination: { total: 0, limit: 20, offset: 0, hasMore: false } };
      } catch (error) {
        if (error instanceof Error && error.message.includes('not authenticated')) {
          console.error('Authentication error:', error);
          throw error;
        }
        console.error('Error fetching plugins:', error);
        return { plugins: [], pagination: { total: 0, limit: 20, offset: 0, hasMore: false } };
      }
    },
    enabled: isLoaded, // Only run query when auth is loaded
  });

  const plugins = pluginsData?.plugins || [];

  // Fetch installed plugins
  const { data: installedPlugins = [], isLoading: installedLoading } = useQuery({
    queryKey: ['installedPlugins'],
    queryFn: async () => {
      // Wait for auth to load
      if (!isLoaded) {
        return [];
      }

      // Check if user is signed in
      if (!isSignedIn) {
        console.warn('User is not authenticated');
        return [];
      }

      try {
        const response = await authenticatedFetch('/api/marketplace/plugins/installed');
        if (!response.ok) {
          if (response.status === 401) {
            console.error('Unauthorized - authentication token may be invalid');
            throw new Error('Your session has expired. Please sign in again.');
          }
          throw new Error(`Failed to fetch installed plugins: ${response.statusText}`);
        }
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        if (error instanceof Error && error.message.includes('not authenticated')) {
          console.error('Authentication error:', error);
          throw error;
        }
        console.error('Error fetching installed plugins:', error);
        return [];
      }
    },
    enabled: isLoaded, // Only run query when auth is loaded
  });

  // Enhanced categories including the 13 integrations
  const categories = [
    { value: 'all', label: 'All Categories', icon: Grid, count: plugins.length },
    { value: 'accounting', label: 'Accounting & Finance', icon: Calculator, count: 15 },
    { value: 'banking', label: 'Banking & Payments', icon: CreditCard, count: 12 },
    { value: 'hr-payroll', label: 'HR & Payroll', icon: Users, count: 8 },
    { value: 'productivity', label: 'Productivity', icon: Zap, count: 25 },
    { value: 'reporting', label: 'Reporting & Analytics', icon: BarChart3, count: 18 },
    { value: 'integration', label: 'Third-party Integrations', icon: Plug, count: 13 },
    { value: 'automation', label: 'Workflow Automation', icon: Code, count: 20 },
    { value: 'security', label: 'Security & Compliance', icon: Shield, count: 10 },
    { value: 'ai-ml', label: 'AI & Machine Learning', icon: Bot, count: 14 },
    { value: 'communication', label: 'Communication', icon: MessageSquare, count: 9 },
    { value: 'document', label: 'Document Management', icon: FileText, count: 16 },
    { value: 'ecommerce', label: 'E-commerce', icon: Briefcase, count: 7 },
    { value: 'real-estate', label: 'Real Estate', icon: Home, count: 6 },
    { value: 'freelance', label: 'Freelance Tools', icon: Target, count: 11 },
  ];

  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'newest', label: 'Newest' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'downloads', label: 'Most Downloaded' },
    { value: 'name', label: 'Name A-Z' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
  ];

  const filteredPlugins = plugins.filter((plugin: Plugin) => {
    const matchesSearch = plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plugin.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plugin.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || plugin.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getInstalledPluginIds = () => {
    return installedPlugins.map((ip: InstalledPlugin) => ip.plugin.id);
  };

  const handleInstall = (pluginId: number) => {
    // In a real implementation, this would trigger the install mutation
    console.log('Installing plugin:', pluginId);
  };

  const handleUninstall = (pluginId: number) => {
    // In a real implementation, this would trigger the uninstall mutation
    console.log('Uninstalling plugin:', pluginId);
  };

  const handleViewDetails = (plugin: Plugin) => {
    setSelectedPlugin(plugin);
  };

  const handleBackToList = () => {
    setSelectedPlugin(null);
  };

  if (selectedPlugin) {
    return (
      <PluginDetails
        plugin={selectedPlugin}
        isInstalled={getInstalledPluginIds().includes(selectedPlugin.id)}
        onInstall={handleInstall}
        onUninstall={handleUninstall}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Store className="h-6 w-6" />
            Plugin Marketplace & Integration Hub
          </h2>
          <p className="text-muted-foreground">
            Discover, install, and manage plugins and integrations to extend Financbase
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Submit Plugin
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            My Account
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Plugins</p>
                <p className="text-xl font-bold">{plugins.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Installed</p>
                <p className="text-xl font-bold">{installedPlugins.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-xl font-bold">4.7</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Downloads Today</p>
                <p className="text-xl font-bold">247</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browse">Browse Plugins</TabsTrigger>
          <TabsTrigger value="integrations">Partner Integrations</TabsTrigger>
          <TabsTrigger value="installed">Installed ({installedPlugins.length})</TabsTrigger>
          <TabsTrigger value="my-plugins">Developer Portal</TabsTrigger>
        </TabsList>

        {/* Browse Plugins */}
        <TabsContent value="browse" className="space-y-4">
          {/* Featured Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.slice(1, 7).map((category) => (
              <Card
                key={category.value}
                className={cn(
                  "cursor-pointer hover:shadow-md transition-shadow",
                  selectedCategory === category.value && "ring-2 ring-primary"
                )}
                onClick={() => setSelectedCategory(category.value)}
              >
                <CardContent className="p-4 text-center">
                  <category.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">{category.label}</p>
                  <p className="text-xs text-muted-foreground">{category.count} plugins</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search plugins, integrations, tools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center gap-2">
                      <category.icon className="h-4 w-4" />
                      {category.label}
                      <Badge variant="secondary" className="ml-auto">
                        {category.count}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Button
                variant={selectedView === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedView('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={selectedView === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedView('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Plugins Grid */}
          {pluginsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredPlugins.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No plugins found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try adjusting your search or filters
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className={cn(
              "grid gap-4",
              selectedView === 'grid'
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
            )}>
              {filteredPlugins.map((plugin: Plugin) => (
                <PluginCard
                  key={plugin.id}
                  plugin={plugin}
                  isInstalled={getInstalledPluginIds().includes(plugin.id)}
                  onInstall={handleInstall}
                  onUninstall={handleUninstall}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Partner Integrations */}
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Partner Integrations
              </CardTitle>
              <CardDescription>
                Connect with 13+ enterprise services and platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Banking & Payments */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Banking & Payments
                  </h4>
                  {[
                    { name: 'Stripe', status: 'Connected', icon: CreditCard, color: 'text-purple-600' },
                    { name: 'PayPal', status: 'Available', icon: Globe, color: 'text-blue-600' },
                    { name: 'Square', status: 'Available', icon: Calculator, color: 'text-gray-600' },
                    { name: 'Wise', status: 'Available', icon: TrendingUp, color: 'text-green-600' },
                  ].map((integration) => (
                    <div key={integration.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <integration.icon className={`h-5 w-5 ${integration.color}`} />
                        <div>
                          <p className="font-medium text-sm">{integration.name}</p>
                          <p className="text-xs text-muted-foreground">Payment processing</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={integration.status === 'Connected' ? 'default' : 'outline'}>
                          {integration.status}
                        </Badge>
                        {integration.status === 'Connected' ? (
                          <Button size="sm" variant="outline">
                            <Settings className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button size="sm">
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Accounting & Finance */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Accounting & Finance
                  </h4>
                  {[
                    { name: 'QuickBooks', status: 'Error', icon: Calculator, color: 'text-green-600' },
                    { name: 'Xero', status: 'Available', icon: FileText, color: 'text-gray-600' },
                    { name: 'FreshBooks', status: 'Available', icon: FileText, color: 'text-orange-600' },
                    { name: 'NetSuite', status: 'Available', icon: Database, color: 'text-blue-600' },
                  ].map((integration) => (
                    <div key={integration.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <integration.icon className={`h-5 w-5 ${integration.color}`} />
                        <div>
                          <p className="font-medium text-sm">{integration.name}</p>
                          <p className="text-xs text-muted-foreground">Accounting software</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          integration.status === 'Connected' ? 'default' :
                          integration.status === 'Error' ? 'destructive' : 'outline'
                        }>
                          {integration.status}
                        </Badge>
                        {integration.status === 'Error' ? (
                          <Button size="sm" variant="outline">
                            <AlertTriangle className="h-4 w-4" />
                          </Button>
                        ) : integration.status === 'Connected' ? (
                          <Button size="sm" variant="outline">
                            <Settings className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button size="sm">
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* HR & Operations */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    HR & Operations
                  </h4>
                  {[
                    { name: 'Gusto', status: 'Connected', icon: Users, color: 'text-blue-600' },
                    { name: 'BambooHR', status: 'Available', icon: Users, color: 'text-green-600' },
                    { name: 'ADP', status: 'Available', icon: Building2, color: 'text-purple-600' },
                    { name: 'Slack', status: 'Available', icon: MessageSquare, color: 'text-purple-600' },
                  ].map((integration) => (
                    <div key={integration.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <integration.icon className={`h-5 w-5 ${integration.color}`} />
                        <div>
                          <p className="font-medium text-sm">{integration.name}</p>
                          <p className="text-xs text-muted-foreground">HR & communication</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={integration.status === 'Connected' ? 'default' : 'outline'}>
                          {integration.status}
                        </Badge>
                        {integration.status === 'Connected' ? (
                          <Button size="sm" variant="outline">
                            <Settings className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button size="sm">
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Installed Plugins */}
        <TabsContent value="installed" className="space-y-4">
          {installedLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : installedPlugins.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Plug className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No plugins installed</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Browse the marketplace to find plugins that can help you
                  </p>
                  <Button className="mt-4" onClick={() => setActiveTab('browse')}>
                    Browse Marketplace
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {installedPlugins.map((installedPlugin: InstalledPlugin) => (
                <Card key={installedPlugin.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                          {installedPlugin.plugin.icon ? (
                            <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                              <Plug className="h-4 w-4 text-gray-600" />
                            </div>
                          ) : (
                            <Plug className="h-6 w-6" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">{installedPlugin.plugin.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            v{installedPlugin.plugin.version} • {installedPlugin.plugin.author}
                          </p>
                          <div className="flex items-center gap-4 mt-1">
                            <Badge variant={installedPlugin.isActive ? 'default' : 'secondary'}>
                              {installedPlugin.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Used {installedPlugin.usageCount} times
                            </span>
                            {installedPlugin.lastUsedAt && (
                              <span className="text-xs text-muted-foreground">
                                Last used {new Date(installedPlugin.lastUsedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(installedPlugin.plugin)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUninstall(installedPlugin.plugin.id)}
                        >
                          Uninstall
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Developer Portal */}
        <TabsContent value="my-plugins" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Plugin Development
                </CardTitle>
                <CardDescription>
                  Create and publish your own plugins to the marketplace
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Development Tools</h4>
                  <div className="grid gap-2">
                    <Button variant="outline" className="justify-start">
                      <Code className="mr-2 h-4 w-4" />
                      Plugin SDK Documentation
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Settings className="mr-2 h-4 w-4" />
                      Development Environment
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Activity className="mr-2 h-4 w-4" />
                      Testing Framework
                    </Button>
                  </div>
                </div>
                <Button className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Plugin
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Developer Stats
                </CardTitle>
                <CardDescription>
                  Your development activity and earnings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-sm text-muted-foreground">Published Plugins</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">2.4K</p>
                    <p className="text-sm text-muted-foreground">Total Downloads</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">4.8</p>
                    <p className="text-sm text-muted-foreground">Avg Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">$1,247</p>
                    <p className="text-sm text-muted-foreground">Total Earnings</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}