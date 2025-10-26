import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchShelf, removeBookFromShelf } from "@redux/booksSlice";
import { fetchUserProfile, updateProfileQuote } from "@redux/profileSlice";
import { updateUserQuote } from "@api/profile";
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
    Quote,
    Edit3,
    Save
} from "lucide-react";
import PostCard from "@components/PostCard";
import { useNotification } from "@components/Layout";
import { useAuth } from '@context/AuthContext';

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
  const { showNotification } = useNotification();

  const { user: currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState("shelves");
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [creationToPost, setCreationToPost] = useState(null);

  const [isEditingQuote, setIsEditingQuote] = useState(false);
  const [quoteInput, setQuoteInput] = useState('');
  const [isSavingQuote, setIsSavingQuote] = useState(false);

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

  const { privateCreations, fetchStatus: creationsFetchStatus } = useSelector(
    (state) => state.creations
  );

  useEffect(() => {
    if (name && (profileStatus === 'idle' || profile?.user?.username !== name)) {
        dispatch(fetchUserProfile(name));
    }
    if (shelfStatus === 'idle') {
        dispatch(fetchShelf());
    }
    if (creationsFetchStatus === 'idle') {
        dispatch(fetchPrivateCreations());
    }
  }, [dispatch, name, profileStatus, shelfStatus, creationsFetchStatus, profile]);


   useEffect(() => {
      if (user?.favorite_quote) {
          setQuoteInput(user.favorite_quote);
      } else {
           setQuoteInput('');
      }
  }, [user?.favorite_quote]);


  const handleSaveQuote = async () => {
      if (isSavingQuote) return;
      setIsSavingQuote(true);
      try {
          const updatedUserData = await updateUserQuote(quoteInput);
          dispatch(updateProfileQuote(updatedUserData.favorite_quote));
          showNotification("Favorite quote updated!");
          setIsEditingQuote(false);

          if (profile && profile.user) {
            profile.user.favorite_quote = updatedUserData.favorite_quote;
          }
      } catch (error) {
          console.error("Failed to save quote:", error);
          showNotification("Failed to save quote.", "error");
      } finally {
          setIsSavingQuote(false);
      }
  };

  const isOwner = currentUser?.name === name;

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

  if (profileStatus === "failed" || !profile || !user) {
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
        <header className="mb-10 flex flex-col items-center text-center relative">
          <div className="w-28 h-28 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <User className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-5xl font-bold text-primary">
            {user.username || "Book Lover"}
          </h1>
          <p className="mt-2 text-secondary max-w-xl">
            {user.bio || "Avid reader exploring worlds between pages."}
          </p>

          <div className="mt-6 w-full max-w-2xl px-4 py-3 bg-card-background/50 border border-border-color rounded-lg shadow-sm relative group">
              {isEditingQuote ? (
                  <>
                      <textarea
                          value={quoteInput}
                          onChange={(e) => setQuoteInput(e.target.value)}
                          placeholder="Enter your favorite quote..."
                          className="w-full h-20 bg-background border border-secondary rounded-md p-2 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm italic mb-2"
                          maxLength={250}
                      />
                      <div className="flex justify-end gap-2">
                          <button
                              onClick={() => { setIsEditingQuote(false); setQuoteInput(user.favorite_quote || ''); }} // Reset on cancel
                              className="text-xs px-3 py-1 rounded text-secondary hover:bg-secondary/20"
                              disabled={isSavingQuote}
                          >
                              Cancel
                          </button>
                          <button
                              onClick={handleSaveQuote}
                              className="text-xs px-3 py-1 rounded bg-primary text-text-contrast hover:opacity-90 flex items-center gap-1 disabled:opacity-50"
                              disabled={isSavingQuote}
                          >
                              {isSavingQuote ? <Loader size={14} className="animate-spin"/> : <Save size={14}/>}
                              Save
                          </button>
                      </div>
                  </>
              ) : (
                  <>
                      {user.favorite_quote ? (
                          <p className="text-text-primary/90 italic text-center">
                             <Quote size={16} className="inline mr-1 text-secondary opacity-50 transform -scale-x-100"/>
                             {user.favorite_quote}
                             <Quote size={16} className="inline ml-1 text-secondary opacity-50"/>
                          </p>
                      ) : (
                          <p className="text-secondary italic text-center text-sm">
                              {isOwner ? "Add your favorite quote..." : "No favorite quote set."}
                          </p>
                      )}
                      {isOwner && (
                          <button
                              onClick={() => setIsEditingQuote(true)}
                              className="absolute top-2 right-2 p-1 text-secondary opacity-0 group-hover:opacity-100 hover:text-primary transition-opacity duration-200"
                              title="Edit Quote"
                          >
                              <Edit3 size={16}/>
                          </button>
                      )}
                  </>
              )}
          </div>
        </header>

        <div className="mb-8 flex justify-center border-b border-secondary">
          <button onClick={() => setActiveTab("shelves")} className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "shelves" ? "border-b-2 border-primary text-primary" : "text-secondary hover:text-primary"}`}>
              <BookOpenCheck size={18} /> Bookshelves ({shelfItems.length})
          </button>
          <button onClick={() => setActiveTab("posts")} className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "posts" ? "border-b-2 border-primary text-primary" : "text-secondary hover:text-primary"}`}>
              <MessageSquare size={18} /> Showcase ({posts.length})
          </button>
          <button onClick={() => setActiveTab("creations")} className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "creations" ? "border-b-2 border-primary text-primary" : "text-secondary hover:text-primary"}`}>
              <Wand2 size={18} /> My Creations ({privateCreations.length})
          </button>
        </div>

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
                  <div className="flex space-x-4 overflow-x-auto pb-4">
                    {readShelf.map((item) => (
                      <ShelfBookCard key={item.uid} shelfItem={item} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

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