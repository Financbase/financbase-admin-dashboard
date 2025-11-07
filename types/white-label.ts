/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

/**
 * White label branding configuration interface
 */
export interface WhiteLabelBranding {
	logo?: string;
	logoDark?: string;
	favicon?: string;
	primaryColor?: string;
	secondaryColor?: string;
	companyName?: string;
	supportEmail?: string;
	supportUrl?: string;
	customDomain?: string;
	customCss?: string;
	hideFinancbaseBranding?: boolean;
	emailFooter?: string;
}

/**
 * Default Financbase branding (fallback)
 */
export const DEFAULT_BRANDING: WhiteLabelBranding = {
	logo: '/financbase-logo.png',
	logoDark: '/financbase-logo-white.png',
	favicon: '/financbase-logo-192x192.png',
	primaryColor: '#3B82F6',
	secondaryColor: '#6B7280',
	companyName: 'Financbase',
	supportEmail: 'support@financbase.com',
	supportUrl: 'https://financbase.com/support',
	hideFinancbaseBranding: false,
};

/**
 * Branding settings stored in workspace/organization settings JSON
 */
export interface BrandingSettings {
	whiteLabel?: WhiteLabelBranding;
}

