import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchShelf, removeBookFromShelf } from "@redux/booksSlice";
import { fetchUserProfile } from "@redux/profileSlice";
import { fetchPrivateCreations } from "@redux/creationsSlice";
import { createPost } from "@redux/postsSlice";
import {
  User,
  BookOpenCheck,
  MessageSquare,
  Loader,
  Image,
  Wand2,
  X,
  Trash2,
  BookUser,
} from "lucide-react";
import PostCard from "@components/PostCard";
import { useNotification } from "@components/Layout";

const PostCreationModal = ({ creation, onClose, onShare }) => {
  const [caption, setCaption] = useState("");
  const handleShare = () => {
    onShare(caption);
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-background rounded-2xl shadow-xl max-w-lg w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-secondary hover:text-primary"
        >
          <X />
        </button>
        <h2 className="text-2xl font-bold text-primary mb-4">
          Share your Vision
        </h2>
        <img
          src={creation.imageUrl}
          alt={creation.prompt}
          className="w-full h-64 object-contain rounded-lg mb-4 bg-black/20"
        />
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Add a caption to your post..."
          className="w-full h-24 bg-card-background border border-secondary rounded-lg p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="flex justify-end mt-4">
          <button
            onClick={handleShare}
            className="px-5 py-2 rounded-lg bg-primary text-text-contrast font-semibold hover:opacity-90 transition-opacity"
          >
            Share Post
          </button>
        </div>
      </div>
    </div>
  );
};

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

const ShelfBookCard = ({ shelfItem }) => {
  const dispatch = useDispatch();
  const { showNotification } = useNotification();

  const coverUrl = shelfItem.cover_id
    ? `https://covers.openlibrary.org/b/id/${shelfItem.cover_id}-M.jpg`
    : `https://via.placeholder.com/128x192?text=No+Cover`;

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Remove "${shelfItem.title}" from your shelf?`)) {
      dispatch(removeBookFromShelf(shelfItem.ol_key));
      showNotification(`"${shelfItem.title}" removed.`);
    }
  };

  const studioLink = `/studio/create/${encodeURIComponent(shelfItem.ol_key)}`;

  return (
    <div className="flex-shrink-0 w-36 text-center group relative border border-secondary/20 rounded-lg p-2 bg-card-background/50 shadow-sm hover:shadow-md transition-shadow duration-200">
      <img
        src={coverUrl}
        alt={shelfItem.title}
        className="w-full h-48 object-cover rounded-md shadow-lg mb-2"
      />
      {/* Overlay for actions on hover */}
      <div className="absolute inset-2 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md gap-2">
        <Link
          to={studioLink}
          title="Create Vision"
          className="flex flex-col items-center text-white hover:text-primary transition-colors"
        >
          <Wand2 className="h-6 w-6 mb-1" />
          <span className="font-semibold text-xs">Create Art</span>
        </Link>
        <button
          onClick={handleRemove}
          title="Remove from Shelf"
          className="flex flex-col items-center text-white hover:text-red-500 transition-colors"
        >
          <Trash2 className="h-6 w-6 mb-1" />
          <span className="font-semibold text-xs">Remove</span>
        </button>
      </div>
      {/* Book Info (visible normally) */}
      <div className="group-hover:opacity-0 transition-opacity">
        <h3
          className="mt-1 font-semibold text-sm text-text-primary truncate"
          title={shelfItem.title}
        >
          {shelfItem.title}
        </h3>
        <p className="text-xs text-secondary truncate">
          {shelfItem.author_names?.join(", ") || "Unknown Author"}
        </p>
      </div>
    </div>
  );
};

const UserProfilePage = () => {
  const { name } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("shelves");
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [creationToPost, setCreationToPost] = useState(null);

  const {
    data: profile,
    status: profileStatus,
    error: profileError,
  } = useSelector((state) => state.profile);
  const { user, posts } = profile || { user: {}, posts: [] };

  const {
    items: shelfItems,
    status: shelfStatus,
    error: shelfError,
  } = useSelector((state) => state.books);

  // Creations state (still mock)
  const { privateCreations, fetchStatus: creationsFetchStatus } = useSelector(
    (state) => state.creations
  );

  useEffect(() => {
    if (name && profileStatus === "idle") {
      dispatch(fetchUserProfile(name));
    }
    if (shelfStatus === "idle") {
      dispatch(fetchShelf());
    }
    if (creationsFetchStatus === "idle") {
      dispatch(fetchPrivateCreations());
    }
  }, [dispatch, name, profileStatus, shelfStatus, creationsFetchStatus]);

  const handleOpenPostModal = (creation) => {
    setCreationToPost(creation);
    setIsPostModalOpen(true);
  };
  const handleSharePost = (captionText) => {
    if (!creationToPost) return;
    const newPost = {
      caption_text: captionText,
      mediaUrl: creationToPost.imageUrl,
      bookId: creationToPost.bookId || "unknown",
      moodKey: "empowered",
    };
    dispatch(createPost(newPost));
    navigate("/posts");
  };

  if (profileStatus === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  if (profileStatus === "failed" || !profile) {
    return (
      <div className="text-center text-red-500 py-10">
        Could not load profile. {profileError}
      </div>
    );
  }

  const readingShelf = shelfItems.filter((s) => s.status === "reading");
  const readShelf = shelfItems.filter((s) => s.status === "read");
  const wantToReadShelf = shelfItems.filter((s) => s.status === "want_to_read");

  return (
    <>
      {isPostModalOpen && (
        <PostCreationModal
          creation={creationToPost}
          onClose={() => setIsPostModalOpen(false)}
          onShare={handleSharePost}
        />
      )}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-body">
        {/* --- 3. HEADER USES REAL DATA --- */}
        <header className="mb-10 flex flex-col items-center text-center">
          <div className="w-28 h-28 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <User className="w-16 h-16 text-primary" />
          </div>
          {/* Use real user.username */}
          <h1 className="text-5xl font-bold text-primary">
            {user.username || "Book Lover"}
          </h1>
          {/* Use real user.bio */}
          <p className="mt-2 text-secondary max-w-xl">
            {user.bio || "Avid reader exploring worlds between pages."}
          </p>
        </header>

        <div className="mb-8 flex justify-center border-b border-secondary">
          <button onClick={() => setActiveTab("shelves")} className={`...`}>
            <BookOpenCheck size={18} /> Bookshelves ({shelfItems.length}){" "}
            {/* (Real) */}
          </button>
          <button onClick={() => setActiveTab("posts")} className={`...`}>
            <MessageSquare size={18} /> Showcase ({posts.length}){" "}
            {/* Use real posts.length */}
          </button>
          <button onClick={() => setActiveTab("creations")} className={`...`}>
            <Wand2 size={18} /> My Creations ({privateCreations.length}){" "}
            {/* (Mock) */}
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "shelves" && (
            <div className="space-y-10">
              {shelfStatus === "loading" && (
                <div className="text-center py-10">
                  <Loader className="animate-spin h-8 w-8 text-primary mx-auto" />
                </div>
              )}
              {shelfStatus === "failed" && (
                <p className="text-center text-red-500 py-10">
                  {shelfError || "Could not load bookshelves."}
                </p>
              )}
              {shelfStatus === "succeeded" && shelfItems.length === 0 && (
                <div className="text-center text-secondary py-16 flex flex-col items-center gap-4">
                  <BookUser size={48} />
                  <p className="text-lg">This bookshelf is empty.</p>
                  <Link
                    to="/books/search"
                    className="rounded-lg bg-primary px-5 py-2 font-medium text-text-contrast transition-transform hover:scale-105"
                  >
                    Find Books to Add
                  </Link>
                </div>
              )}

              {/* Currently Reading Shelf */}
              {shelfStatus === "succeeded" && readingShelf.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold text-primary mb-4">
                    Currently Reading ({readingShelf.length})
                  </h3>
                  {/* Horizontal scrolling container */}
                  <div className="flex space-x-4 overflow-x-auto pb-4">
                    {readingShelf.map((item) => (
                      <ShelfBookCard key={item.uid} shelfItem={item} />
                    ))}
                  </div>
                </div>
              )}

              {/* Want to Read Shelf */}
              {shelfStatus === "succeeded" && wantToReadShelf.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold text-primary mb-4">
                    Want to Read ({wantToReadShelf.length})
                  </h3>
                  {/* Horizontal scrolling container */}
                  <div className="flex space-x-4 overflow-x-auto pb-4">
                    {wantToReadShelf.map((item) => (
                      <ShelfBookCard key={item.uid} shelfItem={item} />
                    ))}
                  </div>
                </div>
              )}

              {/* Read Shelf */}
              {shelfStatus === "succeeded" && readShelf.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold text-primary mb-4">
                    Read ({readShelf.length})
                  </h3>
                  {/* Horizontal scrolling container */}
                  <div className="flex space-x-4 overflow-x-auto pb-4">
                    {readShelf.map((item) => (
                      <ShelfBookCard key={item.uid} shelfItem={item} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Posts Tab (no change) */}
          {activeTab === "posts" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.length > 0 ? (
                // Use real 'posts' array
                posts.map((p) => <PostCard key={p.uid} post={p} />)
              ) : (
                <p className="col-span-full text-center text-secondary py-10">
                  Shared posts will appear here.
                </p>
              )}
            </div>
          )}

          {/* Creations Tab (no change) */}
          {activeTab === "creations" && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {creationsFetchStatus === "loading" && (
                <p className="col-span-full text-center text-secondary py-10">
                  Loading creations...
                </p>
              )}
              {creationsFetchStatus !== "loading" && privateCreations.length > 0
                ? privateCreations.map((c) => (
                    <PrivateCreationCard
                      key={c.id}
                      creation={c}
                      onPost={handleOpenPostModal}
                    />
                  ))
                : creationsFetchStatus !== "loading" && (
                    <p className="col-span-full text-center text-secondary py-10">
                      Your generated art will be saved here.
                    </p>
                  )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserProfilePage;
