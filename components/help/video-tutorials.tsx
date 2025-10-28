"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { 
  Play, 
  Clock, 
  ThumbsUp, 
  Share2, 
  Bookmark,
  Filter,
  Grid,
  List,
  TrendingUp,
  Star,
  Users,
  ChevronRight
} from 'lucide-react';

interface VideoTutorialsProps {
  onViewVideo: (video: any) => void;
}

export function VideoTutorials({ onViewVideo }: VideoTutorialsProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch video tutorials
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['videoTutorials', selectedCategory, selectedDifficulty],
    queryFn: async () => {
      const params = new URLSearchParams({
        category: selectedCategory,
        difficulty: selectedDifficulty,
      });
      const response = await fetch(`/api/help/videos?${params}`);
      return response.json();
    },
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['helpCategories'],
    queryFn: async () => {
      const response = await fetch('/api/help/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      // Ensure we return an array even if the API returns an error object
      return Array.isArray(data) ? data : [];
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const filteredVideos = videos.filter((video: any) => {
    const matchesCategory = selectedCategory === 'all' || video.category?.slug === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || video.difficulty === selectedDifficulty;
    return matchesCategory && matchesDifficulty;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Video Tutorials</h2>
          <p className="text-muted-foreground">
            Learn how to use Financbase with our video guides
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Array.isArray(categories) && categories.map((category: any) => (
              <SelectItem key={category.id} value={category.slug}>
                {category.name || 'Unnamed Category'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Video Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredVideos.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No video tutorials found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your filters
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className={cn(
          "grid gap-4",
          viewMode === 'grid' 
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
            : "grid-cols-1"
        )}>
          {filteredVideos.map((video: any) => (
            <Card 
              key={video.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => onViewVideo(video)}
            >
              <CardContent className="p-0">
                {/* Video Thumbnail */}
                <div className="relative">
                  <img
                    src={video.thumbnailUrl || '/placeholder-video.jpg'}
                    alt={video.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="h-6 w-6 text-black ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(video.duration)}
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-medium line-clamp-2">{video.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {video.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={cn("text-xs", getDifficultyColor(video.difficulty))}>
                        {video.difficulty}
                      </Badge>
                      {video.category && (
                        <Badge variant="outline" className="text-xs">
                          {video.category.name}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>{video.viewCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        <span>{video.likeCount}</span>
                      </div>
                    </div>
                  </div>

                  {viewMode === 'list' && (
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDuration(video.duration)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{video.viewCount} views</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          <span>{video.likeCount} likes</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Bookmark className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Featured Videos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="mr-2 h-5 w-5" />
            Featured Tutorials
          </CardTitle>
          <CardDescription>
            Most popular and highly-rated video tutorials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos
              .filter((video: any) => video.featured)
              .slice(0, 4)
              .map((video: any) => (
                <div 
                  key={video.id}
                  className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onViewVideo(video)}
                >
                  <div className="relative">
                    <img
                      src={video.thumbnailUrl || '/placeholder-video.jpg'}
                      alt={video.title}
                      className="w-20 h-12 object-cover rounded"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Play className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium line-clamp-1">{video.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {video.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={cn("text-xs", getDifficultyColor(video.difficulty))}>
                        {video.difficulty}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDuration(video.duration)}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
