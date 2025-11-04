/**
 * Native Dialog Component
 * 
 * Wrapper around native HTML5 <dialog> element with showModal() and close() functionality.
 * Falls back to Radix UI Dialog if native dialog is not supported.
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


'use client';

import * as React from 'react';
import { Dialog as RadixDialog } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export interface NativeDialogProps {
  /**
   * Dialog content
   */
  children: React.ReactNode;
  /**
   * Whether dialog is open
   */
  open?: boolean;
  /**
   * Callback when dialog should open
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Dialog title (for accessibility)
   */
  title?: string;
  /**
   * Use native dialog (default: true if supported)
   */
  useNative?: boolean;
  /**
   * Additional className
   */
  className?: string;
  /**
   * Close on Escape key (default: true)
   */
  closeOnEscape?: boolean;
  /**
   * Close on backdrop click (default: true)
   */
  closeOnBackdropClick?: boolean;
}

/**
 * Check if native dialog is supported
 */
function isNativeDialogSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'showModal' in document.createElement('dialog');
}

/**
 * Native Dialog Component
 */
export function NativeDialog({
  children,
  open = false,
  onOpenChange,
  title,
  useNative,
  className,
  closeOnEscape = true,
  closeOnBackdropClick = true,
}: NativeDialogProps) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const [useNativeDialog, setUseNativeDialog] = React.useState(
    useNative ?? isNativeDialogSupported()
  );

  // Handle open/close state
  React.useEffect(() => {
    if (!dialogRef.current) return;

    if (open) {
      dialogRef.current.showModal();
    } else {
      dialogRef.current.close();
    }
  }, [open]);

  // Handle Escape key
  React.useEffect(() => {
    if (!dialogRef.current || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange?.(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, closeOnEscape, onOpenChange]);

  // Handle backdrop click
  const handleBackdropClick = React.useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (!closeOnBackdropClick) return;
      
      // If click target is the dialog itself (not children), close it
      if (e.target === e.currentTarget) {
        onOpenChange?.(false);
      }
    },
    [closeOnBackdropClick, onOpenChange]
  );

  // Use Radix UI fallback if native dialog not supported
  if (!useNativeDialog) {
    return (
      <RadixDialog open={open} onOpenChange={onOpenChange}>
        {children}
      </RadixDialog>
    );
  }

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200',
        'backdrop:bg-black/80',
        'open:animate-in open:fade-in-0 open:zoom-in-95 open:slide-in-from-left-1/2 open:slide-in-from-top-[48%]',
        'closed:animate-out closed:fade-out-0 closed:zoom-out-95 closed:slide-out-to-left-1/2 closed:slide-out-to-top-[48%]',
        'sm:rounded-lg',
        className
      )}
      onClick={handleBackdropClick}
      aria-label={title}
    >
      {children}
    </dialog>
  );
}

/**
 * Native Dialog Trigger
 * Button that opens the dialog
 */
export interface NativeDialogTriggerProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function NativeDialogTrigger({
  children,
  onClick,
  className,
}: NativeDialogTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
    >
      {children}
    </button>
  );
}

/**
 * Hook to use native dialog programmatically
 */
export function useNativeDialog() {
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  const showModal = React.useCallback(() => {
    dialogRef.current?.showModal();
  }, []);

  const show = React.useCallback(() => {
    dialogRef.current?.show();
  }, []);

  const close = React.useCallback((returnValue?: string) => {
    dialogRef.current?.close(returnValue);
  }, []);

  return {
    dialogRef,
    showModal,
    show,
    close,
  };
}

