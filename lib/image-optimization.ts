/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import sharp from 'sharp';

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
  maintainAspectRatio?: boolean;
}

export interface OptimizedImageResult {
  buffer: Buffer;
  originalSize: number;
  optimizedSize: number;
  width: number;
  height: number;
  format: string;
  compressionRatio: number;
  originalWidth?: number;
  originalHeight?: number;
  originalFormat?: string;
}

/**
 * Optimize image with automatic resizing and format optimization
 */
export async function optimizeImage(
  inputBuffer: Buffer | string,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImageResult> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 85,
    format = 'webp',
    maintainAspectRatio = true,
  } = options;

  try {
    let sharpInstance = sharp(inputBuffer);

    // Get original image metadata
    const originalMetadata = await sharpInstance.metadata();
    const originalSize = inputBuffer instanceof Buffer ? inputBuffer.length : 0;

    // Resize if needed
    if (maintainAspectRatio) {
      sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    } else {
      sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
        fit: 'fill',
        withoutEnlargement: true,
      });
    }

    // Optimize based on format
    let optimizedBuffer: Buffer;

    switch (format) {
      case 'webp':
        optimizedBuffer = await sharpInstance
          .webp({ quality, effort: 6 })
          .toBuffer();
        break;
      case 'avif':
        optimizedBuffer = await sharpInstance
          .avif({ quality, effort: 6 })
          .toBuffer();
        break;
      case 'jpeg':
        optimizedBuffer = await sharpInstance
          .jpeg({ quality, progressive: true })
          .toBuffer();
        break;
      case 'png':
        optimizedBuffer = await sharpInstance
          .png({ quality, compressionLevel: 9 })
          .toBuffer();
        break;
      default:
        optimizedBuffer = await sharpInstance
          .webp({ quality, effort: 6 })
          .toBuffer();
    }

    // Get optimized image metadata
    const optimizedMetadata = await sharp(optimizedBuffer).metadata();

    return {
      buffer: optimizedBuffer,
      originalSize,
      optimizedSize: optimizedBuffer.length,
      width: optimizedMetadata.width || 0,
      height: optimizedMetadata.height || 0,
      format: format || 'webp',
      compressionRatio: originalSize > 0 ? (originalSize - optimizedBuffer.length) / originalSize : 0,
      originalWidth: originalMetadata.width,
      originalHeight: originalMetadata.height,
      originalFormat: originalMetadata.format,
    };
  } catch (error) {
    console.error('Image optimization failed:', error);
    throw new Error(`Failed to optimize image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate multiple sizes of an image for responsive loading
 */
export async function generateResponsiveImages(
  inputBuffer: Buffer | string,
  sizes: number[] = [320, 640, 1024, 1920]
): Promise<{ [size: string]: OptimizedImageResult }> {
  const responsiveImages: { [size: string]: OptimizedImageResult } = {};

  for (const maxWidth of sizes) {
    try {
      const result = await optimizeImage(inputBuffer, {
        maxWidth,
        maxHeight: Math.round(maxWidth * 0.75), // Maintain 4:3 aspect ratio
        quality: 85,
        format: 'webp',
      });

      responsiveImages[`${maxWidth}w`] = result;
    } catch (error) {
      console.error(`Failed to generate ${maxWidth}w image:`, error);
    }
  }

  return responsiveImages;
}

/**
 * Create thumbnail versions of images
 */
export async function generateThumbnails(
  inputBuffer: Buffer | string,
  sizes: { width: number; height: number; suffix: string }[] = [
    { width: 150, height: 150, suffix: 'thumb' },
    { width: 400, height: 300, suffix: 'medium' },
    { width: 800, height: 600, suffix: 'large' },
  ]
): Promise<{ [key: string]: OptimizedImageResult }> {
  const thumbnails: { [key: string]: OptimizedImageResult } = {};

  for (const size of sizes) {
    try {
      const result = await optimizeImage(inputBuffer, {
        maxWidth: size.width,
        maxHeight: size.height,
        quality: 80,
        format: 'webp',
        maintainAspectRatio: true,
      });

      thumbnails[size.suffix] = result;
    } catch (error) {
      console.error(`Failed to generate ${size.suffix} thumbnail:`, error);
    }
  }

  return thumbnails;
}

/**
 * Validate image dimensions and format
 */
export async function validateImage(
  inputBuffer: Buffer | string
): Promise<{ isValid: boolean; metadata?: sharp.Metadata; error?: string }> {
  try {
    const metadata = await sharp(inputBuffer).metadata();

    // Check if it's a valid image
    if (!metadata.format) {
      return { isValid: false, error: 'Invalid image format' };
    }

    // Check minimum dimensions
    if (!metadata.width || !metadata.height) {
      return { isValid: false, error: 'Image has no dimensions' };
    }

    // Check maximum dimensions (prevent extremely large images)
    if (metadata.width > 10000 || metadata.height > 10000) {
      return { isValid: false, error: 'Image dimensions too large' };
    }

    return { isValid: true, metadata };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown validation error'
    };
  }
}

/**
 * Get image format information
 */
export function getImageFormatInfo(format: string) {
  const formats = {
    jpeg: { extension: 'jpg', mimeType: 'image/jpeg', quality: 85 },
    png: { extension: 'png', mimeType: 'image/png', quality: 90 },
    webp: { extension: 'webp', mimeType: 'image/webp', quality: 85 },
    avif: { extension: 'avif', mimeType: 'image/avif', quality: 80 },
    gif: { extension: 'gif', mimeType: 'image/gif', quality: 100 },
  };

  return formats[format as keyof typeof formats] || formats.webp;
}
