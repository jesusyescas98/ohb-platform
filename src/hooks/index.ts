/**
 * Custom React Hooks for OHB Platform
 * Central export point for all hooks
 */

export { useAuth, default as useAuthDefault } from './useAuth';
export { usePropertyData, default as usePropertyDataDefault } from './usePropertyData';
export { useLeadsData, default as useLeadsDataDefault } from './useLeadsData';
export { useFetch, default as useFetchDefault } from './useFetch';
export { useFormData, type ValidationRule, type FieldSchema, type FormSchema } from './useFormData';

// Re-export common types
export type { FetchOptions } from './useFetch';
