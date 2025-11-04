/**
 * OCR Document Processing Component
 * Advanced document upload with real-time OCR processing and AI data extraction
 * Uses battle-tested patterns: optimistic UI, TypeScript safety, comprehensive error handling
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


'use client';

import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload,
  FileText,
  Eye,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Brain,
  Target,
  DollarSign,
  Calendar,
  User,
  MessageSquare,
  Edit,
  Save,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { billPayService } from '@/lib/services/bill-pay/bill-pay-service';
import type { DocumentProcessingResult, Vendor } from '@/lib/services/bill-pay/bill-pay-service';

// Document processing schema
const documentProcessSchema = z.object({
  documentType: z.enum(['invoice', 'receipt', 'bill', 'auto']),
  vendorId: z.string().optional(),
  category: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  autoProcess: z.boolean().default(true)
});

type DocumentProcessFormData = z.infer<typeof documentProcessSchema>;

interface OCRProcessingProps {
  userId: string;
  onProcessingComplete?: (result: DocumentProcessingResult) => void;
  onProcessingError?: (error: string) => void;
  className?: string;
}

export function OCRProcessing({
  userId,
  onProcessingComplete,
  onProcessingError,
  className
}: OCRProcessingProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processingResult, setProcessingResult] = useState<DocumentProcessingResult | null>(null);
  const [isReviewMode, setIsReviewMode] = useState(false);

  const form = useForm<DocumentProcessFormData>({
    resolver: zodResolver(documentProcessSchema),
    defaultValues: {
      documentType: 'auto',
      priority: 'medium',
      autoProcess: true
    }
  });

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelection(files[0]);
    }
  }, []);

  const handleFileSelection = (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      onProcessingError?.('Please upload a valid image (JPG, PNG, GIF, WebP) or PDF file');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      onProcessingError?.('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);

    // Create preview URL for images
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const processDocument = async () => {
    if (!selectedFile) return;

    try {
      const result = await billPayService.processDocument(
        userId,
        selectedFile,
        form.getValues('documentType')
      );

      setProcessingResult(result);
      setIsReviewMode(true);
      onProcessingComplete?.(result);
    } catch (error) {
      onProcessingError?.(error instanceof Error ? error.message : 'Processing failed');
    }
  };

  const updateExtractedData = (field: string, value: any) => {
    if (!processingResult) return;

    setProcessingResult({
      ...processingResult,
      extractedData: {
        ...processingResult.extractedData,
        [field]: value
      }
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Upload Area */}
      {!selectedFile && (
        <Card>
          <CardContent className="p-8">
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                "hover:border-primary hover:bg-primary/5"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>

                <div>
                  <h3 className="text-lg font-medium">Upload Document</h3>
                  <p className="text-muted-foreground">
                    Drag and drop your invoice, receipt, or bill here, or click to browse
                  </p>
                </div>

                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>Supported: JPG, PNG, PDF</span>
                  <span>•</span>
                  <span>Max size: 10MB</span>
                  <span>•</span>
                  <span>AI-powered extraction</span>
                </div>

                <input
                  type="file"
                  accept="image/*,.pdf,application/pdf"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Preview and Processing Options */}
      {selectedFile && !isReviewMode && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* File Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>{selectedFile.name}</span>
              </CardTitle>
              <CardDescription>
                {Math.round(selectedFile.size / 1024)} KB • {selectedFile.type}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {previewUrl ? (
                <div className="space-y-4">
                  <img
                    src={previewUrl}
                    alt="Document preview"
                    className="w-full max-h-96 object-contain border rounded-lg"
                  />

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>

                    <Button onClick={processDocument}>
                      <Brain className="h-4 w-4 mr-2" />
                      Process with AI
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>

                    <Button onClick={processDocument}>
                      <Brain className="h-4 w-4 mr-2" />
                      Process with AI
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Processing Options */}
          <Card>
            <CardHeader>
              <CardTitle>Processing Options</CardTitle>
              <CardDescription>
                Configure how the document should be processed
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <form className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Document Type</label>
                  <select
                    {...form.register('documentType')}
                    className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="auto">Auto-detect</option>
                    <option value="invoice">Invoice</option>
                    <option value="receipt">Receipt</option>
                    <option value="bill">Bill</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <select
                    {...form.register('priority')}
                    className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    {...form.register('autoProcess')}
                    type="checkbox"
                    id="autoProcess"
                    className="rounded"
                  />
                  <label htmlFor="autoProcess" className="text-sm">
                    Auto-process after extraction
                  </label>
                </div>
              </form>

              <Alert>
                <Brain className="h-4 w-4" />
                <AlertDescription>
                  Our AI will automatically extract vendor information, amounts, due dates, and categorize the document.
                  You can review and correct the extracted data before final processing.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Processing Result Review */}
      {isReviewMode && processingResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-green-600" />
                <CardTitle>AI Processing Complete</CardTitle>
                <Badge className="bg-green-100 text-green-800">
                  {Math.round(processingResult.confidence * 100)}% confidence
                </Badge>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button size="sm">
                  Process Bill
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* AI Explanation */}
            <Alert>
              <Brain className="h-4 w-4" />
              <AlertDescription>
                <strong>AI Analysis:</strong> {processingResult.aiExplanation.reasoning}
                <div className="mt-2">
                  <strong>Evidence:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {processingResult.aiExplanation.evidence.map((evidence, index) => (
                      <li key={index} className="text-sm">{evidence}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>

            {/* Processing Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">
                  {processingResult.metadata.pageCount}
                </div>
                <div className="text-xs text-muted-foreground">Pages</div>
              </div>

              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">
                  {Math.round(processingResult.processingTime)}ms
                </div>
                <div className="text-xs text-muted-foreground">Processing Time</div>
              </div>

              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">
                  {processingResult.extractedData.lineItems?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Line Items</div>
              </div>

              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">
                  {Math.round(processingResult.confidence * 100)}%
                </div>
                <div className="text-xs text-muted-foreground">Confidence</div>
              </div>
            </div>

            {/* Extracted Data Review */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Document Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <EditableField
                    label="Vendor"
                    value={processingResult.extractedData.vendor}
                    onChange={(value) => updateExtractedData('vendor', value)}
                    placeholder="Vendor name"
                  />

                  <EditableField
                    label="Amount"
                    value={processingResult.extractedData.amount}
                    onChange={(value) => updateExtractedData('amount', parseFloat(value))}
                    type="currency"
                    placeholder="0.00"
                  />

                  <EditableField
                    label="Currency"
                    value={processingResult.extractedData.currency}
                    onChange={(value) => updateExtractedData('currency', value)}
                    placeholder="USD"
                  />

                  <EditableField
                    label="Due Date"
                    value={processingResult.extractedData.dueDate}
                    onChange={(value) => updateExtractedData('dueDate', new Date(value))}
                    type="date"
                    placeholder="Select date"
                  />

                  <EditableField
                    label="Invoice Number"
                    value={processingResult.extractedData.invoiceNumber}
                    onChange={(value) => updateExtractedData('invoiceNumber', value)}
                    placeholder="Invoice number"
                  />

                  <EditableField
                    label="Description"
                    value={processingResult.extractedData.description}
                    onChange={(value) => updateExtractedData('description', value)}
                    placeholder="Description"
                  />
                </CardContent>
              </Card>

              {/* Line Items */}
              {processingResult.extractedData.lineItems && processingResult.extractedData.lineItems.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Line Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {processingResult.extractedData.lineItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.description}</p>
                            {item.quantity && (
                              <p className="text-xs text-muted-foreground">
                                Qty: {item.quantity} × {formatCurrency(item.unitPrice || 0)}
                              </p>
                            )}
                          </div>
                          <div className="text-sm font-mono">
                            {formatCurrency(item.amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Confidence Indicators */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Extraction Confidence</span>
              </div>

              <div className="flex items-center space-x-2">
                <Progress
                  value={processingResult.confidence * 100}
                  className="w-32"
                />
                <span className={cn(
                  "text-sm font-medium",
                  processingResult.confidence >= 0.8 ? "text-green-600" :
                  processingResult.confidence >= 0.6 ? "text-yellow-600" : "text-red-600"
                )}>
                  {Math.round(processingResult.confidence * 100)}%
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsReviewMode(false);
                  setProcessingResult(null);
                }}
              >
                Start Over
              </Button>

              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>

              <Button>
                Process Bill
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Editable field component for reviewing extracted data
interface EditableFieldProps {
  label: string;
  value?: any;
  onChange: (value: any) => void;
  type?: 'text' | 'number' | 'currency' | 'date';
  placeholder?: string;
  required?: boolean;
}

function EditableField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    let processedValue = editValue;

    if (type === 'number') {
      processedValue = parseFloat(editValue) || 0;
    } else if (type === 'currency') {
      processedValue = parseFloat(editValue.replace(/[$,]/g, '')) || 0;
    } else if (type === 'date') {
      processedValue = new Date(editValue);
    }

    onChange(processedValue);
    setIsEditing(false);
  };

  const formatDisplayValue = (val: any) => {
    if (val === null || val === undefined) return placeholder || 'Not extracted';

    if (type === 'currency') {
      return formatCurrency(typeof val === 'string' ? parseFloat(val) : val);
    } else if (type === 'date') {
      return formatDate(val);
    } else if (type === 'number') {
      return val.toString();
    }

    return val.toString();
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Edit className="h-3 w-3" />
        </Button>
      </div>

      {isEditing ? (
        <div className="flex items-center space-x-2">
          {type === 'date' ? (
            <input
              type="date"
              value={editValue?.toISOString().split('T')[0] || ''}
              onChange={(e) => setEditValue(e.target.value)}
              className="flex-1 px-2 py-1 border rounded text-sm"
            />
          ) : (
            <input
              type={type === 'number' ? 'number' : 'text'}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-2 py-1 border rounded text-sm"
            />
          )}

          <Button size="sm" onClick={handleSave}>
            <CheckCircle className="h-3 w-3" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditValue(value);
              setIsEditing(false);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div
          className="p-2 border rounded cursor-pointer hover:bg-muted/50"
          onClick={() => setIsEditing(true)}
        >
          <span className={cn(
            "text-sm",
            !value ? "text-muted-foreground italic" : "text-foreground"
          )}>
            {formatDisplayValue(value)}
          </span>
        </div>
      )}
    </div>
  );
}
