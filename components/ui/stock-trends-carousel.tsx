import React from 'react';

interface StockTrendsCarouselProps {
  title: string;
  subtitle: string;
  stocks: any[];
}

export function StockTrendsCarousel({ title, subtitle, stocks }: StockTrendsCarouselProps) {
  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {stocks.map((stock, index) => (
          <div key={index} className="min-w-64 bg-card rounded-lg p-4 border">
            <div className="font-semibold">{stock.symbol || 'STOCK'}</div>
            <div className="text-sm text-muted-foreground">{stock.name || 'Stock Name'}</div>
            <div className="text-lg font-bold text-green-600">
              ${stock.price || '100.00'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
