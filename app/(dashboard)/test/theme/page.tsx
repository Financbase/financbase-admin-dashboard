/**
 * Theme Manager Test Page
 * 
 * Dedicated page for testing ThemeManager functionality
 * Accessible at: /test/theme
 */

'use client';

import { ThemeManagerTest } from '@/components/dev/theme-manager-test';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ThemeTestPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/test">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Palette className="h-8 w-8" />
            Theme Manager Testing
          </h1>
          <p className="text-muted-foreground mt-2">
            Test the centralized ThemeManager service with live theme switching, color utilities, and CSS variable access
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
          <CardDescription>
            Follow these steps to verify ThemeManager functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li><strong>Test Theme Toggling:</strong> Use the theme toggle buttons below to switch between light and dark themes</li>
            <li><strong>Verify Theme Persistence:</strong> Refresh the page and check if your selected theme persists</li>
            <li><strong>Test User Preferences Sync:</strong> Go to Settings → Preferences and change the theme there, then verify it updates here</li>
            <li><strong>Check Color Samples:</strong> Verify that color samples update correctly when switching themes</li>
            <li><strong>Test Chart Colors:</strong> Verify that chart colors (1-5) are accessible and display correctly</li>
            <li><strong>Inspect CSS Variables:</strong> Expand the "View all variables" section to see all theme variables from globals.css</li>
          </ol>
        </CardContent>
      </Card>

      <ThemeManagerTest />
    </div>
  );
}

