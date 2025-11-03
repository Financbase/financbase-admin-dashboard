"use client";

import { useAuth } from '@clerk/nextjs';
import { useCallback } from 'react';

/**
 * Hook for making authenticated API requests with Clerk
 * 
 * @returns An object with:
 * - authenticatedFetch: A wrapper around fetch that automatically adds Clerk token
 * - getToken: Direct access to Clerk's getToken function
 * - userId: The current user ID
 * - isLoaded: Whether Clerk has finished loading
 * - isSignedIn: Whether the user is currently signed in
 */
export function useAuthenticatedFetch() {
  const { getToken, userId, isLoaded, isSignedIn } = useAuth();

  /**
   * Makes an authenticated fetch request with Clerk token
   * 
   * @param url - The URL to fetch
   * @param options - Standard fetch options, headers will be merged with auth headers
   * @returns Promise<Response>
   * @throws Error if user is not authenticated
   */
  const authenticatedFetch = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      if (!isLoaded) {
        throw new Error('Authentication not loaded yet');
      }

      if (!isSignedIn || !userId) {
        throw new Error('User is not authenticated');
      }

      const token = await getToken();
      if (!token) {
        throw new Error('Failed to retrieve authentication token');
      }

      // Merge headers, ensuring Authorization and Content-Type are set
      const headers = new Headers(options.headers);
      headers.set('Authorization', `Bearer ${token}`);
      
      // Only set Content-Type if it's not already set and if there's a body
      if (!headers.has('Content-Type') && options.body) {
        headers.set('Content-Type', 'application/json');
      }

      return fetch(url, {
        ...options,
        headers,
      });
    },
    [getToken, userId, isLoaded, isSignedIn]
  );

  return {
    authenticatedFetch,
    getToken,
    userId,
    isLoaded,
    isSignedIn,
  };
}

