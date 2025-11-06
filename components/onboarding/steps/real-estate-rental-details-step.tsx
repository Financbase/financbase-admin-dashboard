/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, User, Calendar, SkipForward } from "lucide-react";
import { toast } from "sonner";

interface RealEstateRentalDetailsStepProps {
  onComplete: (data?: Record<string, unknown>) => void;
  onSkip?: () => void;
}

export function RealEstateRentalDetailsStep({ onComplete, onSkip }: RealEstateRentalDetailsStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [rentalData, setRentalData] = useState({
    monthlyRent: "",
    tenantName: "",
    leaseEndDate: "",
    leaseStartDate: "",
    securityDeposit: "",
    petDeposit: "",
    notes: "",
  });

  const handleSaveDetails = async () => {
    if (!rentalData.monthlyRent) {
      toast.error("Monthly rental income is required");
      return;
    }

    setIsLoading(true);
    try {
      await onComplete({
        rentalDetailsSaved: true,
        rentalData,
        timestamp: new Date().toISOString(),
      });
      toast.success("Rental details saved successfully!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      await onComplete({
        rentalDetailsSaved: false,
        skipped: true,
        timestamp: new Date().toISOString(),
      });
      toast.info("Rental details skipped - you can add them later");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <DollarSign className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold">Set Up Rental Details</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Configure rental income and tenant information to calculate accurate ROI and cash flow projections.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 text-primary mr-2" />
              Rental Information
            </CardTitle>
            <CardDescription>
              Enter tenant details and rental income information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="monthlyRent">Monthly Rental Income *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="monthlyRent"
                    type="number"
                    placeholder="1500"
                    value={rentalData.monthlyRent}
                    onChange={(e) => setRentalData(prev => ({ ...prev, monthlyRent: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="tenantName">Tenant Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="tenantName"
                    placeholder="John Smith"
                    value={rentalData.tenantName}
                    onChange={(e) => setRentalData(prev => ({ ...prev, tenantName: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="leaseStartDate">Lease Start Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="leaseStartDate"
                    type="date"
                    value={rentalData.leaseStartDate}
                    onChange={(e) => setRentalData(prev => ({ ...prev, leaseStartDate: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="leaseEndDate">Lease End Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="leaseEndDate"
                    type="date"
                    value={rentalData.leaseEndDate}
                    onChange={(e) => setRentalData(prev => ({ ...prev, leaseEndDate: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="securityDeposit">Security Deposit</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="securityDeposit"
                    type="number"
                    placeholder="1500"
                    value={rentalData.securityDeposit}
                    onChange={(e) => setRentalData(prev => ({ ...prev, securityDeposit: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="petDeposit">Pet Deposit (if applicable)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="petDeposit"
                    type="number"
                    placeholder="300"
                    value={rentalData.petDeposit}
                    onChange={(e) => setRentalData(prev => ({ ...prev, petDeposit: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Input
                id="notes"
                placeholder="Any additional rental information..."
                value={rentalData.notes}
                onChange={(e) => setRentalData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Why This Matters:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
                  <p>Accurate rental income helps calculate ROI and cash flow</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
                  <p>Lease dates help track upcoming renewals and vacancies</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
                  <p>Deposit tracking ensures proper accounting</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center space-x-4">
        {onSkip && (
          <Button variant="outline" onClick={handleSkip} disabled={isLoading}>
            <SkipForward className="h-4 w-4 mr-2" />
            Skip for now
          </Button>
        )}
        <Button 
          onClick={handleSaveDetails} 
          disabled={isLoading || !rentalData.monthlyRent}
        >
          {isLoading ? "Saving..." : "Save Details"}
        </Button>
      </div>
    </div>
  );
}

