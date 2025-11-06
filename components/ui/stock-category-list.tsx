/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface StockCategory {
  id?: string;
  name?: string;
  title?: string;
  icon?: React.ReactNode | React.ComponentType<any>;
  stocks?: Array<{
    name: string;
    ticker: string;
    price: number;
    change: number;
  }>;
  [key: string]: any;
}

interface StockCategoryListProps {
  categories?: StockCategory[];
}

export function StockCategoryList({ categories }: StockCategoryListProps = {}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground">
          {categories ? `${categories.length} categories` : "Stock categories"}
        </div>
      </CardContent>
    </Card>
  );
}

export const StockCategory = StockCategoryList;

