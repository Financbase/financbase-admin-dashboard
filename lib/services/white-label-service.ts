/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { getDbOrThrow } from '@/lib/db';
import { organizations } from '@/lib/db/schemas/organizations.schema';
import { workspaces } from '@/drizzle/schema/workspaces';
import { eq, or, ilike, and } from 'drizzle-orm';
import type { WhiteLabelBranding, BrandingSettings } from '@/types/white-label';
import { DEFAULT_BRANDING } from '@/types/white-label';

export class WhiteLabelService {
	private db: ReturnType<typeof getDbOrThrow>;

	constructor() {
		this.db = getDbOrThrow();
	}

	/**
	 * Get branding configuration for a workspace or organization
	 * Falls back through: workspace -> organization -> default
	 */
	async getBranding(
		workspaceId?: string,
		organizationId?: string,
	): Promise<WhiteLabelBranding> {
		try {
			let branding: WhiteLabelBranding | null = null;

			// Try to get workspace branding first
			if (workspaceId) {
				const workspace = await this.db
					.select({
						settings: workspaces.settings,
						logo: workspaces.logo,
						name: workspaces.name,
						plan: workspaces.plan,
					})
					.from(workspaces)
					.where(eq(workspaces.workspaceId, workspaceId))
					.limit(1);

				if (workspace[0] && workspace[0].plan === 'enterprise') {
					const settings = this.parseSettings(workspace[0].settings);
					if (settings?.whiteLabel) {
						branding = {
							...settings.whiteLabel,
							// Use workspace logo if no custom logo set
							logo: settings.whiteLabel.logo || workspace[0].logo || undefined,
							// Use workspace name if no custom company name set
							companyName:
								settings.whiteLabel.companyName || workspace[0].name || undefined,
						};
					} else if (workspace[0].logo) {
						// If workspace has logo but no white label config, create minimal branding
						branding = {
							logo: workspace[0].logo,
							companyName: workspace[0].name,
						};
					}
				}
			}

			// Fallback to organization branding if workspace branding not found
			if (!branding && organizationId) {
				const organization = await this.db
					.select({
						settings: organizations.settings,
						logo: organizations.logo,
						name: organizations.name,
					})
					.from(organizations)
					.where(eq(organizations.id, organizationId))
					.limit(1);

				if (organization[0]) {
					const settings = this.parseSettings(organization[0].settings);
					if (settings?.whiteLabel) {
						branding = {
							...settings.whiteLabel,
							logo: settings.whiteLabel.logo || organization[0].logo || undefined,
							companyName:
								settings.whiteLabel.companyName ||
								organization[0].name ||
								undefined,
						};
					} else if (organization[0].logo) {
						branding = {
							logo: organization[0].logo,
							companyName: organization[0].name,
						};
					}
				}
			}

			// Merge with defaults
			return {
				...DEFAULT_BRANDING,
				...branding,
			};
		} catch (error) {
			console.error('Error fetching branding:', error);
			return DEFAULT_BRANDING;
		}
	}

	/**
	 * Get workspace by custom domain
	 */
	async getBrandingByDomain(domain: string): Promise<{
		workspaceId: string;
		branding: WhiteLabelBranding;
	} | null> {
		try {
			// Normalize domain (remove protocol, www, trailing slash)
			const normalizedDomain = domain
				.replace(/^https?:\/\//, '')
				.replace(/^www\./, '')
				.replace(/\/$/, '')
				.toLowerCase();

			// Try exact match first
			let workspace = await this.db
				.select({
					workspaceId: workspaces.workspaceId,
					settings: workspaces.settings,
					logo: workspaces.logo,
					name: workspaces.name,
					plan: workspaces.plan,
				})
				.from(workspaces)
				.where(
					and(
						eq(workspaces.plan, 'enterprise'),
						or(
							eq(workspaces.domain, normalizedDomain),
							ilike(workspaces.domain, `%${normalizedDomain}%`),
						),
					),
				)
				.limit(1);

			// If no exact match, try subdomain pattern (e.g., client.financbase.com)
			if (!workspace[0]) {
				const subdomain = normalizedDomain.split('.')[0];
				workspace = await this.db
					.select({
						workspaceId: workspaces.workspaceId,
						settings: workspaces.settings,
						logo: workspaces.logo,
						name: workspaces.name,
						plan: workspaces.plan,
					})
					.from(workspaces)
					.where(
						and(
							eq(workspaces.plan, 'enterprise'),
							ilike(workspaces.slug, `%${subdomain}%`),
						),
					)
					.limit(1);
			}

			if (!workspace[0]) {
				return null;
			}

			const settings = this.parseSettings(workspace[0].settings);
			const branding: WhiteLabelBranding = {
				...DEFAULT_BRANDING,
				...(settings?.whiteLabel || {}),
				logo: settings?.whiteLabel?.logo || workspace[0].logo || DEFAULT_BRANDING.logo,
				companyName:
					settings?.whiteLabel?.companyName ||
					workspace[0].name ||
					DEFAULT_BRANDING.companyName,
			};

			return {
				workspaceId: workspace[0].workspaceId,
				branding,
			};
		} catch (error) {
			console.error('Error fetching branding by domain:', error);
			return null;
		}
	}

	/**
	 * Update branding configuration for a workspace
	 */
	async updateBranding(
		workspaceId: string,
		branding: Partial<WhiteLabelBranding>,
	): Promise<WhiteLabelBranding> {
		try {
			// Validate branding
			this.validateBranding(branding);

			// Get current workspace
			const workspace = await this.db
				.select({
					settings: workspaces.settings,
					plan: workspaces.plan,
				})
				.from(workspaces)
				.where(eq(workspaces.workspaceId, workspaceId))
				.limit(1);

			if (!workspace[0]) {
				throw new Error('Workspace not found');
			}

			if (workspace[0].plan !== 'enterprise') {
				throw new Error('White label is only available for enterprise plans');
			}

			// Parse existing settings
			const settings = this.parseSettings(workspace[0].settings) || {};

			// Merge branding
			settings.whiteLabel = {
				...(settings.whiteLabel || {}),
				...branding,
			};

			// Update workspace settings
			await this.db
				.update(workspaces)
				.set({
					settings: JSON.stringify(settings),
					updatedAt: new Date(),
				})
				.where(eq(workspaces.workspaceId, workspaceId));

			// Return merged branding with defaults
			return {
				...DEFAULT_BRANDING,
				...settings.whiteLabel,
			};
		} catch (error) {
			console.error('Error updating branding:', error);
			throw error;
		}
	}

	/**
	 * Validate branding configuration
	 */
	validateBranding(branding: Partial<WhiteLabelBranding>): void {
		// Validate colors
		if (branding.primaryColor && !this.isValidColor(branding.primaryColor)) {
			throw new Error('Invalid primary color format');
		}

		if (branding.secondaryColor && !this.isValidColor(branding.secondaryColor)) {
			throw new Error('Invalid secondary color format');
		}

		// Validate URLs
		if (branding.logo && !this.isValidUrl(branding.logo)) {
			throw new Error('Invalid logo URL');
		}

		if (branding.logoDark && !this.isValidUrl(branding.logoDark)) {
			throw new Error('Invalid dark logo URL');
		}

		if (branding.favicon && !this.isValidUrl(branding.favicon)) {
			throw new Error('Invalid favicon URL');
		}

		if (branding.supportUrl && !this.isValidUrl(branding.supportUrl)) {
			throw new Error('Invalid support URL');
		}

		// Validate email
		if (branding.supportEmail && !this.isValidEmail(branding.supportEmail)) {
			throw new Error('Invalid support email');
		}

		// Validate domain format
		if (branding.customDomain && !this.isValidDomain(branding.customDomain)) {
			throw new Error('Invalid custom domain format');
		}
	}

	/**
	 * Parse settings JSON string
	 */
	private parseSettings(settings: string | null): BrandingSettings | null {
		if (!settings) return null;
		try {
			return typeof settings === 'string' ? JSON.parse(settings) : settings;
		} catch {
			return null;
		}
	}

	/**
	 * Validate color format (hex, rgb, rgba)
	 */
	private isValidColor(color: string): boolean {
		return (
			/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color) ||
			/^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/.test(color) ||
			/^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*(0|1|0?\.\d+)\s*\)$/.test(color)
		);
	}

	/**
	 * Validate URL format
	 */
	private isValidUrl(url: string): boolean {
		try {
			// Allow relative URLs (starting with /)
			if (url.startsWith('/')) return true;
			// Allow data URLs for images
			if (url.startsWith('data:image/')) return true;
			// Validate absolute URLs
			const urlObj = new URL(url);
			return ['http:', 'https:'].includes(urlObj.protocol);
		} catch {
			return false;
		}
	}

	/**
	 * Validate email format
	 */
	private isValidEmail(email: string): boolean {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	}

	/**
	 * Validate domain format
	 */
	private isValidDomain(domain: string): boolean {
		// Basic domain validation
		return /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(domain);
	}
}

// Export singleton instance
export const whiteLabelService = new WhiteLabelService();

