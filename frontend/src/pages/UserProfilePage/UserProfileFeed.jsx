import React from 'react';
import PostCard from '@components/PostCard';
import ConfessionCard from '@pages/ConfessionPage/ConfessionCard';
import JournalHighlightCard from './JournalHighlightCard';
import {
  MessageSquare,
  BookHeart,
  ShieldOff,
} from "lucide-react";

const UserProfileFeed = ({
  activeTab,
  setActiveTab,
  posts,
  isOwner,
  journalEntries,
  journalStatus,
  confessions,
  confessionsStatus,
}) => {
  return (
    <div className="w-full lg:w-2/3">
      {/* --- TAB NAVIGATION --- */}
      <div className="mb-8 flex justify-center border-b border-secondary">
        <button
          onClick={() => setActiveTab("posts")}
          className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === "posts"
              ? "border-b-2 border-primary text-primary"
              : "text-secondary hover:text-primary"
          }`}
        >
          <MessageSquare size={18} /> Showcase ({posts.length})
        </button>

        <button
          onClick={() => setActiveTab("journal")}
          className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === "journal"
              ? "border-b-2 border-primary text-primary"
              : "text-secondary hover:text-primary"
          }`}
        >
          <BookHeart size={18} /> Journal ({journalEntries.length})
        </button>

        {isOwner && (
          <button
            onClick={() => setActiveTab("confessions")}
            className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === "confessions"
                ? "border-b-2 border-primary text-primary"
                : "text-secondary hover:text-primary"
            }`}
          >
            <ShieldOff size={18} /> Confessions ({confessions.length})
          </button>
        )}
      </div>

      {/* --- TAB CONTENT --- */}
      <div>
        {activeTab === "posts" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.length > 0 ? (
              posts.map((p) => <PostCard key={p.uid} post={p} />)
            ) : (
              <p className="col-span-full text-center text-secondary py-10">
                Shared posts will appear here.
              </p>
            )}
          </div>
        )}

        {activeTab === "journal" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {journalStatus === "loading" && <p>Loading journal...</p>}
            {journalStatus === "succeeded" && journalEntries.length > 0 ? (
              journalEntries.map((entry) => (
                <JournalHighlightCard key={entry.uid} entry={entry} />
              ))
            ) : (
              journalStatus !== "loading" && (
                <p className="col-span-full text-center text-secondary py-10">
                  Journal highlights will appear here.
                </p>
              )
            )}
          </div>
        )}

        {isOwner && activeTab === "confessions" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {confessionsStatus === "loading" && <p>Loading confessions...</p>}
            {confessionsStatus === "succeeded" && confessions.length > 0 ? (
              confessions.map((entry) => (
                <ConfessionCard key={entry.uid} confession={entry} isOwner={true} />
              ))
            ) : (
              confessionsStatus !== "loading" && (
                <p className="col-span-full text-center text-secondary py-10">
                  Your private confessions are kept here.
                </p>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileFeed;
