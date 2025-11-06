/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface CookiePreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function CookiePreferencesModal({
  isOpen,
  onClose,
}: CookiePreferencesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cookie Preferences</DialogTitle>
          <DialogDescription>
            Manage your cookie preferences for this website.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Analytics Cookies</Label>
              <p className="text-sm text-muted-foreground">
                Help us improve our website
              </p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Marketing Cookies</Label>
              <p className="text-sm text-muted-foreground">
                Show relevant advertisements
              </p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Preference Cookies</Label>
              <p className="text-sm text-muted-foreground">
                Remember your settings
              </p>
            </div>
            <Switch />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onClose}>Save Preferences</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { CookiePreferencesModal };
export default CookiePreferencesModal;
