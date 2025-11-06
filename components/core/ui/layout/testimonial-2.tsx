/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Testimonial {
  imgSrc: string;
  alt: string;
}

interface AnimatedTestimonialGridProps {
  testimonials: Testimonial[];
  title: React.ReactNode;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
}

export function AnimatedTestimonialGrid({
  testimonials,
  title,
  description,
  ctaText,
  ctaHref,
}: AnimatedTestimonialGridProps) {
  return (
    <div className="w-full py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          {description && (
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                <Avatar className="w-full h-full rounded-none">
                  <AvatarImage src={testimonial.imgSrc} alt={testimonial.alt} />
                  <AvatarFallback>{testimonial.alt.slice(0, 2)}</AvatarFallback>
                </Avatar>
              </CardContent>
            </Card>
          ))}
        </div>
        {ctaText && ctaHref && (
          <div className="text-center mt-8">
            <a
              href={ctaHref}
              className="text-primary hover:underline font-medium"
            >
              {ctaText} →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
