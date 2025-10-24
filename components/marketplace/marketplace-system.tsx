"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  Download, 
  Zap,
  BarChart3,
  Plug,
  Shield,
  Code,
  Palette,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle
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

  // Fetch available plugins
  const { data: plugins = [], isLoading: pluginsLoading } = useQuery({
    queryKey: ['marketplacePlugins', { category: selectedCategory, search: searchTerm, sort: sortBy }],
    queryFn: async () => {
      const params = new URLSearchParams({
        category: selectedCategory,
        search: searchTerm,
        sort: sortBy,
      });
      const response = await fetch(`/api/marketplace/plugins?${params}`);
      return response.json();
    },
  });

  // Fetch installed plugins
  const { data: installedPlugins = [], isLoading: installedLoading } = useQuery({
    queryKey: ['installedPlugins'],
    queryFn: async () => {
      const response = await fetch('/api/marketplace/plugins/installed');
      return response.json();
    },
  });

  const categories = [
    { value: 'all', label: 'All Categories', icon: Grid },
    { value: 'productivity', label: 'Productivity', icon: Zap },
    { value: 'reporting', label: 'Reporting', icon: BarChart3 },
    { value: 'integration', label: 'Integration', icon: Plug },
    { value: 'automation', label: 'Automation', icon: Code },
    { value: 'security', label: 'Security', icon: Shield },
  ];

  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'newest', label: 'Newest' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'downloads', label: 'Most Downloaded' },
    { value: 'name', label: 'Name A-Z' },
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
          <h2 className="text-2xl font-bold">Plugin Marketplace</h2>
          <p className="text-muted-foreground">
            Discover and install plugins to extend your Financbase experience
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse Plugins</TabsTrigger>
          <TabsTrigger value="installed">Installed ({installedPlugins.length})</TabsTrigger>
          <TabsTrigger value="my-plugins">My Plugins</TabsTrigger>
        </TabsList>

        {/* Browse Plugins */}
        <TabsContent value="browse" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search plugins..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center gap-2">
                      <category.icon className="h-4 w-4" />
                      {category.label}
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
                            <img 
                              src={installedPlugin.plugin.icon} 
                              alt={installedPlugin.plugin.name} 
                              className="w-8 h-8" 
                            />
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

        {/* My Plugins */}
        <TabsContent value="my-plugins" className="space-y-4">
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Plugin Development</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Create and publish your own plugins to the marketplace
                </p>
                <Button className="mt-4">
                  Create Plugin
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}