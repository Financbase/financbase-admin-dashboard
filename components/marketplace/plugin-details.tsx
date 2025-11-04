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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { 
  Download, 
  Star, 
  Users, 
  ExternalLink, 
  Settings,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap,
  Shield,
  Code,
  Palette,
  BarChart3,
  Plug,
  Heart,
  Share2,
  Flag,
  MessageSquare,
  Image,
  FileText,
  Code2,
  GitBranch
} from 'lucide-react';

interface Plugin {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  version: string;
  author: string;
  authorEmail: string;
  authorWebsite: string;
  category: string;
  tags: string[];
  icon: string;
  screenshots: string[];
  features: string[];
  requirements: Record<string, any>;
  compatibility: Record<string, any>;
  isFree: boolean;
  price?: number;
  currency: string;
  license: string;
  permissions: string[];
  downloadCount: number;
  installCount: number;
  rating: number;
  reviewCount: number;
  isOfficial: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Review {
  id: number;
  rating: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  isVerified: boolean;
  isHelpful: number;
}

interface PluginDetailsProps {
  plugin: Plugin;
  isInstalled?: boolean;
  onInstall: (pluginId: number) => void;
  onUninstall: (pluginId: number) => void;
  onBack: () => void;
}

export function PluginDetails({ 
  plugin, 
  isInstalled = false, 
  onInstall, 
  onUninstall, 
  onBack 
}: PluginDetailsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showScreenshot, setShowScreenshot] = useState(0);
  
  const queryClient = useQueryClient();

  // Fetch plugin reviews
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['pluginReviews', plugin.id],
    queryFn: async () => {
      const response = await fetch(`/api/marketplace/plugins/${plugin.id}/reviews`);
      return response.json();
    },
  });

  const installMutation = useMutation({
    mutationFn: async (pluginId: number) => {
      const response = await fetch(`/api/marketplace/plugins/${pluginId}/install`, {
        method: 'POST',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['installedPlugins']);
    },
  });

  const uninstallMutation = useMutation({
    mutationFn: async (pluginId: number) => {
      const response = await fetch(`/api/marketplace/plugins/${pluginId}/uninstall`, {
        method: 'DELETE',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['installedPlugins']);
    },
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'productivity': return <Zap className="h-5 w-5" />;
      case 'reporting': return <BarChart3 className="h-5 w-5" />;
      case 'integration': return <Plug className="h-5 w-5" />;
      case 'automation': return <Code className="h-5 w-5" />;
      case 'security': return <Shield className="h-5 w-5" />;
      default: return <Palette className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'productivity': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'reporting': return 'bg-green-100 text-green-800 border-green-200';
      case 'integration': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'automation': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'security': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4",
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        )}
      />
    ));
  };

  const formatPrice = (price?: number, currency: string = 'USD') => {
    if (!price) return 'Free';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price / 100);
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum: number, review: Review) => sum + review.rating, 0) / reviews.length 
    : plugin.rating;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          ← Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{plugin.name}</h1>
          <p className="text-muted-foreground">by {plugin.author}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Heart className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Flag className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Plugin Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Screenshots */}
          {plugin.screenshots.length > 0 && (
            <Card>
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={plugin.screenshots[showScreenshot]}
                    alt={`${plugin.name} screenshot`}
                    className="w-full h-64 object-cover rounded-t-lg"
                  />
                  {plugin.screenshots.length > 1 && (
                    <div className="absolute bottom-4 left-4 flex gap-2">
                      {plugin.screenshots.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setShowScreenshot(index)}
                          className={cn(
                            "w-3 h-3 rounded-full",
                            index === showScreenshot ? "bg-white" : "bg-white/50"
                          )}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{plugin.description}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plugin.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>What's Included</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plugin.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {Object.keys(plugin.requirements).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(plugin.requirements).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="font-medium">{key}:</span>
                          <span className="text-muted-foreground">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Reviews ({plugin.reviewCount})</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {renderStars(Math.round(averageRating))}
                    <span className="text-sm text-muted-foreground">
                      {averageRating.toFixed(1)} average
                    </span>
                  </div>
                </div>
              </div>

              {reviewsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : reviews.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No reviews yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Be the first to review this plugin
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review: Review) => (
                    <Card key={review.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium">{review.title}</p>
                            <p className="text-sm text-muted-foreground">by {review.author}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {renderStars(review.rating)}
                            </div>
                            {review.isVerified && (
                              <Badge variant="secondary" className="text-xs">
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{review.content}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}</span>
                          <div className="flex items-center gap-2">
                            <span>{review.isHelpful} helpful</span>
                            <Button variant="ghost" size="sm">
                              Helpful
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Plugin Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">Version</p>
                      <p className="text-muted-foreground">{plugin.version}</p>
                    </div>
                    <div>
                      <p className="font-medium">License</p>
                      <p className="text-muted-foreground">{plugin.license}</p>
                    </div>
                    <div>
                      <p className="font-medium">Author</p>
                      <p className="text-muted-foreground">{plugin.author}</p>
                    </div>
                    <div>
                      <p className="font-medium">Category</p>
                      <p className="text-muted-foreground">{plugin.category}</p>
                    </div>
                    <div>
                      <p className="font-medium">Last Updated</p>
                      <p className="text-muted-foreground">
                        {formatDistanceToNow(new Date(plugin.updatedAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Downloads</p>
                      <p className="text-muted-foreground">{plugin.downloadCount.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {plugin.permissions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Permissions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {plugin.permissions.map((permission, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-500" />
                          <span>{permission}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Install Card */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                  {plugin.icon ? (
                    <img src={plugin.icon} alt={plugin.name} className="w-12 h-12" />
                  ) : (
                    <Plug className="h-8 w-8" />
                  )}
                </div>
                
                <div>
                  <h3 className="font-medium">{plugin.name}</h3>
                  <p className="text-sm text-muted-foreground">v{plugin.version}</p>
                </div>

                <div className="flex items-center justify-center gap-1">
                  {renderStars(Math.round(averageRating))}
                  <span className="text-sm text-muted-foreground ml-2">
                    ({plugin.reviewCount} reviews)
                  </span>
                </div>

                <div className="text-2xl font-bold">
                  {formatPrice(plugin.price, plugin.currency)}
                </div>

                {isInstalled ? (
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => uninstallMutation.mutate(plugin.id)}
                      disabled={uninstallMutation.isPending}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {uninstallMutation.isPending ? 'Uninstalling...' : 'Installed'}
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      Configure
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => installMutation.mutate(plugin.id)}
                    disabled={installMutation.isPending}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {installMutation.isPending ? 'Installing...' : 'Install Plugin'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Downloads</span>
                  <span className="font-medium">{plugin.downloadCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Installs</span>
                  <span className="font-medium">{plugin.installCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Rating</span>
                  <span className="font-medium">{averageRating.toFixed(1)}/5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Reviews</span>
                  <span className="font-medium">{plugin.reviewCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {plugin.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
