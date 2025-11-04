/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { useState, useCallback } from 'react';

/**
 * Email validation regex (RFC 5322 compliant subset)
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export interface ValidationRule {
	required?: boolean;
	minLength?: number;
	maxLength?: number;
	pattern?: RegExp;
	custom?: (value: string) => string | null; // Return error message or null
}

export interface ValidationRules {
	[key: string]: ValidationRule;
}

/**
 * Hook for form validation with consistent rules
 * 
 * @param rules - Validation rules for each field
 * @param initialErrors - Initial error state
 * @returns Object with errors, validateField, validateForm, and clearErrors functions
 */
export function useFormValidation<T extends Record<string, string>>(
	rules: ValidationRules,
	initialErrors: Partial<Record<keyof T, string>> = {}
) {
	const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>(
		initialErrors
	);

	/**
	 * Validate email address
	 */
	const validateEmail = useCallback((email: string): boolean => {
		if (!email.trim()) return false;
		return EMAIL_REGEX.test(email) && email.length <= 255;
	}, []);

	/**
	 * Validate a single field
	 */
	const validateField = useCallback(
		(name: keyof T, value: string): string | null => {
			const rule = rules[name as string];
			if (!rule) return null;

			// Required check
			if (rule.required && !value.trim()) {
				return `${String(name)} is required`;
			}

			// Skip other validations if field is empty and not required
			if (!value.trim() && !rule.required) {
				return null;
			}

			// Email validation (special case)
			if (name === 'email' && value) {
				if (!validateEmail(value)) {
					return 'Please enter a valid email address';
				}
			}

			// Min length
			if (rule.minLength && value.length < rule.minLength) {
				return `${String(name)} must be at least ${rule.minLength} characters`;
			}

			// Max length
			if (rule.maxLength && value.length > rule.maxLength) {
				return `${String(name)} must be less than ${rule.maxLength} characters`;
			}

			// Pattern match
			if (rule.pattern && !rule.pattern.test(value)) {
				return `${String(name)} format is invalid`;
			}

			// Custom validation
			if (rule.custom) {
				return rule.custom(value);
			}

			return null;
		},
		[rules, validateEmail]
	);

	/**
	 * Validate entire form
	 */
	const validateForm = useCallback(
		(formData: T): boolean => {
			const newErrors: Partial<Record<keyof T, string>> = {};

			Object.keys(rules).forEach((key) => {
				const error = validateField(key as keyof T, formData[key as keyof T] || '');
				if (error) {
					newErrors[key as keyof T] = error;
				}
			});

			setErrors(newErrors);
			return Object.keys(newErrors).length === 0;
		},
		[rules, validateField]
	);

	/**
	 * Clear all errors
	 */
	const clearErrors = useCallback(() => {
		setErrors({});
	}, []);

	/**
	 * Set errors manually
	 */
	const setFieldError = useCallback((name: keyof T, error: string | null) => {
		setErrors((prev) => {
			if (error === null) {
				const { [name]: _, ...rest } = prev;
				return rest;
			}
			return { ...prev, [name]: error };
		});
	}, []);

	return {
		errors,
		validateEmail,
		validateField,
		validateForm,
		clearErrors,
		setFieldError,
	};
}

