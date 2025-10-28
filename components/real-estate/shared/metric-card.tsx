"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatPercentage } from '@/lib/utils/real-estate-formatting';

export interface MetricCardData {
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  format?: 'currency' | 'percentage' | 'number' | 'text';
  icon?: React.ReactNode;
  description?: string;
  trend?: 'up' | 'down' | 'stable';
}

interface MetricCardProps {
  metric: MetricCardData;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

export function MetricCard({ metric, variant = 'default', className = '' }: MetricCardProps) {
  const formatValue = (value: number | string, format?: string) => {
    if (typeof value === 'string') return value;
    
    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return formatPercentage(value);
      case 'number':
        return value.toLocaleString();
      default:
        return value.toString();
    }
  };

  const getChangeColor = (changeType?: string) => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      case 'neutral':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      case 'stable':
        return '→';
      default:
        return '';
    }
  };

  if (variant === 'compact') {
    return (
      <Card className={`hover:shadow-md transition-shadow ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{metric.title}</p>
              <p className="text-lg font-semibold">
                {formatValue(metric.value, metric.format)}
              </p>
            </div>
            {metric.icon && (
              <div className="text-muted-foreground">
                {metric.icon}
              </div>
            )}
          </div>
          {metric.change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-xs ${getChangeColor(metric.changeType)}`}>
                {metric.change > 0 ? '+' : ''}{formatPercentage(metric.change)}
              </span>
              {metric.trend && (
                <span className="text-xs text-muted-foreground">
                  {getTrendIcon(metric.trend)}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (variant === 'detailed') {
    return (
      <Card className={`hover:shadow-lg transition-shadow ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{metric.title}</CardTitle>
            {metric.icon && (
              <div className="text-muted-foreground">
                {metric.icon}
              </div>
            )}
          </div>
          {metric.description && (
            <p className="text-sm text-muted-foreground">{metric.description}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-2xl font-bold">
              {formatValue(metric.value, metric.format)}
            </p>
            {metric.change !== undefined && (
              <div className="flex items-center gap-2">
                <Badge 
                  variant={metric.changeType === 'increase' ? 'default' : 
                          metric.changeType === 'decrease' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {metric.change > 0 ? '+' : ''}{formatPercentage(metric.change)}
                </Badge>
                {metric.trend && (
                  <span className="text-sm text-muted-foreground">
                    {getTrendIcon(metric.trend)}
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className={`hover:shadow-md transition-all duration-200 hover:scale-105 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{metric.title}</p>
            <p className="text-2xl font-bold">
              {formatValue(metric.value, metric.format)}
            </p>
            {metric.change !== undefined && (
              <div className="flex items-center gap-1 mt-1">
                <span className={`text-xs ${getChangeColor(metric.changeType)}`}>
                  {metric.change > 0 ? '+' : ''}{formatPercentage(metric.change)}
                </span>
                {metric.trend && (
                  <span className="text-xs text-muted-foreground">
                    {getTrendIcon(metric.trend)}
                  </span>
                )}
              </div>
            )}
          </div>
          {metric.icon && (
            <div className="text-muted-foreground">
              {metric.icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
