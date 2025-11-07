/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import type { LandingPage as SchemaLandingPage, LandingPageVersion as SchemaLandingPageVersion } from "@/lib/db/schemas/cms.schema";

export type LandingPage = SchemaLandingPage;
export type LandingPageVersion = SchemaLandingPageVersion;

export interface LandingPageMetadata {
	[key: string]: unknown;
}

export interface CreateLandingPageInput {
	title: string;
	slug: string;
	content?: string | null;
	template?: string | null;
	status?: "draft" | "published" | "archived";
	seoTitle?: string | null;
	seoDescription?: string | null;
	seoKeywords?: string | null;
	metadata?: LandingPageMetadata;
}

export interface UpdateLandingPageInput extends Partial<CreateLandingPageInput> {
	id: number;
}

