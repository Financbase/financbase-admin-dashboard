"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  TrendingUp,
  Briefcase,
  Heart,
  ChevronDown,
  Check,
} from 'lucide-react';
import { RealEstateRole } from '@/lib/hooks/use-real-estate-role';
import { useRouter } from 'next/navigation';

interface RoleSwitcherProps {
  currentRole: RealEstateRole;
  onRoleChange: (role: RealEstateRole) => void;
}

const roleConfig = {
  investor: {
    title: 'Property Investor',
    icon: <TrendingUp className="h-4 w-4" />,
    color: 'bg-green-500',
  },
  realtor: {
    title: 'Real Estate Agent',
    icon: <Briefcase className="h-4 w-4" />,
    color: 'bg-blue-500',
  },
  buyer: {
    title: 'Home Buyer',
    icon: <Heart className="h-4 w-4" />,
    color: 'bg-purple-500',
  },
};

export function RoleSwitcher({ currentRole, onRoleChange }: RoleSwitcherProps) {
  const router = useRouter();
  const currentConfig = roleConfig[currentRole];

  const handleRoleChange = (newRole: RealEstateRole) => {
    onRoleChange(newRole);
    router.push(`/real-estate/${newRole}`);
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="text-sm">
        <span className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${currentConfig.color}`} />
          {currentConfig.title}
        </span>
      </Badge>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            Switch Role
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {Object.entries(roleConfig).map(([role, config]) => (
            <DropdownMenuItem
              key={role}
              onClick={() => handleRoleChange(role as RealEstateRole)}
              className="flex items-center gap-2"
            >
              <div className={`w-3 h-3 rounded-full ${config.color}`} />
              <span className="flex-1">{config.title}</span>
              {role === currentRole && <Check className="h-3 w-3" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
