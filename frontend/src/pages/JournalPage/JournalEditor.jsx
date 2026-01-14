import { useState, useEffect, useRef, useCallback } from "react";
import { useAutoSave } from "@hooks/useAutoSave";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import {
  FONTS, PAPERS, MOODS,
  getFont, getPaper, getMood,
  getJournalPrefs, saveJournalPrefs
} from "@config/journal";

// Ambient toolbar - appears on hover, fades after inactivity
const AmbientToolbar = ({
  font, setFont,
  paper, setPaper,
  mood, setMood,
  visible,
  onInteraction
}) => {
  return (
    <div
      className={`absolute top-4 right-4 flex items-center gap-3 transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onMouseEnter={onInteraction}
    >
      {/* Font selector */}
      <div className="flex items-center gap-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg p-1 shadow-sm">
        {FONTS.map(f => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFont(f.id)}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              font === f.id
                ? 'bg-slate-200 dark:bg-slate-600 text-slate-900 dark:text-white'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
            style={{ fontFamily: f.fontFamily }}
            title={f.description}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Paper selector */}
      <div className="flex items-center gap-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg p-1 shadow-sm">
        {PAPERS.map(p => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPaper(p.id)}
            className={`w-6 h-6 rounded border-2 transition-all ${
              paper === p.id
                ? 'border-slate-400 scale-110'
                : 'border-transparent hover:border-slate-300'
            } ${p.bg}`}
            title={p.label}
          />
        ))}
      </div>

      {/* Mood - abstract symbols */}
      <div className="flex items-center gap-0.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg p-1 shadow-sm">
        {MOODS.map(m => (
          <button
            key={m.id || 'neutral'}
            type="button"
            onClick={() => setMood(m.id)}
            className={`w-7 h-7 flex items-center justify-center rounded text-lg transition-all ${
              mood === m.id
                ? 'bg-slate-200 dark:bg-slate-600 scale-110'
                : 'hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            style={{ color: m.color === 'transparent' ? 'currentColor' : m.color }}
            title={m.id || 'No mood'}
          >
            {m.emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

// Minimal save indicator
const SaveIndicator = ({ saving, lastSaved }) => {
  if (!lastSaved && !saving) return null;

  return (
    <div className="absolute bottom-4 right-4 text-xs text-slate-400 transition-opacity">
      {saving ? 'Saving...' : lastSaved ? `Saved ${lastSaved}` : ''}
    </div>
  );
};

const JournalEditor = ({ entry, onSave, onCancel }) => {
  // Load preferences
  const prefs = getJournalPrefs();

  // Core state
  const [title, setTitle] = useState(entry?.title || "");
  const [content, setContent] = useState(entry?.content || "");
  const [font, setFont] = useState(entry?.font || prefs.font || 'serif');
  const [paper, setPaper] = useState(entry?.paper || prefs.paper || 'warm');
  const [mood, setMood] = useState(entry?.mood || null);
  const [linkedBooks] = useState(entry?.linked_books || []);
  const [writingStartTime] = useState(Date.now());

  // UI state
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saving, setSaving] = useState(false);
  const hideTimeoutRef = useRef(null);
  const editorContainerRef = useRef(null);
  const titleRef = useRef(null);

  // Get current styles
  const currentFont = getFont(font);
  const currentPaper = getPaper(paper);

  // TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: '',
        showOnlyWhenEditable: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate dark:prose-invert max-w-none focus:outline-none min-h-full',
        style: `font-family: ${currentFont.fontFamily}`,
      },
    },
  });

  // Update editor font when it changes
  useEffect(() => {
    if (editor) {
      editor.setOptions({
        editorProps: {
          attributes: {
            class: 'prose prose-slate dark:prose-invert max-w-none focus:outline-none min-h-full',
            style: `font-family: ${currentFont.fontFamily}`,
          },
        },
      });
    }
  }, [editor, currentFont.fontFamily]);

  // Focus on load - cursor first!
  useEffect(() => {
    // Small delay to ensure editor is ready
    const timer = setTimeout(() => {
      if (editor && !entry) {
        editor.commands.focus('end');
      } else if (titleRef.current && !entry?.title) {
        titleRef.current.focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [editor, entry]);

  // Save preferences when they change
  useEffect(() => {
    saveJournalPrefs({ font, paper, structure: 'free' });
  }, [font, paper]);

  // Toolbar visibility - show on mouse movement, hide after inactivity
  const showToolbar = useCallback(() => {
    setToolbarVisible(true);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      setToolbarVisible(false);
    }, 3000);
  }, []);

  const handleMouseMove = useCallback(() => {
    showToolbar();
  }, [showToolbar]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // Save function
  const memoizedSaveEntry = useCallback(async () => {
    setSaving(true);
    const entryData = {
      title: title.trim() || 'Untitled',
      content: content.trim(),
      tags: [],
      writingTime: Math.floor((Date.now() - writingStartTime) / 1000),
      favorite: entry?.favorite || false,
      mood,
      linked_books: linkedBooks,
      font,
      paper,
    };
    await onSave(entryData);
    setSaving(false);
    setLastSaved('just now');

    // Update "just now" to actual time after a bit
    setTimeout(() => setLastSaved(null), 5000);
  }, [title, content, writingStartTime, entry, onSave, mood, linkedBooks, font, paper]);

  const { manualSave } = useAutoSave(
    content,
    entry?._id,
    memoizedSaveEntry
  );

  const handleManualSave = (e) => {
    e.preventDefault();
    manualSave();
  };

  // Handle @book mentions in content (future feature)
  const handleKeyDown = () => {
    // Future: detect @ for book tagging
  };

  // Paper background classes
  const paperClasses = `${currentPaper.bg} ${currentPaper.border}`;
  const isDark = currentPaper.dark;

  return (
    <div
      ref={editorContainerRef}
      className={`relative w-full h-full flex flex-col ${paperClasses} rounded-2xl border transition-colors duration-300`}
      onMouseMove={handleMouseMove}
      onMouseEnter={showToolbar}
    >
      {/* Ambient toolbar */}
      <AmbientToolbar
        font={font}
        setFont={setFont}
        paper={paper}
        setPaper={setPaper}
        mood={mood}
        setMood={setMood}
        visible={toolbarVisible}
        onInteraction={showToolbar}
      />

      {/* Writing area */}
      <form onSubmit={handleManualSave} className="flex-grow flex flex-col p-8 md:p-12">
        {/* Title - optional, unobtrusive */}
        <input
          ref={titleRef}
          type="text"
          placeholder=""
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`w-full bg-transparent border-0 text-2xl font-light mb-6 focus:outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 ${
            isDark ? 'text-slate-100' : 'text-slate-800'
          }`}
          style={{ fontFamily: currentFont.fontFamily }}
        />

        {/* Lined paper effect */}
        {currentPaper.lined && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="border-b border-slate-200/30"
                style={{ height: '28px' }}
              />
            ))}
          </div>
        )}

        {/* Editor */}
        <div
          className={`flex-grow relative ${isDark ? 'text-slate-100' : 'text-slate-800'}`}
          onKeyDown={handleKeyDown}
        >
          <EditorContent
            editor={editor}
            className="h-full"
          />
        </div>

        {/* Linked books - subtle display if any */}
        {linkedBooks.length > 0 && (
          <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
            {linkedBooks.map(book => (
              <span key={book.book_id} className="px-2 py-1 bg-slate-100/50 dark:bg-slate-800/50 rounded">
                {book.title}
              </span>
            ))}
          </div>
        )}

        {/* Minimal action bar - only shows on hover or when needed */}
        <div className={`mt-6 flex items-center justify-between transition-opacity duration-300 ${
          toolbarVisible ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            Close
          </button>
          <button
            type="submit"
            className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            Save
          </button>
        </div>
      </form>

      {/* Save indicator */}
      <SaveIndicator saving={saving} lastSaved={lastSaved} />

      {/* Mood indicator - subtle ambient display in corner */}
      {mood && (
        <div
          className="absolute bottom-4 left-4 text-lg opacity-50"
          style={{ color: getMood(mood).color }}
        >
          {getMood(mood).emoji}
        </div>
      )}
    </div>
  );
};

export default JournalEditor;
