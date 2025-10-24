"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Plus, 
  Settings, 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Trash2,
  Edit,
  Eye,
  Pause,
  Play
} from 'lucide-react';

interface AlertRule {
  id: number;
  name: string;
  description: string;
  metricName: string;
  condition: string;
  threshold: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: string[];
  isActive: boolean;
  cooldownPeriod: number;
  maxAlertsPerHour: number;
  createdAt: string;
  updatedAt: string;
}

interface AlertConfigurationProps {
  onViewAlerts: () => void;
}

export function AlertConfiguration({ onViewAlerts }: AlertConfigurationProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  const queryClient = useQueryClient();

  // Fetch alert rules
  const { data: alertRules = [], isLoading } = useQuery({
    queryKey: ['alertRules'],
    queryFn: async () => {
      const response = await fetch('/api/monitoring/alerts/rules');
      return response.json();
    },
  });

  // Create alert rule mutation
  const createRuleMutation = useMutation({
    mutationFn: async (ruleData: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await fetch('/api/monitoring/alerts/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ruleData),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['alertRules']);
      setShowCreateDialog(false);
    },
  });

  // Update alert rule mutation
  const updateRuleMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<AlertRule> }) => {
      const response = await fetch(`/api/monitoring/alerts/rules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['alertRules']);
      setEditingRule(null);
    },
  });

  // Delete alert rule mutation
  const deleteRuleMutation = useMutation({
    mutationFn: async (ruleId: number) => {
      const response = await fetch(`/api/monitoring/alerts/rules/${ruleId}`, {
        method: 'DELETE',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['alertRules']);
    },
  });

  // Toggle rule status mutation
  const toggleRuleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await fetch(`/api/monitoring/alerts/rules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['alertRules']);
    },
  });

  const filteredRules = alertRules.filter((rule: AlertRule) => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.metricName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = selectedSeverity === 'all' || rule.severity === selectedSeverity;
    return matchesSearch && matchesSeverity;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleCreateRule = (ruleData: any) => {
    createRuleMutation.mutate(ruleData);
  };

  const handleUpdateRule = (id: number, updates: Partial<AlertRule>) => {
    updateRuleMutation.mutate({ id, updates });
  };

  const handleDeleteRule = (id: number) => {
    if (confirm('Are you sure you want to delete this alert rule?')) {
      deleteRuleMutation.mutate(id);
    }
  };

  const handleToggleRule = (id: number, isActive: boolean) => {
    toggleRuleMutation.mutate({ id, isActive });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Alert Configuration</h2>
          <p className="text-muted-foreground">
            Manage alert rules and notification settings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onViewAlerts}>
            <Eye className="mr-2 h-4 w-4" />
            View Alerts
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Alert Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Alert Rule</DialogTitle>
                <DialogDescription>
                  Set up a new alert rule to monitor system metrics
                </DialogDescription>
              </DialogHeader>
              <AlertRuleForm
                onSubmit={handleCreateRule}
                onCancel={() => setShowCreateDialog(false)}
                isLoading={createRuleMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search alert rules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Alert Rules List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredRules.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No alert rules found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Create your first alert rule to get started
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredRules.map((rule: AlertRule) => (
            <Card key={rule.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">{rule.name}</h3>
                      <Badge className={cn("text-xs", getSeverityColor(rule.severity))}>
                        {rule.severity}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {rule.metricName}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {rule.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Condition: {rule.condition} {rule.threshold}</span>
                      <span>Channels: {rule.channels.join(', ')}</span>
                      <span>Cooldown: {rule.cooldownPeriod}s</span>
                      <span>Max/Hour: {rule.maxAlertsPerHour}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={rule.isActive}
                      onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                      disabled={toggleRuleMutation.isPending}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingRule(rule)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteRule(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Rule Dialog */}
      {editingRule && (
        <Dialog open={!!editingRule} onOpenChange={() => setEditingRule(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Alert Rule</DialogTitle>
              <DialogDescription>
                Update the alert rule configuration
              </DialogDescription>
            </DialogHeader>
            <AlertRuleForm
              rule={editingRule}
              onSubmit={(updates) => handleUpdateRule(editingRule.id, updates)}
              onCancel={() => setEditingRule(null)}
              isLoading={updateRuleMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Alert Rule Form Component
function AlertRuleForm({
  rule,
  onSubmit,
  onCancel,
  isLoading
}: {
  rule?: AlertRule;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: rule?.name || '',
    description: rule?.description || '',
    metricName: rule?.metricName || '',
    condition: rule?.condition || 'greater_than',
    threshold: rule?.threshold || '',
    severity: rule?.severity || 'medium',
    channels: rule?.channels || ['email'],
    cooldownPeriod: rule?.cooldownPeriod || 3600,
    maxAlertsPerHour: rule?.maxAlertsPerHour || 10,
    isActive: rule?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Rule Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="metricName">Metric Name</Label>
          <Input
            id="metricName"
            value={formData.metricName}
            onChange={(e) => setFormData({ ...formData, metricName: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="condition">Condition</Label>
          <Select
            value={formData.condition}
            onValueChange={(value) => setFormData({ ...formData, condition: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="greater_than">Greater Than</SelectItem>
              <SelectItem value="less_than">Less Than</SelectItem>
              <SelectItem value="equals">Equals</SelectItem>
              <SelectItem value="not_equals">Not Equals</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="threshold">Threshold</Label>
          <Input
            id="threshold"
            type="number"
            value={formData.threshold}
            onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="severity">Severity</Label>
          <Select
            value={formData.severity}
            onValueChange={(value) => setFormData({ ...formData, severity: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cooldownPeriod">Cooldown Period (seconds)</Label>
          <Input
            id="cooldownPeriod"
            type="number"
            value={formData.cooldownPeriod}
            onChange={(e) => setFormData({ ...formData, cooldownPeriod: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <Label htmlFor="maxAlertsPerHour">Max Alerts Per Hour</Label>
          <Input
            id="maxAlertsPerHour"
            type="number"
            value={formData.maxAlertsPerHour}
            onChange={(e) => setFormData({ ...formData, maxAlertsPerHour: parseInt(e.target.value) })}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Rule'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
