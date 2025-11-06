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
import { 
  FileText,
  BookOpen,
  Image as ImageIcon,
  Video,
  Link2,
  Settings,
  Plus,
  TrendingUp,
  Eye,
  Edit,
  Calendar,
  Tag,
  RefreshCw,
  ArrowRight,
  BarChart3,
  Users,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";

export default function ContentManagerPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - in real app, fetch from API
  const contentStats = {
    totalPosts: 24,
    publishedPosts: 18,
    draftPosts: 6,
    totalViews: 12450,
    totalCategories: 8,
    mediaFiles: 156
  };

  const recentPosts = [
    {
      id: 1,
      title: 'Getting Started with Financial Intelligence',
      status: 'published',
      views: 1240,
      publishedAt: '2024-01-15',
      category: 'Finance'
    },
    {
      id: 2,
      title: 'Advanced Analytics Dashboard Guide',
      status: 'published',
      views: 890,
      publishedAt: '2024-01-14',
      category: 'Tutorials'
    },
    {
      id: 3,
      title: 'New Features Coming Soon',
      status: 'draft',
      views: 0,
      publishedAt: null,
      category: 'Announcements'
    }
  ];

  const quickActions = [
    {
      title: 'Create Blog Post',
      description: 'Write and publish a new blog post',
      icon: Plus,
      href: '/content/blog/new',
      color: 'blue'
    },
    {
      title: 'Manage Media',
      description: 'Upload and organize images, videos',
      icon: ImageIcon,
      href: '/gallery',
      color: 'green'
    },
    {
      title: 'Edit Content',
      description: 'Manage existing blog posts and pages',
      icon: Edit,
      href: '/content/blog',
      color: 'purple'
    },
    {
      title: 'View Analytics',
      description: 'Track content performance and metrics',
      icon: BarChart3,
      href: '/content/blog',
      color: 'orange'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <FileText className="h-8 w-8 text-blue-600" />
            Content Manager
          </h1>
          <p className="text-muted-foreground">
            Manage all your content including blog posts, media, and pages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button onClick={() => router.push('/content/blog/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-bold">{contentStats.totalPosts}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {contentStats.publishedPosts} published
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{contentStats.totalViews.toLocaleString()}</p>
                <p className="text-sm text-blue-600 flex items-center mt-1">
                  <Eye className="h-3 w-3 mr-1" />
                  All time views
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Draft Posts</p>
                <p className="text-2xl font-bold">{contentStats.draftPosts}</p>
                <p className="text-sm text-orange-600 flex items-center mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending review
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Edit className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Media Files</p>
                <p className="text-2xl font-bold">{contentStats.mediaFiles}</p>
                <p className="text-sm text-purple-600 flex items-center mt-1">
                  <ImageIcon className="h-3 w-3 mr-1" />
                  Images & videos
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <ImageIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="blog">Blog</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common content management tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  const colorClasses = {
                    blue: 'bg-blue-100 text-blue-600',
                    green: 'bg-green-100 text-green-600',
                    purple: 'bg-purple-100 text-purple-600',
                    orange: 'bg-orange-100 text-orange-600'
                  };
                  
                  return (
                    <Link key={index} href={action.href}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                        <CardContent className="p-6">
                          <div className={`w-12 h-12 rounded-lg ${colorClasses[action.color as keyof typeof colorClasses]} flex items-center justify-center mb-4`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <h3 className="font-semibold mb-1">{action.title}</h3>
                          <p className="text-sm text-muted-foreground">{action.description}</p>
                          <ArrowRight className="h-4 w-4 text-muted-foreground mt-2" />
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Posts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Posts</CardTitle>
                  <CardDescription>
                    Latest blog posts and updates
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push('/content/blog')}>
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{post.title}</h4>
                        <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                          {post.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {post.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {post.views} views
                        </span>
                        {post.publishedAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(post.publishedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/content/blog/${post.id}/edit`)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blog Tab */}
        <TabsContent value="blog" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Blog Management</CardTitle>
                  <CardDescription>
                    Create, edit, and manage your blog posts
                  </CardDescription>
                </div>
                <Button onClick={() => router.push('/content/blog/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Post
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Use the blog management system to create and publish content. All features are available through the dedicated blog interface.
                </p>
                <div className="flex gap-2">
                  <Button onClick={() => router.push('/content/blog')}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Go to Blog Manager
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/content/blog/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Post
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Media Library</CardTitle>
                  <CardDescription>
                    Manage images, videos, and other media files
                  </CardDescription>
                </div>
                <Button onClick={() => router.push('/gallery')}>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Open Gallery
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/gallery')}>
                  <CardContent className="p-6 text-center">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 text-blue-600" />
                    <h3 className="font-semibold mb-1">Image Gallery</h3>
                    <p className="text-sm text-muted-foreground">Manage images</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/video')}>
                  <CardContent className="p-6 text-center">
                    <Video className="h-12 w-12 mx-auto mb-2 text-green-600" />
                    <h3 className="font-semibold mb-1">Video Library</h3>
                    <p className="text-sm text-muted-foreground">Upload videos</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/editor')}>
                  <CardContent className="p-6 text-center">
                    <Edit className="h-12 w-12 mx-auto mb-2 text-purple-600" />
                    <h3 className="font-semibold mb-1">Image Editor</h3>
                    <p className="text-sm text-muted-foreground">Edit images</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pages Tab */}
        <TabsContent value="pages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Static Pages</CardTitle>
              <CardDescription>
                Manage static pages and site content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-muted-foreground">
                    Create and manage static pages for your site
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    disabled
                    title="Page creation feature coming soon"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Page
                    <Badge variant="secondary" className="ml-2 text-xs">Soon</Badge>
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { name: 'About Us', url: '/about', status: 'published', views: 1240 },
                    { name: 'Contact', url: '/contact', status: 'published', views: 890 },
                    { name: 'Privacy Policy', url: '/privacy', status: 'published', views: 450 },
                    { name: 'Terms of Service', url: '/terms', status: 'published', views: 320 },
                  ].map((page) => (
                    <Card key={page.name} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{page.name}</h4>
                          <p className="text-sm text-muted-foreground">{page.url} • {page.views} views</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={page.status === 'published' ? 'default' : 'secondary'}>
                            {page.status}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

