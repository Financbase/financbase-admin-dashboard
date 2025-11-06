/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

export interface AccessMember {
	id: string;
	name: string;
	email: string;
	role: "Editor" | "Viewer" | "Owner";
	avatar?: string;
}

export interface AccessInvitation {
	id: string;
	email: string;
	role: "Editor" | "Viewer";
	status: "pending" | "accepted" | "rejected";
	expiresAt?: Date;
}

