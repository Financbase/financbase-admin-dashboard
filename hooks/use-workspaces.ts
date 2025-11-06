/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState, useCallback } from "react";

export interface Workspace {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  plan?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchWorkspaces = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Mock data - replace with actual API call
      const mockWorkspaces: Workspace[] = [];
      setWorkspaces(mockWorkspaces);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch workspaces");
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createWorkspace = useCallback(async (data: {
    name: string;
    slug: string;
    description?: string;
    logo?: string;
    plan?: string;
  }): Promise<Workspace> => {
    setLoading(true);
    setError(null);
    try {
      // Mock creation - replace with actual API call
      const newWorkspace: Workspace = {
        id: `workspace-${Date.now()}`,
        workspaceId: data.slug,
        name: data.name,
        slug: data.slug,
        description: data.description,
        logo: data.logo,
        plan: data.plan,
      };
      setWorkspaces((prev) => [...prev, newWorkspace]);
      return newWorkspace;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to create workspace");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const selectWorkspace = useCallback((workspace: Workspace) => {
    setSelectedWorkspace(workspace);
  }, []);

  return {
    workspaces,
    selectedWorkspace,
    loading,
    error,
    fetchWorkspaces,
    createWorkspace,
    selectWorkspace,
  };
}

