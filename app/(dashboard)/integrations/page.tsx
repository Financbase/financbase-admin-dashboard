"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IntegrationList } from '@/components/integrations/integration-list';
import { SyncStatus } from '@/components/integrations/sync-status';
import { 
  Zap, 
  Activity, 
  Settings, 
  BarChart3,
  Plus,
  ExternalLink
} from 'lucide-react';

interface Integration {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  isActive: boolean;
  isOfficial: boolean;
  version: string;
  features: string[];
}

interface Connection {
  id: number;
  name: string;
  status: 'active' | 'inactive' | 'error' | 'expired';
  isActive: boolean;
  externalName: string;
  lastSyncAt: string | null;
  syncCount: number;
  successCount: number;
  failureCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function IntegrationsPage() {
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [activeTab, setActiveTab] = useState('integrations');

  const handleConnectIntegration = (integration: Integration) => {
    // Redirect to OAuth flow
    const authUrl = `/api/integrations/oauth/${integration.slug}/authorize?integrationId=${integration.id}`;
    window.location.href = authUrl;
  };

  const handleViewConnection = (connection: Connection) => {
    setSelectedConnection(connection);
    setActiveTab('sync');
  };

  const handleSyncConnection = (connection: Connection) => {
    // Start sync process
    fetch(`/api/integrations/connections/${connection.id}/sync`, {
      method: 'POST',
    }).then(response => {
      if (response.ok) {
        // Refresh sync status
        console.log('Sync started for connection:', connection.id);
      }
    });
  };

  const handleStartSync = (connectionId: number) => {
    fetch(`/api/integrations/connections/${connectionId}/sync`, {
      method: 'POST',
    }).then(response => {
      if (response.ok) {
        console.log('Sync started for connection:', connectionId);
      }
    });
  };

  const handleStopSync = (syncId: string) => {
    fetch(`/api/integrations/syncs/${syncId}/cancel`, {
      method: 'POST',
    }).then(response => {
      if (response.ok) {
        console.log('Sync cancelled:', syncId);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integrations</h1>
          <p className="text-muted-foreground">
            Connect your favorite tools and automate your workflow
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('integrations')}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            <Plus className="mr-2 h-4 w-4" />
            Browse Integrations
          </button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="sync">Sync Status</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Integrations List */}
        <TabsContent value="integrations" className="space-y-4">
          <IntegrationList 
            onConnectIntegration={handleConnectIntegration}
            onViewConnection={handleViewConnection}
            onSyncConnection={handleSyncConnection}
          />
        </TabsContent>

        {/* Sync Status */}
        <TabsContent value="sync" className="space-y-4">
          {selectedConnection ? (
            <SyncStatus
              connectionId={selectedConnection.id}
              onStartSync={handleStartSync}
              onStopSync={handleStopSync}
            />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-medium mb-2">Select a Connection</h4>
                  <p className="text-muted-foreground">
                    Choose a connected integration to view sync status
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Integration Analytics
              </CardTitle>
              <CardDescription>
                Monitor integration performance and usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-medium mb-2">Analytics Coming Soon</h4>
                <p className="text-muted-foreground">
                  Integration analytics and performance metrics will be available here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Integration Settings
              </CardTitle>
              <CardDescription>
                Configure global integration settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Sync Settings</h4>
                  <p className="text-sm text-muted-foreground">
                    Configure automatic sync intervals and retry policies
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Error Handling</h4>
                  <p className="text-sm text-muted-foreground">
                    Set up error notifications and retry mechanisms
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Data Mapping</h4>
                  <p className="text-sm text-muted-foreground">
                    Configure default field mappings for new integrations
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Security</h4>
                  <p className="text-sm text-muted-foreground">
                    Manage integration permissions and access controls
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
