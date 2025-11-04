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

export type RealEstateRole = 'investor' | 'realtor' | 'buyer' | null;

export function useRealEstateRole() {
  const [role, setRole] = useState<RealEstateRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedRole = localStorage.getItem('realEstateRole') as RealEstateRole;
    if (storedRole) {
      setRole(storedRole);
    }
    setIsLoading(false);
  }, []);

  const updateRole = (newRole: RealEstateRole) => {
    setRole(newRole);
    if (newRole) {
      localStorage.setItem('realEstateRole', newRole);
    } else {
      localStorage.removeItem('realEstateRole');
    }
  };

  return { role, updateRole, isLoading };
}