/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LanguageSelector } from '@/components/i18n/language-selector';
import { CurrencySelector } from '@/components/i18n/currency-selector';
import { TimezoneSelector } from '@/components/i18n/timezone-selector';
import { formatters } from '@/lib/i18n/formatters';
import { cn } from '@/lib/utils';
import { Globe, DollarSign, Clock, Settings, Save, RefreshCw } from 'lucide-react';

export default function I18nPage() {
  const t = useTranslations();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [currentCurrency, setCurrentCurrency] = useState('USD');
  const [currentTimezone, setCurrentTimezone] = useState('UTC');
  const [testAmount, setTestAmount] = useState(1234.56);
  const [testDate, setTestDate] = useState(new Date());

  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
  };

  const handleCurrencyChange = (currency: string) => {
    setCurrentCurrency(currency);
  };

  const handleTimezoneChange = (timezone: string) => {
    setCurrentTimezone(timezone);
  };

  const formatCurrency = (amount: number) => {
    return formatters.currency(amount, currentCurrency, currentLanguage);
  };

  const formatDate = (date: Date) => {
    return formatters.dateTime(date, currentLanguage);
  };

  const formatNumber = (value: number) => {
    return formatters.number(value, currentLanguage);
  };

  const formatPercentage = (value: number) => {
    return formatters.percent(value, currentLanguage);
  };

  const formatRelativeTime = (date: Date) => {
    return formatters.date(date, currentLanguage);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Internationalization</h1>
          <p className="text-muted-foreground">
            Configure language, currency, and timezone settings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="test">Test</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Language Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Language
                </CardTitle>
                <CardDescription>
                  Select your preferred language
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Current Language</Label>
                  <LanguageSelector
                    variant="default"
                    className="w-full"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  Language affects the display of dates, numbers, and text throughout the application.
                </div>
              </CardContent>
            </Card>

            {/* Currency Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Currency
                </CardTitle>
                <CardDescription>
                  Set your default currency
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Current Currency</Label>
                  <CurrencySelector
                    currentCurrency={currentCurrency}
                    onCurrencyChange={handleCurrencyChange}
                    variant="default"
                    className="w-full"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  Currency affects how monetary values are displayed and formatted.
                </div>
              </CardContent>
            </Card>

            {/* Timezone Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Timezone
                </CardTitle>
                <CardDescription>
                  Set your timezone
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Current Timezone</Label>
                  <TimezoneSelector
                    currentTimezone={currentTimezone}
                    onTimezoneChange={handleTimezoneChange}
                    variant="default"
                    className="w-full"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  Timezone affects how dates and times are displayed and calculated.
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Formatting Preview</CardTitle>
              <CardDescription>
                See how your settings affect the display of data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Currency Formatting</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-mono">{formatCurrency(testAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Large Amount:</span>
                      <span className="font-mono">{formatCurrency(1234567.89)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Small Amount:</span>
                      <span className="font-mono">{formatCurrency(0.99)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Date & Time Formatting</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Current Date:</span>
                      <span className="font-mono">{formatDate(testDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Relative Time:</span>
                      <span className="font-mono">{formatRelativeTime(testDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Timezone:</span>
                      <span className="font-mono">{currentTimezone}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Number Formatting</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Decimal:</span>
                      <span className="font-mono">{formatNumber(1234.56)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Percentage:</span>
                      <span className="font-mono">{formatPercentage(75.5)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Large Number:</span>
                      <span className="font-mono">{formatNumber(1234567)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">File Size Formatting</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Small File:</span>
                      <span className="font-mono">{formatNumber(1024)} bytes</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Large File:</span>
                      <span className="font-mono">{formatNumber(1024 * 1024 * 1024)} bytes</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Very Large File:</span>
                      <span className="font-mono">{formatNumber(1024 * 1024 * 1024 * 1024)} bytes</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Formatting</CardTitle>
              <CardDescription>
                Test different values to see how they're formatted
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Test Currency</h3>
                  <div className="space-y-2">
                    <Label htmlFor="test-amount">Amount</Label>
                    <Input
                      id="test-amount"
                      type="number"
                      value={testAmount}
                      onChange={(e) => setTestAmount(parseFloat(e.target.value) || 0)}
                      step="0.01"
                    />
                    <div className="text-sm text-muted-foreground">
                      Formatted: <span className="font-mono">{formatCurrency(testAmount)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Test Date</h3>
                  <div className="space-y-2">
                    <Label htmlFor="test-date">Date</Label>
                    <Input
                      id="test-date"
                      type="datetime-local"
                      value={testDate.toISOString().slice(0, 16)}
                      onChange={(e) => setTestDate(new Date(e.target.value))}
                    />
                    <div className="text-sm text-muted-foreground">
                      Formatted: <span className="font-mono">{formatDate(testDate)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Current Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Language</div>
                    <div className="font-semibold">{currentLanguage}</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Currency</div>
                    <div className="font-semibold">{currentCurrency}</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Timezone</div>
                    <div className="font-semibold">{currentTimezone}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
