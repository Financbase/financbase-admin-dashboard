"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Home,
  TrendingUp,
  Users,
  DollarSign,
  Search,
  Calculator,
  Briefcase,
  Heart,
} from 'lucide-react';
import { RealEstateRole } from '@/lib/hooks/use-real-estate-role';

interface RoleOption {
  id: RealEstateRole;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
}

const roleOptions: RoleOption[] = [
  {
    id: 'investor',
    title: 'Property Investor',
    description: 'Manage your real estate portfolio and track investment performance',
    icon: <TrendingUp className="h-8 w-8" />,
    color: 'bg-green-500',
    features: [
      'Portfolio analytics & ROI tracking',
      'Cash flow management',
      'Property performance metrics',
      'Tenant & lease management',
      'Expense tracking',
    ],
  },
  {
    id: 'realtor',
    title: 'Real Estate Agent',
    description: 'Manage listings, leads, and client relationships',
    icon: <Briefcase className="h-8 w-8" />,
    color: 'bg-blue-500',
    features: [
      'Active listings management',
      'Lead pipeline tracking',
      'Commission tracking',
      'Market analytics',
      'Client relationship tools',
    ],
  },
  {
    id: 'buyer',
    title: 'Home Buyer',
    description: 'Find your dream home and manage the buying process',
    icon: <Heart className="h-8 w-8" />,
    color: 'bg-purple-500',
    features: [
      'Property search & comparison',
      'Affordability calculator',
      'Mortgage pre-qualification',
      'Offer tracking',
      'Document checklist',
    ],
  },
];

interface RoleSelectorProps {
  onRoleSelect: (role: RealEstateRole) => void;
  currentRole?: RealEstateRole | null;
}

export function RoleSelector({ onRoleSelect, currentRole }: RoleSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Welcome to Real Estate Platform</h1>
        <p className="text-muted-foreground text-lg">
          Choose your role to access personalized tools and insights
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {roleOptions.map((option) => (
          <Card
            key={option.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              currentRole === option.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onRoleSelect(option.id)}
          >
            <CardHeader className="text-center">
              <div className={`${option.color} rounded-full w-16 h-16 flex items-center justify-center text-white mx-auto mb-4`}>
                {option.icon}
              </div>
              <CardTitle className="text-xl">{option.title}</CardTitle>
              <p className="text-muted-foreground text-sm">
                {option.description}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {option.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <Button 
                className="w-full mt-4" 
                variant={currentRole === option.id ? 'default' : 'outline'}
              >
                {currentRole === option.id ? 'Current Role' : 'Select Role'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {currentRole && (
        <div className="text-center">
          <Badge variant="secondary" className="text-sm">
            Current Role: {roleOptions.find(r => r.id === currentRole)?.title}
          </Badge>
        </div>
      )}
    </div>
  );
}
