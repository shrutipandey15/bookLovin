import { useState, useEffect, useRef, useCallback } from 'react';
import { Save, ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { getWordCount } from '@utils/journalUtils';
import { useAutoSave } from '@hooks/useAutoSave';
import MoodSelectDropdown from './MoodSelectDropdown';

const JournalEditor = ({ entry, onSave, onCancel, error }) => {
  const [title, setTitle] = useState(entry?.title || '');
  const [content, setContent] = useState(entry?.content || '');
  const [mood, setMood] = useState(entry?.mood || 2);
  const [tags, setTags] = useState(entry?.tags?.join(', ') || '');
  const [writingStartTime] = useState(Date.now());
  const [showPreview, setShowPreview] = useState(false);

  const textareaRef = useRef(null);
  const wordCount = getWordCount(content);

  const memoizedSaveEntry = useCallback(async () => {
    const entryData = {
      title: title.trim(),
      content: content.trim(),
      mood,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      writing_time: Math.floor((Date.now() - writingStartTime) / 1000),
      favorite: entry?.favorite || false,
      word_count: wordCount
    };
    await onSave(entryData);
  }, [title, content, mood, tags, writingStartTime, entry, wordCount, onSave]);

  const { isSaving, lastSaved, hasUnsavedChanges, manualSave } = useAutoSave(
    content,
    entry?._id,
    memoizedSaveEntry
  );

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      manualSave();
    }
  };

  return (
    <div
      className="max-w-4xl mx-auto p-6 min-h-screen transition-all duration-500"
      style={{
        backgroundColor: 'var(--mood-bg)',
        color: 'var(--mood-text)',
        fontFamily: 'var(--mood-font)'
      }}
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={onCancel}
            className="flex items-center space-x-2 transition-colors hover:opacity-80"
            style={{ color: 'var(--mood-text)' }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Journal</span>
          </button>

          <MoodSelectDropdown
            selectedMood={mood}
            onMoodChange={setMood}
          />
        </div>

        <div className="flex items-center space-x-4 text-sm" style={{ color: 'var(--mood-secondary)' }}>
          <span>{wordCount} words</span>
          {isSaving && (
            <div className="flex items-center space-x-1">
              <div className="animate-spin w-3 h-3 border border-t-transparent rounded-full"
                style={{ borderColor: 'var(--mood-secondary)' }}
              />
              <span>Saving...</span>
            </div>
          )}
          {lastSaved && (
            <span style={{ color: 'var(--mood-primary)' }}>
              Saved at {lastSaved.toLocaleTimeString()}
            </span>
          )}
          {hasUnsavedChanges && !isSaving && (
            <span style={{ color: '#f59e0b' }}>Unsaved changes</span>
          )}

          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-3 py-2 border rounded-lg hover:opacity-80 transition-all flex items-center space-x-2"
            style={{
              backgroundColor: 'var(--mood-contrast)',
              borderColor: 'var(--mood-primary)',
              color: 'var(--mood-primary)'
            }}
          >
            {showPreview ? (
              <>
                <EyeOff className="w-4 h-4" />
                <span>Edit</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </>
            )}
          </button>

          <button
            onClick={manualSave}
            disabled={!content.trim()}
            className="px-4 py-2 border rounded-lg hover:opacity-80 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--mood-primary)',
              borderColor: 'var(--mood-primary)',
              color: 'var(--mood-contrast)'
            }}
          >
            <Save className="w-4 h-4" />
            <span>Save Entry</span>
          </button>
        </div>
      </div>

      {error && (
        <div
          className="mb-4 p-4 rounded-lg border-l-4"
          style={{
            borderColor: 'var(--error-color, #ef4444)',
            backgroundColor: 'var(--error-bg, #fef2f2)',
            color: 'var(--error-text, #dc2626)'
          }}
        >
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">Save Failed</span>
          </div>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); manualSave(); }}>
        <div
          className="rounded-2xl shadow-lg p-8"
          style={{
            backgroundColor: 'var(--mood-contrast)',
            border: `1px solid var(--mood-secondary)`,
            backdropFilter: 'blur(10px)'
          }}
        >
          {showPreview ? (
            <div className="prose max-w-none">
              {title && (
                <h1 className="text-3xl font-bold mb-6" style={{
                  color: 'var(--mood-text)',
                  fontFamily: 'var(--mood-font)'
                }}>{title}</h1>
              )}
              <div
                className="whitespace-pre-wrap text-lg leading-relaxed"
                style={{
                  color: 'var(--mood-text)',
                  fontFamily: 'var(--mood-font)'
                }}
              >
                {content}
              </div>
              {tags && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {tags.split(',').filter(Boolean).map((tag, i) => (
                    <span key={i} className="px-3 py-1 text-sm rounded-full"
                      style={{
                        backgroundColor: 'var(--mood-primary)',
                        color: 'var(--mood-contrast)'
                      }}>
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <input
                type="text"
                placeholder="Entry title (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full text-2xl font-bold border-0 bg-transparent focus:outline-none mb-6 placeholder-opacity-50"
                style={{
                  color: 'var(--mood-text)',
                  fontFamily: 'var(--mood-font)',
                }}
              />
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pour your heart out... What's on your mind today?"
                className="w-full h-96 border-0 bg-transparent resize-none focus:outline-none text-lg leading-relaxed mb-6 placeholder-opacity-50"
                style={{
                  color: 'var(--mood-text)',
                  fontFamily: 'var(--mood-font)',
                }}
              />
              <input
                type="text"
                placeholder="Tags (comma-separated, e.g., self-care, book-inspired)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full border-t pt-4 bg-transparent focus:outline-none text-sm placeholder-opacity-50"
                style={{
                  color: 'var(--mood-text)',
                  borderColor: 'var(--mood-secondary)',
                }}
              />
            </>
          )}
        </div>
      </form>

      <div
        className="mt-4 text-center text-sm"
        style={{ color: 'var(--mood-secondary)' }}
      >
        Press <kbd className="px-2 py-1 rounded text-xs"
          style={{
            backgroundColor: 'var(--mood-secondary)',
            color: 'var(--mood-contrast)'
          }}>Ctrl+S</kbd> to save • Auto-saves every 30 seconds
      </div>
    </div>
  );
};

export default JournalEditor;
