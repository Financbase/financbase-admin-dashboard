/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import React from "react";
import { Card, CardContent } from "./card";

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  company?: string;
  avatar?: string;
  rating?: number;
  className?: string;
}

export function TestimonialCard({ 
  quote, 
  author, 
  role, 
  company, 
  avatar, 
  rating = 5,
  className 
}: TestimonialCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {rating > 0 && (
            <div className="flex space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`text-yellow-400 ${
                    i < rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
          )}
          
          <blockquote className="text-gray-700 italic">
            "{quote}"
          </blockquote>
          
          <div className="flex items-center space-x-3">
            {avatar && (
              <img
                src={avatar}
                alt={author}
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            <div>
              <p className="font-semibold">{author}</p>
              <p className="text-sm text-gray-600">
                {role}
                {company && ` at ${company}`}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
