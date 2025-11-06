/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { useState } from 'react';

interface FeedbackData {
  rating: number;
  comment: string;
  category: string;
}

export function useFeedback() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submitFeedback = async (data: FeedbackData): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      // Placeholder feedback submission
      console.log('Submitting feedback:', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubmitted(true);
      return true;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    isSubmitted,
    error: null, // Add error property for compatibility
    submitFeedback,
  };
}