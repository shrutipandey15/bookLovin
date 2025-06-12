// useAutoSave.js
import { useState, useEffect, useCallback, useRef } from 'react';

export const useAutoSave = (content, entryId, onSave) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const onSaveRef = useRef(onSave);
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  const performSave = useCallback(async () => {
    if (!content.trim() || !hasUnsavedChanges) {
      return;
    }

    setIsSaving(true);
    try {
      await onSaveRef.current();
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [content, hasUnsavedChanges]);

  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [content]);

  useEffect(() => {
    if (!content.trim() || !hasUnsavedChanges) return;

    const timer = setTimeout(() => {
      performSave();
    }, 30000);

    return () => clearTimeout(timer);
  }, [content, hasUnsavedChanges, performSave]);

  const manualSave = useCallback(() => {
    performSave();
  }, [performSave]);

  return {
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    manualSave
  };
};
