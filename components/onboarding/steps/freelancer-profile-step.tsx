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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Phone, MapPin, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface FreelancerProfileStepProps {
  onComplete: (data?: Record<string, unknown>) => void;
  onSkip?: () => void;
}

export function FreelancerProfileStep({ onComplete, onSkip }: FreelancerProfileStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    businessName: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    businessType: "",
    hourlyRate: "",
    description: "",
  });

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await onComplete({
        profileCompleted: true,
        profileData,
        timestamp: new Date().toISOString(),
      });
      toast.success("Profile saved successfully!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      await onComplete({
        profileCompleted: false,
        skipped: true,
        timestamp: new Date().toISOString(),
      });
      toast.info("Profile setup skipped - you can complete this later");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <User className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold">Set Up Your Freelancer Profile</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Tell us about your freelance business so we can customize your 
          experience and help you get paid faster.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 text-primary mr-2" />
              Business Information
            </CardTitle>
            <CardDescription>
              This information will be used on your invoices and business documents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  placeholder="Your Business Name"
                  value={profileData.businessName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, businessName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="businessType">Business Type</Label>
                <Select value={profileData.businessType} onValueChange={(value) => setProfileData(prev => ({ ...prev, businessType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="writing">Writing</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="photography">Photography</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="address"
                  placeholder="123 Main Street"
                  value={profileData.address}
                  onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="New York"
                  value={profileData.city}
                  onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="NY"
                  value={profileData.state}
                  onChange={(e) => setProfileData(prev => ({ ...prev, state: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  placeholder="10001"
                  value={profileData.zipCode}
                  onChange={(e) => setProfileData(prev => ({ ...prev, zipCode: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="hourlyRate">Default Hourly Rate</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="hourlyRate"
                  type="number"
                  placeholder="75"
                  value={profileData.hourlyRate}
                  onChange={(e) => setProfileData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Business Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of your services..."
                value={profileData.description}
                onChange={(e) => setProfileData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center space-x-4">
        {onSkip && (
          <Button variant="outline" onClick={handleSkip} disabled={isLoading}>
            Skip for now
          </Button>
        )}
        <Button 
          onClick={handleSaveProfile} 
          disabled={isLoading || !profileData.businessName || !profileData.firstName}
        >
          {isLoading ? "Saving Profile..." : "Save Profile"}
        </Button>
      </div>
    </div>
  );
}
