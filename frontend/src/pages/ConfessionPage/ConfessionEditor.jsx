import { useState } from "react";
import { useMood } from "@components/MoodContext";
import { X } from "lucide-react";

const suggestedTags = [
  'unpopular-opinion', 'book-hoarding', 'guilty-pleasure',
  'classics', 'romance', 'fantasy', '#dnf', '#fanfiction',
  'controversial', 'shame', 'help'
];

const ConfessionEditor = ({ isOpen, onClose, onSave }) => {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const { mood } = useMood();

  if (!isOpen) return null;

  const handleTagClick = (tag) => {
    setTags(currentTags =>
      currentTags.includes(tag)
        ? currentTags.filter(t => t !== tag)
        : [...currentTags, tag]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    const confessionData = {
      content: content.trim(),
      moodKey: mood,
      tags: tags,
      isAnonymous: true, // As per design, all are anonymous
    };

    onSave(confessionData);
    // Reset state for next time
    setContent("");
    setTags([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-background p-8 shadow-2xl border border-border-color">
        <button onClick={onClose} className="absolute top-4 right-4 text-secondary transition-colors hover:text-primary">
            <X size={24} />
        </button>
        <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-primary font-heading">Your Literary Confession</h2>
            <p className="text-text-secondary mt-1">What's your most controversial book opinion?</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-40 resize-none rounded-lg border-2 border-dashed border-secondary p-4 bg-background focus:border-primary focus:ring-primary"
                placeholder="Share your deepest, darkest reading secrets..."
                required
            />
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Tags (optional)</label>
                <div className="flex flex-wrap gap-2">
                    {suggestedTags.map(tag => (
                        <button
                            type="button"
                            key={tag}
                            onClick={() => handleTagClick(tag)}
                            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${tags.includes(tag) ? 'bg-primary text-text-contrast' : 'bg-secondary/20 text-text-primary'}`}
                        >
                            #{tag}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex items-center justify-end gap-4 pt-4">
                <button type="button" onClick={onClose} className="rounded-lg px-6 py-2 font-semibold text-text-secondary hover:bg-secondary/20">
                    Cancel
                </button>
                <button
                    type="submit"
                    className="rounded-lg bg-primary px-6 py-2 font-semibold text-text-contrast transition-opacity hover:opacity-90 disabled:opacity-50"
                    disabled={!content.trim()}
                >
                    Share Anonymously
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default ConfessionEditor;