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

export interface ShareConfig {
  folderId: string;
  permissions: string[];
  users: string[];
}

export interface FolderUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "Owner" | "Editor" | "Viewer";
}

interface FolderSharingData {
  members: FolderUser[];
  users?: FolderUser[];
  folder?: {
    id: string;
    name: string;
    shared: boolean;
  };
}

export function useFolderSharing(folderId?: string) {
  const [data, setData] = useState<FolderSharingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const shareFolder = useCallback(async (config: ShareConfig) => {
    setLoading(true);
    try {
      // Mock API call
      setData({ members: [] });
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to share folder");
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const inviteUser = useCallback(async (email: string, role: "owner" | "editor" | "viewer"): Promise<{ success: boolean }> => {
    setLoading(true);
    setError(null);
    try {
      // Mock API call
      const newUser: FolderUser = {
        id: `user-${Date.now()}`,
        name: email.split("@")[0],
        email,
        role: role === "owner" ? "Owner" : role === "editor" ? "Editor" : "Viewer",
      };
      setData((prev) => ({
        members: [...(prev?.members || []), newUser],
      }));
      return { success: true };
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to invite user");
      setError(error);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const changeUserRole = useCallback(async (userId: string, role: "owner" | "editor" | "viewer"): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      // Mock API call
      setData((prev) => ({
        members: (prev?.members || []).map((member) =>
          member.id === userId
            ? { ...member, role: role === "owner" ? "Owner" : role === "editor" ? "Editor" : "Viewer" }
            : member
        ),
      }));
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to change user role");
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    shareFolder,
    inviteUser,
    changeUserRole,
  };
}

