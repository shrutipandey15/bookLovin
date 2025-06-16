import { useState, useEffect, useRef, useCallback } from 'react';
import { Save, ArrowLeft, Calendar, Mail, Heart, Clock, User } from 'lucide-react';
import { getWordCount } from '@utils/journalUtils';
import MoodSelectDropdown from './MoodSelectDropdown';

const LetterComposer = ({ letter, onSave, onCancel, error }) => {
  const [letterType, setLetterType] = useState(letter?.type || 'future');
  // Use camelCase for state consistency
  const [targetDate, setTargetDate] = useState(letter?.targetDate || '');
  const [content, setContent] = useState(letter?.content || '');
  const [mood, setMood] = useState(letter?.mood ?? 2);
  const [writingStartTime] = useState(Date.now());

  const textareaRef = useRef(null);
  const wordCount = getWordCount(content);

  const handleSave = useCallback(async () => {
    // Build the payload with camelCase props
    const letterData = {
      type: letterType,
      targetDate: targetDate,
      content: content.trim(),
      mood,
      writingTime: letter ? letter.writingTime : Math.floor((Date.now() - writingStartTime) / 1000),
      wordCount: wordCount,
    };
    await onSave(letterData);
  }, [letterType, targetDate, content, mood, writingStartTime, wordCount, onSave, letter]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  const getMinDate = () => {
    if (letterType === 'future') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }
    // No min date for past letters
    return undefined;
  };

  const getMaxDate = () => {
    if (letterType === 'past') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday.toISOString().split('T')[0];
    }
    // No max date for future letters
    return undefined;
  };

  const getPlaceholderText = () => {
    if (letterType === 'future') {
      return `Dear Future Me,\n\nI'm writing to you from ${new Date().toLocaleDateString()}. Right now, I'm feeling...\n\nI hope by the time you read this, you've...\n\nWith love and hope,\nPresent You`;
    }
    return `Dear Past Me,\n\nI'm writing to you from the future - ${new Date().toLocaleDateString()}.\n\nI want you to know that everything you're going through right now...\n\nIf I could give you one piece of advice, it would be...\n\nWith love and wisdom,\nFuture You`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen" style={{ backgroundColor: 'var(--mood-bg)', color: 'var(--mood-text)', fontFamily: 'var(--mood-font)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={onCancel} className="flex items-center space-x-2 transition-colors hover:opacity-80" style={{ color: 'var(--mood-text)' }}>
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Inbox</span>
        </button>
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">Letter to {letterType === 'future' ? 'Future' : 'Past'} Self</h1>
          <MoodSelectDropdown selectedMood={mood} onMoodChange={setMood} />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg border-l-4" style={{ borderColor: 'var(--error-color, #ef4444)', backgroundColor: 'var(--error-bg, #fef2f2)', color: 'var(--error-text, #dc2626)' }}>
          Error: {error}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <div className="rounded-2xl shadow-lg p-8 mb-6" style={{ backgroundColor: 'var(--mood-contrast)', border: `1px solid var(--mood-secondary)` }}>
          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--mood-text)' }}>Type</label>
              <div className="flex space-x-2">
                {['future', 'past'].map(type => (
                  <button key={type} type="button" onClick={() => setLetterType(type)} className={`flex items-center space-x-2 px-4 py-2 rounded-lg border text-sm transition-all ${letterType === type ? 'border-2' : ''}`} style={{ backgroundColor: letterType === type ? 'var(--mood-primary)' : 'var(--mood-bg)', borderColor: 'var(--mood-primary)', color: letterType === type ? 'var(--mood-contrast)' : 'var(--mood-text)' }}>
                    {type === 'future' ? <Clock className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    <span>{type.charAt(0).toUpperCase() + type.slice(1)} Self</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--mood-text)' }}>
                {letterType === 'future' ? 'Deliver On' : 'Date to Remember'}
              </label>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5" style={{ color: 'var(--mood-primary)' }} />
                <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} min={getMinDate()} max={getMaxDate()} className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2" style={{ backgroundColor: 'var(--mood-bg)', borderColor: 'var(--mood-secondary)', color: 'var(--mood-text)', focusRingColor: 'var(--mood-primary)' }} required />
              </div>
            </div>
          </div>

          {/* Text Area */}
          <div className="mb-6">
            <textarea ref={textareaRef} value={content} onChange={(e) => setContent(e.target.value)} onKeyDown={handleKeyDown} placeholder={getPlaceholderText()} className="w-full h-96 border-t pt-6 bg-transparent resize-none focus:outline-none text-lg leading-relaxed placeholder-opacity-50" style={{ color: 'var(--mood-text)', fontFamily: 'var(--mood-font)', borderColor: 'var(--mood-secondary)' }} required />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--mood-secondary)' }}>
            <span className="text-sm" style={{ color: 'var(--mood-secondary)' }}>{wordCount} words</span>
            <button type="submit" disabled={!content.trim() || !targetDate} className="px-6 py-2 border rounded-lg hover:opacity-80 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: 'var(--mood-primary)', borderColor: 'var(--mood-primary)', color: 'var(--mood-contrast)' }}>
              <Heart className="w-4 h-4" />
              <span>{letterType === 'future' ? 'Schedule Letter' : 'Save Letter'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LetterComposer;
