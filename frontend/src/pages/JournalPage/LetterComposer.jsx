import { useState, useRef } from "react";
import { Send, Clock, Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getWordCount } from "@utils/journalUtils";
import { LetterType } from "@constants/letterType";

const LetterComposer = ({ onSave, onCancel }) => {
  const [content, setContent] = useState("");
  const [letterType, setLetterType] = useState(LetterType.FUTURE);

  const getDefaultFutureDate = () => {
    const now = new Date();
    now.setDate(now.getDate() + 7);
    return now;
  };

  const [targetDate, setTargetDate] = useState(getDefaultFutureDate());
  
  const textareaRef = useRef(null);
  const wordCount = getWordCount(content);

  const handleTypeChange = (newType) => {
    setLetterType(newType);
    if (newType === LetterType.FUTURE) {
      setTargetDate(getDefaultFutureDate());
    }
  };

  const handleSave = () => {
    const letterData = {
      content: content.trim(),
      type: letterType,
      word_count: wordCount,
    };

    if (letterType === LetterType.FUTURE) {
      letterData.target_date = targetDate.toISOString();
    }    
    onSave(letterData);
  };

  const getButtonClass = (type) =>
    `px-4 py-2 rounded-lg transition-colors w-full font-semibold ${
      letterType === type
        ? "bg-primary text-text-contrast shadow-md"
        : "bg-background text-text-secondary hover:bg-secondary/20"
    }`;

  const placeholderText =
    letterType === LetterType.FUTURE
      ? "Dear Future Me, I want you to remember this..."
      : "I'm writing this down to remember a moment from the past...";

  const dateLabel = "When should this letter be delivered?";

  return (
    <div className="h-full flex flex-col font-body text-text-primary">
      <header className="flex-shrink-0 flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold font-heading text-text-primary">
          {letterType === LetterType.FUTURE
            ? "Letter to the Future"
            : "Memory from the Past"}
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSave}
            disabled={!content.trim()}
            className="flex items-center space-x-2 rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-semibold text-text-contrast transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>Seal Letter</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-secondary px-4 py-2 text-sm font-semibold text-text-primary transition-colors hover:bg-secondary/20"
          >
            Cancel
          </button>
        </div>
      </header>

      {/* Main editor card */}
      <div className="flex-grow flex flex-col rounded-2xl border border-secondary bg-background p-8 shadow-lg space-y-6">
        {/* --- TYPE TOGGLE --- */}
        <div>
          <div className="flex items-center gap-2 p-1 bg-secondary/10 rounded-lg">
            <button
              onClick={() => handleTypeChange(LetterType.FUTURE)}
              className={getButtonClass(LetterType.FUTURE)}
            >
              <div className="flex items-center justify-center gap-2">
                <Clock size={16} />
                <span>To the Future</span>
              </div>
            </button>
            <button
              onClick={() => handleTypeChange(LetterType.PAST)}
              className={getButtonClass(LetterType.PAST)}
            >
              <div className="flex items-center justify-center gap-2">
                <Calendar size={16} />
                <span>From the Past</span>
              </div>
            </button>
          </div>
        </div>

        {/* --- DATE PICKER (Conditional) --- */}
        {letterType === LetterType.FUTURE && (
          <div>
            <label
              htmlFor="targetDate"
              className="block text-sm font-medium text-secondary mb-2"
            >
              {dateLabel}
            </label>
            <DatePicker
              id="targetDate"
              selected={targetDate}
              onChange={(date) => setTargetDate(date)}
              minDate={new Date()} // Only allow future dates
              dateFormat="MMMM d, yyyy"
              className="w-full rounded-lg border border-secondary bg-background px-4 py-2 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        )}

        {/* --- TEXT AREA --- */}
        <div className="flex flex-col flex-grow">
          <label
            htmlFor="content"
            className="block text-sm font-medium text-secondary mb-2"
          >
            {letterType === LetterType.FUTURE ? "Your Letter" : "Your Memory"}
          </label>
          <textarea
            id="content"
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            placeholder={placeholderText}
            className="w-full flex-grow resize-none bg-background text-base leading-relaxed text-text-primary placeholder:text-secondary focus:outline-none"
            style={{ fontFamily: "'Lora', serif", fontSize: "1.1rem" }}
          />
          <div className="text-right text-sm text-secondary mt-2">
            {wordCount} words
          </div>
        </div>
      </div>
    </div>
  );
};

export default LetterComposer;