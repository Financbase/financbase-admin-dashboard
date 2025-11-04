/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface OptimizedImageProps {
	src: string;
	alt: string;
	width?: number;
	height?: number;
	className?: string;
	priority?: boolean;
	placeholder?: "blur" | "empty";
	blurDataURL?: string;
	sizes?: string;
	quality?: number;
	loading?: "lazy" | "eager";
	onLoad?: () => void;
	onError?: () => void;
}

/**
 * Performance-optimized image component with lazy loading
 * Implements intersection observer for better performance
 */
export function OptimizedImage({
	src,
	alt,
	width,
	height,
	className,
	priority = false,
	placeholder = "blur",
	blurDataURL,
	sizes,
	quality = 75,
	loading = "lazy",
	onLoad,
	onError,
	...props
}: OptimizedImageProps) {
	const [isLoaded, setIsLoaded] = useState(false);
	const [isInView, setIsInView] = useState(priority);
	const [hasError, setHasError] = useState(false);
	const imgRef = useRef<HTMLDivElement>(null);

	// Intersection Observer for lazy loading
	useEffect(() => {
		if (priority || loading === "eager") {
			setIsInView(true);
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsInView(true);
					observer.disconnect();
				}
			},
			{
				threshold: 0.1,
				rootMargin: "50px",
			},
		);

		if (imgRef.current) {
			observer.observe(imgRef.current);
		}

		return () => observer.disconnect();
	}, [priority, loading]);

	const handleLoad = () => {
		setIsLoaded(true);
		onLoad?.();
	};

	const handleError = () => {
		setHasError(true);
		onError?.();
	};

	// Generate blur placeholder if not provided
	const defaultBlurDataURL =
		blurDataURL ||
		"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";

	return (
		<div
			ref={imgRef}
			className={cn("relative overflow-hidden", className)}
			style={{ width, height }}
		>
			{isInView && (
				<Image
					src={src}
					alt={alt}
					width={width}
					height={height}
					className={cn(
						"transition-opacity duration-300",
						isLoaded ? "opacity-100" : "opacity-0",
					)}
					priority={priority}
					placeholder={placeholder}
					blurDataURL={placeholder === "blur" ? defaultBlurDataURL : undefined}
					sizes={sizes}
					quality={quality}
					onLoad={handleLoad}
					onError={handleError}
					{...props}
				/>
			)}

			{/* Loading placeholder */}
			{!isLoaded && !hasError && (
				<div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
					<div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
				</div>
			)}

			{/* Error placeholder */}
			{hasError && (
				<div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
					<div className="text-gray-400 text-sm">Failed to load image</div>
				</div>
			)}
		</div>
	);
}

/**
 * Lazy-loaded image gallery component
 */
interface ImageGalleryProps {
	images: Array<{
		src: string;
		alt: string;
		width: number;
		height: number;
	}>;
	className?: string;
}

export function ImageGallery({ images, className }: ImageGalleryProps) {
	return (
		<div
			className={cn(
				"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
				className,
			)}
		>
			{images.map((image, index) => (
				<OptimizedImage
					key={index}
					{...image}
					loading={index < 3 ? "eager" : "lazy"} // Load first 3 images immediately
					className="rounded-lg"
				/>
			))}
		</div>
	);
}
