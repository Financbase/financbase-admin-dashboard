/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState, useEffect } from 'react';

export function useAdminStatus() {
	const [isAdmin, setIsAdmin] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function checkAdminStatus() {
			try {
				const response = await fetch('/api/auth/admin-status');
				if (response.ok) {
					const data = await response.json();
					setIsAdmin(data.isAdmin);
				} else if (response.status === 401) {
					// User not authenticated, not an admin
					setIsAdmin(false);
				} else {
					setError('Failed to check admin status');
				}
			} catch (_err) {
				setError('Failed to check admin status');
			} finally {
				setLoading(false);
			}
		}

		checkAdminStatus();
	}, []);

	return { isAdmin, loading, error };
}
