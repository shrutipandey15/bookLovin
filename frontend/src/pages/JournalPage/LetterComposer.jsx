import { useState, useEffect, useRef, useCallback } from 'react';
import { Save, ArrowLeft, Calendar, Heart, Clock, User } from 'lucide-react';
import { getWordCount } from '@utils/journalUtils';
import MoodSelectDropdown from '@pages/JournalPage/MoodSelectDropdown';

const LetterComposer = ({ letter, onSave, onCancel }) => {
  const [letterType, setLetterType] = useState(letter?.type || 'future');
  const [targetDate, setTargetDate] = useState(letter?.targetDate || '');
  const [content, setContent] = useState(letter?.content || '');
  const [mood, setMood] = useState(letter?.mood ?? 2);
  const textareaRef = useRef(null);
  const wordCount = getWordCount(content);

  const handleSave = useCallback(() => {
    const letterData = { type: letterType, targetDate, content: content.trim(), mood, wordCount };
    onSave(letterData);
  }, [letterType, targetDate, content, mood, wordCount, onSave]);

  useEffect(() => { textareaRef.current?.focus(); }, []);

  const getMinDate = () => {
    if (letterType === 'future') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }
  };
  const getMaxDate = () => {
    if (letterType === 'past') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday.toISOString().split('T')[0];
    }
  };
  const getPlaceholderText = () => letterType === 'future' ? `Dear Future Me...\n\nI hope by the time you read this...` : `Dear Past Me...\n\nI want you to know that...`;

  return (
    <div className="mx-auto max-w-4xl min-h-screen p-6 bg-background text-text-primary font-body">
      <header className="mb-8 flex items-center justify-between">
        <button onClick={onCancel} className="flex items-center space-x-2 text-text-primary transition-colors hover:opacity-80">
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Inbox</span>
        </button>
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">Letter to {letterType === 'future' ? 'Future' : 'Past'} Self</h1>
          <MoodSelectDropdown selectedMood={mood} onMoodChange={setMood} />
        </div>
      </header>
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <div className="mb-6 rounded-2xl border border-secondary bg-background p-8 shadow-lg">
          <div className="mb-6 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary">Type</label>
              <div className="flex space-x-2">
                {['future', 'past'].map(type => (
                  <button key={type} type="button" onClick={() => setLetterType(type)}
                    className={`flex items-center space-x-2 rounded-lg border px-4 py-2 text-sm transition-all ${letterType === type ? 'border-primary bg-primary text-text-contrast' : 'border-secondary bg-background text-text-primary hover:border-primary/70'}`}
                  >
                    {type === 'future' ? <Clock className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    <span>{type.charAt(0).toUpperCase() + type.slice(1)} Self</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary">{letterType === 'future' ? 'Deliver On' : 'Date to Remember'}</label>
              <div className="flex items-center space-x-3 rounded-lg border border-secondary bg-background px-3 py-1.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/50">
                <Calendar className="h-5 w-5 text-primary" />
                <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} min={getMinDate()} max={getMaxDate()} required 
                  className="bg-transparent text-text-primary focus:outline-none" />
              </div>
            </div>
          </div>
          <textarea ref={textareaRef} value={content} onChange={(e) => setContent(e.target.value)} required placeholder={getPlaceholderText()}
            className="mb-6 h-96 w-full resize-none border-t border-secondary bg-transparent pt-6 text-lg leading-relaxed text-text-primary placeholder:text-secondary focus:outline-none"
          />
          <div className="flex items-center justify-between border-t border-secondary pt-4">
            <span className="text-sm text-secondary">{wordCount} words</span>
            <button type="submit" disabled={!content.trim() || !targetDate} className="flex items-center space-x-2 rounded-lg border border-primary bg-primary px-6 py-2 text-text-contrast transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
              <Heart className="h-4 w-4" />
              <span>{letterType === 'future' ? 'Schedule Letter' : 'Save Letter'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LetterComposer;
