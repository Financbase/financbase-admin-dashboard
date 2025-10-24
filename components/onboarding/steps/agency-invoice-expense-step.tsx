"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Receipt, FileText, DollarSign, Calendar } from "lucide-react";
import { toast } from "sonner";

interface AgencyInvoiceExpenseStepProps {
  onComplete: (data?: Record<string, unknown>) => void;
  onSkip?: () => void;
}

export function AgencyInvoiceExpenseStep({ onComplete, onSkip }: AgencyInvoiceExpenseStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"invoice" | "expense">("invoice");
  const [invoiceData, setInvoiceData] = useState({
    client: "",
    project: "",
    amount: "",
    description: "",
    dueDate: "",
  });
  const [expenseData, setExpenseData] = useState({
    category: "",
    amount: "",
    description: "",
    date: "",
  });

  const handleCreateInvoice = async () => {
    setIsLoading(true);
    try {
      await onComplete({
        step: "invoice",
        invoiceData,
        timestamp: new Date().toISOString(),
      });
      toast.success("Invoice created successfully!");
      setStep("expense");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogExpense = async () => {
    setIsLoading(true);
    try {
      await onComplete({
        step: "expense",
        expenseData,
        timestamp: new Date().toISOString(),
      });
      toast.success("Expense logged successfully!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      await onComplete({
        skipped: true,
        timestamp: new Date().toISOString(),
      });
      toast.info("Invoice/expense demo skipped");
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
        <h3 className="text-2xl font-bold">Create Invoice & Categorize Expense</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Let's walk through creating your first invoice and categorizing an expense 
          for a client project.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {step === "invoice" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 text-primary mr-2" />
                Create Your First Invoice
              </CardTitle>
              <CardDescription>
                Create an invoice for a client project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="client">Client</Label>
                  <Input
                    id="client"
                    placeholder="Client Name"
                    value={invoiceData.client}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, client: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="project">Project</Label>
                  <Input
                    id="project"
                    placeholder="Project Name"
                    value={invoiceData.project}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, project: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={invoiceData.amount}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, amount: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the work performed..."
                  value={invoiceData.description}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
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

              <Button 
                onClick={handleCreateInvoice} 
                disabled={isLoading || !invoiceData.client || !invoiceData.amount}
                className="w-full"
              >
                {isLoading ? "Creating Invoice..." : "Create Invoice"}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "expense" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Receipt className="h-5 w-5 text-primary mr-2" />
                Categorize an Expense
              </CardTitle>
              <CardDescription>
                Log an expense for the project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={expenseData.category} onValueChange={(value) => setExpenseData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="office-supplies">Office Supplies</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="professional-services">Professional Services</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="expense-amount">Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="expense-amount"
                    type="number"
                    placeholder="0.00"
                    value={expenseData.amount}
                    onChange={(e) => setExpenseData(prev => ({ ...prev, amount: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="expense-description">Description</Label>
                <Textarea
                  id="expense-description"
                  placeholder="Describe the expense..."
                  value={expenseData.description}
                  onChange={(e) => setExpenseData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="expense-date">Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="expense-date"
                    type="date"
                    value={expenseData.date}
                    onChange={(e) => setExpenseData(prev => ({ ...prev, date: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <Button 
                onClick={handleLogExpense} 
                disabled={isLoading || !expenseData.category || !expenseData.amount}
                className="w-full"
              >
                {isLoading ? "Logging Expense..." : "Log Expense"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex justify-center space-x-4">
        {onSkip && (
          <Button variant="outline" onClick={handleSkip} disabled={isLoading}>
            Skip Demo
          </Button>
        )}
        {step === "expense" && (
          <Button 
            onClick={handleLogExpense} 
            disabled={isLoading || !expenseData.category || !expenseData.amount}
          >
            {isLoading ? "Logging..." : "Complete Demo"}
          </Button>
        )}
      </div>
    </div>
  );
}
