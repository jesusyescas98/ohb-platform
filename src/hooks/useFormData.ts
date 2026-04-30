'use client';

import { useState, useCallback, useRef } from 'react';

export interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

export interface FieldSchema {
  name: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'password' | 'select' | 'checkbox' | 'textarea';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  rules?: ValidationRule[];
  initialValue?: any;
}

export interface FormSchema {
  fields: FieldSchema[];
}

interface FormErrors {
  [fieldName: string]: string | null;
}

interface UseFormDataReturn {
  formData: Record<string, any>;
  errors: FormErrors;
  isDirty: boolean;
  isSubmitting: boolean;
  touched: Record<string, boolean>;
  setValue: (name: string, value: any) => void;
  setError: (name: string, message: string | null) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (onSubmit: (data: Record<string, any>) => Promise<void> | void) => (e: React.FormEvent) => Promise<void>;
  reset: () => void;
  validate: () => boolean;
  getFieldProps: (name: string) => { value: any; onChange: (e: React.ChangeEvent<any>) => void; onBlur: (e: React.FocusEvent<any>) => void };
}

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Phone validation regex (international format)
const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s]?[(]?[0-9]{1,4}[)]?[-\s]?[0-9]{1,9}$/;

export function useFormData(schema: FormSchema): UseFormDataReturn {
  const initialFormData = schema.fields.reduce(
    (acc, field) => ({
      ...acc,
      [field.name]: field.initialValue ?? '',
    }),
    {} as Record<string, any>
  );

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const initialDataRef = useRef(initialFormData);

  const fieldSchemaMap = schema.fields.reduce(
    (acc, field) => ({
      ...acc,
      [field.name]: field,
    }),
    {} as Record<string, FieldSchema>
  );

  const validateField = useCallback(
    (name: string, value: any): string | null => {
      const field = fieldSchemaMap[name];
      if (!field) return null;

      // Required validation
      if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
        return `${name} es requerido`;
      }

      if (!value) return null; // Skip other validations if empty and not required

      // Type-specific validation
      switch (field.type) {
        case 'email':
          if (!EMAIL_REGEX.test(value)) {
            return 'Email inválido';
          }
          break;
        case 'phone':
          if (!PHONE_REGEX.test(value)) {
            return 'Teléfono inválido';
          }
          break;
        case 'number':
          if (isNaN(Number(value))) {
            return 'Debe ser un número';
          }
          break;
        default:
          break;
      }

      // Length validation
      if (field.minLength && value.length < field.minLength) {
        return `Mínimo ${field.minLength} caracteres`;
      }
      if (field.maxLength && value.length > field.maxLength) {
        return `Máximo ${field.maxLength} caracteres`;
      }

      // Pattern validation
      if (field.pattern && !field.pattern.test(value)) {
        return 'Formato inválido';
      }

      // Custom rules
      if (field.rules) {
        for (const rule of field.rules) {
          if (!rule.validate(value)) {
            return rule.message;
          }
        }
      }

      return null;
    },
    [fieldSchemaMap]
  );

  const setValue = useCallback((name: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      setIsDirty(JSON.stringify(updated) !== JSON.stringify(initialDataRef.current));
      return updated;
    });
  }, []);

  const setError = useCallback((name: string, message: string | null) => {
    setErrors(prev => ({
      ...prev,
      [name]: message,
    }));
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target as HTMLInputElement;

      // Handle checkboxes
      let finalValue = value;
      if (type === 'checkbox') {
        finalValue = (e.target as HTMLInputElement).checked;
      }

      setValue(name, finalValue);

      // Clear error on change if user has touched field
      if (touched[name]) {
        const fieldError = validateField(name, finalValue);
        setError(name, fieldError);
      }
    },
    [setValue, setError, validateField, touched]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setTouched(prev => ({ ...prev, [name]: true }));

      // Validate on blur
      const fieldError = validateField(name, value);
      setError(name, fieldError);
    },
    [validateField, setError]
  );

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    for (const field of schema.fields) {
      const fieldError = validateField(field.name, formData[field.name]);
      if (fieldError) {
        newErrors[field.name] = fieldError;
      }
    }

    setErrors(newErrors);
    setTouched(
      schema.fields.reduce((acc, field) => ({ ...acc, [field.name]: true }), {})
    );

    return Object.values(newErrors).every(err => err === null);
  }, [schema.fields, formData, validateField]);

  const handleSubmit = useCallback(
    (onSubmit: (data: Record<string, any>) => Promise<void> | void) =>
      async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
          return;
        }

        setIsSubmitting(true);
        try {
          await onSubmit(formData);
          // Reset form after successful submission
          setFormData(initialDataRef.current);
          setIsDirty(false);
          setTouched({});
          setErrors({});
        } catch (err) {
          console.error('Form submission error:', err);
        } finally {
          setIsSubmitting(false);
        }
      },
    [formData, validate]
  );

  const reset = useCallback(() => {
    setFormData(initialDataRef.current);
    setErrors({});
    setTouched({});
    setIsDirty(false);
  }, []);

  const getFieldProps = useCallback(
    (name: string) => ({
      value: formData[name] ?? '',
      onChange: handleChange,
      onBlur: handleBlur,
    }),
    [formData, handleChange, handleBlur]
  );

  return {
    formData,
    errors,
    isDirty,
    isSubmitting,
    touched,
    setValue,
    setError,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    validate,
    getFieldProps,
  };
}

export default useFormData;
