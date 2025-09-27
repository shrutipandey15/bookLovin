import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchConfessions, createConfession } from "@redux/confessionSlice";
import ConfessionCard from "@pages/ConfessionPage/ConfessionCard";
import ConfessionEditor from "@pages/ConfessionPage/ConfessionEditor";
import SingleConfessionPage from "@pages/ConfessionPage/SingleConfessionPage";
import { Plus, Tag, Drama } from "lucide-react";

const ConfessionWallPage = () => {
  const dispatch = useDispatch();
  const { items: confessions, status } = useSelector(
    (state) => state.confessions
  );

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeTag, setActiveTag] = useState(null);
  const [viewingConfessionId, setViewingConfessionId] = useState(null);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchConfessions());
    }
  }, [dispatch, status]);

  const handleSaveConfession = (confessionData) => {
    dispatch(createConfession(confessionData));
    setIsEditorOpen(false);
  };

  const handleCardClick = (confessionId) => {
    setViewingConfessionId(confessionId);
  };

  const handleCloseViewer = () => {
    setViewingConfessionId(null);
  };

  const allTags = [...new Set(confessions.flatMap(c => c.tags || []))];

  const filteredConfessions = activeTag
    ? confessions.filter(c => c.tags?.includes(activeTag))
    : confessions;

  const renderContent = () => {
    if (status === "loading") {
      return (
        <p className="py-10 text-center text-text-secondary">
          Gathering whispers from the ether...
        </p>
      );
    }
    if (status === "failed") {
      return (
        <p className="py-10 text-center text-red-500">
          The stars are not aligned. Could not fetch confessions.
        </p>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredConfessions.map((confession) => (
          <ConfessionCard
            key={confession._id}
            confession={confession}
            onTagClick={setActiveTag}
            onCardClick={() => handleCardClick(confession._id)}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <div className={`mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8 transition-filter duration-300 ${viewingConfessionId ? 'blur-sm' : ''}`}>
        <header className="mb-8 text-center">
          <div className="animate-float inline-block mb-2">
            <Drama className="h-12 w-12 text-primary opacity-70" strokeWidth={1.5} />
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-wider text-primary">
            The Confession Wall
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-text-secondary text-sm">
            A safe space for your most controversial book opinions, guilty reading pleasures, and literary confessions. All confessions are anonymous - let your literary soul speak freely.
          </p>
          <button
            onClick={() => setIsEditorOpen(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-semibold text-text-contrast text-sm shadow-lg transition-transform hover:scale-105"
          >
            <Plus size={18} />
            Share a Confession
          </button>
        </header>
        
        <div className="mb-6 flex flex-wrap items-center gap-2 py-2 justify-center">
            <Tag className="mr-2 text-secondary" size={16} />
            <button
                onClick={() => setActiveTag(null)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${!activeTag ? 'bg-primary text-text-contrast' : 'bg-background hover:bg-secondary/20'}`}
            >
                All
            </button>
            {allTags.map(tag => (
                <button
                    key={tag}
                    onClick={() => setActiveTag(tag)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${activeTag === tag ? 'bg-primary text-text-contrast' : 'bg-background hover:bg-secondary/20'}`}
                >
                    #{tag}
                </button>
            ))}
        </div>

        <div className="max-h-[65vh] overflow-y-auto no-scrollbar pr-2">
          {renderContent()}
        </div>

        <button
          onClick={() => setIsEditorOpen(true)}
          className="fixed bottom-8 right-8 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-text-contrast shadow-lg transition-transform hover:scale-110"
          aria-label="Write a new confession"
        >
          <Plus className="h-7 w-7" />
        </button>
      </div>

      <ConfessionEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveConfession}
      />
      
      {viewingConfessionId && (
        <SingleConfessionPage
          confessionId={viewingConfessionId}
          onClose={handleCloseViewer}
        />
      )}
    </>
  );
};

export default ConfessionWallPage;