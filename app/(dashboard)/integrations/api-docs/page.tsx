"use client";

import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen,
  Code,
  Copy,
  Play,
  Download,
  ExternalLink,
  Key,
  Shield,
  Zap,
  Globe,
  Database,
  Users,
  DollarSign,
  BarChart3,
  Mail,
  Calendar,
  FileText,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useState } from "react";

export default function APIDocumentationPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const apiEndpoints = [
    {
      id: 'auth',
      name: 'Authentication',
      description: 'Manage user authentication and authorization',
      icon: Shield,
      color: 'text-blue-500',
      endpoints: [
        {
          method: 'POST',
          path: '/api/auth/login',
          description: 'Authenticate user with email and password',
          parameters: [
            { name: 'email', type: 'string', required: true, description: 'User email address' },
            { name: 'password', type: 'string', required: true, description: 'User password' }
          ],
          response: {
            status: 200,
            data: {
              token: 'string',
              user: 'object',
              expiresIn: 'number'
            }
          }
        },
        {
          method: 'POST',
          path: '/api/auth/register',
          description: 'Register a new user account',
          parameters: [
            { name: 'email', type: 'string', required: true, description: 'User email address' },
            { name: 'password', type: 'string', required: true, description: 'User password' },
            { name: 'name', type: 'string', required: true, description: 'User full name' }
          ],
          response: {
            status: 201,
            data: {
              user: 'object',
              message: 'string'
            }
          }
        }
      ]
    },
    {
      id: 'users',
      name: 'Users',
      description: 'Manage user accounts and profiles',
      icon: Users,
      color: 'text-green-500',
      endpoints: [
        {
          method: 'GET',
          path: '/api/users',
          description: 'Get list of users',
          parameters: [
            { name: 'page', type: 'number', required: false, description: 'Page number for pagination' },
            { name: 'limit', type: 'number', required: false, description: 'Number of users per page' },
            { name: 'search', type: 'string', required: false, description: 'Search term for filtering users' }
          ],
          response: {
            status: 200,
            data: {
              users: 'array',
              pagination: 'object'
            }
          }
        },
        {
          method: 'GET',
          path: '/api/users/{id}',
          description: 'Get user by ID',
          parameters: [
            { name: 'id', type: 'string', required: true, description: 'User ID' }
          ],
          response: {
            status: 200,
            data: {
              user: 'object'
            }
          }
        }
      ]
    },
    {
      id: 'campaigns',
      name: 'Campaigns',
      description: 'Manage marketing campaigns',
      icon: Zap,
      color: 'text-purple-500',
      endpoints: [
        {
          method: 'GET',
          path: '/api/campaigns',
          description: 'Get list of campaigns',
          parameters: [
            { name: 'status', type: 'string', required: false, description: 'Filter by campaign status' },
            { name: 'platform', type: 'string', required: false, description: 'Filter by platform' }
          ],
          response: {
            status: 200,
            data: {
              campaigns: 'array',
              pagination: 'object'
            }
          }
        },
        {
          method: 'POST',
          path: '/api/campaigns',
          description: 'Create a new campaign',
          parameters: [
            { name: 'name', type: 'string', required: true, description: 'Campaign name' },
            { name: 'platform', type: 'string', required: true, description: 'Advertising platform' },
            { name: 'budget', type: 'number', required: true, description: 'Campaign budget' }
          ],
          response: {
            status: 201,
            data: {
              campaign: 'object'
            }
          }
        }
      ]
    },
    {
      id: 'analytics',
      name: 'Analytics',
      description: 'Access analytics and reporting data',
      icon: BarChart3,
      color: 'text-orange-500',
      endpoints: [
        {
          method: 'GET',
          path: '/api/analytics/overview',
          description: 'Get analytics overview',
          parameters: [
            { name: 'startDate', type: 'string', required: false, description: 'Start date for analytics' },
            { name: 'endDate', type: 'string', required: false, description: 'End date for analytics' }
          ],
          response: {
            status: 200,
            data: {
              overview: 'object',
              metrics: 'object'
            }
          }
        }
      ]
    }
  ];

  const codeExamples = {
    javascript: `// JavaScript Example
const response = await fetch('/api/campaigns', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    name: 'Summer Sale Campaign',
    platform: 'Facebook',
    budget: 5000
  })
});

const data = await response.json();
console.log(data);`,
    
    python: `# Python Example
import requests

url = 'https://api.financbase.com/campaigns'
headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
}
data = {
    'name': 'Summer Sale Campaign',
    'platform': 'Facebook',
    'budget': 5000
}

response = requests.post(url, headers=headers, json=data)
print(response.json())`,
    
    curl: `# cURL Example
curl -X POST https://api.financbase.com/campaigns \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "name": "Summer Sale Campaign",
    "platform": "Facebook",
    "budget": 5000
  }'`
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(type);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'POST': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'PUT': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              API Documentation
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Interactive API explorer and documentation
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download SDK
            </Button>
            <Button>
              <Key className="h-4 w-4 mr-2" />
              Get API Key
            </Button>
          </div>
        </div>

        {/* Quick Start */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Quick Start
            </CardTitle>
            <CardDescription>
              Get started with our API in minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Key className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-medium mb-2">1. Get API Key</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Sign up and get your API key from the dashboard
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Code className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-medium mb-2">2. Make Request</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Use your API key to make authenticated requests
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-medium mb-2">3. Integrate</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Integrate our API into your application
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* API Endpoints */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>API Endpoints</CardTitle>
                <CardDescription>
                  Explore available API endpoints and their documentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiEndpoints.map((category) => (
                    <div key={category.id} className="border rounded-lg">
                      <div 
                        className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        onClick={() => setSelectedEndpoint(selectedEndpoint === category.id ? null : category.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <category.icon className={`h-5 w-5 ${category.color}`} />
                            <div>
                              <h3 className="font-medium">{category.name}</h3>
                              <p className="text-sm text-slate-600 dark:text-slate-300">
                                {category.description}
                              </p>
                            </div>
                          </div>
                          {selectedEndpoint === category.id ? (
                            <ChevronDown className="h-5 w-5 text-slate-400" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                      </div>
                      
                      {selectedEndpoint === category.id && (
                        <div className="border-t p-4 space-y-4">
                          {category.endpoints.map((endpoint, index) => (
                            <div key={index} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <Badge className={getMethodColor(endpoint.method)}>
                                  {endpoint.method}
                                </Badge>
                                <code className="text-sm font-mono bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">
                                  {endpoint.path}
                                </code>
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                                {endpoint.description}
                              </p>
                              
                              {endpoint.parameters && endpoint.parameters.length > 0 && (
                                <div className="mb-3">
                                  <h4 className="text-sm font-medium mb-2">Parameters:</h4>
                                  <div className="space-y-1">
                                    {endpoint.parameters.map((param, paramIndex) => (
                                      <div key={paramIndex} className="flex items-center gap-2 text-sm">
                                        <code className="font-mono bg-slate-200 dark:bg-slate-700 px-1 rounded">
                                          {param.name}
                                        </code>
                                        <Badge variant="outline" className="text-xs">
                                          {param.type}
                                        </Badge>
                                        {param.required && (
                                          <Badge variant="destructive" className="text-xs">
                                            Required
                                          </Badge>
                                        )}
                                        <span className="text-slate-600 dark:text-slate-300">
                                          {param.description}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              <div>
                                <h4 className="text-sm font-medium mb-2">Response:</h4>
                                <div className="bg-slate-900 text-slate-100 p-3 rounded text-sm font-mono">
                                  <div>Status: {endpoint.response.status}</div>
                                  <div>Data: {JSON.stringify(endpoint.response.data, null, 2)}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Code Examples */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Code Examples</CardTitle>
                <CardDescription>
                  Copy and paste ready-to-use code examples
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(codeExamples).map(([language, code]) => (
                    <div key={language} className="border rounded-lg">
                      <div className="flex items-center justify-between p-3 border-b">
                        <h4 className="font-medium capitalize">{language}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(code, language)}
                        >
                          {copiedCode === language ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="p-3">
                        <pre className="text-xs font-mono bg-slate-900 text-slate-100 p-3 rounded overflow-x-auto">
                          <code>{code}</code>
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Authentication */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Authentication</CardTitle>
                <CardDescription>
                  How to authenticate with our API
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">API Key Required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Bearer Token Authentication</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">HTTPS Only</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded">
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Include your API key in the Authorization header:
                  </p>
                  <code className="text-xs font-mono">
                    Authorization: Bearer YOUR_API_KEY
                  </code>
                </div>
              </CardContent>
            </Card>

            {/* Rate Limits */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Rate Limits</CardTitle>
                <CardDescription>
                  API usage limits and quotas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Free Tier</span>
                    <Badge variant="outline">1,000 requests/day</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pro Tier</span>
                    <Badge variant="outline">10,000 requests/day</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Enterprise</span>
                    <Badge variant="outline">Unlimited</Badge>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-xs text-yellow-800 dark:text-yellow-200">
                      Rate limit headers included in responses
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
