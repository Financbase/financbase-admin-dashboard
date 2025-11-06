/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState, useEffect, useCallback } from "react";

interface UseCameraPermissionOptions {
  onPermissionChange?: (status: PermissionState) => void;
  onError?: (errorMessage: string) => void;
}

export function useCameraPermission(options: UseCameraPermissionOptions = {}) {
  const { onPermissionChange, onError } = options;
  const [status, setStatus] = useState<PermissionState>("prompt");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && "permissions" in navigator) {
      setIsSupported(true);
      navigator.permissions.query({ name: "camera" as PermissionName }).then((result) => {
        setStatus(result.state);
        result.onchange = () => {
          setStatus(result.state);
          onPermissionChange?.(result.state);
        };
      }).catch(() => {
        setIsSupported(false);
      });
    }
  }, [onPermissionChange]);

  const requestPermission = useCallback(async () => {
    try {
      setIsLoading(true);
      setHasInteracted(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setStatus("granted");
      onPermissionChange?.("granted");
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to access camera";
      setError(errorMessage);
      setStatus("denied");
      onPermissionChange?.("denied");
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [onPermissionChange, onError]);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    status,
    isLoading,
    error,
    isSupported,
    requestPermission,
    resetError,
    hasInteracted,
  };
}

