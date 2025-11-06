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

export interface TourStep {
  id: string;
  target: string;
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
}

export interface TourOptions {
  steps: TourStep[];
  onComplete?: () => void;
  onSkip?: () => void;
}

export function useTour(options: TourOptions = { steps: [] }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const start = useCallback(() => {
    setCurrentStep(0);
    setIsOpen(true);
    setCompletedSteps(new Set());
  }, []);

  const next = useCallback(() => {
    if (currentStep < options.steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      setCompletedSteps((prev) => new Set([...prev, options.steps[currentStep].id]));
    } else {
      complete();
    }
  }, [currentStep, options.steps]);

  const previous = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const skip = useCallback(() => {
    setIsOpen(false);
    setCurrentStep(0);
    options.onSkip?.();
  }, [options]);

  const complete = useCallback(() => {
    setIsOpen(false);
    setCurrentStep(0);
    setCompletedSteps((prev) => new Set([...prev, options.steps[currentStep]?.id]));
    options.onComplete?.();
  }, [currentStep, options]);

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < options.steps.length) {
      setCurrentStep(stepIndex);
      setIsOpen(true);
    }
  }, [options.steps.length]);

  const isCompleted = completedSteps.size === options.steps.length && options.steps.length > 0;
  const isLoading = false; // Can be extended for async operations
  const error = null; // Can be extended for error handling

  return {
    currentStep,
    isOpen,
    setIsOpen,
    completedSteps,
    start,
    next,
    previous,
    skip,
    complete,
    goToStep,
    nextStep: next,
    prevStep: previous,
    restartTour: start,
    currentStepData: options.steps[currentStep],
    totalSteps: options.steps.length,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === options.steps.length - 1,
    isCompleted,
    isLoading,
    error,
  };
}

