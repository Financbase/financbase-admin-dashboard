import { getDbOrThrow } from "@/lib/db";
import { landingPageVersions, landingPages } from "@/lib/db/schemas/cms.schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { Trash2, XCircle } from "lucide-react";

/**
 * Landing Page Version History Service
 * Manages version snapshots, restoration, and comparison
 */

export interface LandingPageVersion {
	id: number;
	landingPageId: number;
	versionNumber: number;
	title: string;
	slug: string;
	content: string | null;
	template: string | null;
	status: string | null;
	seoTitle: string | null;
	seoDescription: string | null;
	seoKeywords: string | null;
	metadata: string | null;
	changeMessage: string | null;
	createdBy: string | null;
	createdAt: Date | null;
}

export interface VersionDiff {
	field: string;
	oldValue: string;
	newValue: string;
	type: "added" | "removed" | "modified";
}

/**
 * Create a version snapshot of a landing page
 */
export async function createVersionSnapshot(
	landingPageId: number,
	changeMessage?: string,
	userId?: string,
): Promise<LandingPageVersion> {
	try {
		// Get current landing page data
		const [currentPage] = await getDbOrThrow()
			.select()
			.from(landingPages)
			.where(eq(landingPages.id, landingPageId))
			.limit(1);

		if (!currentPage) {
			throw new Error("Landing page not found");
		}

		// Get the next version number
		const [latestVersion] = await getDbOrThrow()
			.select({
				versionNumber: landingPageVersions.versionNumber,
			})
			.from(landingPageVersions)
			.where(eq(landingPageVersions.landingPageId, landingPageId))
			.orderBy(desc(landingPageVersions.versionNumber))
			.limit(1);

		const nextVersionNumber = (latestVersion?.versionNumber || 0) + 1;

		// Create version snapshot
		const [version] = await getDbOrThrow()
			.insert(landingPageVersions)
			.values({
				landingPageId: currentPage.id,
				versionNumber: nextVersionNumber,
				title: currentPage.title,
				slug: currentPage.slug,
				content: currentPage.content,
				template: currentPage.template,
				status: currentPage.status,
				seoTitle: currentPage.seoTitle,
				seoDescription: currentPage.seoDescription,
				seoKeywords: currentPage.seoKeywords,
				metadata: currentPage.metadata,
				changeMessage: changeMessage || null,
				createdBy: userId || null,
				createdAt: new Date(),
			})
			.returning();

		if (!version) {
			throw new Error("Failed to create version snapshot");
		}

		return version;
	} catch (error) {
		console.error("Error creating version snapshot:", error);
		throw error;
	}
}

/**
 * Get all versions for a landing page
 */
export async function getPageVersions(
	landingPageId: number,
): Promise<LandingPageVersion[]> {
	try {
		const versions = await getDbOrThrow()
			.select()
			.from(landingPageVersions)
			.where(eq(landingPageVersions.landingPageId, landingPageId))
			.orderBy(desc(landingPageVersions.versionNumber));

		return versions;
	} catch (error) {
		console.error("Error fetching page versions:", error);
		throw error;
	}
}

/**
 * Get a specific version
 */
export async function getVersion(
	versionId: number,
): Promise<LandingPageVersion | null> {
	try {
		const [version] = await getDbOrThrow()
			.select()
			.from(landingPageVersions)
			.where(eq(landingPageVersions.id, versionId))
			.limit(1);

		return version || null;
	} catch (error) {
		console.error("Error fetching version:", error);
		throw error;
	}
}

/**
 * Restore a landing page to a specific version
 */
export async function restoreToVersion(
	landingPageId: number,
	versionId: number,
	userId?: string,
): Promise<void> {
	try {
		// Get the version to restore
		const version = await getVersion(versionId);

		if (!version) {
			throw new Error("Version not found");
		}

		if (version.landingPageId !== landingPageId) {
			throw new Error("Version does not belong to this landing page");
		}

		// Create a snapshot of current state before restoration
		await createVersionSnapshot(
			landingPageId,
			`Backup before restoring to version ${version.versionNumber}`,
			userId,
		);

		// Restore the landing page to the version state
		await getDbOrThrow()
			.update(landingPages)
			.set({
				title: version.title,
				slug: version.slug,
				content: version.content,
				template: version.template,
				status: version.status,
				seoTitle: version.seoTitle,
				seoDescription: version.seoDescription,
				seoKeywords: version.seoKeywords,
				metadata: version.metadata,
				updatedAt: new Date(),
			})
			.where(eq(landingPages.id, landingPageId));

		// Create a new snapshot after restoration
		await createVersionSnapshot(
			landingPageId,
			`Restored from version ${version.versionNumber}`,
			userId,
		);
	} catch (error) {
		console.error("Error restoring to version:", error);
		throw error;
	}
}

/**
 * Compare two versions and return differences
 */
export async function compareVersions(
	versionId1: number,
	versionId2: number,
): Promise<VersionDiff[]> {
	try {
		const version1 = await getVersion(versionId1);
		const version2 = await getVersion(versionId2);

		if (!version1 || !version2) {
			throw new Error("One or both versions not found");
		}

		const diffs: VersionDiff[] = [];

		// Fields to compare
		const fieldsToCompare: Array<keyof LandingPageVersion> = [
			"title",
			"slug",
			"content",
			"template",
			"status",
			"seoTitle",
			"seoDescription",
			"seoKeywords",
			"metadata",
		];

		for (const field of fieldsToCompare) {
			const oldValue = String(version1[field] || "");
			const newValue = String(version2[field] || "");

			if (oldValue !== newValue) {
				let type: "added" | "removed" | "modified" = "modified";

				if (!oldValue && newValue) {
					type = "added";
				} else if (oldValue && !newValue) {
					type = "removed";
				}

				diffs.push({
					field,
					oldValue,
					newValue,
					type,
				});
			}
		}

		return diffs;
	} catch (error) {
		console.error("Error comparing versions:", error);
		throw error;
	}
}

/**
 * Delete old versions (keep only the last N versions)
 */
export async function pruneOldVersions(
	landingPageId: number,
	keepCount = 10,
): Promise<number> {
	try {
		// Get all versions
		const versions = await getPageVersions(landingPageId);

		if (versions.length <= keepCount) {
			return 0; // Nothing to prune
		}

		// Get versions to delete (all except the last keepCount)
		const versionsToDelete = versions.slice(keepCount);
		const versionIds = versionsToDelete.map((v) => v.id);

		// Delete old versions
		await getDbOrThrow()
			.delete(landingPageVersions)
			.where(
				and(
					eq(landingPageVersions.landingPageId, landingPageId),
					sql`${landingPageVersions.id} IN (${sql.join(
						versionIds.map((id) => sql`${id}`),
						sql`, `,
					)})`,
				),
			);

		return versionIds.length;
	} catch (error) {
		console.error("Error pruning old versions:", error);
		throw error;
	}
}

/**
 * Get version statistics for a landing page
 */
export async function getVersionStats(landingPageId: number): Promise<{
	totalVersions: number;
	oldestVersion: Date | null;
	newestVersion: Date | null;
	totalSize: number; // Approximate size in bytes
}> {
	try {
		const versions = await getPageVersions(landingPageId);

		if (versions.length === 0) {
			return {
				totalVersions: 0,
				oldestVersion: null,
				newestVersion: null,
				totalSize: 0,
			};
		}

		// Calculate approximate size
		const totalSize = versions.reduce((sum, version) => {
			const contentSize = version.content?.length || 0;
			const metadataSize = version.metadata?.length || 0;
			return sum + contentSize + metadataSize;
		}, 0);

		return {
			totalVersions: versions.length,
			oldestVersion: versions[versions.length - 1]?.createdAt || null,
			newestVersion: versions[0]?.createdAt || null,
			totalSize,
		};
	} catch (error) {
		console.error("Error getting version stats:", error);
		throw error;
	}
}
