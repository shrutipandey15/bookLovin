import { useState, useEffect, useRef, useCallback } from "react";
import { Save } from "lucide-react";
import { useAutoSave } from "@hooks/useAutoSave";
import MoodSelectDropdown from "./MoodSelectDropdown";
import { useMood } from "@components/MoodContext";
import { MOOD_ENUM_TO_KEY, MOOD_KEY_TO_ENUM, MOOD_CONFIG } from "@config/moods";

const JournalEditor = ({ entry, onSave, onCancel }) => {
  const { mood: globalMood, setMood: setGlobalMood } = useMood();
  const [title, setTitle] = useState(entry?.title || "");
  const [content, setContent] = useState(entry?.content || "");
  const [tags, _setTags] = useState(entry?.tags?.join(", ") || "");
  const [writingStartTime] = useState(Date.now());

  const textareaRef = useRef(null);

  const shimmerColorDark = MOOD_CONFIG[globalMood]?.accents?.daydream.primary || '#A0522D'; // Fallback color
  const shimmerColorLight = MOOD_CONFIG[globalMood]?.accents?.daydream.secondary || '#D2B48C'; // Fallback color

  const magicalInkStyle = {
    '--shimmer-color-dark': shimmerColorDark,
    '--shimmer-color-light': shimmerColorLight,
  };

  useEffect(() => {
    if (entry?.mood) {
      const moodKey = MOOD_ENUM_TO_KEY[entry.mood];
      if (moodKey) {
        setGlobalMood(moodKey);
      }
    }
  }, [entry, setGlobalMood]);

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
  }, [title, content, globalMood, tags, writingStartTime, entry, onSave]);

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
                    <label className="block text-sm font-medium text-text-secondary mb-1">Current Mood</label>
                    <p className="text-text-primary">How are you feeling about this book?</p>
                </div>
                <MoodSelectDropdown
                  selectedMood={globalMood}
                  onMoodChange={setGlobalMood}
                />
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
                style={magicalInkStyle}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default JournalEditor;