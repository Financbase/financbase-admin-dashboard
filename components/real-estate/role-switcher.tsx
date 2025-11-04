/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Home, Briefcase, DollarSign } from 'lucide-react';

interface RoleSwitcherProps {
  currentRole: 'investor' | 'realtor' | 'buyer';
  onRoleChange: (role: 'investor' | 'realtor' | 'buyer') => void;
}

const roleMap = {
  investor: { label: 'Property Investor', icon: DollarSign },
  realtor: { label: 'Real Estate Agent', icon: Briefcase },
  buyer: { label: 'Home Buyer', icon: Home },
};

export function RoleSwitcher({ currentRole, onRoleChange }: RoleSwitcherProps) {
  const CurrentIcon = roleMap[currentRole]?.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {CurrentIcon && <CurrentIcon className="h-4 w-4" />}
          {roleMap[currentRole]?.label}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(roleMap).map(([roleKey, { label, icon: Icon }]) => (
          <DropdownMenuItem key={roleKey} onClick={() => onRoleChange(roleKey as any)}>
            <Icon className="mr-2 h-4 w-4" />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}