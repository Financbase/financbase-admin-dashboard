"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarketplaceSystem } from '@/components/marketplace/marketplace-system';
import { 
  Store, 
  Package, 
  Code, 
  Settings,
  TrendingUp,
  Star,
  Download,
  Users
} from 'lucide-react';

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState('browse');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Plugin Marketplace</h1>
          <p className="text-muted-foreground">
            Discover and install plugins to extend your Financbase experience
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available Plugins</p>
                <p className="text-2xl font-bold">150+</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Downloads</p>
                <p className="text-2xl font-bold">50K+</p>
              </div>
              <Download className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">10K+</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold">4.8/5</p>
              </div>
              <Star className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Featured Plugins */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Featured Plugins
          </CardTitle>
          <CardDescription>
            Popular and highly-rated plugins from our community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                  <Code className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium">Currency Converter</h4>
                  <p className="text-sm text-muted-foreground">by Financbase Team</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Automatically convert invoice amounts to different currencies using real-time exchange rates.
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm">4.9</span>
                </div>
                <span className="text-sm text-muted-foreground">Free</span>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium">Invoice PDF Customizer</h4>
                  <p className="text-sm text-muted-foreground">by Financbase Team</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Customize invoice PDF templates with your branding, colors, and layout preferences.
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm">4.8</span>
                </div>
                <span className="text-sm text-muted-foreground">Free</span>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white">
                  <Code className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium">Advanced Tax Calculator</h4>
                  <p className="text-sm text-muted-foreground">by Financbase Team</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Advanced tax calculation with multiple rates, exemptions, and region-specific rules.
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm">4.7</span>
                </div>
                <span className="text-sm text-muted-foreground">Free</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Marketplace Interface */}
      <MarketplaceSystem />
    </div>
  );
}
