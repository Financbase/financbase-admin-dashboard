/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PublicFormProps {
  onSubmit: (data: Record<string, string>) => void;
  children: ReactNode;
  className?: string;
  isLoading?: boolean;
}

export function PublicForm({ onSubmit, children, className, isLoading = false }: PublicFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      {children}
      <Button 
        type="submit" 
        className="w-full" 
        size="lg"
        disabled={isLoading}
      >
        {isLoading ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
}

interface PublicFormFieldProps {
  label: string;
  name: string;
  type?: "text" | "email" | "tel" | "textarea" | "select";
  placeholder?: string;
  required?: boolean;
  error?: string;
  options?: { value: string; label: string }[];
  className?: string;
}

export function PublicFormField({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
  error,
  options = [],
  className,
}: PublicFormFieldProps) {
  const fieldId = `field-${name}`;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={fieldId} className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      
      {type === "textarea" ? (
        <Textarea
          id={fieldId}
          name={name}
          placeholder={placeholder}
          className={cn(error && "border-red-500")}
          rows={4}
        />
      ) : type === "select" ? (
        <Select name={name}>
          <SelectTrigger className={cn(error && "border-red-500")}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={fieldId}
          name={name}
          type={type}
          placeholder={placeholder}
          className={cn(error && "border-red-500")}
        />
      )}
      
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
}

interface PublicCTAProps {
  title: string;
  description?: string;
  primaryAction?: {
    text: string;
    href: string;
  };
  secondaryAction?: {
    text: string;
    href: string;
  };
  background?: "gradient" | "solid" | "muted";
  className?: string;
}

export function PublicCTA({
  title,
  description,
  primaryAction,
  secondaryAction,
  background = "gradient",
  className,
}: PublicCTAProps) {
  // Use inline styles with oklch() for proper Financbase brand colors
  const getBackgroundStyle = () => {
    if (background === "gradient") {
      return {
        background: "linear-gradient(to right, oklch(var(--brand-primary)), oklch(var(--brand-primary-dark)))",
      };
    }
    if (background === "solid") {
      return {
        backgroundColor: "oklch(var(--brand-primary))",
      };
    }
    return undefined;
  };

  return (
    <section 
      className={cn(
        "py-20",
        className
      )}
      style={getBackgroundStyle()}
    >
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6" style={{ color: "white" }}>
          {title}
        </h2>
        {description && (
          <p className="text-xl mb-8 max-w-2xl mx-auto text-foreground/90">
            {description}
          </p>
        )}
        {(primaryAction || secondaryAction) && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {primaryAction && (
              <a 
                href={primaryAction.href}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold h-11 px-8 bg-white hover:bg-gray-100 shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
                style={{
                  color: "oklch(var(--primary))",
                  textDecoration: "none",
                }}
              >
                {primaryAction.text}
              </a>
            )}
            {secondaryAction && (
              <a 
                href={secondaryAction.href}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold h-11 px-8 border-2 bg-transparent text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer hover:bg-white [&:hover]:text-[oklch(var(--primary))]"
                style={{
                  borderColor: "white",
                  color: "white",
                }}
              >
                {secondaryAction.text}
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
