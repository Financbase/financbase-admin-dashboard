/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  X, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  Package,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

interface UploadedFile {
  url: string;
  name?: string;
  size?: number;
}

export function PluginSubmissionForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pluginPackage, setPluginPackage] = useState<UploadedFile | null>(null);
  const [icon, setIcon] = useState<UploadedFile | null>(null);
  const [screenshots, setScreenshots] = useState<UploadedFile[]>([]);

  // Upload functions
  const uploadPlugin = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/uploadthing?endpoint=pluginPackage", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      if (result?.url) {
        setPluginPackage({
          url: result.url,
          name: file.name,
          size: file.size,
        });
        toast.success("Plugin package uploaded successfully");
      } else {
        throw new Error("No URL returned");
      }
    } catch (error) {
      toast.error(`Failed to upload plugin package: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const uploadIcon = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/uploadthing?endpoint=pluginIcon", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      if (result?.url) {
        setIcon({ url: result.url });
        toast.success("Icon uploaded successfully");
      } else {
        throw new Error("No URL returned");
      }
    } catch (error) {
      toast.error(`Failed to upload icon: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const uploadScreenshots = async (files: File[]) => {
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/uploadthing?endpoint=pluginScreenshots", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const result = await response.json();
        if (result?.url) {
          return { url: result.url };
        } else {
          throw new Error("No URL returned");
        }
      });

      const results = await Promise.all(uploadPromises);
      setScreenshots(prev => [...prev, ...results]);
      toast.success(`${results.length} screenshot(s) uploaded successfully`);
    } catch (error) {
      toast.error(`Failed to upload screenshots: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    shortDescription: "",
    version: "1.0.0",
    author: "",
    authorEmail: "",
    authorWebsite: "",
    category: "",
    tags: "",
    features: "",
    entryPoint: "index.js",
    dependencies: "",
    permissions: "",
    minPlatformVersion: "",
    isFree: true,
    price: "",
    currency: "USD",
    license: "Proprietary",
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!pluginPackage?.url) {
      setError("Please upload a plugin package file");
      setLoading(false);
      return;
    }

    try {
      // Parse arrays from comma-separated strings
      const tagsArray = formData.tags
        .split(",")
        .map(t => t.trim())
        .filter(t => t.length > 0);
      
      const featuresArray = formData.features
        .split("\n")
        .map(f => f.trim())
        .filter(f => f.length > 0);

      let dependenciesArray: any[] = [];
      try {
        dependenciesArray = formData.dependencies 
          ? JSON.parse(formData.dependencies) 
          : [];
      } catch {
        // If not JSON, treat as comma-separated
        dependenciesArray = formData.dependencies
          .split(",")
          .map(d => d.trim())
          .filter(d => d.length > 0)
          .map(d => ({ name: d }));
      }

      let permissionsArray: string[] = [];
      try {
        permissionsArray = formData.permissions 
          ? JSON.parse(formData.permissions) 
          : [];
      } catch {
        // If not JSON, treat as comma-separated
        permissionsArray = formData.permissions
          .split(",")
          .map(p => p.trim())
          .filter(p => p.length > 0);
      }

      const response = await fetch("/api/marketplace/plugins/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          pluginFile: pluginPackage.url,
          icon: icon?.url || null,
          screenshots: screenshots.map(s => s.url),
          tags: tagsArray,
          features: featuresArray,
          dependencies: dependenciesArray,
          permissions: permissionsArray,
          requirements: {},
          compatibility: {},
          manifest: {},
          price: formData.isFree ? null : parseFloat(formData.price) || 0,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit plugin");
      }

      toast.success("Plugin submitted successfully! It will be reviewed by an administrator.");
      router.push("/integrations/marketplace");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit plugin";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Essential details about your plugin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Plugin Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="My Awesome Plugin"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe what your plugin does..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">Short Description</Label>
            <Input
              id="shortDescription"
              value={formData.shortDescription}
              onChange={(e) => handleInputChange("shortDescription", e.target.value)}
              placeholder="Brief one-liner (optional)"
              maxLength={150}
            />
            <p className="text-xs text-gray-500">
              {formData.shortDescription.length}/150 characters
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="version">Version *</Label>
              <Input
                id="version"
                value={formData.version}
                onChange={(e) => handleInputChange("version", e.target.value)}
                placeholder="1.0.0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payments">Payments</SelectItem>
                  <SelectItem value="analytics">Analytics</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="communication">Communication</SelectItem>
                  <SelectItem value="storage">Storage</SelectItem>
                  <SelectItem value="automation">Automation</SelectItem>
                  <SelectItem value="scheduling">Scheduling</SelectItem>
                  <SelectItem value="e-commerce">E-commerce</SelectItem>
                  <SelectItem value="ecommerce">E-commerce (alt)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => handleInputChange("tags", e.target.value)}
              placeholder="plugin, automation, workflow (comma-separated)"
            />
            <p className="text-xs text-gray-500">Separate tags with commas</p>
          </div>
        </CardContent>
      </Card>

      {/* Author Information */}
      <Card>
        <CardHeader>
          <CardTitle>Author Information</CardTitle>
          <CardDescription>Your contact and website details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="author">Author Name *</Label>
            <Input
              id="author"
              value={formData.author}
              onChange={(e) => handleInputChange("author", e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="authorEmail">Email</Label>
              <Input
                id="authorEmail"
                type="email"
                value={formData.authorEmail}
                onChange={(e) => handleInputChange("authorEmail", e.target.value)}
                placeholder="author@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="authorWebsite">Website/Repository</Label>
              <Input
                id="authorWebsite"
                value={formData.authorWebsite}
                onChange={(e) => handleInputChange("authorWebsite", e.target.value)}
                placeholder="https://github.com/author/plugin"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plugin Files */}
      <Card>
        <CardHeader>
          <CardTitle>Plugin Files</CardTitle>
          <CardDescription>Upload your plugin package and assets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Plugin Package * (ZIP/TAR, max 10MB)</Label>
            {pluginPackage ? (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="flex-1 text-sm">{pluginPackage.name || "Package uploaded"}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setPluginPackage(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Upload your plugin package (ZIP or TAR file)
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = ".zip,.tar,.gz";
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) uploadPlugin(file);
                    };
                    input.click();
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Package
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Plugin Icon (optional, max 2MB)</Label>
            {icon ? (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded">
                <ImageIcon className="h-5 w-5 text-green-600" />
                <span className="flex-1 text-sm">Icon uploaded</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIcon(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) uploadIcon(file);
                  };
                  input.click();
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Icon
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label>Screenshots (optional, multiple, max 4MB each)</Label>
            {screenshots.length > 0 && (
              <div className="space-y-2">
                {screenshots.map((screenshot, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 border rounded">
                    <ImageIcon className="h-4 w-4 text-gray-600" />
                    <span className="flex-1 text-sm">Screenshot {idx + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setScreenshots(prev => prev.filter((_, i) => i !== idx))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.multiple = true;
                input.onchange = (e) => {
                  const files = Array.from((e.target as HTMLInputElement).files || []);
                  if (files.length > 0) uploadScreenshots(files);
                };
                input.click();
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Add Screenshots
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Details</CardTitle>
          <CardDescription>Plugin configuration and requirements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="entryPoint">Entry Point *</Label>
            <Input
              id="entryPoint"
              value={formData.entryPoint}
              onChange={(e) => handleInputChange("entryPoint", e.target.value)}
              placeholder="index.js"
              required
            />
            <p className="text-xs text-gray-500">Main plugin file path</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minPlatformVersion">Minimum Platform Version</Label>
              <Input
                id="minPlatformVersion"
                value={formData.minPlatformVersion}
                onChange={(e) => handleInputChange("minPlatformVersion", e.target.value)}
                placeholder="1.0.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="license">License</Label>
              <Select
                value={formData.license}
                onValueChange={(value) => handleInputChange("license", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Proprietary">Proprietary</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="features">Features</Label>
            <Textarea
              id="features"
              value={formData.features}
              onChange={(e) => handleInputChange("features", e.target.value)}
              placeholder="One feature per line"
              rows={4}
            />
            <p className="text-xs text-gray-500">Enter one feature per line</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dependencies">Dependencies</Label>
            <Textarea
              id="dependencies"
              value={formData.dependencies}
              onChange={(e) => handleInputChange("dependencies", e.target.value)}
              placeholder='JSON array or comma-separated: [{"name": "package-name", "version": "1.0.0"}]'
              rows={3}
            />
            <p className="text-xs text-gray-500">JSON array or comma-separated list</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="permissions">Permissions</Label>
            <Textarea
              id="permissions"
              value={formData.permissions}
              onChange={(e) => handleInputChange("permissions", e.target.value)}
              placeholder='JSON array or comma-separated: ["read", "write"]'
              rows={3}
            />
            <p className="text-xs text-gray-500">Required permissions for the plugin</p>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
          <CardDescription>Set your plugin's pricing model</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isFree"
              checked={formData.isFree}
              onChange={(e) => handleInputChange("isFree", e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="isFree" className="cursor-pointer">
              Free Plugin
            </Label>
          </div>

          {!formData.isFree && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (USD)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  placeholder="9.99"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => handleInputChange("currency", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !pluginPackage}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Submit Plugin
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
