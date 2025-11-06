/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Mail, UserPlus, Eye, SkipForward } from "lucide-react";
import { toast } from "sonner";

interface InviteAdvisorsStepProps {
  onComplete: (data?: Record<string, unknown>) => void;
  onSkip?: () => void;
}

export function InviteAdvisorsStep({ onComplete, onSkip }: InviteAdvisorsStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [invites, setInvites] = useState<Array<{ email: string; role: string; name: string }>>([]);
  const [currentInvite, setCurrentInvite] = useState({
    name: "",
    email: "",
    role: "",
  });

  const handleAddInvite = () => {
    if (!currentInvite.email || !currentInvite.role) {
      toast.error("Email and role are required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(currentInvite.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setInvites(prev => [...prev, { ...currentInvite }]);
    setCurrentInvite({ name: "", email: "", role: "" });
    toast.success("Advisor added to invite list");
  };

  const handleRemoveInvite = (index: number) => {
    setInvites(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendInvites = async () => {
    setIsLoading(true);
    try {
      await onComplete({
        invitesSent: true,
        inviteCount: invites.length,
        invites,
        timestamp: new Date().toISOString(),
      });
      toast.success(`Invited ${invites.length} advisors!`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      await onComplete({
        invitesSent: false,
        skipped: true,
        timestamp: new Date().toISOString(),
      });
      toast.info("Advisor invites skipped - you can invite them later");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Users className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold">Invite Advisors & Investors</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Give your advisors and investors read-only access to view financial reports 
          and metrics. They can monitor your progress without needing full access to your account.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="h-5 w-5 text-primary mr-2" />
              Add Advisors
            </CardTitle>
            <CardDescription>
              Invite advisors, investors, or board members to view reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Advisor name"
                  value={currentInvite.name}
                  onChange={(e) => setCurrentInvite(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="advisor@vc.com"
                  value={currentInvite.email}
                  onChange={(e) => setCurrentInvite(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={currentInvite.role} onValueChange={(value) => setCurrentInvite(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="advisor">Advisor</SelectItem>
                  <SelectItem value="investor">Investor</SelectItem>
                  <SelectItem value="board-member">Board Member</SelectItem>
                  <SelectItem value="accountant">Accountant</SelectItem>
                  <SelectItem value="read-only">Read-Only Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleAddInvite} 
              disabled={!currentInvite.email || !currentInvite.role}
              className="w-full"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add to Invite List
            </Button>
          </CardContent>
        </Card>

        {invites.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 text-primary mr-2" />
                Invite List ({invites.length})
              </CardTitle>
              <CardDescription>
                Review and send invitations to your advisors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {invites.map((invite, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{invite.name || invite.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {invite.email} • {invite.role.replace('-', ' ')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveInvite(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}

              <div className="pt-4 border-t">
                <Button 
                  onClick={handleSendInvites} 
                  disabled={isLoading}
                  className="w-full"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {isLoading ? "Sending Invites..." : `Send ${invites.length} Invitations`}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-semibold mb-2 flex items-center">
            <Eye className="h-4 w-4 text-primary mr-2" />
            Read-Only Access Benefits:
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
              <p>Advisors can view financial reports and metrics without full account access</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
              <p>Investors can monitor progress and performance</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
              <p>Board members stay informed with automated reports</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
              <p>Secure access with role-based permissions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        {onSkip && (
          <Button variant="outline" onClick={handleSkip} disabled={isLoading}>
            <SkipForward className="h-4 w-4 mr-2" />
            I'll invite them later
          </Button>
        )}
        {invites.length > 0 && (
          <Button 
            onClick={handleSendInvites} 
            disabled={isLoading}
          >
            <Mail className="h-4 w-4 mr-2" />
            {isLoading ? "Sending..." : "Send Invitations"}
          </Button>
        )}
      </div>
    </div>
  );
}

