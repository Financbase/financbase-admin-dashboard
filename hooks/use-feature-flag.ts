/**
 * React hook for checking feature flags
 */

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export interface UseFeatureFlagOptions {
	organizationId?: string;
	plan?: string;
	region?: string;
	accountAge?: number;
	customAttributes?: Record<string, unknown>;
}

export function useFeatureFlag(key: string, options?: UseFeatureFlagOptions) {
	const [enabled, setEnabled] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(true);
	const { user } = useUser();

	useEffect(() => {
		async function checkFlag() {
			try {
				const params = new URLSearchParams({ key });
				const response = await fetch(`/api/feature-flags/check?${params.toString()}`);
				
				if (response.ok) {
					const data = await response.json();
					setEnabled(data.enabled ?? false);
				} else {
					setEnabled(false);
				}
			} catch (error) {
				console.error('Error checking feature flag:', error);
				setEnabled(false);
			} finally {
				setLoading(false);
			}
		}

		checkFlag();
	}, [key, user?.id, options?.organizationId]);

	return { enabled, loading };
}

