/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { PublicHero } from "@/components/layout/public-hero";
import { PublicCTA } from "@/components/layout/public-form";
import { PageAnimationWrapper, AnimatedBackground } from "@/components/layout/public-page-animations";
import type { ReactNode } from "react";

interface PublicPageTemplateProps {
  children: ReactNode;
  hero?: {
    title: string;
    subtitle?: string;
    description?: string;
    primaryAction?: {
      text: string;
      href: string;
    };
    secondaryAction?: {
      text: string;
      href: string;
    };
  };
  cta?: {
    title: string;
    description?: string;
    primaryAction?: {
      text: string;
      href: string;
    };
    secondaryAction?: {
      text: string;
      href: string;
    };
  };
}

export function PublicPageTemplate({ children, hero, cta }: PublicPageTemplateProps) {
  return (
    <AnimatedBackground showFloatingPaths={true} gradient={true}>
      <div className="min-h-screen bg-background/80 backdrop-blur-sm">
        {hero && (
          <PageAnimationWrapper delay={0.1}>
            <PublicHero
              title={hero.title}
              subtitle={hero.subtitle}
              description={hero.description}
              primaryAction={hero.primaryAction}
              secondaryAction={hero.secondaryAction}
            />
          </PageAnimationWrapper>
        )}
        
        <main>
          <PageAnimationWrapper delay={0.2}>
            {children}
          </PageAnimationWrapper>
        </main>
        
        {cta && (
          <PageAnimationWrapper delay={0.3}>
            <PublicCTA
              title={cta.title}
              description={cta.description}
              primaryAction={cta.primaryAction}
              secondaryAction={cta.secondaryAction}
            />
          </PageAnimationWrapper>
        )}
      </div>
    </AnimatedBackground>
  );
}

interface ContentPageTemplateProps {
  children: ReactNode;
  title: string;
  description?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
}

export function ContentPageTemplate({ 
  children, 
  title, 
  description, 
  breadcrumbs 
}: ContentPageTemplateProps) {
  return (
    <AnimatedBackground showFloatingPaths={true} gradient={true}>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Header Section */}
        <PageAnimationWrapper delay={0.1}>
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 py-16">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6">
                  {title}
                </h1>
                {description && (
                  <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </PageAnimationWrapper>

        {/* Breadcrumbs */}
        {breadcrumbs && (
          <PageAnimationWrapper delay={0.15}>
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {breadcrumbs.map((crumb, crumbIndex) => (
                    <div key={`crumb-${crumb.label}`} className="flex items-center gap-2">
                      {crumb.href ? (
                        <a
                          href={crumb.href}
                          className="hover:text-primary transition-colors"
                        >
                          {crumb.label}
                        </a>
                      ) : (
                        <span className="text-foreground font-medium">{crumb.label}</span>
                      )}
                      {crumbIndex < breadcrumbs.length - 1 && <span>/</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PageAnimationWrapper>
        )}

        {/* Content */}
        <PageAnimationWrapper delay={0.2}>
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </div>
        </PageAnimationWrapper>
      </div>
    </AnimatedBackground>
  );
}
