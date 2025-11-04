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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  Plug
} from 'lucide-react';

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

interface PluginCardProps {
  plugin: Plugin;
  isInstalled?: boolean;
  onInstall: (pluginId: number) => void;
  onUninstall: (pluginId: number) => void;
  onViewDetails: (plugin: Plugin) => void;
}

export function PluginCard({ 
  plugin, 
  isInstalled = false, 
  onInstall, 
  onUninstall, 
  onViewDetails 
}: PluginCardProps) {
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const queryClient = useQueryClient();

  const installMutation = useMutation({
    mutationFn: async (pluginId: number) => {
      const response = await fetch(`/api/marketplace/plugins/${pluginId}/install`, {
        method: 'POST',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['installedPlugins']);
      setShowInstallDialog(false);
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
      case 'productivity': return <Zap className="h-4 w-4" />;
      case 'reporting': return <BarChart3 className="h-4 w-4" />;
      case 'integration': return <Plug className="h-4 w-4" />;
      case 'automation': return <Code className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      default: return <Palette className="h-4 w-4" />;
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

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
              {plugin.icon ? (
                <img src={plugin.icon} alt={plugin.name} className="w-8 h-8" />
              ) : (
                <Plug className="h-6 w-6" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{plugin.name}</CardTitle>
              <p className="text-sm text-muted-foreground">by {plugin.author}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {plugin.isOfficial && (
              <Badge variant="secondary" className="text-xs">
                Official
              </Badge>
            )}
            <Badge className={cn("text-xs", getCategoryColor(plugin.category))}>
              {getCategoryIcon(plugin.category)}
              <span className="ml-1">{plugin.category}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            {plugin.shortDescription || plugin.description}
          </p>
          <div className="flex flex-wrap gap-1">
            {plugin.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {plugin.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{plugin.tags.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {renderStars(plugin.rating)}
              <span className="text-muted-foreground">({plugin.reviewCount})</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Download className="h-4 w-4" />
              <span>{plugin.downloadCount.toLocaleString()}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium">{formatPrice(plugin.price, plugin.currency)}</p>
            <p className="text-xs text-muted-foreground">v{plugin.version}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isInstalled ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => uninstallMutation.mutate(plugin.id)}
              disabled={uninstallMutation.isPending}
              className="flex-1"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {uninstallMutation.isPending ? 'Uninstalling...' : 'Installed'}
            </Button>
          ) : (
            <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Install
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Install {plugin.name}</DialogTitle>
                  <DialogDescription>
                    This plugin will be installed to your account and can be configured after installation.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Plugin Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Version:</span>
                        <span>{plugin.version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Author:</span>
                        <span>{plugin.author}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>License:</span>
                        <span>{plugin.license}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price:</span>
                        <span>{formatPrice(plugin.price, plugin.currency)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {plugin.features.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Features</h4>
                      <ul className="text-sm space-y-1">
                        {plugin.features.slice(0, 5).map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => installMutation.mutate(plugin.id)}
                      disabled={installMutation.isPending}
                      className="flex-1"
                    >
                      {installMutation.isPending ? 'Installing...' : 'Install Plugin'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowInstallDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(plugin)}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Updated {formatDistanceToNow(new Date(plugin.updatedAt), { addSuffix: true })}</span>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{plugin.installCount.toLocaleString()} installs</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
