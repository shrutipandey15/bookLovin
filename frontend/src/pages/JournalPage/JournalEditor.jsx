import { useState, useEffect, useRef, useCallback } from "react";
import { Save } from "lucide-react";
import { useAutoSave } from "@hooks/useAutoSave";

const JournalEditor = ({ entry, onSave, onCancel }) => {
  const [title, setTitle] = useState(entry?.title || "");
  const [content, setContent] = useState(entry?.content || "");
  const [tags, _setTags] = useState(entry?.tags?.join(", ") || "");
  const [writingStartTime] = useState(Date.now());

  const textareaRef = useRef(null);

  const memoizedSaveEntry = useCallback(async () => {
    const entryData = {
      title: title.trim(),
      content: content.trim(),
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      writing_time: Math.floor((Date.now() - writingStartTime) / 1000),
      favorite: entry?.favorite || false,
    };
    await onSave(entryData);
  }, [title, content, tags, writingStartTime, entry, onSave]);

  const { manualSave } = useAutoSave(
    content,
    entry?._id,
    memoizedSaveEntry
  );

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleManualSave = (e) => {
    e.preventDefault();
    manualSave();
  };

  return (
    <div className="w-full h-full max-w-4xl font-body text-text-primary flex flex-col">
      <form onSubmit={handleManualSave} className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <h2 className="text-2xl font-bold text-text-primary">
            {entry ? "Edit Journal Entry" : "New Journal Entry"}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              type="submit"
              className="flex items-center space-x-2 rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-semibold text-text-contrast transition-opacity hover:opacity-90"
            >
              <Save className="w-4 h-4" />
              <span>Save Entry</span>
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-secondary px-4 py-2 text-sm font-semibold text-text-primary transition-colors hover:bg-secondary/20"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Editor Card */}
        <div className="flex-grow flex flex-col rounded-2xl border border-secondary bg-background p-8 shadow-lg">
          <div className="space-y-6 flex flex-col flex-grow">
            <div>
              <label htmlFor="entry-title" className="block text-sm font-medium text-text-secondary mb-1">
                Title
              </label>
              <input
                id="entry-title"
                type="text"
                placeholder="Enter book title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border-0 bg-transparent text-xl font-semibold text-text-primary placeholder:text-secondary/70 focus:outline-none"
              />
            </div>
            
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                    <p className="text-text-primary">How are you feeling about this book?</p>
                </div>
            </div>

            <div className="flex flex-col flex-grow">
              <label htmlFor="entry-content" className="block text-sm font-medium text-text-secondary mb-1">
                Your Thoughts
              </label>
              <textarea
                id="entry-content"
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts, feelings, favorite quotes..."
                className="w-full flex-grow resize-none border-0 bg-transparent text-base leading-relaxed placeholder:text-secondary/70 focus:outline-none magical-ink"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default JournalEditor;