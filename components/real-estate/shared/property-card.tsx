"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Calendar,
  Eye,
  Edit,
  Heart,
  Star
} from 'lucide-react';
import { formatCurrency, formatDate, formatSquareFootage } from '@/lib/utils/real-estate-formatting';

export interface PropertyCardData {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  propertyType: string;
  status?: 'active' | 'pending' | 'sold' | 'off_market' | null;
  imageUrl?: string;
  description?: string;
  features?: string[];
  monthlyPayment?: number;
  savedDate?: string;
  notes?: string;
  rating?: number;
}

interface PropertyCardProps {
  property: PropertyCardData;
  variant?: 'default' | 'compact' | 'detailed';
  onView?: (property: PropertyCardData) => void;
  onEdit?: (property: PropertyCardData) => void;
  onSave?: (property: PropertyCardData) => void;
  onSchedule?: (property: PropertyCardData) => void;
  className?: string;
}

export function PropertyCard({ 
  property, 
  variant = 'default', 
  onView, 
  onEdit, 
  onSave, 
  onSchedule,
  className = '' 
}: PropertyCardProps) {
  const getStatusColor = (status?: string | null) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'sold':
        return 'bg-blue-100 text-blue-800';
      case 'off_market':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status?: string | null) => {
    if (!status) return 'Unknown';
    return status.replace('_', ' ');
  };

  if (variant === 'compact') {
    return (
      <Card className={`hover:shadow-md transition-all duration-200 hover:scale-105 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm truncate">{property.name}</h3>
            <Badge className={getStatusColor(property.status)}>
              {formatStatus(property.status)}
            </Badge>
          </div>
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="truncate">{property.city}, {property.state}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-lg">{formatCurrency(property.price)}</span>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center">
                <Bed className="h-3 w-3 mr-1" />
                {property.bedrooms}
              </span>
              <span className="flex items-center">
                <Bath className="h-3 w-3 mr-1" />
                {property.bathrooms}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'detailed') {
    return (
      <Card className={`hover:shadow-lg transition-all duration-200 hover:scale-105 ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-1">{property.name}</CardTitle>
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{property.city}, {property.state}</span>
              </div>
              <Badge className={getStatusColor(property.status)}>
                {property.status.replace('_', ' ')}
              </Badge>
            </div>
            {property.rating && (
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="ml-1 text-sm font-medium">{property.rating}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Price and Payment */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="text-xl font-bold">{formatCurrency(property.price)}</p>
            </div>
            {property.monthlyPayment && (
              <div>
                <p className="text-sm text-muted-foreground">Monthly Payment</p>
                <p className="text-lg font-semibold">{formatCurrency(property.monthlyPayment)}</p>
              </div>
            )}
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Bedrooms</p>
              <p className="font-semibold">{property.bedrooms}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bathrooms</p>
              <p className="font-semibold">{property.bathrooms}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Square Feet</p>
              <p className="font-semibold">{formatSquareFootage(property.squareFootage)}</p>
            </div>
          </div>

          {/* Saved Date */}
          {property.savedDate && (
            <div>
              <p className="text-sm text-muted-foreground">Saved</p>
              <p className="text-sm">{formatDate(property.savedDate)}</p>
            </div>
          )}

          {/* Notes */}
          {property.notes && (
            <div>
              <p className="text-sm text-muted-foreground">Notes:</p>
              <p className="text-sm">{property.notes}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {onView && (
              <Button variant="outline" size="sm" onClick={() => onView(property)}>
                <Eye className="h-4 w-4 mr-1" />
                View Details
              </Button>
            )}
            {onSchedule && (
              <Button variant="outline" size="sm" onClick={() => onSchedule(property)}>
                <Calendar className="h-4 w-4 mr-1" />
                Schedule Tour
              </Button>
            )}
            {onSave && (
              <Button variant="outline" size="sm" onClick={() => onSave(property)}>
                <Heart className="h-4 w-4 mr-1" />
                Save
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className={`hover:shadow-lg transition-all duration-200 hover:scale-105 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{property.name}</h3>
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{property.city}, {property.state}</span>
            </div>
            <Badge className={getStatusColor(property.status)}>
              {formatStatus(property.status)}
            </Badge>
          </div>
          {property.rating && (
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="ml-1 text-sm font-medium">{property.rating}</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{formatCurrency(property.price)}</span>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center">
                <Bed className="h-4 w-4 mr-1" />
                {property.bedrooms}
              </span>
              <span className="flex items-center">
                <Bath className="h-4 w-4 mr-1" />
                {property.bathrooms}
              </span>
              <span className="flex items-center">
                <Square className="h-4 w-4 mr-1" />
                {formatSquareFootage(property.squareFootage)}
              </span>
            </div>
          </div>

          {property.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {property.description}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            {onView && (
              <Button variant="outline" size="sm" onClick={() => onView(property)}>
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
            )}
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(property)}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}