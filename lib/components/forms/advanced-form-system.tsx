/**
 * Advanced Form System with React Hook Form + Zod
 * Configuration-driven forms for dynamic financial modules
 * Includes validation, conditional fields, and compliance features
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import React from 'react';
import { useForm, UseFormProps, FieldValues, Path, DefaultValues, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';

// Base form field types
export interface BaseFormField {
  name: string;
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

// Form field types
export interface TextField extends BaseFormField {
  type: 'text' | 'email' | 'tel' | 'url' | 'password';
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface NumberField extends BaseFormField {
  type: 'number' | 'currency';
  min?: number;
  max?: number;
  step?: number;
  currency?: string;
}

export interface DateField extends BaseFormField {
  type: 'date' | 'datetime' | 'time';
  minDate?: Date;
  maxDate?: Date;
}

export interface SelectField extends BaseFormField {
  type: 'select' | 'multiselect';
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  allowCreate?: boolean;
}

export interface CheckboxField extends BaseFormField {
  type: 'checkbox' | 'switch';
  defaultChecked?: boolean;
}

export interface RadioField extends BaseFormField {
  type: 'radio';
  options: Array<{ value: string; label: string; disabled?: boolean }>;
}

export interface FileField extends BaseFormField {
  type: 'file';
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
}

export interface TextareaField extends BaseFormField {
  type: 'textarea';
  rows?: number;
  maxLength?: number;
}

export interface RichTextField extends BaseFormField {
  type: 'richtext';
  height?: number;
}

// Conditional field logic
export interface ConditionalField {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater' | 'less' | 'exists';
  value: any;
  action: 'show' | 'hide' | 'require' | 'disable';
}

// Form section
export interface FormSection {
  id: string;
  title?: string;
  description?: string;
  fields: FormField[];
  conditionalFields?: ConditionalField[];
  className?: string;
}

// Complete form configuration
export interface FormConfig<T extends FieldValues = FieldValues> {
  id: string;
  title: string;
  description?: string;
  sections: FormSection[];
  validationSchema: z.ZodType<T, z.ZodTypeDef, unknown>;
  defaultValues?: Partial<T>;
  submitLabel?: string;
  cancelLabel?: string;
  className?: string;
  onSubmit?: (data: T) => Promise<void>;
  onCancel?: () => void;
  mode?: 'create' | 'edit' | 'view';
  permissions?: {
    canCreate?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    canView?: boolean;
  };
}

// Union type for all field types
export type FormField =
  | TextField
  | NumberField
  | DateField
  | SelectField
  | CheckboxField
  | RadioField
  | FileField
  | TextareaField
  | RichTextField;

// Form context for sharing state between components
interface FormContextValue<T extends FieldValues = FieldValues> {
  config: FormConfig<T>;
  watch: any;
  setValue: any;
  getValues: any;
  formState: any;
}

const FormContext = React.createContext<FormContextValue<any> | null>(null);

// Custom hook for form management
export function useAdvancedForm<T extends FieldValues = FieldValues>(
  config: FormConfig<T>,
  options?: UseFormProps<T>
) {
  // zodResolver automatically infers types from the schema
  // We need to assert the resolver type to match our generic T
  const form = useForm<T>({
    resolver: zodResolver(config.validationSchema) as Resolver<T>,
    defaultValues: (config.defaultValues as DefaultValues<T> | undefined) ?? options?.defaultValues,
    mode: 'onChange',
    ...options,
  });

  const contextValue: FormContextValue<T> = {
    config,
    watch: form.watch,
    setValue: form.setValue,
    getValues: form.getValues,
    formState: form.formState,
  };

  return {
    form,
    contextValue,
  };
}

// Main form component
export function AdvancedForm<T extends FieldValues = FieldValues>({
  config,
  className,
  children
}: {
  config: FormConfig<T>;
  className?: string;
  children?: React.ReactNode;
}) {
  const { form, contextValue } = useAdvancedForm<T>(config);

  const onSubmit = async (data: T) => {
    try {
      await config.onSubmit?.(data);
    } catch (error) {
      console.error('Form submission error:', error);
      form.setError('root', {
        type: 'manual',
        message: 'An error occurred while submitting the form'
      });
    }
  };

  return (
    <FormContext.Provider value={contextValue}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("space-y-6", className)}
      >
        <div className="space-y-8">
          {config.title && (
            <div className="border-b pb-4">
              <h2 className="text-2xl font-semibold">{config.title}</h2>
              {config.description && (
                <p className="text-muted-foreground mt-2">{config.description}</p>
              )}
            </div>
          )}

          {config.sections.map((section) => (
            <FormSection key={section.id} section={section} />
          ))}
        </div>

        {children}

        <div className="flex justify-end space-x-4 pt-6 border-t">
          {config.onCancel && (
            <button
              type="button"
              onClick={config.onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {config.cancelLabel || 'Cancel'}
            </button>
          )}
          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {form.formState.isSubmitting ? 'Submitting...' : (config.submitLabel || 'Submit')}
          </button>
        </div>

        {form.formState.errors.root && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          </div>
        )}
      </form>
    </FormContext.Provider>
  );
}

// Section component
function FormSection({ section }: { section: FormSection }) {
  const context = React.useContext(FormContext);
  
  // Always call hooks in the same order, even if context is null
  const watchedValues = context?.watch() || {};
  
  // Check if section should be visible based on conditional logic
  const isVisible = React.useMemo(() => {
    if (!context) return false;
    if (!section.conditionalFields) return true;

    return section.conditionalFields.every((condition) => {
      const fieldValue = watchedValues[condition.field];
      return evaluateCondition(fieldValue, condition);
    });
  }, [context, watchedValues, section.conditionalFields]);

  if (!context || !isVisible) return null;

  return (
    <div className={cn("space-y-6", section.className)}>
      {section.title && (
        <div className="border-b pb-2">
          <h3 className="text-lg font-medium">{section.title}</h3>
          {section.description && (
            <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {section.fields.map((field) => (
          <FormField key={field.name} field={field} />
        ))}
      </div>
    </div>
  );
}

// Individual field component
function FormField({ field }: { field: FormField }) {
  const context = React.useContext(FormContext);
  
  // Always call hooks in the same order, even if context is null
  const watchedValues = context?.watch() || {};
  const fieldError = context?.formState?.errors?.[field.name];

  // Check if field should be visible/disabled based on conditions
  const fieldState = React.useMemo(() => {
    if (!context) {
      return { visible: false, disabled: field.disabled || false, required: field.required || false };
    }

    const { config } = context;
    if (!config.sections.some(s => s.conditionalFields)) {
      return { visible: true, disabled: field.disabled, required: field.required };
    }

    // Find conditional fields for this field
    const relevantConditions = config.sections
      .flatMap(s => s.conditionalFields || [])
      .filter(c => c.field === field.name);

    let visible = true;
    let disabled = field.disabled || false;
    let required = field.required || false;

    for (const condition of relevantConditions) {
      const fieldValue = watchedValues[condition.field];
      if (evaluateCondition(fieldValue, condition)) {
        switch (condition.action) {
          case 'hide':
            visible = false;
            break;
          case 'disable':
            disabled = true;
            break;
          case 'require':
            required = true;
            break;
        }
      }
    }

    return { visible, disabled, required };
  }, [context, watchedValues, field]);

  if (!context || !fieldState.visible) return null;
  
  const { setValue, formState } = context;

  return (
    <div className={cn("space-y-2", field.className)}>
      <label
        htmlFor={field.name}
        className={cn(
          "text-sm font-medium leading-none",
          fieldState.required && "after:content-['*'] after:ml-0.5 after:text-destructive"
        )}
      >
        {field.label}
      </label>

      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}

      <div className="relative">
        {renderFieldInput(field, fieldState, setValue, watchedValues)}

        {fieldError && (
          <p className="text-sm text-destructive mt-1">
            {fieldError.message as string}
          </p>
        )}
      </div>
    </div>
  );
}

// Field input renderer
function renderFieldInput(
  field: FormField,
  fieldState: any,
  setValue: any,
  watchedValues: any
) {
  const commonProps = {
    id: field.name,
    disabled: fieldState.disabled,
    className: cn(
      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
      "ring-offset-background placeholder:text-muted-foreground",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      fieldState.required && "border-destructive/50"
    ),
    'aria-required': fieldState.required,
    'aria-describedby': field.description ? `${field.name}-description` : undefined
  };

  switch (field.type) {
    case 'text':
    case 'email':
    case 'tel':
    case 'url':
    case 'password':
      return (
        <input
          {...commonProps}
          type={field.type}
          placeholder={field.placeholder}
          minLength={field.minLength}
          maxLength={field.maxLength}
          pattern={field.pattern}
          onChange={(e) => setValue(field.name, e.target.value)}
        />
      );

    case 'number':
    case 'currency':
      return (
        <input
          {...commonProps}
          type="number"
          min={field.min}
          max={field.max}
          step={field.step || 1}
          placeholder={field.placeholder}
          onChange={(e) => setValue(field.name, parseFloat(e.target.value) || 0)}
        />
      );

    case 'date':
    case 'datetime':
    case 'time':
      return (
        <input
          {...commonProps}
          type={field.type === 'datetime' ? 'datetime-local' : field.type}
          min={field.minDate?.toISOString().split('T')[0]}
          max={field.maxDate?.toISOString().split('T')[0]}
          onChange={(e) => setValue(field.name, new Date(e.target.value))}
        />
      );

    case 'select':
      return (
        <select
          {...commonProps}
          onChange={(e) => setValue(field.name, e.target.value)}
        >
          <option value="">Select an option</option>
          {field.options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
      );

    case 'multiselect':
      return (
        <select
          {...commonProps}
          multiple
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            setValue(field.name, values);
          }}
        >
          {field.options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
      );

    case 'checkbox':
    case 'switch':
      return (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={field.name}
            className="rounded border-gray-300"
            defaultChecked={field.defaultChecked}
            onChange={(e) => setValue(field.name, e.target.checked)}
          />
          <label htmlFor={field.name} className="text-sm">
            {field.label}
          </label>
        </div>
      );

    case 'radio':
      return (
        <div className="space-y-2">
          {field.options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <input
                type="radio"
                id={`${field.name}-${option.value}`}
                name={field.name}
                value={option.value}
                disabled={option.disabled}
                className="border-gray-300"
                onChange={(e) => setValue(field.name, e.target.value)}
              />
              <label htmlFor={`${field.name}-${option.value}`} className="text-sm">
                {option.label}
              </label>
            </div>
          ))}
        </div>
      );

    case 'file':
      return (
        <input
          {...commonProps}
          type="file"
          accept={field.accept}
          multiple={field.multiple}
          onChange={(e) => setValue(field.name, e.target.files)}
        />
      );

    case 'textarea':
      return (
        <textarea
          {...commonProps}
          rows={field.rows || 3}
          maxLength={field.maxLength}
          placeholder={field.placeholder}
          onChange={(e) => setValue(field.name, e.target.value)}
        />
      );

    case 'richtext':
      return (
        <div className="border rounded-md">
          {/* Rich text editor implementation (could use Tiptap, Quill, etc.) */}
          <div className="p-3 min-h-[100px] prose prose-sm max-w-none">
            Rich text editor would go here
          </div>
        </div>
      );

    default:
      return <div>Unsupported field type: {(field as any).type}</div>;
  }
}

// Utility function to evaluate conditional field logic
function evaluateCondition(fieldValue: any, condition: ConditionalField): boolean {
  switch (condition.operator) {
    case 'equals':
      return fieldValue === condition.value;
    case 'not_equals':
      return fieldValue !== condition.value;
    case 'contains':
      return Array.isArray(fieldValue)
        ? fieldValue.includes(condition.value)
        : String(fieldValue).includes(String(condition.value));
    case 'greater':
      return Number(fieldValue) > Number(condition.value);
    case 'less':
      return Number(fieldValue) < Number(condition.value);
    case 'exists':
      return fieldValue != null && fieldValue !== '';
    default:
      return false;
  }
}

// Pre-built form configurations for common financial modules

const invoiceFormSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  issueDate: z.date(),
  dueDate: z.date(),
  items: z.array(z.object({
    description: z.string().min(1, 'Description is required'),
    quantity: z.number().min(0.1, 'Quantity must be greater than 0'),
    unitPrice: z.number().min(0, 'Unit price must be positive'),
    total: z.number().min(0, 'Total must be positive')
  })).min(1, 'At least one item is required'),
  taxRate: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  terms: z.string().optional()
});

export const INVOICE_FORM_CONFIG: FormConfig<z.infer<typeof invoiceFormSchema>> = {
  id: 'invoice-form',
  title: 'Create Invoice',
  description: 'Generate a professional invoice for your client',
  validationSchema: invoiceFormSchema,
  defaultValues: {
    issueDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
    taxRate: 0
  },
  sections: [
    {
      id: 'invoice-details',
      title: 'Invoice Details',
      fields: [
        {
          name: 'clientId',
          label: 'Client',
          type: 'select',
          required: true,
          options: [] // Would be populated from clients API
        },
        {
          name: 'invoiceNumber',
          label: 'Invoice Number',
          type: 'text',
          required: true,
          placeholder: 'INV-001'
        }
      ]
    },
    {
      id: 'dates',
      title: 'Important Dates',
      fields: [
        {
          name: 'issueDate',
          label: 'Issue Date',
          type: 'date',
          required: true
        },
        {
          name: 'dueDate',
          label: 'Due Date',
          type: 'date',
          required: true
        }
      ]
    },
    {
      id: 'additional-notes',
      title: 'Additional Information',
      fields: [
        {
          name: 'notes',
          label: 'Notes',
          type: 'textarea',
          description: 'Additional notes or payment instructions'
        },
        {
          name: 'terms',
          label: 'Terms & Conditions',
          type: 'textarea',
          description: 'Payment terms and conditions'
        }
      ]
    }
  ]
};

const expenseFormSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  currency: z.string().default('USD'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  date: z.date(),
  vendor: z.string().optional(),
  receipt: z.any().optional(),
  paymentMethod: z.string().optional(),
  tags: z.string().optional(),
  isRecurring: z.boolean().default(false),
  projectId: z.string().optional()
});

export const EXPENSE_FORM_CONFIG: FormConfig<z.infer<typeof expenseFormSchema>> = {
  id: 'expense-form',
  title: 'Add Expense',
  description: 'Record a business expense with receipt upload',
  validationSchema: expenseFormSchema,
  sections: [
    {
      id: 'expense-details',
      title: 'Expense Details',
      fields: [
        {
          name: 'amount',
          label: 'Amount',
          type: 'currency',
          required: true,
          currency: 'USD'
        },
        {
          name: 'description',
          label: 'Description',
          type: 'text',
          required: true,
          placeholder: 'What was this expense for?'
        },
        {
          name: 'category',
          label: 'Category',
          type: 'select',
          required: true,
          options: [
            { value: 'office_supplies', label: 'Office Supplies' },
            { value: 'software', label: 'Software & Tools' },
            { value: 'marketing', label: 'Marketing & Advertising' },
            { value: 'travel', label: 'Travel & Transportation' },
            { value: 'meals', label: 'Meals & Entertainment' },
            { value: 'professional_services', label: 'Professional Services' },
            { value: 'other', label: 'Other' }
          ]
        }
      ]
    },
    {
      id: 'additional-info',
      title: 'Additional Information',
      fields: [
        {
          name: 'date',
          label: 'Date',
          type: 'date',
          required: true
        },
        {
          name: 'vendor',
          label: 'Vendor/Merchant',
          type: 'text',
          placeholder: 'Who did you pay?'
        },
        {
          name: 'receipt',
          label: 'Receipt',
          type: 'file',
          accept: 'image/*,.pdf',
          description: 'Upload receipt image or PDF'
        },
        {
          name: 'projectId',
          label: 'Project',
          type: 'select',
          options: [] // Would be populated from projects API
        }
      ]
    }
  ]
};

// Form builder utility for creating dynamic forms
export function createFormConfig(
  baseConfig: Partial<FormConfig<FieldValues>>,
  dynamicFields: FormField[]
): FormConfig<FieldValues> {
  const schemaFields: Record<string, z.ZodTypeAny> = {};

  dynamicFields.forEach(field => {
    let fieldSchema: z.ZodTypeAny;

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'url':
      case 'password': {
        let stringSchema = z.string();
        if (field.required) stringSchema = stringSchema.min(1, `${field.label} is required`);
        if (field.minLength) stringSchema = stringSchema.min(field.minLength);
        if (field.maxLength) stringSchema = stringSchema.max(field.maxLength);
        if (field.pattern) stringSchema = stringSchema.regex(new RegExp(field.pattern));
        fieldSchema = stringSchema;
        break;
      }

      case 'number':
      case 'currency': {
        let numberSchema = z.number();
        if (field.required) numberSchema = numberSchema.min(0.01, `${field.label} is required`);
        if (field.min !== undefined) numberSchema = numberSchema.min(field.min);
        if (field.max !== undefined) numberSchema = numberSchema.max(field.max);
        fieldSchema = numberSchema;
        break;
      }

      case 'date':
      case 'datetime':
      case 'time': {
        let dateSchema: z.ZodDate = z.date();
        if (field.required) {
          dateSchema = dateSchema.refine(date => date != null, `${field.label} is required`) as unknown as z.ZodDate;
        }
        fieldSchema = dateSchema;
        break;
      }

      case 'select': {
        let stringSchema = z.string();
        if (field.required) stringSchema = stringSchema.min(1, `${field.label} is required`);
        fieldSchema = stringSchema;
        break;
      }

      case 'multiselect': {
        let arraySchema = z.array(z.string());
        if (field.required) arraySchema = arraySchema.min(1, `${field.label} is required`);
        fieldSchema = arraySchema;
        break;
      }

      case 'checkbox':
      case 'switch':
        fieldSchema = z.boolean();
        break;

      case 'file': {
        let anySchema: z.ZodAny = z.any();
        if (field.required) {
          anySchema = anySchema.refine(file => file != null, `${field.label} is required`) as unknown as z.ZodAny;
        }
        fieldSchema = anySchema;
        break;
      }

      case 'textarea': {
        let stringSchema = z.string();
        if (field.required) stringSchema = stringSchema.min(1, `${field.label} is required`);
        if (field.maxLength) stringSchema = stringSchema.max(field.maxLength);
        fieldSchema = stringSchema;
        break;
      }

      default:
        fieldSchema = z.any();
    }

    schemaFields[field.name] = fieldSchema;
  });

  const validationSchema = z.object(schemaFields) as z.ZodType<FieldValues>;

  return {
    id: baseConfig.id || 'dynamic-form',
    title: baseConfig.title || 'Dynamic Form',
    description: baseConfig.description,
    sections: [
      {
        id: 'dynamic-fields',
        fields: dynamicFields
      }
    ],
    validationSchema,
    defaultValues: baseConfig.defaultValues,
    ...baseConfig
  } as FormConfig<FieldValues>;
}
