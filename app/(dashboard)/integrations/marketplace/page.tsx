"use client";

import { useState, useEffect } from "react";
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
}

// Sample plugins data - moved outside component to avoid dependency issues
const samplePlugins: Plugin[] = [
    {
      id: 1,
      name: "Stripe Payment Gateway",
      description: "Accept payments online with Stripe integration",
      category: "Payments",
      developer: "Stripe Inc.",
      price: "Free",
      rating: 4.9,
      downloads: 15420,
      status: "installed",
      version: "2.1.0",
      lastUpdated: "2024-10-15",
      compatibility: "v2.0+",
      features: ["Payment Processing", "Subscription Management", "Webhooks"],
      icon: CreditCard
    },
    {
      id: 2,
      name: "Google Analytics Integration",
      description: "Track website analytics with Google Analytics 4",
      category: "Analytics",
      developer: "Google LLC",
      price: "Free",
      rating: 4.8,
      downloads: 12850,
      status: "available",
      version: "1.8.2",
      lastUpdated: "2024-10-12",
      compatibility: "v2.0+",
      features: ["Real-time Analytics", "Custom Events", "E-commerce Tracking"],
      icon: BarChart3
    },
    {
      id: 3,
      name: "Mailchimp Email Marketing",
      description: "Send marketing emails and manage subscribers",
      category: "Marketing",
      developer: "Mailchimp",
      price: "$29/month",
      rating: 4.7,
      downloads: 9850,
      status: "installed",
      version: "3.2.1",
      lastUpdated: "2024-10-10",
      compatibility: "v2.0+",
      features: ["Email Campaigns", "Automation", "Segmentation"],
      icon: Mail
    },
    {
      id: 4,
      name: "Slack Notifications",
      description: "Send notifications to Slack channels",
      category: "Communication",
      developer: "Slack Technologies",
      price: "Free",
      rating: 4.6,
      downloads: 7650,
      status: "available",
      version: "1.5.0",
      lastUpdated: "2024-10-08",
      compatibility: "v2.0+",
      features: ["Real-time Notifications", "Custom Channels", "Rich Messages"],
      icon: MessageSquare
    },
    {
      id: 5,
      name: "AWS S3 Storage",
      description: "Store files securely in AWS S3 buckets",
      category: "Storage",
      developer: "Amazon Web Services",
      price: "$15/month",
      rating: 4.9,
      downloads: 11200,
      status: "installed",
      version: "2.0.3",
      lastUpdated: "2024-10-05",
      compatibility: "v2.0+",
      features: ["File Upload", "CDN Integration", "Backup"],
      icon: Database
    },
    {
      id: 6,
      name: "Zapier Automation",
      description: "Connect with 5000+ apps via Zapier",
      category: "Automation",
      developer: "Zapier Inc.",
      price: "$20/month",
      rating: 4.8,
      downloads: 8900,
      status: "available",
      version: "1.9.1",
      lastUpdated: "2024-10-03",
      compatibility: "v2.0+",
      features: ["Workflow Automation", "Multi-app Integration", "Triggers"],
      icon: Zap
    },
    {
      id: 7,
      name: "Calendly Scheduling",
      description: "Let customers book appointments online",
      category: "Scheduling",
      developer: "Calendly LLC",
      price: "Free",
      rating: 4.7,
      downloads: 6540,
      status: "available",
      version: "1.4.2",
      lastUpdated: "2024-10-01",
      compatibility: "v2.0+",
      features: ["Online Booking", "Calendar Sync", "Reminders"],
      icon: Calendar
    },
    {
      id: 8,
      name: "Shopify E-commerce",
      description: "Sell products online with Shopify integration",
      category: "E-commerce",
      developer: "Shopify Inc.",
      price: "$39/month",
      rating: 4.9,
      downloads: 18750,
      status: "installed",
      version: "3.1.0",
      lastUpdated: "2024-09-28",
      compatibility: "v2.0+",
      features: ["Product Management", "Order Processing", "Inventory Sync"],
      icon: ShoppingCart
    }
  ];

export default function PluginMarketplacePage() {
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

  // Load plugins on component mount
  useEffect(() => {
    const loadPlugins = async () => {
      setLoading(true);
      setError(null);
      try {
        // Simulate API call - in real app, this would fetch from your API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPlugins(samplePlugins);
        
        // Calculate stats
        const stats = {
          totalPlugins: samplePlugins.length,
          installedPlugins: samplePlugins.filter(p => p.status === 'installed').length,
          availablePlugins: samplePlugins.filter(p => p.status === 'available').length,
          totalDownloads: samplePlugins.reduce((sum, p) => sum + p.downloads, 0),
          averageRating: samplePlugins.reduce((sum, p) => sum + p.rating, 0) / samplePlugins.length
        };
        setMarketplaceStats(stats);
      } catch (err) {
        setError('Failed to load plugins. Please try again.');
        console.error('Error loading plugins:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPlugins();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle plugin installation
  const handleInstallPlugin = async (pluginId: number) => {
    setInstallingPlugins(prev => new Set(prev).add(pluginId));
    setError(null);
    
    try {
      // Simulate installation process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update plugin status
      setPlugins(prev => prev.map(plugin => 
        plugin.id === pluginId 
          ? { ...plugin, status: 'installed' as const }
          : plugin
      ));
      
      // Update stats
      setMarketplaceStats(prev => ({
        ...prev,
        installedPlugins: prev.installedPlugins + 1,
        availablePlugins: prev.availablePlugins - 1
      }));
    } catch (err) {
      setError(`Failed to install plugin. Please try again.`);
      console.error('Error installing plugin:', err);
      
      // Update plugin status to error
      setPlugins(prev => prev.map(plugin => 
        plugin.id === pluginId 
          ? { ...plugin, status: 'error' as const, errorMessage: 'Installation failed' }
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
      // Simulate uninstallation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update plugin status
      setPlugins(prev => prev.map(plugin => 
        plugin.id === pluginId 
          ? { ...plugin, status: 'available' as const }
          : plugin
      ));
      
      // Update stats
      setMarketplaceStats(prev => ({
        ...prev,
        installedPlugins: prev.installedPlugins - 1,
        availablePlugins: prev.availablePlugins + 1
      }));
    } catch (err) {
      setError(`Failed to uninstall plugin. Please try again.`);
      console.error('Error uninstalling plugin:', err);
    }
  };

  // Filter plugins based on search and filters
  const filteredPlugins = plugins.filter(plugin => {
    const matchesSearch = plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plugin.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plugin.developer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || plugin.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || plugin.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [
    { name: "All", count: 156, icon: Globe },
    { name: "Payments", count: 23, icon: CreditCard },
    { name: "Analytics", count: 18, icon: BarChart3 },
    { name: "Marketing", count: 31, icon: Mail },
    { name: "Communication", count: 15, icon: MessageSquare },
    { name: "Storage", count: 12, icon: Database },
    { name: "Automation", count: 28, icon: Zap },
    { name: "Scheduling", count: 9, icon: Calendar },
    { name: "E-commerce", count: 20, icon: ShoppingCart }
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

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
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
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Configure
                          </Button>
                        ) : (
                          <Button size="sm">
                            <DownloadIcon className="h-4 w-4 mr-2" />
                            Install
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