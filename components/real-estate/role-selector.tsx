"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    icon: <Home className="h-8 w-8" />,
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
  currentRole: RealEstateRole;
}

export function RoleSelector({ onRoleSelect, currentRole }: RoleSelectorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Welcome to Real Estate Platform
        </h1>
        <p className="text-xl text-muted-foreground">
          Choose your role to access personalized tools and insights
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 w-full max-w-6xl">
        {roleOptions.map((option) => (
          <Card
            key={option.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
              currentRole === option.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onRoleSelect(option.id)}
          >
            <CardHeader className="text-center">
              <div className={`${option.color} rounded-full p-4 w-fit mx-auto mb-4`}>
                <div className="text-white">
                  {option.icon}
                </div>
              </div>
              <CardTitle className="text-xl">{option.title}</CardTitle>
              <p className="text-muted-foreground">{option.description}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {option.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="w-full mt-6" variant={currentRole === option.id ? 'default' : 'outline'}>
                Select Role
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}