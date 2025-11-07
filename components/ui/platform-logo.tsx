/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import React, { useState } from "react";
import Image from "next/image";

interface PlatformLogoProps {
  src: string;
  fallback?: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export function PlatformLogo({ 
  src, 
  fallback, 
  alt, 
  width = 48, 
  height = 48,
  className = "w-full h-full object-contain"
}: PlatformLogoProps) {
  const [imgSrc, setImgSrc] = useState(src);
  
  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      unoptimized={imgSrc.endsWith('.svg') || imgSrc.startsWith('https://')}
      onError={() => {
        if (fallback && imgSrc !== fallback) {
          setImgSrc(fallback);
        }
      }}
    />
  );
}

