/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

export interface Action {
	id: string;
	name: string;
	label?: string;
	description?: string;
	icon?: string;
	category?: string;
	actionType?: string;
	actionData?: Record<string, any>;
}
