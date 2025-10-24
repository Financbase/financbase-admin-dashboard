"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, MapPin, DollarSign, Calendar, Upload } from "lucide-react";
import { toast } from "sonner";

interface RealEstatePropertyStepProps {
  onComplete: (data?: Record<string, unknown>) => void;
  onSkip?: () => void;
}

export function RealEstatePropertyStep({ onComplete, onSkip }: RealEstatePropertyStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [propertyData, setPropertyData] = useState({
    name: "",
    address: "",
    propertyType: "",
    purchasePrice: "",
    purchaseDate: "",
    bedrooms: "",
    bathrooms: "",
    squareFeet: "",
    description: "",
  });

  const handleAddProperty = async () => {
    setIsLoading(true);
    try {
      await onComplete({
        propertyAdded: true,
        propertyData,
        timestamp: new Date().toISOString(),
      });
      toast.success("Property added successfully!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      await onComplete({
        propertyAdded: false,
        skipped: true,
        timestamp: new Date().toISOString(),
      });
      toast.info("Property setup skipped - you can add properties later");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Home className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold">Add Your First Property</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Let's set up your first rental property to start tracking income, 
          expenses, and performance.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Home className="h-5 w-5 text-primary mr-2" />
              Property Details
            </CardTitle>
            <CardDescription>
              Enter the basic information for your rental property
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Property Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Main Street Duplex"
                  value={propertyData.name}
                  onChange={(e) => setPropertyData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="type">Property Type</Label>
                <Select value={propertyData.propertyType} onValueChange={(value) => setPropertyData(prev => ({ ...prev, propertyType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single-family">Single Family</SelectItem>
                    <SelectItem value="duplex">Duplex</SelectItem>
                    <SelectItem value="triplex">Triplex</SelectItem>
                    <SelectItem value="apartment">Apartment Building</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="address"
                  placeholder="123 Main Street, City, State 12345"
                  value={propertyData.address}
                  onChange={(e) => setPropertyData(prev => ({ ...prev, address: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  placeholder="3"
                  value={propertyData.bedrooms}
                  onChange={(e) => setPropertyData(prev => ({ ...prev, bedrooms: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  step="0.5"
                  placeholder="2.5"
                  value={propertyData.bathrooms}
                  onChange={(e) => setPropertyData(prev => ({ ...prev, bathrooms: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="squareFeet">Square Feet</Label>
                <Input
                  id="squareFeet"
                  type="number"
                  placeholder="1500"
                  value={propertyData.squareFeet}
                  onChange={(e) => setPropertyData(prev => ({ ...prev, squareFeet: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="purchasePrice">Purchase Price</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="purchasePrice"
                    type="number"
                    placeholder="250000"
                    value={propertyData.purchasePrice}
                    onChange={(e) => setPropertyData(prev => ({ ...prev, purchasePrice: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={propertyData.purchaseDate}
                    onChange={(e) => setPropertyData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Any additional notes about the property..."
                value={propertyData.description}
                onChange={(e) => setPropertyData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Import from Spreadsheet</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Have multiple properties? You can import them from a CSV file.
              </p>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload CSV
              </Button>
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
          onClick={handleAddProperty} 
          disabled={isLoading || !propertyData.name || !propertyData.address}
        >
          {isLoading ? "Adding Property..." : "Add Property"}
        </Button>
      </div>
    </div>
  );
}
