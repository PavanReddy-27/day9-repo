import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to preserve unfinished form data in sessionStorage to handle recoverable failures,
 * unexpected page reloads, or transient network drops.
 *
 * @param formId Unique key for the form draft in storage.
 * @param initialValues Initial form state values.
 */
export function useFormDraft<T extends Record<string, any>>(formId: string, initialValues: T) {
  const storageKey = `form_draft_${formId}`;

  const [values, setValues] = useState<T>(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn(`[useFormDraft] Failed to read draft for key ${storageKey}`, e);
    }
    return initialValues;
  });

  // Sync changes to storage
  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(values));
    } catch (e) {
      console.warn(`[useFormDraft] Failed to save draft for key ${storageKey}`, e);
    }
  }, [storageKey, values]);

  const updateField = useCallback((field: keyof T, value: any) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    try {
      sessionStorage.removeItem(storageKey);
    } catch (e) {
      console.warn(`[useFormDraft] Failed to clear draft for key ${storageKey}`, e);
    }
  }, [initialValues, storageKey]);

  return {
    values,
    setValues,
    updateField,
    resetForm,
  };
}

export default useFormDraft;
