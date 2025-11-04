/**
 * ThemeManager Test Component
 * Visual test component for verifying ThemeManager functionality
 * Use this component in development to test theme switching
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useThemeManager } from '@/hooks/use-theme-manager';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export function ThemeManagerTest() {
  const {
    mode,
    resolved,
    state,
    isDark,
    isLight,
    isSystem,
    setTheme,
    toggleTheme,
    getColor,
    getChartColor,
    getAllVariables,
    isLoading,
    isMounted,
    error,
  } = useThemeManager();

  const [colorSamples, setColorSamples] = useState<Record<string, string>>({});
  const [variables, setVariables] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isMounted) {
      // Get color samples
      const samples: Record<string, string> = {
        primary: getColor('primary', 'rgb'),
        background: getColor('background', 'rgb'),
        foreground: getColor('foreground', 'rgb'),
        accent: getColor('accent', 'rgb'),
        destructive: getColor('destructive', 'rgb'),
      };
      setColorSamples(samples);

      // Get all variables
      setVariables(getAllVariables());
    }
  }, [isMounted, resolved, getColor, getAllVariables]);

  if (!isMounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Theme Manager Test</CardTitle>
          <CardDescription>Loading theme manager...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme Manager Test Component</CardTitle>
          <CardDescription>
            Test component for verifying ThemeManager functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme State */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Theme State</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Mode</div>
                <Badge variant="outline">{mode}</Badge>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Resolved</div>
                <Badge variant="outline">{resolved}</Badge>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Is Dark</div>
                <Badge variant={isDark ? 'default' : 'outline'}>
                  {isDark ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Is System</div>
                <Badge variant={isSystem ? 'default' : 'outline'}>
                  {isSystem ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Theme Controls */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Theme Controls</h3>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setTheme('light')} variant={mode === 'light' ? 'default' : 'outline'}>
                Light
              </Button>
              <Button onClick={() => setTheme('dark')} variant={mode === 'dark' ? 'default' : 'outline'}>
                Dark
              </Button>
              <Button onClick={() => setTheme('system')} variant={mode === 'system' ? 'default' : 'outline'}>
                System
              </Button>
              <Button onClick={toggleTheme} variant="secondary">
                Toggle
              </Button>
              <ThemeToggle />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Status</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">Loading:</span>
                <Badge variant={isLoading ? 'default' : 'outline'}>
                  {isLoading ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Mounted:</span>
                <Badge variant={isMounted ? 'default' : 'destructive'}>
                  {isMounted ? 'Yes' : 'No'}
                </Badge>
              </div>
              {error && (
                <div className="text-sm text-destructive">
                  Error: {error.message}
                </div>
              )}
            </div>
          </div>

          {/* Color Samples */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Color Samples</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(colorSamples).map(([name, color]) => (
                <div key={name} className="space-y-2">
                  <div className="text-sm font-medium capitalize">{name}</div>
                  <div
                    className="h-16 rounded-md border-2 border-border"
                    style={{ backgroundColor: color }}
                  />
                  <div className="text-xs text-muted-foreground font-mono truncate">
                    {color}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart Colors */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Chart Colors</h3>
            <div className="grid grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((index) => {
                const color = getChartColor(index as 1 | 2 | 3 | 4 | 5);
                return (
                  <div key={index} className="space-y-2">
                    <div className="text-sm font-medium">Chart {index}</div>
                    <div
                      className="h-16 rounded-md border-2 border-border"
                      style={{ backgroundColor: color }}
                    />
                    <div className="text-xs text-muted-foreground font-mono truncate">
                      {color}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CSS Variables Count */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">CSS Variables</h3>
            <div className="text-sm text-muted-foreground">
              Total variables loaded: {Object.keys(variables).length}
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer text-sm font-medium">
                View all variables
              </summary>
              <div className="mt-2 p-4 bg-muted rounded-md max-h-64 overflow-y-auto">
                <pre className="text-xs font-mono">
                  {JSON.stringify(variables, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

