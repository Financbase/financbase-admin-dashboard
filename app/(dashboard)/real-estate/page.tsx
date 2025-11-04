/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RoleSelector } from '@/components/real-estate/role-selector';
import { useRealEstateRole } from '@/lib/hooks/use-real-estate-role';
import { Loader2 } from 'lucide-react';

export default function RealEstatePage() {
  const { role, updateRole, isLoading } = useRealEstateRole();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && role) {
      // Redirect to the appropriate dashboard based on role
      router.push(`/real-estate/${role}`);
    }
  }, [role, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (role) {
    // This will be handled by the useEffect redirect
    return (
      <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
      <RoleSelector onRoleSelect={updateRole} currentRole={role} />
    </div>
  );
}
