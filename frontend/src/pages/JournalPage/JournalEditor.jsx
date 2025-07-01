import { useState, useEffect, useRef, useCallback } from "react";
import {
  Save,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  Loader,
} from "lucide-react";
import { getWordCount } from "@utils/journalUtils";
import { useAutoSave } from "@hooks/useAutoSave";
import MoodSelectDropdown from "./MoodSelectDropdown";
import { useMood } from "@components/MoodContext";
import { MOOD_ENUM_TO_KEY, MOOD_KEY_TO_ENUM } from "@config/moods";

const JournalEditor = ({ entry, onSave, onCancel, error }) => {
  const { mood: globalMood, setMood: setGlobalMood } = useMood();
  const [title, setTitle] = useState(entry?.title || "");
  const [content, setContent] = useState(entry?.content || "");
  const [tags, setTags] = useState(entry?.tags?.join(", ") || "");
  const [writingStartTime] = useState(Date.now());
  const [showPreview, setShowPreview] = useState(false);

  const textareaRef = useRef(null);
  const wordCount = getWordCount(content);

  useEffect(() => {
    if (entry?.mood) {
      const moodKey = MOOD_ENUM_TO_KEY[entry.mood];
      if (moodKey) {
        setGlobalMood(moodKey);
      }
    }
  }, [entry, setGlobalMood]);

  // The memoized save function that prepares data for the API
  const memoizedSaveEntry = useCallback(async () => {
    const entryData = {
      title: title.trim(),
      content: content.trim(),
      mood: MOOD_KEY_TO_ENUM[globalMood],
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      writing_time: Math.floor((Date.now() - writingStartTime) / 1000),
      favorite: entry?.favorite || false,
    };
    await onSave(entryData);
  }, [
    title,
    content,
    globalMood,
    tags,
    writingStartTime,
    entry,
    onSave,
  ]);

  const { isSaving, lastSaved, hasUnsavedChanges, manualSave } = useAutoSave(
    content,
    entry?._id,
    memoizedSaveEntry
  );

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Handler for Ctrl+S / Cmd+S shortcut
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      manualSave();
    }
  };

  // Helper to format the "Last Saved" timestamp
  const formatLastSavedTime = (date) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  return (
    <div className="mx-auto max-w-4xl min-h-screen p-6 font-body text-text-primary bg-background transition-colors duration-500">
      {/* Header: Controls & Status */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={onCancel}
            className="flex items-center space-x-2 text-text-primary transition-colors hover:opacity-80"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Journal</span>
          </button>
          <MoodSelectDropdown
            selectedMood={globalMood}
            onMoodChange={setGlobalMood}
          />
        </div>

        <div className="flex items-center space-x-4 text-sm text-secondary">
          <span>{wordCount} words</span>

          {/* Save Status Indicator */}
          <div className="flex items-center space-x-1">
            {isSaving ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : hasUnsavedChanges ? (
              <span className="text-yellow-500 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>Unsaved</span>
              </span>
            ) : lastSaved ? (
              <span className="text-primary flex items-center space-x-1">
                <Save className="w-4 h-4" />
                <span>Saved at {formatLastSavedTime(lastSaved)}</span>
              </span>
            ) : null}
          </div>

          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center space-x-2 rounded-lg border border-primary bg-background px-3 py-2 text-primary transition-colors hover:bg-primary/10"
          >
            {showPreview ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            <span>{showPreview ? "Edit" : "Preview"}</span>
          </button>

          <button
            onClick={manualSave}
            disabled={isSaving || !content.trim()}
            className="flex items-center space-x-2 rounded-lg border border-primary bg-primary px-4 py-2 text-text-contrast transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Save Now</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 flex items-center rounded-lg border-l-4 border-red-500 bg-red-500/10 p-4 text-red-700">
          <AlertCircle className="w-5 h-5 mr-2" />
          <div>
            <span className="font-medium">Save Failed:</span>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Main Form & Editor Area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          manualSave();
        }}
      >
        <div className="rounded-2xl border border-secondary bg-background p-8 shadow-lg">
          {showPreview ? (
            // Using Tailwind's 'prose' plugin for beautiful, automatic styling of rendered content.
            // 'prose-invert' handles dark mode automatically.
            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none font-body">
              <h1>{title}</h1>
              <p className="whitespace-pre-wrap">{content}</p>
              {tags && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {tags
                    .split(",")
                    .filter(Boolean)
                    .map((tag, i) => (
                      <span
                        key={i}
                        className="not-prose rounded-full bg-primary px-3 py-1 text-sm text-text-contrast"
                      >
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
                className="w-full border-0 bg-transparent text-2xl font-bold text-text-primary placeholder:text-secondary/70 focus:outline-none font-body mb-6"
              />
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pour your heart out... What's on your mind today?"
                className="w-full h-96 resize-none border-0 bg-transparent text-lg leading-relaxed text-text-primary placeholder:text-secondary/70 focus:outline-none font-body mb-6"
              />
              <input
                type="text"
                placeholder="Tags (comma-separated, e.g., self-care, book-inspired)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full border-t border-secondary bg-transparent pt-4 text-sm text-text-primary placeholder:text-secondary/70 focus:outline-none"
              />
            </>
          )}
        </div>
      </form>

      {/* Footer Hint */}
      <div className="mt-4 text-center text-sm text-secondary">
        Press{" "}
        <kbd className="rounded bg-secondary px-2 py-1 text-xs text-text-contrast">
          Ctrl+S
        </kbd>{" "}
        to save
      </div>
    </div>
  );
};

export default JournalEditor;
