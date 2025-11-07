/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Image as ImageIcon,
  Upload,
  Download,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Crop,
  Filter,
  Sliders,
  Save,
  X,
  ZoomIn,
  ZoomOut,
  RefreshCw
} from 'lucide-react';
import { ImageUpload } from '@/components/core/ui/layout/image-upload';
import { toast } from 'sonner';
import { validateSafeUrl } from '@/lib/utils/security';

export default function ImageEditorPage() {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [zoom, setZoom] = useState(100);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imageUrl && canvasRef.current && imageRef.current) {
      applyFilters();
    }
  }, [imageUrl, rotation, flipHorizontal, flipVertical, brightness, contrast, saturation, zoom]);

  const handleImageUpload = (imageUrl: string | string[], analysis?: any) => {
    // For single image editor, extract first URL if array is passed
    const url = Array.isArray(imageUrl) ? imageUrl[0] : imageUrl;
    
    // Security: Validate image URL before setting
    const safeUrl = validateSafeUrl(url) || (url.startsWith('blob:') ? url : null);
    if (!safeUrl && !url.startsWith('blob:')) {
      toast.error('Invalid image URL');
      return;
    }
    setImageUrl(safeUrl || url);
    setEditedImageUrl(null);
    setRotation(0);
    setFlipHorizontal(false);
    setFlipVertical(false);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setZoom(100);
    toast.success('Image loaded successfully');
  };

  const applyFilters = () => {
    if (!imageUrl || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageRef.current;
    img.onload = () => {
      // Set canvas size
      const displayWidth = (img.width * zoom) / 100;
      const displayHeight = (img.height * zoom) / 100;
      canvas.width = displayWidth;
      canvas.height = displayHeight;

      // Save context
      ctx.save();

      // Apply transformations
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      // Apply filters
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

      // Draw image
      ctx.drawImage(img, 0, 0, displayWidth, displayHeight);

      // Restore context
      ctx.restore();

      // Update preview URL
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setEditedImageUrl(url);
        }
      });
    };

    img.src = imageUrl;
  };

  const handleRotate = (direction: 'left' | 'right') => {
    setRotation((prev) => prev + (direction === 'right' ? 90 : -90));
  };

  const handleFlip = (direction: 'horizontal' | 'vertical') => {
    if (direction === 'horizontal') {
      setFlipHorizontal((prev) => !prev);
    } else {
      setFlipVertical((prev) => !prev);
    }
  };

  const handleReset = () => {
    setRotation(0);
    setFlipHorizontal(false);
    setFlipVertical(false);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setZoom(100);
    toast.success('Filters reset');
  };

  const handleSave = () => {
    if (!editedImageUrl) {
      toast.error('No image to save');
      return;
    }

    const link = document.createElement('a');
    link.href = editedImageUrl;
    link.download = 'edited-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Image downloaded successfully');
  };

  const handleClear = () => {
    setImageUrl(null);
    setEditedImageUrl(null);
    setRotation(0);
    setFlipHorizontal(false);
    setFlipVertical(false);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setZoom(100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <ImageIcon className="h-8 w-8 text-blue-600" />
            Image Editor
          </h1>
          <p className="text-muted-foreground">
            Upload and edit images with advanced tools and filters
          </p>
        </div>
        <div className="flex items-center gap-2">
          {imageUrl && (
            <>
              <Button variant="outline" onClick={handleReset}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button variant="outline" onClick={handleSave}>
                <Download className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={handleClear}>
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Upload and Transform */}
        <div className="space-y-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Image
              </CardTitle>
              <CardDescription>
                Upload an image to start editing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload
                onImageUpdate={handleImageUpload}
                maxSize={10}
                acceptedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
                showPreview={false}
              />
            </CardContent>
          </Card>

          {/* Transform Controls */}
          {imageUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCw className="h-5 w-5" />
                  Transform
                </CardTitle>
                <CardDescription>
                  Rotate and flip your image
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleRotate('left')}
                    className="w-full"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Rotate Left
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleRotate('right')}
                    className="w-full"
                  >
                    <RotateCw className="h-4 w-4 mr-2" />
                    Rotate Right
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleFlip('horizontal')}
                    className="w-full"
                  >
                    <FlipHorizontal className="h-4 w-4 mr-2" />
                    Flip H
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleFlip('vertical')}
                    className="w-full"
                  >
                    <FlipVertical className="h-4 w-4 mr-2" />
                    Flip V
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Zoom: {zoom}%</Label>
                  <Input
                    type="range"
                    min="50"
                    max="200"
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filter Controls */}
          {imageUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
                <CardDescription>
                  Adjust brightness, contrast, and saturation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Brightness: {brightness}%</Label>
                  <Input
                    type="range"
                    min="0"
                    max="200"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contrast: {contrast}%</Label>
                  <Input
                    type="range"
                    min="0"
                    max="200"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Saturation: {saturation}%</Label>
                  <Input
                    type="range"
                    min="0"
                    max="200"
                    value={saturation}
                    onChange={(e) => setSaturation(Number(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Canvas Area */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                {imageUrl ? 'Edit your image in real-time' : 'Upload an image to start editing'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {imageUrl ? (
                <div className="space-y-4">
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
                    <div className="flex items-center justify-center min-h-[400px] p-4">
                      <canvas
                        ref={canvasRef}
                        className="max-w-full max-h-[600px] object-contain"
                        style={{ display: 'block' }}
                      />
                      {imageUrl && (() => {
                        // Security: imageUrl is validated in handleImageUpload before being set
                        const safeImageUrl = imageUrl.startsWith('blob:') ? imageUrl : validateSafeUrl(imageUrl) || imageUrl;
                        return (
                          <img
                            ref={imageRef}
                            src={safeImageUrl}
                            alt="Source"
                            className="hidden"
                          />
                        );
                      })()}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Rotation</p>
                      <p className="text-lg font-semibold">{rotation}°</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Zoom</p>
                      <p className="text-lg font-semibold">{zoom}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant="secondary" className="mt-1">
                        {editedImageUrl ? 'Ready' : 'Processing...'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <ImageIcon className="h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Image Loaded</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload an image to start editing with our powerful tools
                  </p>
                  <Badge variant="outline">Upload to begin</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features Info */}
      <Card>
        <CardHeader>
          <CardTitle>Editor Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <RotateCw className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Rotate & Flip</h4>
                <p className="text-xs text-muted-foreground">Transform images easily</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Sliders className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Color Filters</h4>
                <p className="text-xs text-muted-foreground">Brightness, contrast, saturation</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <ZoomIn className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Zoom Control</h4>
                <p className="text-xs text-muted-foreground">50% to 200% zoom range</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Download className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Export</h4>
                <p className="text-xs text-muted-foreground">Download edited images</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

