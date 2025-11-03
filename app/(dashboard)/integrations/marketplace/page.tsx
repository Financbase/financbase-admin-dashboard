"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Plus, 
  Search, 
  Filter, 
  Star, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Eye,
  Download as DownloadIcon,
  Settings,
  Zap,
  Clock,
  Globe,
  Code,
  Database,
  Mail,
  CreditCard,
  BarChart3,
  Calendar,
  ShoppingCart,
  MessageSquare,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Trash2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Plugin {
  id: number;
  name: string;
  description: string;
  category: string;
  developer: string;
  price: string;
  rating: number;
  downloads: number;
  status: 'installed' | 'available' | 'updating' | 'error';
  version: string;
  lastUpdated: string;
  compatibility: string;
  features: string[];
  icon: React.ComponentType<{ className?: string }>;
  errorMessage?: string;
  installationProgress?: number;
}

interface MarketplaceStats {
  totalPlugins: number;
  installedPlugins: number;
  availablePlugins: number;
  totalDownloads: number;
  averageRating: number;
  categoryCounts?: Record<string, number>;
}


export default function PluginMarketplacePage() {
  const { isLoaded, isSignedIn } = useAuth();
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [installingPlugins, setInstallingPlugins] = useState<Set<number>>(new Set());

  const [marketplaceStats, setMarketplaceStats] = useState<MarketplaceStats>({
    totalPlugins: 0,
    installedPlugins: 0,
    availablePlugins: 0,
    totalDownloads: 0,
    averageRating: 0
  });

  // Load plugins and stats on component mount
  useEffect(() => {
    if (!isLoaded) {
      console.log('Clerk auth is still loading...');
      return; // Wait for Clerk to load
    }
    
    console.log('Auth state:', { isLoaded, isSignedIn });
    
    // Try to load data even if isSignedIn is false - Clerk might have cookies but state not updated
    // The API will return 401 if truly unauthorized, so we can let it through
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch marketplace stats - cookies are automatically included for same-origin requests
        const statsResponse = await fetch('/api/marketplace/stats', {
          credentials: 'include',
        });
        if (!statsResponse.ok) {
          if (statsResponse.status === 401) {
            const errorMsg = 'Please sign in to access the marketplace. If you are signed in, try refreshing the page.';
            setError(errorMsg);
            setLoading(false);
            return; // Stop here if unauthorized
          }
          throw new Error('Failed to load marketplace statistics');
        }
        const statsData = await statsResponse.json();
        if (statsData.success && statsData.stats) {
          setMarketplaceStats({
            totalPlugins: statsData.stats.totalPlugins,
            installedPlugins: statsData.stats.installedPlugins,
            availablePlugins: statsData.stats.availablePlugins,
            totalDownloads: statsData.stats.totalDownloads,
            averageRating: statsData.stats.averageRating,
            categoryCounts: statsData.stats.categoryCounts || {}
          });
        }

        // Fetch installed plugins to determine status
        const installedResponse = await fetch('/api/marketplace/plugins/installed', {
          credentials: 'include',
        });
        let installedPluginsData = [];
        if (installedResponse.ok) {
          try {
            installedPluginsData = await installedResponse.json();
          } catch (e) {
            console.warn('Failed to parse installed plugins response:', e);
          }
        } else if (installedResponse.status === 401) {
          console.warn('Unauthorized - cannot load installed plugins');
        }
        const installedPluginIds = new Set(
          Array.isArray(installedPluginsData) 
            ? installedPluginsData.map((ip: any) => ip.pluginId || ip.id)
            : []
        );

        // Fetch all marketplace plugins - increase limit to get all 156 plugins
        const pluginsResponse = await fetch('/api/marketplace/plugins?limit=200&offset=0', {
          credentials: 'include',
        });
        if (!pluginsResponse.ok) {
          if (pluginsResponse.status === 401) {
            // Don't throw - just log and set empty array
            console.error('Unauthorized - cannot load plugins');
            setPlugins([]);
            return; // Exit early but don't show error if stats loaded
          }
          throw new Error(`Failed to load plugins: ${pluginsResponse.status} ${pluginsResponse.statusText}`);
        }
        const pluginsData = await pluginsResponse.json();
        
        // Debug logging
        console.log('Plugins API Response:', {
          pluginsCount: pluginsData.plugins?.length || 0,
          pagination: pluginsData.pagination,
          totalPlugins: pluginsData.pagination?.total || 0
        });
        
        // Map database schema to UI format
        const mappedPlugins: Plugin[] = (pluginsData.plugins || []).map((plugin: any) => {
          const isInstalled = installedPluginIds.has(plugin.id);
          const features = Array.isArray(plugin.features) ? plugin.features : [];
          const tags = Array.isArray(plugin.tags) ? plugin.tags : [];
          
          // Map icon based on category or use a default
          const getIcon = () => {
            const category = (plugin.category || '').toLowerCase();
            if (category.includes('payment')) return CreditCard;
            if (category.includes('analytics')) return BarChart3;
            if (category.includes('marketing')) return Mail;
            if (category.includes('communication')) return MessageSquare;
            if (category.includes('storage')) return Database;
            if (category.includes('automation')) return Zap;
            if (category.includes('scheduling')) return Calendar;
            if (category.includes('e-commerce') || category.includes('ecommerce')) return ShoppingCart;
            return Code;
          };

          return {
            id: plugin.id,
            name: plugin.name || 'Unknown Plugin',
            description: plugin.description || plugin.shortDescription || '',
            category: plugin.category || 'Other',
            developer: plugin.author || 'Unknown',
            price: plugin.isFree ? 'Free' : `$${(plugin.price || 0) / 100}/month`,
            rating: Number(plugin.rating) || 0,
            downloads: plugin.downloadCount || plugin.installCount || 0,
            status: isInstalled ? 'installed' as const : 'available' as const,
            version: plugin.version || '1.0.0',
            lastUpdated: plugin.updatedAt ? new Date(plugin.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            compatibility: `v${plugin.version || '1.0.0'}+`,
            features: features.length > 0 ? features : ['Feature 1', 'Feature 2'],
            icon: getIcon()
          };
        });

        console.log('Mapped plugins:', {
          totalMapped: mappedPlugins.length,
          samplePlugin: mappedPlugins[0]
        });
        
        setPlugins(mappedPlugins);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load plugins. Please try again.';
        setError(errorMessage);
        console.error('Error loading plugins:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isLoaded, isSignedIn]); // Only depend on auth state, not functions

  // Handle plugin installation
  const handleInstallPlugin = async (pluginId: number) => {
    setInstallingPlugins(prev => new Set(prev).add(pluginId));
    setError(null);
    
    try {
      const response = await fetch(`/api/marketplace/plugins/${pluginId}/install`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Installation failed');
      }
      
      // Update plugin status
      setPlugins(prev => prev.map(plugin => 
        plugin.id === pluginId 
          ? { ...plugin, status: 'installed' as const }
          : plugin
      ));
      
      // Refresh stats
      const statsResponse = await fetch('/api/marketplace/stats', {
        credentials: 'include',
      });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success && statsData.stats) {
          setMarketplaceStats({
            totalPlugins: statsData.stats.totalPlugins,
            installedPlugins: statsData.stats.installedPlugins,
            availablePlugins: statsData.stats.availablePlugins,
            totalDownloads: statsData.stats.totalDownloads,
            averageRating: statsData.stats.averageRating,
            categoryCounts: statsData.stats.categoryCounts || {}
          });
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to install plugin. Please try again.';
      setError(errorMessage);
      console.error('Error installing plugin:', err);
      
      // Update plugin status to error
      setPlugins(prev => prev.map(plugin => 
        plugin.id === pluginId 
          ? { ...plugin, status: 'error' as const, errorMessage }
          : plugin
      ));
    } finally {
      setInstallingPlugins(prev => {
        const newSet = new Set(prev);
        newSet.delete(pluginId);
        return newSet;
      });
    }
  };

  // Handle plugin uninstallation
  const handleUninstallPlugin = async (pluginId: number) => {
    if (!confirm('Are you sure you want to uninstall this plugin?')) return;
    
    setError(null);
    try {
      // Get installation ID first
      const installedResponse = await fetch('/api/marketplace/plugins/installed', {
        credentials: 'include',
      });
      if (!installedResponse.ok) {
        if (installedResponse.status === 401) {
          throw new Error('Authentication required. Please sign in again.');
        }
        throw new Error('Failed to fetch installed plugins');
      }
      const installedPluginsData = await installedResponse.json();
      const installation = Array.isArray(installedPluginsData)
        ? installedPluginsData.find((ip: any) => (ip.pluginId || ip.id) === pluginId)
        : null;

      if (!installation) {
        throw new Error('Plugin installation not found');
      }

      const installationId = installation.id || installation.installationId;
      
      const response = await fetch(`/api/marketplace/plugins/${pluginId}/uninstall?installationId=${installationId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Uninstallation failed');
      }
      
      // Update plugin status
      setPlugins(prev => prev.map(plugin => 
        plugin.id === pluginId 
          ? { ...plugin, status: 'available' as const }
          : plugin
      ));
      
      // Refresh stats
      const statsResponse = await fetch('/api/marketplace/stats', {
        credentials: 'include',
      });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success && statsData.stats) {
          setMarketplaceStats({
            totalPlugins: statsData.stats.totalPlugins,
            installedPlugins: statsData.stats.installedPlugins,
            availablePlugins: statsData.stats.availablePlugins,
            totalDownloads: statsData.stats.totalDownloads,
            averageRating: statsData.stats.averageRating,
            categoryCounts: statsData.stats.categoryCounts || {}
          });
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to uninstall plugin. Please try again.';
      setError(errorMessage);
      console.error('Error uninstalling plugin:', err);
    }
  };

  // Filter plugins based on search and filters
  const filteredPlugins = plugins.filter(plugin => {
    const matchesSearch = searchTerm === '' || 
                         plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plugin.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plugin.developer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || plugin.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || plugin.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  // Debug: Log filtering results
  useEffect(() => {
    if (plugins.length > 0) {
      console.log('Plugin Filtering:', {
        totalPlugins: plugins.length,
        filteredPlugins: filteredPlugins.length,
        searchTerm,
        categoryFilter,
        statusFilter,
        sampleCategories: [...new Set(plugins.map(p => p.category))].slice(0, 5)
      });
    }
  }, [plugins, filteredPlugins, searchTerm, categoryFilter, statusFilter]);

  // Map database category names (lowercase) to display names and icons
  const categoryMapping: Array<{
    dbKeys: string[]; // Multiple possible keys to match
    displayName: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { dbKeys: ["payments", "payment"], displayName: "Payments", icon: CreditCard },
    { dbKeys: ["analytics", "analytic"], displayName: "Analytics", icon: BarChart3 },
    { dbKeys: ["marketing"], displayName: "Marketing", icon: Mail },
    { dbKeys: ["communication", "communications"], displayName: "Communication", icon: MessageSquare },
    { dbKeys: ["storage"], displayName: "Storage", icon: Database },
    { dbKeys: ["automation"], displayName: "Automation", icon: Zap },
    { dbKeys: ["scheduling", "schedule"], displayName: "Scheduling", icon: Calendar },
    { dbKeys: ["e-commerce", "ecommerce", "e_commerce"], displayName: "E-commerce", icon: ShoppingCart },
  ];

  // Helper function to get count for a category, trying multiple key variations
  const getCategoryCount = (dbKeys: string[], categoryCounts?: Record<string, number>): number => {
    if (!categoryCounts) return 0;
    
    for (const key of dbKeys) {
      // Try exact match (case-insensitive)
      const lowerKey = key.toLowerCase();
      if (categoryCounts[lowerKey] !== undefined) {
        return Number(categoryCounts[lowerKey]) || 0;
      }
      
      // Try case-insensitive match on all keys in categoryCounts
      const matchingKey = Object.keys(categoryCounts).find(
        k => k.toLowerCase() === lowerKey
      );
      if (matchingKey !== undefined) {
        return Number(categoryCounts[matchingKey]) || 0;
      }
    }
    
    return 0;
  };

  // Build categories array with dynamic counts
  const categories = [
    { 
      name: "All", 
      count: marketplaceStats.totalPlugins || 0, 
      icon: Globe 
    },
    ...categoryMapping.map(({ dbKeys, displayName, icon }) => {
      const count = getCategoryCount(dbKeys, marketplaceStats.categoryCounts);
      return {
        name: displayName,
        count,
        icon,
        dbKeys // Store for filtering
      };
    })
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "installed": return "bg-green-100 text-green-800";
      case "available": return "bg-blue-100 text-blue-800";
      case "updating": return "bg-yellow-100 text-yellow-800";
      case "error": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriceColor = (price: string) => {
    if (price === "Free") return "bg-green-100 text-green-800";
    return "bg-blue-100 text-blue-800";
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Plugin Marketplace</h1>
          <p className="text-gray-600 mt-2">
            Discover and install powerful integrations and plugins
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <DownloadIcon className="h-4 w-4 mr-2" />
            My Plugins
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Submit Plugin
          </Button>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500">
        <span>Dashboard</span>
        <span>/</span>
        <span>Integration & Development</span>
        <span>/</span>
        <span className="text-gray-900">Plugin Marketplace</span>
      </nav>

      {/* Error Alert - Only show if we have an actual error and no data loaded */}
      {error && plugins.length === 0 && marketplaceStats.totalPlugins === 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <div className="mt-2 text-sm">
              <p>Debug Info:</p>
              <ul className="list-disc list-inside">
                <li>Auth Loaded: {isLoaded ? 'Yes' : 'No'}</li>
                <li>Signed In: {isSignedIn ? 'Yes' : 'No'}</li>
                <li>Plugins Loaded: {plugins.length}</li>
                <li>Loading: {loading ? 'Yes' : 'No'}</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Warning Alert - Show if partially loaded but still have error */}
      {error && (plugins.length > 0 || marketplaceStats.totalPlugins > 0) && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Marketplace Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plugins</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketplaceStats.totalPlugins}</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12 this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Installed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketplaceStats.installedPlugins}</div>
            <p className="text-xs text-green-600">
              Active integrations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <DownloadIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketplaceStats.totalDownloads.toLocaleString()}</div>
            <p className="text-xs text-green-600">
              Across all plugins
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketplaceStats.averageRating.toFixed(1)}</div>
            <p className="text-xs text-green-600">
              Out of 5 stars
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Plugin Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Browse by Category</CardTitle>
          <CardDescription>
            Find plugins organized by functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <div key={category.name} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3 mb-2">
                  <category.icon className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">{category.name}</span>
                </div>
                <p className="text-sm text-gray-600">{category.count} plugins</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Plugin Marketplace */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Available Plugins</CardTitle>
              <CardDescription>
                Discover and install powerful integrations
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search plugins..."
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="payments">Payments</SelectItem>
                  <SelectItem value="analytics">Analytics</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="communication">Communication</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="installed">Installed</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Plugins</TabsTrigger>
              <TabsTrigger value="installed">Installed</TabsTrigger>
              <TabsTrigger value="featured">Featured</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading plugins...</span>
                </div>
              ) : filteredPlugins.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Code className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No plugins found</h3>
                  <p className="text-gray-600 mb-4">
                    {plugins.length === 0 
                      ? 'No plugins are available in the marketplace yet.'
                      : `No plugins match your current filters. Found ${plugins.length} total plugins.`}
                  </p>
                  {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' ? (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm('');
                        setCategoryFilter('all');
                        setStatusFilter('all');
                      }}
                    >
                      Clear Filters
                    </Button>
                  ) : null}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPlugins.map((plugin) => {
                    const isInstalling = installingPlugins.has(plugin.id);
                    const StatusIcon = plugin.status === 'installed' ? CheckCircle : 
                                     plugin.status === 'error' ? AlertTriangle : 
                                     plugin.status === 'updating' ? RefreshCw : Clock;
                    
                    return (
                      <div key={plugin.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                          <plugin.icon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{plugin.name}</h3>
                          <p className="text-sm text-gray-600">{plugin.developer}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <DownloadIcon className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            Configure
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Star className="h-4 w-4 mr-2" />
                            Rate Plugin
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{plugin.description}</p>

                    <div className="flex items-center gap-2 mb-4">
                      <Badge className={getStatusColor(plugin.status)}>
                        {plugin.status}
                      </Badge>
                      <Badge className={getPriceColor(plugin.price)}>
                        {plugin.price}
                      </Badge>
                      <Badge variant="outline">
                        {plugin.category}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-gray-600">Rating</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-semibold">{plugin.rating}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-600">Downloads</p>
                        <p className="font-semibold">{plugin.downloads.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Version</p>
                        <p className="font-semibold">{plugin.version}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Updated</p>
                        <p className="font-semibold">{plugin.lastUpdated}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <p className="text-sm font-medium">Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {plugin.features.map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Error Message */}
                    {plugin.errorMessage && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{plugin.errorMessage}</AlertDescription>
                      </Alert>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Compatible: {plugin.compatibility}
                        </Badge>
                        <Badge className={getStatusColor(plugin.status)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {plugin.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        {plugin.status === "installed" ? (
                          <>
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4 mr-2" />
                              Configure
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleUninstallPlugin(plugin.id)}
                              disabled={loading}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Uninstall
                            </Button>
                          </>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => handleInstallPlugin(plugin.id)}
                            disabled={isInstalling || loading}
                          >
                            {isInstalling ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Installing...
                              </>
                            ) : (
                              <>
                                <DownloadIcon className="h-4 w-4 mr-2" />
                                Install
                              </>
                            )}
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="installed" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading installed plugins...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlugins.filter(plugin => plugin.status === "installed").map((plugin) => (
                <div key={plugin.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                        <plugin.icon className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{plugin.name}</h3>
                        <p className="text-sm text-gray-600">{plugin.developer}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Installed
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{plugin.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-600">Version</p>
                      <p className="font-semibold">{plugin.version}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Last Updated</p>
                      <p className="font-semibold">{plugin.lastUpdated}</p>
                    </div>
                  </div>

                    <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {plugin.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {plugin.price}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUninstallPlugin(plugin.id)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Uninstall
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="featured" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading featured plugins...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlugins.filter(plugin => plugin.rating >= 4.8).map((plugin) => (
                <div key={plugin.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                          <plugin.icon className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{plugin.name}</h3>
                          <p className="text-sm text-gray-600">{plugin.developer}</p>
                        </div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        Featured
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{plugin.description}</p>

                    <div className="flex items-center gap-2 mb-4">
                      <Badge className={getStatusColor(plugin.status)}>
                        {plugin.status}
                      </Badge>
                      <Badge className={getPriceColor(plugin.price)}>
                        {plugin.price}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-semibold">{plugin.rating}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {plugin.downloads.toLocaleString()} downloads
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        {plugin.status === "installed" ? (
                          <>
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4 mr-2" />
                              Configure
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleUninstallPlugin(plugin.id)}
                              disabled={loading}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Uninstall
                            </Button>
                          </>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => handleInstallPlugin(plugin.id)}
                            disabled={installingPlugins.has(plugin.id) || loading}
                          >
                            {installingPlugins.has(plugin.id) ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Installing...
                              </>
                            ) : (
                              <>
                                <DownloadIcon className="h-4 w-4 mr-2" />
                                Install
                              </>
                            )}
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}