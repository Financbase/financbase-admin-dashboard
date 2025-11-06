/**
 * CSS Variables Test Component
 * 
 * This component verifies that CSS variables from globals.css are being loaded
 * and accessible in the browser.
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface CSSVariable {
  name: string;
  value: string;
  status: 'success' | 'error' | 'warning';
}

export function CSSVariablesTest() {
  const [variables, setVariables] = useState<CSSVariable[]>([]);
  const [htmlHasDarkClass, setHtmlHasDarkClass] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    checkVariables();
    checkDarkClass();
    
    // Re-check on theme changes
    const observer = new MutationObserver(() => {
      checkVariables();
      checkDarkClass();
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  const checkDarkClass = () => {
    const hasDark = document.documentElement.classList.contains('dark');
    setHtmlHasDarkClass(hasDark);
  };

  const checkVariables = () => {
    if (typeof window === 'undefined') return;

    const computedStyle = getComputedStyle(document.documentElement);
    const testVariables: CSSVariable[] = [
      { name: '--background', value: '', status: 'warning' },
      { name: '--foreground', value: '', status: 'warning' },
      { name: '--primary', value: '', status: 'warning' },
      { name: '--primary-foreground', value: '', status: 'warning' },
      { name: '--secondary', value: '', status: 'warning' },
      { name: '--muted', value: '', status: 'warning' },
      { name: '--muted-foreground', value: '', status: 'warning' },
      { name: '--accent', value: '', status: 'warning' },
      { name: '--card', value: '', status: 'warning' },
      { name: '--card-foreground', value: '', status: 'warning' },
      { name: '--border', value: '', status: 'warning' },
      { name: '--input', value: '', status: 'warning' },
      { name: '--ring', value: '', status: 'warning' },
      { name: '--chart-1', value: '', status: 'warning' },
      { name: '--brand-primary', value: '', status: 'warning' },
    ];

    testVariables.forEach((variable) => {
      const value = computedStyle.getPropertyValue(variable.name).trim();
      variable.value = value;
      variable.status = value ? 'success' : 'error';
    });

    setVariables(testVariables);
  };

  if (!isMounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CSS Variables Test</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const successCount = variables.filter(v => v.status === 'success').length;
  const errorCount = variables.filter(v => v.status === 'error').length;
  const totalCount = variables.length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          CSS Variables Test
          <Badge variant={errorCount === 0 ? 'default' : 'destructive'}>
            {successCount}/{totalCount} loaded
          </Badge>
        </CardTitle>
        <CardDescription>
          Verifies that CSS variables from globals.css are accessible
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Theme Status */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
          <div className="flex items-center gap-2">
            {htmlHasDarkClass ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Dark mode active</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Light mode active</span>
              </>
            )}
          </div>
          <Badge variant="outline" className="ml-auto">
            HTML class: {htmlHasDarkClass ? 'dark' : 'none'}
          </Badge>
        </div>

        {/* Variables List */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">CSS Variables Status:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
            {variables.map((variable) => (
              <div
                key={variable.name}
                className={`flex items-center justify-between p-2 rounded border ${
                  variable.status === 'success'
                    ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {variable.status === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                  )}
                  <code className="text-xs font-mono truncate">{variable.name}</code>
                </div>
                {variable.value && (
                  <code className="text-xs text-muted-foreground ml-2 truncate max-w-[200px]">
                    {variable.value.substring(0, 30)}...
                  </code>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {successCount}
              </div>
              <div className="text-xs text-muted-foreground">Loaded</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {errorCount}
              </div>
              <div className="text-xs text-muted-foreground">Missing</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {Math.round((successCount / totalCount) * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Direct CSS Check */}
        <div className="pt-4 border-t">
          <h3 className="text-sm font-semibold mb-2">Direct CSS Check:</h3>
          <div className="p-3 rounded-lg bg-muted font-mono text-xs">
            <div className="mb-2">
              <strong>HTML Element Classes:</strong>{' '}
              {document.documentElement.className || '(none)'}
            </div>
            <div className="mb-2">
              <strong>Data Theme:</strong>{' '}
              {document.documentElement.getAttribute('data-theme') || '(none)'}
            </div>
            <div>
              <strong>Computed Background:</strong>{' '}
              {typeof window !== 'undefined'
                ? getComputedStyle(document.documentElement).backgroundColor
                : 'N/A'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

