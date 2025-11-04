/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HelpCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';

export function TourPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      title: 'Welcome to the Dashboard',
      content: 'This is your main dashboard where you can view all your financial data and analytics.',
    },
    {
      title: 'Navigation Menu',
      content: 'Use the sidebar to navigate between different sections of the application.',
    },
    {
      title: 'Analytics Overview',
      content: 'Monitor your portfolio performance and key metrics in real-time.',
    },
    {
      title: 'Settings & Profile',
      content: 'Customize your experience and manage your account settings.',
    },
  ];

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const closeTour = () => {
    setIsOpen(false);
    setCurrentStep(1);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <HelpCircle className="h-4 w-4 mr-2" />
          Start Tour
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{steps[currentStep - 1].title}</h3>
            <Button variant="ghost" size="sm" onClick={closeTour}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            {steps[currentStep - 1].content}
          </p>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Step {currentStep} of {steps.length}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextStep}
                disabled={currentStep === steps.length}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
