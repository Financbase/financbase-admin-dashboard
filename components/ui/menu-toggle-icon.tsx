/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

'use client';
import React from 'react';
import { cn } from '@/lib/utils';

interface MenuToggleIconProps extends React.ComponentProps<'svg'> {
	open: boolean;
	duration?: number;
}

export function MenuToggleIcon({
	open,
	duration = 200,
	className,
	...props
}: MenuToggleIconProps) {
	return (
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={cn('transition-transform duration-200', className)}
			style={{
				transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
				transitionDuration: `${duration}ms`,
			}}
			{...props}
		>
			{open ? (
				// X icon when open
				<>
					<path d="M18 6L6 18" />
					<path d="M6 6l12 12" />
				</>
			) : (
				// Hamburger icon when closed
				<>
					<line x1="3" y1="6" x2="21" y2="6" />
					<line x1="3" y1="12" x2="21" y2="12" />
					<line x1="3" y1="18" x2="21" y2="18" />
				</>
			)}
		</svg>
	);
}
