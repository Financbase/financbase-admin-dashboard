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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Bell,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  Filter,
  Settings,
  RefreshCw,
  Search,
  Clock,
  User,
  Mail,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { validateSafeUrl } from '@/lib/utils/security';

interface Alert {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  category: 'system' | 'user' | 'security' | 'payment' | 'other';
  actionUrl?: string;
}

export default function AlertsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock alerts data
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'error',
      title: 'Payment Failed',
      message: 'Payment processing failed for invoice #1234. Please review.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
      category: 'payment',
      actionUrl: '/invoices/1234'
    },
    {
      id: '2',
      type: 'warning',
      title: 'Low Storage Space',
      message: 'Storage usage is at 85%. Consider upgrading your plan.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false,
      category: 'system',
      actionUrl: '/settings/billing'
    },
    {
      id: '3',
      type: 'success',
      title: 'Backup Completed',
      message: 'Daily backup completed successfully at 2:00 AM.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      read: true,
      category: 'system'
    },
    {
      id: '4',
      type: 'info',
      title: 'New Feature Available',
      message: 'New analytics dashboard is now available. Check it out!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      read: true,
      category: 'system',
      actionUrl: '/analytics'
    },
    {
      id: '5',
      type: 'warning',
      title: 'Security Alert',
      message: 'Unusual login activity detected from a new location.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
      read: false,
      category: 'security',
      actionUrl: '/security-dashboard'
    },
    {
      id: '6',
      type: 'success',
      title: 'Invoice Paid',
      message: 'Invoice #1234 has been paid successfully.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
      read: true,
      category: 'payment',
      actionUrl: '/invoices/1234'
    }
  ]);

  const filteredAlerts = alerts.filter(alert => {
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'unread' && !alert.read) ||
      (activeTab === alert.category);
    
    const matchesSearch = searchQuery === '' ||
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  const unreadCount = alerts.filter(a => !a.read).length;
  const alertsByCategory = {
    system: alerts.filter(a => a.category === 'system').length,
    security: alerts.filter(a => a.category === 'security').length,
    payment: alerts.filter(a => a.category === 'payment').length,
    user: alerts.filter(a => a.category === 'user').length
  };

  const markAsRead = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    ));
  };

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, read: true })));
  };

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const getIcon = (type: Alert['type']) => {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'error':
        return AlertTriangle;
      case 'info':
        return Info;
      default:
        return Bell;
    }
  };

  const getColorClasses = (type: Alert['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Bell className="h-8 w-8 text-blue-600" />
            Alerts & Notifications
          </h1>
          <p className="text-muted-foreground">
            Manage system alerts, notifications, and important messages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Link href="/monitoring">
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              System Monitoring
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unread Alerts</p>
                <p className="text-2xl font-bold">{unreadCount}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <Bell className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Alerts</p>
                <p className="text-2xl font-bold">{alertsByCategory.system}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Security Alerts</p>
                <p className="text-2xl font-bold">{alertsByCategory.security}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payment Alerts</p>
                <p className="text-2xl font-bold">{alertsByCategory.payment}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">
              All Alerts
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </div>
        </div>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No alerts found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try adjusting your search query' : 'You\'re all caught up! No alerts to display.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredAlerts.map((alert) => {
                const Icon = getIcon(alert.type);
                const colorClasses = getColorClasses(alert.type);
                
                return (
                  <Card key={alert.id} className={`${!alert.read ? 'border-l-4 border-l-blue-500' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${colorClasses}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{alert.title}</h4>
                              {!alert.read && (
                                <Badge variant="default" className="text-xs">New</Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {alert.category}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTime(alert.timestamp)}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            {alert.message}
                          </p>
                          
                          <div className="flex items-center gap-2">
                            {alert.actionUrl && (() => {
                              // Security: validateSafeUrl() ensures URL is safe before use in Link href
                              const safeUrl = validateSafeUrl(alert.actionUrl);
                              // Security: safeUrl is validated - safe for use in Next.js Link
                              return safeUrl ? (
                                <Link href={safeUrl}>
                                  <Button size="sm" variant="outline">
                                    View Details
                                  </Button>
                                </Link>
                              ) : null;
                            })()}
                            {!alert.read && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markAsRead(alert.id)}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Mark Read
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteAlert(alert.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

