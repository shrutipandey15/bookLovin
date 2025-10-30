import React from 'react';
import PostCard from '@components/PostCard';
import ConfessionCard from '@pages/ConfessionPage/ConfessionCard'; 
import JournalHighlightCard from './JournalHighlightCard'; 
import {
  MessageSquare,
  Wand2,
  BookHeart,
  ShieldOff,
} from "lucide-react";

const PrivateCreationCard = ({ creation, onPost }) => {
  return (
    <div
      className="relative group bg-card-background rounded-lg shadow-lg overflow-hidden cursor-pointer"
      onClick={() => onPost(creation)}
    >
      <img
        src={creation.imageUrl}
        alt={creation.prompt}
        className="w-full h-48 object-cover"
      />
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-white font-semibold text-center p-2">
          Post This
        </span>
      </div>
      <p
        className="p-2 text-xs text-secondary truncate"
        title={creation.prompt}
      >
        {creation.prompt}
      </p>
    </div>
  );
};

const UserProfileFeed = ({
  activeTab,
  setActiveTab,
  posts,
  privateCreations,
  creationsFetchStatus,
  handleOpenPostModal,
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
        
        <button
          onClick={() => setActiveTab("creations")}
          className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === "creations"
              ? "border-b-2 border-primary text-primary"
              : "text-secondary hover:text-primary"
          }`}
        >
          <Wand2 size={18} /> My Creations ({privateCreations.length})
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

        {activeTab === "creations" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {creationsFetchStatus === "loading" && (
              <p className="col-span-full text-center text-secondary py-10">
                Loading creations...
              </p>
            )}
            {creationsFetchStatus !== "loading" &&
            privateCreations.length > 0 ? (
              privateCreations.map((c) => (
                <PrivateCreationCard
                  key={c.id}
                  creation={c}
                  onPost={handleOpenPostModal}
                />
              ))
            ) : (
              creationsFetchStatus !== "loading" && (
                <p className="col-span-full text-center text-secondary py-10">
                  Your generated art will be saved here.
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