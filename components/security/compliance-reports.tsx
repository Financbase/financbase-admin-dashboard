"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import {
  FileText,
  Download,
  CheckCircle,
  Clock,
  AlertTriangle,
  Shield,
  Award,
  Calendar,
  Target
} from 'lucide-react';

export function ComplianceReports() {
  const [selectedPeriod, setSelectedPeriod] = useState('current');

  // Mock compliance data - in real implementation, this would come from API
  const complianceStandards = [
    {
      id: 'soc2',
      name: 'SOC 2 Type II',
      description: 'Security, availability, and confidentiality controls',
      status: 'in-progress',
      progress: 75,
      targetDate: '2026-03-15',
      lastAudit: '2025-10-01',
      nextAudit: '2026-03-15',
      requirements: [
        { name: 'Security Controls', status: 'complete', percentage: 100 },
        { name: 'Access Management', status: 'complete', percentage: 100 },
        { name: 'Data Protection', status: 'complete', percentage: 100 },
        { name: 'Monitoring', status: 'in-progress', percentage: 60 },
        { name: 'Incident Response', status: 'pending', percentage: 0 }
      ]
    },
    {
      id: 'iso27001',
      name: 'ISO 27001',
      description: 'Information security management system',
      status: 'planned',
      progress: 25,
      targetDate: '2026-06-30',
      lastAudit: null,
      nextAudit: '2026-06-30',
      requirements: [
        { name: 'ISMS Framework', status: 'complete', percentage: 100 },
        { name: 'Risk Assessment', status: 'in-progress', percentage: 50 },
        { name: 'Security Policies', status: 'pending', percentage: 0 },
        { name: 'Training Program', status: 'pending', percentage: 0 },
        { name: 'Certification Audit', status: 'pending', percentage: 0 }
      ]
    },
    {
      id: 'gdpr',
      name: 'GDPR',
      description: 'General Data Protection Regulation compliance',
      status: 'compliant',
      progress: 100,
      targetDate: null,
      lastAudit: '2025-09-15',
      nextAudit: '2026-09-15',
      requirements: [
        { name: 'Data Processing', status: 'complete', percentage: 100 },
        { name: 'Privacy Rights', status: 'complete', percentage: 100 },
        { name: 'Data Security', status: 'complete', percentage: 100 },
        { name: 'Breach Notification', status: 'complete', percentage: 100 },
        { name: 'DPIA Process', status: 'complete', percentage: 100 }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600';
      case 'in-progress': return 'text-blue-600';
      case 'planned': return 'text-orange-600';
      case 'pending': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'compliant': return 'default';
      case 'in-progress': return 'secondary';
      case 'planned': return 'outline';
      case 'pending': return 'outline';
      default: return 'outline';
    }
  };

  const getRequirementStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'text-green-600';
      case 'in-progress': return 'text-blue-600';
      case 'pending': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Compliance Reports</h2>
          <p className="text-muted-foreground">
            Track compliance status and generate audit reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
          <Button size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Standards</p>
                <p className="text-2xl font-bold">{complianceStandards.length}</p>
              </div>
              <Award className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compliant</p>
                <p className="text-2xl font-bold">
                  {complianceStandards.filter(s => s.status === 'compliant').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">
                  {complianceStandards.filter(s => s.status === 'in-progress').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Standards */}
      <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod}>
        <TabsList>
          <TabsTrigger value="current">Current Status</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          <div className="grid gap-6">
            {complianceStandards.map((standard) => (
              <Card key={standard.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{standard.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {standard.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={getStatusBadgeVariant(standard.status)}
                        className={getStatusColor(standard.status)}
                      >
                        {standard.status.replace('-', ' ').toUpperCase()}
                      </Badge>
                      <div className="text-sm text-muted-foreground mt-1">
                        {standard.progress}% Complete
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{standard.progress}%</span>
                    </div>
                    <Progress value={standard.progress} className="h-2" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Key Requirements</h4>
                        <div className="space-y-2">
                          {standard.requirements.map((req, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span className={cn(
                                "flex items-center gap-2",
                                getRequirementStatusColor(req.status)
                              )}>
                                {req.status === 'complete' && <CheckCircle className="h-3 w-3" />}
                                {req.status === 'in-progress' && <Clock className="h-3 w-3" />}
                                {req.status === 'pending' && <Target className="h-3 w-3" />}
                                {req.name}
                              </span>
                              <span className="text-muted-foreground">{req.percentage}%</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Timeline</h4>
                        <div className="space-y-2 text-sm">
                          {standard.lastAudit && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>Last Audit: {new Date(standard.lastAudit).toLocaleDateString()}</span>
                            </div>
                          )}
                          {standard.nextAudit && (
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-muted-foreground" />
                              <span>Next Audit: {new Date(standard.nextAudit).toLocaleDateString()}</span>
                            </div>
                          )}
                          {standard.targetDate && (
                            <div className="flex items-center gap-2">
                              <Award className="h-4 w-4 text-muted-foreground" />
                              <span>Target: {new Date(standard.targetDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="roadmap">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Roadmap</CardTitle>
              <p className="text-muted-foreground">
                Planned compliance initiatives and certification timeline
              </p>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Detailed roadmap and timeline will be available once compliance planning is complete.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Generated Reports</CardTitle>
              <p className="text-muted-foreground">
                Download compliance reports and audit documentation
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">GDPR Compliance Report</h3>
                      <p className="text-sm text-muted-foreground">Generated October 15, 2025</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>Current</Badge>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">Security Assessment Report</h3>
                      <p className="text-sm text-muted-foreground">Generated October 10, 2025</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Draft</Badge>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
