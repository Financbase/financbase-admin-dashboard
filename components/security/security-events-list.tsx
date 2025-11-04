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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import {
  Search,
  Filter,
  AlertTriangle,
  Shield,
  Eye,
  Clock,
  User,
  FileText
} from 'lucide-react';

export function SecurityEventsList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');

  // Mock data - in real implementation, this would come from API
  const events = [
    {
      id: '1',
      type: 'login_attempt',
      description: 'Failed login attempt from unusual location',
      severity: 'high',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      user: 'john.doe@company.com',
      ip: '192.168.1.100',
      location: 'New York, US',
      isResolved: false
    },
    {
      id: '2',
      type: 'data_access',
      description: 'Large data export initiated',
      severity: 'medium',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      user: 'admin@company.com',
      ip: '10.0.0.5',
      location: 'San Francisco, US',
      isResolved: true
    },
    {
      id: '3',
      type: 'policy_violation',
      description: 'Attempt to access restricted financial data',
      severity: 'critical',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      user: 'suspicious@external.com',
      ip: '203.0.113.45',
      location: 'Unknown',
      isResolved: false
    }
  ];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.user.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = selectedSeverity === 'all' || event.severity === selectedSeverity;
    return matchesSearch && matchesSeverity;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Security Events</h2>
          <p className="text-muted-foreground">
            Monitor and manage security events and alerts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={selectedSeverity === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSeverity('all')}
              >
                All
              </Button>
              <Button
                variant={selectedSeverity === 'critical' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSeverity('critical')}
              >
                Critical
              </Button>
              <Button
                variant={selectedSeverity === 'high' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSeverity('high')}
              >
                High
              </Button>
              <Button
                variant={selectedSeverity === 'medium' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSeverity('medium')}
              >
                Medium
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-medium mb-2">No security events found</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedSeverity !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'No security events to display'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={cn("w-3 h-3 rounded-full mt-2", getSeverityColor(event.severity))} />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{event.description}</h3>
                        <Badge variant={getSeverityBadgeVariant(event.severity)}>
                          {event.severity.toUpperCase()}
                        </Badge>
                        <Badge variant={event.isResolved ? 'secondary' : 'destructive'}>
                          {event.isResolved ? 'Resolved' : 'Active'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{event.user}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          <span>{event.ip} • {event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{event.timestamp.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Event Type: {event.type.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    {!event.isResolved && (
                      <Button size="sm">
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary */}
      {filteredEvents.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Showing {filteredEvents.length} of {events.length} events
              </span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span>{events.filter(e => e.severity === 'critical').length} Critical</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  <span>{events.filter(e => e.severity === 'high').length} High</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  <span>{events.filter(e => e.severity === 'medium').length} Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>{events.filter(e => e.severity === 'low').length} Low</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
