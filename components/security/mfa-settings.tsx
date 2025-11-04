"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { 
  Shield, 
  Smartphone, 
  Mail, 
  Key, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Copy,
  Download,
  QrCode,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function MFASettings() {
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch MFA settings
  const { data: mfaSettings, isLoading } = useQuery({
    queryKey: ['mfa-settings'],
    queryFn: async () => {
      const response = await fetch('/api/security/mfa');
      return response.json();
    },
  });

  // Setup MFA mutation
  const setupMFAMutation = useMutation({
    mutationFn: async (mfaType: 'totp' | 'sms' | 'email') => {
      const response = await fetch('/api/security/mfa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mfaType }),
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['mfa-settings']);
      toast({
        title: 'MFA Setup Initiated',
        description: 'Please scan the QR code with your authenticator app.',
      });
    },
  });

  // Verify MFA mutation
  const verifyMFAMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await fetch('/api/security/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['mfa-settings']);
      toast({
        title: 'MFA Enabled',
        description: 'Multi-factor authentication has been successfully enabled.',
      });
      setVerificationCode('');
      setShowQRCode(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Verification Failed',
        description: error.message || 'Invalid verification code.',
        variant: 'destructive',
      });
    },
  });

  // Disable MFA mutation
  const disableMFAMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/security/mfa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['mfa-settings']);
      toast({
        title: 'MFA Disabled',
        description: 'Multi-factor authentication has been disabled.',
      });
    },
  });

  // Generate backup codes mutation
  const generateBackupCodesMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/security/mfa/backup-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['mfa-settings']);
      toast({
        title: 'Backup Codes Generated',
        description: 'New backup codes have been generated.',
      });
    },
  });

  const handleSetupMFA = (mfaType: 'totp' | 'sms' | 'email') => {
    setupMFAMutation.mutate(mfaType);
  };

  const handleVerifyMFA = () => {
    if (!verificationCode.trim()) {
      toast({
        title: 'Verification Code Required',
        description: 'Please enter a verification code.',
        variant: 'destructive',
      });
      return;
    }
    verifyMFAMutation.mutate(verificationCode);
  };

  const handleDisableMFA = () => {
    if (confirm('Are you sure you want to disable MFA? This will reduce your account security.')) {
      disableMFAMutation.mutate();
    }
  };

  const handleGenerateBackupCodes = () => {
    if (confirm('Generating new backup codes will invalidate your existing codes. Continue?')) {
      generateBackupCodesMutation.mutate();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Text copied to clipboard.',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* MFA Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Multi-Factor Authentication
          </CardTitle>
          <CardDescription>
            Secure your account with an additional layer of protection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {mfaSettings?.isEnabled ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
              <div>
                <div className="font-medium">
                  {mfaSettings?.isEnabled ? 'MFA Enabled' : 'MFA Disabled'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {mfaSettings?.isEnabled 
                    ? `Using ${mfaSettings.mfaType.toUpperCase()} authentication`
                    : 'Add an extra layer of security to your account'
                  }
                </div>
              </div>
            </div>
            <Badge variant={mfaSettings?.isEnabled ? 'default' : 'secondary'}>
              {mfaSettings?.isEnabled ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* MFA Setup */}
      {!mfaSettings?.isEnabled && (
        <Card>
          <CardHeader>
            <CardTitle>Setup Multi-Factor Authentication</CardTitle>
            <CardDescription>
              Choose your preferred MFA method
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleSetupMFA('totp')}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Smartphone className="h-6 w-6 text-blue-600" />
                    <div>
                      <div className="font-medium">Authenticator App</div>
                      <div className="text-sm text-muted-foreground">Recommended</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Use apps like Google Authenticator, Authy, or 1Password
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleSetupMFA('sms')}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Mail className="h-6 w-6 text-green-600" />
                    <div>
                      <div className="font-medium">SMS</div>
                      <div className="text-sm text-muted-foreground">Text message</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Receive verification codes via text message
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleSetupMFA('email')}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Mail className="h-6 w-6 text-purple-600" />
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-sm text-muted-foreground">Email codes</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Receive verification codes via email
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* MFA Verification */}
      {setupMFAMutation.data && !mfaSettings?.isEnabled && (
        <Card>
          <CardHeader>
            <CardTitle>Verify Setup</CardTitle>
            <CardDescription>
              Complete the MFA setup by verifying your authenticator app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowQRCode(!showQRCode)}
              >
                <QrCode className="h-4 w-4 mr-2" />
                {showQRCode ? 'Hide' : 'Show'} QR Code
              </Button>
              <Button
                variant="outline"
                onClick={() => copyToClipboard(setupMFAMutation.data.secret)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Secret
              </Button>
            </div>

            {showQRCode && setupMFAMutation.data?.qrCodeUrl && (() => {
              // Security: Validate QR code URL before using in img src
              const { validateSafeUrl } = require('@/lib/utils/security');
              const safeUrl = validateSafeUrl(setupMFAMutation.data.qrCodeUrl);
              return safeUrl ? (
                <div className="flex justify-center">
                  <img 
                    src={safeUrl} 
                    alt="QR Code for MFA setup"
                    className="border rounded-lg"
                  />
                </div>
              ) : null;
            })()}

            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <div className="flex gap-2">
                <Input
                  id="verification-code"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                />
                <Button 
                  onClick={handleVerifyMFA}
                  disabled={verifyMFAMutation.isPending}
                >
                  {verifyMFAMutation.isPending ? 'Verifying...' : 'Verify'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Backup Codes */}
      {mfaSettings?.isEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Backup Codes
            </CardTitle>
            <CardDescription>
              Use these codes to access your account if you lose your authenticator device
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Store these backup codes in a safe place. Each code can only be used once.
              </AlertDescription>
            </Alert>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowBackupCodes(!showBackupCodes)}
              >
                {showBackupCodes ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showBackupCodes ? 'Hide' : 'Show'} Codes
              </Button>
              <Button
                variant="outline"
                onClick={handleGenerateBackupCodes}
                disabled={generateBackupCodesMutation.isPending}
              >
                <Key className="h-4 w-4 mr-2" />
                Generate New Codes
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const codes = mfaSettings.backupCodes.join('\n');
                  const blob = new Blob([codes], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'backup-codes.txt';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>

            {showBackupCodes && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {mfaSettings.backupCodes.map((code: string, index: number) => (
                  <div key={index} className="p-2 bg-muted rounded text-sm font-mono text-center">
                    {code}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* MFA Management */}
      {mfaSettings?.isEnabled && (
        <Card>
          <CardHeader>
            <CardTitle>MFA Management</CardTitle>
            <CardDescription>
              Manage your multi-factor authentication settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">MFA Status</div>
                <div className="text-sm text-muted-foreground">
                  Last used: {mfaSettings.lastUsed ? new Date(mfaSettings.lastUsed).toLocaleString() : 'Never'}
                </div>
              </div>
              <Badge variant="default">Active</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Failed Attempts</div>
                <div className="text-sm text-muted-foreground">
                  {mfaSettings.failedAttempts} recent failed attempts
                </div>
              </div>
              {mfaSettings.failedAttempts > 0 && (
                <Badge variant="destructive">Locked</Badge>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Required for Organization</div>
                <div className="text-sm text-muted-foreground">
                  {mfaSettings.isRequired ? 'Yes' : 'No'}
                </div>
              </div>
              <Switch
                checked={mfaSettings.isRequired}
                disabled
              />
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="destructive"
                onClick={handleDisableMFA}
                disabled={disableMFAMutation.isPending}
              >
                {disableMFAMutation.isPending ? 'Disabling...' : 'Disable MFA'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
