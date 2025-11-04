/**
 * Responsive UI Test Page
 * 
 * Demonstrates all the new responsive UI components and patterns
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeDialog, useNativeDialog } from '@/components/ui/native-dialog';
import { Details, DetailsGroup } from '@/components/ui/details';
import { ResponsiveImage } from '@/components/ui/responsive-image';
import { Editable } from '@/components/ui/editable';
import { SimpleTooltip } from '@/components/core/ui/layout/tooltip';
import {
  LayoutContainer,
  SectionContainer,
  ContentWrapper,
} from '@/lib/styles/layout';
import {
  StickyHeader,
  StickyNav,
} from '@/lib/styles/sticky';
import { useBreakpoint } from '@/lib/styles/breakpoints';
import { Badge } from '@/components/ui/badge';
import { Palette, Layout, Image as ImageIcon, Code, Monitor } from 'lucide-react';

export default function ResponsiveUITestPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { dialogRef, showModal, close } = useNativeDialog();
  const { breakpoint, isMobile: isMobileView, isDesktop: isDesktopView } = useBreakpoint();

  return (
    <div className="min-h-screen bg-background">
      <StickyHeader>
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-bold">Responsive UI Test Page</h1>
          <Badge variant="outline">
            Breakpoint: {breakpoint}
            {isMobileView && ' (Mobile)'}
            {isDesktopView && ' (Desktop)'}
          </Badge>
        </div>
      </StickyHeader>

      <LayoutContainer size="7xl" padding="md">
        <SectionContainer>
          <ContentWrapper>
            <div className="space-y-8">
              {/* Color System Demo */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    <CardTitle>Color System</CardTitle>
                  </div>
                  <CardDescription>
                    HSL colors alongside OKLCH for easier manipulation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Primary HSL</div>
                      <div className="h-16 rounded-md bg-primary-hsl" />
                      <div className="h-8 rounded-md bg-primary-hsl-light" />
                      <div className="h-8 rounded-md bg-primary-hsl-dark" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Secondary HSL</div>
                      <div className="h-16 rounded-md bg-secondary-hsl" />
                      <div className="h-16 rounded-md bg-accent-hsl" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Neutral</div>
                      <div className="h-8 rounded-md bg-neutral-100" />
                      <div className="h-8 rounded-md bg-neutral-500" />
                      <div className="h-8 rounded-md bg-neutral-900" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Semantic</div>
                      <div className="h-8 rounded-md bg-success-hsl" />
                      <div className="h-8 rounded-md bg-warning-hsl" />
                      <div className="h-8 rounded-md bg-error-hsl" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Layout Patterns Demo */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Layout className="h-5 w-5" />
                    <CardTitle>Layout Patterns</CardTitle>
                  </div>
                  <CardDescription>
                    Flexbox and Grid responsive layouts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Responsive Grid */}
                    <div>
                      <h3 className="text-sm font-medium mb-2">Responsive Grid (1 col mobile, 2 tablet, 3 desktop)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div key={i} className="p-4 bg-card border rounded-md">
                            Card {i}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Flexbox Layout */}
                    <div>
                      <h3 className="text-sm font-medium mb-2">Flexbox Layout (Column on mobile, Row on desktop)</h3>
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 p-4 bg-card border rounded-md">Item 1</div>
                        <div className="flex-1 p-4 bg-card border rounded-md">Item 2</div>
                        <div className="flex-1 p-4 bg-card border rounded-md">Item 3</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Native Dialog Demo */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    <CardTitle>Native Dialog</CardTitle>
                  </div>
                  <CardDescription>
                    Native HTML5 dialog element with showModal() support
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={() => setIsDialogOpen(true)}>
                        Open Dialog (Controlled)
                      </Button>
                      <Button onClick={showModal}>
                        Open Dialog (useNativeDialog hook)
                      </Button>
                    </div>

                    <NativeDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <div className="space-y-4">
                        <h2 className="text-xl font-bold">Native Dialog</h2>
                        <p>This is a native HTML5 dialog element.</p>
                        <p>Press Escape to close or click outside.</p>
                        <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
                      </div>
                    </NativeDialog>

                    <dialog ref={dialogRef} className="rounded-lg p-6">
                      <h2 className="text-xl font-bold mb-4">Dialog via Hook</h2>
                      <p className="mb-4">Opened using useNativeDialog hook</p>
                      <Button onClick={close}>Close</Button>
                    </dialog>
                  </div>
                </CardContent>
              </Card>

              {/* Details/Summary Demo */}
              <Card>
                <CardHeader>
                  <CardTitle>Native Details/Summary</CardTitle>
                  <CardDescription>
                    Collapsible content using native HTML5 details element
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DetailsGroup>
                    <Details summary="What is Financbase?">
                      <p className="text-sm text-muted-foreground">
                        Financbase is a comprehensive financial management platform
                        with advanced automation, integrations, and analytics capabilities.
                      </p>
                    </Details>
                    <Details summary="How does it work?">
                      <p className="text-sm text-muted-foreground">
                        Connect your financial accounts, set up automations,
                        and get real-time insights into your financial health.
                      </p>
                    </Details>
                    <Details summary="What features are available?">
                      <p className="text-sm text-muted-foreground">
                        Features include invoicing, expense tracking, reporting,
                        AI-powered insights, and extensive third-party integrations.
                      </p>
                    </Details>
                  </DetailsGroup>
                </CardContent>
              </Card>

              {/* Input with inputmode Demo */}
              <Card>
                <CardHeader>
                  <CardTitle>Enhanced Input Fields</CardTitle>
                  <CardDescription>
                    Input fields with automatic inputmode for mobile keyboard optimization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Email (auto inputmode)</label>
                      <Input type="email" placeholder="Enter email" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Phone (auto inputmode)</label>
                      <Input type="tel" placeholder="Enter phone number" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Number (auto inputmode)</label>
                      <Input type="number" placeholder="Enter number" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Custom inputmode</label>
                      <Input inputMode="decimal" placeholder="Enter decimal number" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tooltip Demo */}
              <Card>
                <CardHeader>
                  <CardTitle>Enhanced Tooltips</CardTitle>
                  <CardDescription>
                    Tooltips with native title attribute support
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <SimpleTooltip content="This tooltip uses native title attribute" useNative>
                      <Button>Native Tooltip</Button>
                    </SimpleTooltip>
                    <SimpleTooltip content="This tooltip uses Radix UI">
                      <Button>Radix Tooltip</Button>
                    </SimpleTooltip>
                    <Button title="Simple native title attribute">
                      Native Title
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Editable Content Demo */}
              <Card>
                <CardHeader>
                  <CardTitle>Editable Content</CardTitle>
                  <CardDescription>
                    Contenteditable component with validation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Editable Text (Plain)</label>
                      <Editable
                        contentType="plain"
                        placeholder="Click to edit..."
                        showSaveButton
                        minLength={10}
                        maxLength={100}
                      >
                        Sample editable content. Click to edit!
                      </Editable>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Responsive Image Demo */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    <CardTitle>Responsive Images</CardTitle>
                  </div>
                  <CardDescription>
                    Picture element with WebP support and mobile optimization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Note: Run <code className="bg-muted px-1 rounded">npm run optimize:images</code> to
                      generate WebP versions of your images.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Standard Image</label>
                        <ResponsiveImage
                          src="/financbase-logo.png"
                          alt="Financbase Logo"
                          width={200}
                          height={200}
                          className="rounded-md border"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">With WebP (if available)</label>
                        <ResponsiveImage
                          src="/financbase-logo.png"
                          webpSrc="/financbase-logo.webp"
                          alt="Financbase Logo WebP"
                          width={200}
                          height={200}
                          className="rounded-md border"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Breakpoint Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    <CardTitle>Breakpoint Information</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Current Breakpoint</div>
                      <div className="text-muted-foreground">{breakpoint}</div>
                    </div>
                    <div>
                      <div className="font-medium">Is Mobile</div>
                      <div className="text-muted-foreground">{isMobileView ? 'Yes' : 'No'}</div>
                    </div>
                    <div>
                      <div className="font-medium">Is Desktop</div>
                      <div className="text-muted-foreground">{isDesktopView ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ContentWrapper>
        </SectionContainer>
      </LayoutContainer>
    </div>
  );
}

