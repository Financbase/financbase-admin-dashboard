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
  const backgroundClasses = {
    gradient: "bg-gradient-to-r from-blue-600 to-indigo-700",
    solid: "bg-primary",
    muted: "bg-muted/50",
  };

  return (
    <section className={cn(
      "py-20",
      backgroundClasses[background],
      className
    )}>
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          {title}
        </h2>
        {description && (
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            {description}
          </p>
        )}
        {(primaryAction || secondaryAction) && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {primaryAction && (
              <Button
                asChild
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                <a href={primaryAction.href}>
                  {primaryAction.text}
                </a>
              </Button>
            )}
            {secondaryAction && (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600"
              >
                <a href={secondaryAction.href}>
                  {secondaryAction.text}
                </a>
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
