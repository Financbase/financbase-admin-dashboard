"use client";

import { useState, useEffect } from 'react';

export type RealEstateRole = 'investor' | 'realtor' | 'buyer';

const STORAGE_KEY = 'real-estate-role';

export function useRealEstateRole() {
  const [role, setRole] = useState<RealEstateRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load role from localStorage on mount
    const savedRole = localStorage.getItem(STORAGE_KEY) as RealEstateRole;
    if (savedRole && ['investor', 'realtor', 'buyer'].includes(savedRole)) {
      setRole(savedRole);
    }
    setIsLoading(false);
  }, []);

  const updateRole = (newRole: RealEstateRole) => {
    setRole(newRole);
    localStorage.setItem(STORAGE_KEY, newRole);
  };

  const clearRole = () => {
    setRole(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    role,
    updateRole,
    clearRole,
    isLoading,
  };
}
