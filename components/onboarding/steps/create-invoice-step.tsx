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
import { FileText, Receipt, DollarSign, Calendar, SkipForward } from "lucide-react";
import { toast } from "sonner";

interface CreateInvoiceStepProps {
  onComplete: (data?: Record<string, unknown>) => void;
  onSkip?: () => void;
}

export function CreateInvoiceStep({ onComplete, onSkip }: CreateInvoiceStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [invoiceCreated, setInvoiceCreated] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    clientName: "",
    description: "",
    amount: "",
    dueDate: "",
  });

  const handleCreateInvoice = async () => {
    if (!invoiceData.clientName || !invoiceData.amount) {
      toast.error("Client name and amount are required");
      return;
    }

    setIsLoading(true);
    try {
      // Simulate invoice creation
      await new Promise(resolve => setTimeout(resolve, 1500));
      setInvoiceCreated(true);
      await onComplete({
        invoiceCreated: true,
        invoiceData,
        timestamp: new Date().toISOString(),
      });
      toast.success("Invoice created successfully!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      await onComplete({
        invoiceCreated: false,
        skipped: true,
        timestamp: new Date().toISOString(),
      });
      toast.info("Invoice demo skipped");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold">Create Your First Invoice</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Set up a professional invoice template and see how easy it is to get paid faster. 
          Customize your invoice with your logo and branding for a professional look.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Receipt className="h-5 w-5 text-primary mr-2" />
              Invoice Details
            </CardTitle>
            <CardDescription>
              Create a professional invoice in minutes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!invoiceCreated ? (
              <>
                <div>
                  <Label htmlFor="clientName">Client Name *</Label>
                  <Input
                    id="clientName"
                    placeholder="Client or Company Name"
                    value={invoiceData.clientName}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, clientName: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="e.g., Web Development Services - January 2025"
                    value={invoiceData.description}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="amount">Amount *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="amount"
                        type="number"
                        placeholder="1500"
                        value={invoiceData.amount}
                        onChange={(e) => setInvoiceData(prev => ({ ...prev, amount: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="dueDate"
                        type="date"
                        value={invoiceData.dueDate}
                        onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Invoice Features:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
                      <p>Professional templates with your branding</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
                      <p>Automatic numbering and tracking</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
                      <p>Payment reminders and follow-ups</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
                      <p>Online payment options (Stripe, PayPal)</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center space-y-4 py-8">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-700 mb-2">Invoice Created!</h4>
                  <p className="text-sm text-muted-foreground">
                    Your invoice has been created and is ready to send to {invoiceData.clientName}.
                  </p>
                </div>
                <div className="flex justify-center space-x-2 mt-4">
                  <Button variant="outline">
                    Preview
                  </Button>
                  <Button>
                    Send Invoice
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center space-x-4">
        {onSkip && (
          <Button variant="outline" onClick={handleSkip} disabled={isLoading}>
            <SkipForward className="h-4 w-4 mr-2" />
            Skip demo
          </Button>
        )}
        {!invoiceCreated && (
          <Button 
            onClick={handleCreateInvoice} 
            disabled={isLoading || !invoiceData.clientName || !invoiceData.amount}
          >
            {isLoading ? "Creating..." : "Create Invoice"}
          </Button>
        )}
      </div>
    </div>
  );
}

