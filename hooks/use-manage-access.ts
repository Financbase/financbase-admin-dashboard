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

export interface AccessUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface AccessMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

interface AccessData {
  members: AccessMember[];
}

interface UseManageAccessOptions {
  folderId?: number;
  onUpdate?: () => void;
}

export function useManageAccess(options: UseManageAccessOptions = {}) {
  const { folderId, onUpdate } = options;
  const [data, setData] = useState<AccessData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Transform data to users format for backward compatibility
  const users: AccessUser[] = data?.members.map((member) => ({
    id: member.id,
    name: member.name,
    email: member.email,
    role: member.role,
    avatar: member.avatarUrl,
  })) || [];

  const inviteMember = useCallback(async (email: string, role: string) => {
    setLoading(true);
    setError(null);
    try {
      // Mock API call
      const newMember: AccessMember = {
        id: `user-${Date.now()}`,
        name: email.split("@")[0],
        email,
        role,
      };
      setData((prev) => ({
        members: [...(prev?.members || []), newMember],
      }));
      onUpdate?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to invite member");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [onUpdate]);

  const updateMemberRole = useCallback(async (userId: string, role: string) => {
    setLoading(true);
    setError(null);
    try {
      // Mock API call
      setData((prev) => ({
        members: (prev?.members || []).map((member) =>
          member.id === userId ? { ...member, role } : member
        ),
      }));
      onUpdate?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to update role");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [onUpdate]);

  const removeMember = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Mock API call
      setData((prev) => ({
        members: (prev?.members || []).filter((member) => member.id !== userId),
      }));
      onUpdate?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to remove member");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [onUpdate]);

  const updateAccessLevel = useCallback(async (level: string) => {
    setLoading(true);
    setError(null);
    try {
      // Mock API call
      onUpdate?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to update access level");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [onUpdate]);

  const updateAccess = useCallback(async (userId: string, role: string) => {
    await updateMemberRole(userId, role);
  }, [updateMemberRole]);

  return {
    users,
    data,
    loading,
    isLoading: loading,
    error,
    updateAccess,
    inviteMember,
    updateMemberRole,
    removeMember,
    updateAccessLevel,
  };
}

