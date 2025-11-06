/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { useState } from "react";

export interface UseActionsOptions {
	query?: string;
	limit?: number;
	enabled?: boolean;
}

export interface UseActionsReturn {
	data?: {
		actions: any[];
	};
	isLoading: boolean;
	error: string | null;
	refetch: () => void;
}

export function useActions(options?: UseActionsOptions): UseActionsReturn {
	return {
		data: {
			actions: [],
		},
		isLoading: false,
		error: null,
		refetch: () => {},
	};
}

