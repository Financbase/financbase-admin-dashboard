"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Home, Building2, Users, Eye, Edit } from 'lucide-react';
import { formatCurrency, formatSquareFootage, formatPropertyType, formatROI } from '@/lib/utils/real-estate-formatting';

export interface PropertyCardData {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  purchasePrice: number;
  currentValue?: number;
  squareFootage?: number;
  bedrooms?: number;
  bathrooms?: number;
  status: string;
  monthlyRent?: number;
  occupancyRate?: number;
  roi?: number;
  tenantCount?: number;
  imageUrl?: string;
}

interface PropertyCardProps {
  property: PropertyCardData;
  onView?: (property: PropertyCardData) => void;
  onEdit?: (property: PropertyCardData) => void;
  variant?: 'default' | 'compact' | 'detailed';
}

export function PropertyCard({ 
  property, 
  onView, 
  onEdit, 
  variant = 'default' 
}: PropertyCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'vacant': return 'bg-red-100 text-red-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPropertyTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'residential': return <Home className="h-4 w-4" />;
      case 'commercial': return <Building2 className="h-4 w-4" />;
      default: return <Building2 className="h-4 w-4" />;
    }
  };

  const roiDisplay = property.roi ? formatROI(property.roi) : null;

  if (variant === 'compact') {
    return (
      <Card className="hover:shadow-md transition-all duration-200 hover:scale-105">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getPropertyTypeIcon(property.propertyType)}
              <div>
                <h3 className="font-semibold text-sm">{property.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {property.city}, {property.state}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">
                {property.currentValue ? formatCurrency(property.currentValue) : 'Not set'}
              </p>
              {roiDisplay && (
                <p className={`text-xs ${roiDisplay.color}`}>
                  {roiDisplay.value}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'detailed') {
    return (
      <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {getPropertyTypeIcon(property.propertyType)}
              <div>
                <CardTitle className="text-lg">{property.name}</CardTitle>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />
                  <span>{property.address}, {property.city}, {property.state}</span>
                </div>
              </div>
            </div>
            <Badge className={getStatusColor(property.status)}>
              {property.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Property Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Property Type</p>
              <p className="font-medium">{formatPropertyType(property.propertyType)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Square Footage</p>
              <p className="font-medium">
                {property.squareFootage ? formatSquareFootage(property.squareFootage) : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Bedrooms</p>
              <p className="font-medium">{property.bedrooms || 'N/A'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Bathrooms</p>
              <p className="font-medium">{property.bathrooms || 'N/A'}</p>
            </div>
          </div>

          {/* Financial Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Value</p>
              <p className="text-lg font-bold">
                {property.currentValue ? formatCurrency(property.currentValue) : 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Purchase Price</p>
              <p className="text-sm font-medium">{formatCurrency(property.purchasePrice)}</p>
            </div>
          </div>

          {property.monthlyRent && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Rent</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(property.monthlyRent)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Occupancy</p>
                <p className="text-sm font-medium">
                  {property.occupancyRate || 0}%
                </p>
              </div>
            </div>
          )}

          {/* ROI and Tenant Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {property.tenantCount !== undefined && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {property.tenantCount} tenant{property.tenantCount !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
            {roiDisplay && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">ROI</p>
                <p className={`text-sm font-semibold ${roiDisplay.color}`}>
                  {roiDisplay.value}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => onView?.(property)}>
              <Eye className="mr-2 h-3 w-3" />
              View Details
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit?.(property)}>
              <Edit className="mr-2 h-3 w-3" />
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getPropertyTypeIcon(property.propertyType)}
            <div>
              <CardTitle className="text-lg">{property.name}</CardTitle>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3 w-3" />
                <span>{property.city}, {property.state}</span>
              </div>
            </div>
          </div>
          <Badge className={getStatusColor(property.status)}>
            {property.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current Value</p>
            <p className="text-lg font-bold">
              {property.currentValue ? formatCurrency(property.currentValue) : 'Not set'}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Purchase Price</p>
            <p className="text-sm font-medium">{formatCurrency(property.purchasePrice)}</p>
          </div>
        </div>

        {property.monthlyRent && (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Rent</p>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(property.monthlyRent)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Occupancy</p>
              <p className="text-sm font-medium">
                {property.occupancyRate || 0}%
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {property.tenantCount !== undefined && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {property.tenantCount} tenant{property.tenantCount !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
          {roiDisplay && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">ROI</p>
              <p className={`text-sm font-semibold ${roiDisplay.color}`}>
                {roiDisplay.value}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onView?.(property)}>
            <Eye className="mr-2 h-3 w-3" />
            View Details
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit?.(property)}>
            <Edit className="mr-2 h-3 w-3" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
