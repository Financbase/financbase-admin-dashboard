/**
 * Editable Content Component
 * 
 * Provides contenteditable functionality with validation and sanitization.
 * Useful for user-suggested content, inline editing, and FAQ sections.
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { sanitizeHtml as sanitizeHtmlUtil, sanitizeText as sanitizeTextUtil } from '@/lib/utils/sanitize';

export interface EditableProps {
  /**
   * Initial content
   */
  children: React.ReactNode;
  /**
   * Callback when content changes
   */
  onChange?: (content: string) => void;
  /**
   * Callback when content is saved
   */
  onSave?: (content: string) => void;
  /**
   * Validation function
   */
  validate?: (content: string) => boolean | string;
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Whether editing is enabled
   */
  editable?: boolean;
  /**
   * Show save button
   */
  showSaveButton?: boolean;
  /**
   * Additional className
   */
  className?: string;
  /**
   * Content type (affects allowed HTML)
   */
  contentType?: 'text' | 'html' | 'plain';
  /**
   * Maximum length
   */
  maxLength?: number;
  /**
   * Minimum length
   */
  minLength?: number;
}

/**
 * Sanitize HTML content
 * Uses shared sanitization utility for consistency
 */
function sanitizeHtml(html: string): string {
  return sanitizeHtmlUtil(html);
}

/**
 * Sanitize plain text
 */
function sanitizeText(text: string): string {
  return sanitizeTextUtil(text);
}

/**
 * Editable Content Component
 */
export function Editable({
  children,
  onChange,
  onSave,
  validate,
  placeholder = 'Click to edit...',
  editable = true,
  showSaveButton = false,
  className,
  contentType = 'html',
  maxLength,
  minLength,
}: EditableProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [content, setContent] = React.useState(
    typeof children === 'string' ? children : ''
  );
  const [error, setError] = React.useState<string | null>(null);
  const editableRef = React.useRef<HTMLDivElement>(null);

  const handleFocus = React.useCallback(() => {
    if (editable) {
      setIsEditing(true);
    }
  }, [editable]);

  const handleBlur = React.useCallback(() => {
    setIsEditing(false);
    const newContent = editableRef.current?.innerHTML || '';
    handleSave(newContent);
  }, []);

  const handleInput = React.useCallback(
    (e: React.FormEvent<HTMLDivElement>) => {
      const newContent = e.currentTarget.innerHTML;
      setContent(newContent);
      
      // Validate length
      const textContent = e.currentTarget.textContent || '';
      if (maxLength && textContent.length > maxLength) {
        setError(`Content exceeds maximum length of ${maxLength} characters`);
        return;
      }
      if (minLength && textContent.length < minLength) {
        setError(`Content must be at least ${minLength} characters`);
        return;
      }
      
      setError(null);
      onChange?.(newContent);
    },
    [onChange, maxLength, minLength]
  );

  const handleSave = React.useCallback(
    (contentToSave: string) => {
      // Sanitize content based on type
      let sanitized = contentToSave;
      if (typeof document !== 'undefined') {
        if (contentType === 'html') {
          sanitized = sanitizeHtml(contentToSave);
        } else if (contentType === 'plain') {
          sanitized = sanitizeText(contentToSave);
        }
      }

      // Validate
      if (validate) {
        const validationResult = validate(sanitized);
        if (validationResult !== true) {
          setError(
            typeof validationResult === 'string'
              ? validationResult
              : 'Validation failed'
          );
          return;
        }
      }

      setError(null);
      setContent(sanitized);
      onSave?.(sanitized);
    },
    [validate, onSave, contentType]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      // Save on Enter (for single-line)
      if (e.key === 'Enter' && !e.shiftKey && contentType === 'plain') {
        e.preventDefault();
        handleSave(e.currentTarget.innerHTML);
        setIsEditing(false);
        editableRef.current?.blur();
      }
      // Save on Ctrl/Cmd + Enter
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSave(e.currentTarget.innerHTML);
        setIsEditing(false);
        editableRef.current?.blur();
      }
      // Cancel on Escape
      if (e.key === 'Escape') {
        setIsEditing(false);
        editableRef.current?.blur();
        // Restore original content
        if (editableRef.current) {
          editableRef.current.innerHTML = content;
        }
      }
    },
    [content, handleSave, contentType]
  );

  return (
    <div className={cn('relative', className)}>
      <div
        ref={editableRef}
        contentEditable={editable}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className={cn(
          'outline-none',
          isEditing && 'ring-2 ring-ring ring-offset-2 rounded-md',
          error && 'ring-2 ring-destructive',
          !content && 'text-muted-foreground'
        )}
        data-placeholder={placeholder}
        suppressContentEditableWarning
        dangerouslySetInnerHTML={{ __html: content || '' }}
      />
      {error && (
        <p className="mt-1 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {showSaveButton && isEditing && (
        <button
          type="button"
          onClick={() => {
            const contentToSave = editableRef.current?.innerHTML || '';
            handleSave(contentToSave);
            setIsEditing(false);
            editableRef.current?.blur();
          }}
          className="mt-2 text-sm text-primary hover:underline"
        >
          Save
        </button>
      )}
      <style jsx>{`
        div[contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: var(--muted-foreground);
        }
      `}</style>
    </div>
  );
}

