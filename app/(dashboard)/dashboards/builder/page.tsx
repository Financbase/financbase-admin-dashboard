"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardBuilder } from '@/components/dashboard/custom/dashboard-builder';
import { useToast } from '@/components/ui/use-toast';

export default function DashboardBuilderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (dashboard: any) => {
    setIsSaving(true);
    try {
      // The save logic is handled by the DashboardBuilder component
      toast({
        title: 'Success',
        description: 'Dashboard saved successfully!',
      });
      
      // Navigate to the dashboard view
      router.push(`/dashboards/${dashboard.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save dashboard. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="h-screen">
      <DashboardBuilder
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
}
