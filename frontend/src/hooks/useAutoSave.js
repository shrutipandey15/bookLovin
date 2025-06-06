import { useState, useEffect, useCallback } from 'react';

export const useAutoSave = (content, entryId, onSave) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const performSave = useCallback(async () => {
    if (!content.trim() || !hasUnsavedChanges) return;

    setIsSaving(true);
    try {
      await onSave();
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [content, hasUnsavedChanges, onSave]);

  // Mark as having unsaved changes when content changes
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [content]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!content.trim() || !hasUnsavedChanges) return;

    const timer = setTimeout(() => {
      performSave();
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  }, [content, hasUnsavedChanges, performSave]);

  // Manual save function
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
