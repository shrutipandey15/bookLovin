import { useState, useRef } from "react";
import { Send } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getWordCount } from "@utils/journalUtils";

const LetterComposer = ({ onSave, onCancel }) => {  
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const textareaRef = useRef(null);
  const wordCount = getWordCount(content);

  const handleSave = () => {
    const letterData = {
      recipient: recipient.trim(),
      subject: subject.trim(),
      content: content.trim(),
      word_count: wordCount,
    };
    onSave(letterData);
  };

  return (
    <div className="h-full flex flex-col font-body text-text-primary">
       <header className="flex-shrink-0 flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary">
            New Letter
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              disabled={!content.trim() || !recipient.trim() || !subject.trim()}
              className="flex items-center space-x-2 rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-semibold text-text-contrast transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Send Letter</span>
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

        <div className="flex-grow flex flex-col rounded-2xl border border-secondary bg-background p-8 shadow-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                    type="text"
                    placeholder="Recipient's Pen Name"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full border-b border-border-color bg-transparent pb-2 text-text-primary placeholder:text-secondary focus:outline-none"
                />
            </div>
             <input
                type="text"
                placeholder="Subject Line"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border-b border-border-color bg-transparent pb-2 text-xl font-semibold text-text-primary placeholder:text-secondary focus:outline-none"
            />
            <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                placeholder="My dearest fellow book lover..."
                className="w-full flex-grow resize-none bg-transparent text-base leading-relaxed text-text-primary placeholder:text-secondary focus:outline-none"
            />
            <div className="text-right text-sm text-secondary">{wordCount} words</div>
        </div>
    </div>
  );
};

export default LetterComposer;