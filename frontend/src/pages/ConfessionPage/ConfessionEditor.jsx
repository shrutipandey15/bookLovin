import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createConfession } from "@redux/confessionSlice";
import { useMood } from "@components/MoodContext";

const ConfessionEditor = () => {
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const { mood } = useMood();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    const confessionData = {
      content: content.trim(),
      moodKey: mood,
      isAnonymous,
    };

    dispatch(createConfession(confessionData));

    navigate("/confessions");
  };

  return (
    <div className="mx-auto max-w-2xl p-8 font-body text-text-primary">
      <h1 className="text-3xl font-bold text-primary mb-4">
        Share a Confession
      </h1>
      <p className="text-secondary mb-8">
        Release a thought into the ether. It can be anonymous or shared with
        your pen name.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-48 resize-none rounded-lg border border-secondary p-4 bg-background focus:border-primary focus:ring-primary"
          placeholder="What's on your mind...?"
          required
        />
        <div className="flex items-center justify-between">
          <label
            htmlFor="anonymous"
            className="flex items-center gap-2 cursor-pointer text-sm"
          >
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="h-4 w-4 rounded border-secondary text-primary focus:ring-primary"
            />
            <span>Post Anonymously</span>
          </label>
          <button
            type="submit"
            className="rounded-lg bg-primary px-6 py-2 text-text-contrast transition-opacity hover:opacity-90 disabled:opacity-50"
            disabled={!content.trim()}
          >
            Confess
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConfessionEditor;
