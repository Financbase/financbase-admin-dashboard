/**
 * Responsive Image Component
 * 
 * Wrapper around <picture> element with WebP support and responsive loading.
 * Uses <source> elements with media queries for optimal mobile/desktop images.
 */

'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface ResponsiveImageProps {
  /**
   * Image source (desktop/fallback)
   */
  src: string;
  /**
   * Mobile-optimized image source (smaller, cropped)
   */
  mobileSrc?: string;
  /**
   * WebP version of desktop image
   */
  webpSrc?: string;
  /**
   * WebP version of mobile image
   */
  webpMobileSrc?: string;
  /**
   * Image alt text
   */
  alt: string;
  /**
   * Image width (for Next.js Image optimization)
   */
  width?: number;
  /**
   * Image height (for Next.js Image optimization)
   */
  height?: number;
  /**
   * Additional className
   */
  className?: string;
  /**
   * Use Next.js Image component (default: true)
   */
  useNextImage?: boolean;
  /**
   * Breakpoint for mobile (default: 768px / md)
   */
  mobileBreakpoint?: string;
  /**
   * Loading strategy
   */
  loading?: 'lazy' | 'eager';
  /**
   * Object fit style
   */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  /**
   * Priority loading (for above-the-fold images)
   */
  priority?: boolean;
}

/**
 * Responsive Image Component
 */
export function ResponsiveImage({
  src,
  mobileSrc,
  webpSrc,
  webpMobileSrc,
  alt,
  width,
  height,
  className,
  useNextImage = true,
  mobileBreakpoint = '(max-width: 768px)',
  loading = 'lazy',
  objectFit = 'cover',
  priority = false,
}: ResponsiveImageProps) {
  // If using Next.js Image and no responsive variants needed, use simple Image
  if (useNextImage && !mobileSrc && !webpSrc && !webpMobileSrc) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={priority ? 'eager' : loading}
        priority={priority}
        style={{ objectFit }}
      />
    );
  }

  // Use picture element for responsive images
  return (
    <picture className={cn('block', className)}>
      {/* WebP Mobile Source */}
      {webpMobileSrc && (
        <source
          srcSet={webpMobileSrc}
          type="image/webp"
          media={mobileBreakpoint}
        />
      )}
      
      {/* Mobile Source */}
      {mobileSrc && (
        <source srcSet={mobileSrc} media={mobileBreakpoint} />
      )}
      
      {/* WebP Desktop Source */}
      {webpSrc && (
        <source
          srcSet={webpSrc}
          type="image/webp"
          media={`(min-width: ${mobileBreakpoint.replace('max-width: ', '').replace('px)', 'px)')}`}
        />
      )}
      
      {/* Fallback Image */}
      {useNextImage && width && height ? (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : loading}
          priority={priority}
          style={{ objectFit }}
        />
      ) : (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          style={{ objectFit, width: '100%', height: 'auto' }}
        />
      )}
    </picture>
  );
}

/**
 * Simple Responsive Image (without Next.js Image)
 * For external images or when Next.js Image is not needed
 */
export function SimpleResponsiveImage({
  src,
  mobileSrc,
  webpSrc,
  webpMobileSrc,
  alt,
  className,
  mobileBreakpoint = '(max-width: 768px)',
  loading = 'lazy',
  objectFit = 'cover',
}: Omit<ResponsiveImageProps, 'useNextImage' | 'width' | 'height' | 'priority'>) {
  return (
    <picture className={cn('block', className)}>
      {/* WebP Mobile Source */}
      {webpMobileSrc && (
        <source
          srcSet={webpMobileSrc}
          type="image/webp"
          media={mobileBreakpoint}
        />
      )}
      
      {/* Mobile Source */}
      {mobileSrc && (
        <source srcSet={mobileSrc} media={mobileBreakpoint} />
      )}
      
      {/* WebP Desktop Source */}
      {webpSrc && (
        <source
          srcSet={webpSrc}
          type="image/webp"
          media={`(min-width: ${mobileBreakpoint.replace('max-width: ', '').replace('px)', 'px)')}`}
        />
      )}
      
      {/* Fallback Image */}
      <img
        src={src}
        alt={alt}
        loading={loading}
        style={{ objectFit, width: '100%', height: 'auto' }}
      />
    </picture>
  );
}

