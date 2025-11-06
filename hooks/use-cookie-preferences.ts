/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState, useCallback, useEffect } from "react";

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export interface UseCookiePreferencesReturn {
  preferences: CookiePreferences;
  setPreferences: (prefs: CookiePreferences) => void;
  updatePreferences: (prefs: Partial<CookiePreferences>) => void;
  updatePreference: (category: keyof CookiePreferences, value: boolean) => void;
  savePreferences: () => Promise<void>;
  resetPreferences: () => void;
  acceptAll: () => void;
  rejectAll: () => void;
  hasConsented: boolean;
  loading?: boolean;
  error?: Error | null;
}

export function useCookiePreferences(): UseCookiePreferencesReturn {
  const [preferences, setPreferencesState] = useState<CookiePreferences>({
    necessary: true, // Always enabled
    analytics: false,
    marketing: false,
    preferences: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cookie-preferences");
      if (saved) {
        const parsed = JSON.parse(saved) as CookiePreferences;
        setPreferencesState({
          ...parsed,
          necessary: true, // Always keep necessary enabled
        });
      }
    } catch (err) {
      console.error("Failed to load cookie preferences:", err);
    }
  }, []);

  const setPreferences = useCallback((prefs: CookiePreferences) => {
    setPreferencesState({
      ...prefs,
      necessary: true, // Always keep necessary enabled
    });
  }, []);

  const updatePreferences = useCallback((prefs: Partial<CookiePreferences>) => {
    setPreferencesState((prev) => ({
      ...prev,
      ...prefs,
      necessary: true, // Always keep necessary enabled
    }));
  }, []);

  const updatePreference = useCallback(
    (category: keyof CookiePreferences, value: boolean) => {
      if (category === "necessary") return; // Cannot disable necessary cookies
      updatePreferences({ [category]: value });
    },
    [updatePreferences]
  );

  const savePreferences = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      localStorage.setItem("cookie-preferences", JSON.stringify(preferences));
      // Here you would typically also send to your API
      await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate API call
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to save preferences");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [preferences]);

  const resetPreferences = useCallback(() => {
    setPreferencesState({
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    });
  }, []);

  const acceptAll = useCallback(() => {
    setPreferencesState({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    });
  }, []);

  const rejectAll = useCallback(() => {
    setPreferencesState({
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    });
  }, []);

  const hasConsented = preferences.analytics || preferences.marketing || preferences.preferences;

  return {
    preferences,
    setPreferences,
    updatePreferences,
    updatePreference,
    savePreferences,
    resetPreferences,
    acceptAll,
    rejectAll,
    hasConsented,
    loading,
    error,
  };
}
