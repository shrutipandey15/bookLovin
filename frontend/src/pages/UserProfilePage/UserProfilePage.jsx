import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchShelf,
  addBookToShelf, 
  updateBookFavorite,
  updateBookProgress,
  updateShelfOrder, 
  removeBookFromShelf,
} from "@redux/booksSlice";
import { DragDropContext, Droppable } from "react-beautiful-dnd"; 
import BookSpine from "@components/BookSpine"; 
import {
  fetchUserProfile,
  updateProfileQuote,
  updateProfileArchetype,
  updateProfileGenres, 
  updateProfileGoal, 
} from "@redux/profileSlice";
import {
  updateUserQuote,
  updateUserGenres,
  updateUserGoal,
  updateUserArchetype,
} from "@api/profile";
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
  Save,
  BookMarked,
  StickyNote,
  PenSquare,
  Users,
  Tag,
  Target,
  Award,
  Sparkles,
  Star,
  BookText,
} from "lucide-react";
import PostCard from "@components/PostCard";
import { useNotification } from "@components/Layout";
import { useAuth } from "@context/AuthContext";

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

const ShelfBookCard = ({ shelfItem, onCloseModal }) => {
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
      onCloseModal(); // Close modal after action
    }
  };

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      updateBookFavorite({
        olKey: shelfItem.ol_key,
        is_favorite: !shelfItem.is_favorite,
      })
    );
    // Note: We don't close modal here, user might want to do other actions
  };

  const handleSetProgress = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const progressInput = window.prompt(
      `Set progress for "${shelfItem.title}" (0-100):`,
      shelfItem.progress_percent || 0
    );

    if (progressInput === null) return; 

    const progress = parseInt(progressInput, 10);

    if (isNaN(progress) || progress < 0 || progress > 100) {
      showNotification("Please enter a valid number between 0 and 100.", "error");
      return;
    }

    dispatch(updateBookProgress({
      olKey: shelfItem.ol_key,
      progress: progress
    }));
    showNotification("Progress updated!");
  };

  const studioLink = `/studio/create/${encodeURIComponent(shelfItem.ol_key)}`;

  return (
    <div className="flex-shrink-0 w-full text-center group relative p-2">
      <button
        onClick={handleFavorite}
        title={
          shelfItem.is_favorite ? "Remove from Favorites" : "Add to Favorites"
        }
        className="absolute top-2 right-2 z-10 p-1 bg-card-background/70 rounded-full text-secondary hover:text-primary"
      >
        <Star
          className="h-5 w-5"
          fill={shelfItem.is_favorite ? "currentColor" : "none"}
        />
      </button>
      <img
        src={coverUrl}
        alt={shelfItem.title}
        className="w-36 h-48 object-cover rounded-md shadow-lg mb-2 mx-auto" // Centered image
      />
      {shelfItem.status === "reading" && (
        <div className="w-36 mx-auto bg-secondary/30 rounded-full h-1.5 mt-2">
          <div 
            className="bg-primary h-1.5 rounded-full" 
            style={{ width: `${shelfItem.progress_percent || 0}%` }}
          ></div>
        </div>
      )}
        <h3
          className="mt-2 font-semibold text-lg text-text-primary truncate"
          title={shelfItem.title}
        >
          {shelfItem.title}
        </h3>
        <p className="text-sm text-secondary truncate mb-4">
          {shelfItem.author_names?.join(", ") || "Unknown Author"}
        </p>
      
      {/* --- ACTION BUTTONS --- */}
      <div className="flex flex-col items-center justify-center gap-2">
        <Link
          to={studioLink}
          title="Create Vision"
          className="flex items-center justify-center gap-2 text-text-primary hover:text-primary transition-colors w-full p-2 bg-secondary/10 rounded-lg"
        >
          <Wand2 className="h-5 w-5" />
          <span className="font-semibold text-sm">Create AI Art</span>
        </Link>
        {shelfItem.status === "reading" && (
          <button
            onClick={handleSetProgress}
            title="Set Reading Progress"
            className="flex items-center justify-center gap-2 text-text-primary hover:text-primary transition-colors w-full p-2 bg-secondary/10 rounded-lg"
          >
            <BookText className="h-5 w-5" />
            <span className="font-semibold text-sm">Set Progress</span>
          </button>
        )}
        <button
          onClick={handleRemove}
          title="Remove from Shelf"
          className="flex items-center justify-center gap-2 text-red-500 hover:text-red-400 transition-colors w-full p-2 bg-secondary/10 rounded-lg"
        >
          <Trash2 className="h-5 w-5" />
          <span className="font-semibold text-sm">Remove</span>
        </button>
      </div>
    </div>
  );
};

const BookDetailModal = ({ book, onClose }) => {
  if (!book) return null;

  return (
     <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-background rounded-2xl shadow-xl max-w-xs w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-secondary hover:text-primary"
        >
          <X />
        </button>
        <ShelfBookCard shelfItem={book} onCloseModal={onClose} />
      </div>
    </div>
  )
};


const DraggableShelf = ({ title, icon, books, droppableId, onBookClick }) => {
  if (droppableId !== 'favorites-shelf' && (!books || books.length === 0)) {
    return (
      <div>
        <h3 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
          {icon} {title} (0)
        </h3>
        <div className="flex items-center justify-center gap-1 p-4 h-56 bg-secondary/10 rounded-lg overflow-x-auto text-secondary italic text-sm">
          No books on this shelf yet.
        </div>
      </div>
    );
  }
  
  if (droppableId === 'favorites-shelf' && (!books || books.length === 0)) {
      return null;
  }

  return (
    <div>
      <h3 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
        {icon} {title} ({books.length})
      </h3>
      <Droppable droppableId={droppableId} direction="horizontal">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex items-end gap-1 p-4 h-56 bg-secondary/10 rounded-lg overflow-x-auto"
          >
            {books.map((book, index) => (
              <BookSpine 
                key={book.ol_key} 
                book={book} 
                index={index} 
                onBookClick={onBookClick} // <-- Pass the click handler
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
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

  const [selectedBook, setSelectedBook] = useState(null);

  const [isEditingQuote, setIsEditingQuote] = useState(false);
  const [quoteInput, setQuoteInput] = useState("");
  const [isSavingQuote, setIsSavingQuote] = useState(false);

  const [isEditingGenres, setIsEditingGenres] = useState(false);
  const [genresInput, setGenresInput] = useState("");
  const [isSavingGenres, setIsSavingGenres] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalYearInput, setGoalYearInput] = useState(new Date().getFullYear());
  const [goalCountInput, setGoalCountInput] = useState("");
  const [isSavingGoal, setIsSavingGoal] = useState(false);

  const [isEditingArchetype, setIsEditingArchetype] = useState(false);
  const [archetypeInput, setArchetypeInput] = useState("");
  const [isSavingArchetype, setIsSavingArchetype] = useState(false);

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
    if (
      name &&
      (profileStatus === "idle" || profile?.user?.username !== name)
    ) {
      dispatch(fetchUserProfile(name));
    }
    if (shelfStatus === "idle") {
      dispatch(fetchShelf());
    }
    if (creationsFetchStatus === "idle") {
      dispatch(fetchPrivateCreations());
    }
  }, [
    dispatch,
    name,
    profileStatus,
    shelfStatus,
    creationsFetchStatus,
    profile,
  ]);

  useEffect(() => {
    setQuoteInput(user?.favorite_quote || "");
  }, [user?.favorite_quote]);

  useEffect(() => {
    if (user) {
      setGenresInput(user.reading_personality?.favorite_genres?.join(", ") || "");
      setGoalYearInput(
        user.reading_personality?.reading_goal_year || new Date().getFullYear()
      );
      setGoalCountInput(
        user.reading_personality?.reading_goal_count?.toString() || ""
      );
      setArchetypeInput(user.reading_personality?.literary_archetype || "");
    }
  }, [user]); 

  const handleSaveQuote = async () => {
    if (isSavingQuote) return;
    setIsSavingQuote(true);
    try {
      const updatedUserData = await updateUserQuote(quoteInput);
      dispatch(updateProfileQuote(updatedUserData.favorite_quote));
      showNotification("Favorite quote updated!");
      setIsEditingQuote(false);
    } catch (error) {
      console.error("Failed to save quote:", error);
      showNotification(
        `Failed to save quote: ${error.message || "Unknown error"}`,
        "error"
      );
    } finally {
      setIsSavingQuote(false);
    }
  };

  const handleSaveGenres = async () => {
    if (isSavingGenres) return;
    setIsSavingGenres(true);
    try {
      const genresArray = genresInput
        .split(",")
        .map((g) => g.trim())
        .filter((g) => g !== "");
      const updatedUserData = await updateUserGenres(genresArray);
      dispatch(updateProfileGenres(updatedUserData.reading_personality.favorite_genres || []));
      showNotification("Favorite genres updated!");
      setIsEditingGenres(false);
    } catch (error) {
      console.error("Failed to save genres:", error);
      showNotification("Failed to save genres.", "error");
    } finally {
      setIsSavingGenres(false);
    }
  };

  const handleSaveGoal = async () => {
    if (isSavingGoal) return;
    const year = parseInt(goalYearInput);
    const count = parseInt(goalCountInput);
    if (isNaN(year) || isNaN(count) || count <= 0) {
      showNotification(
        "Please enter a valid year and a positive number for the goal count.",
        "error"
      );
      return;
    }
    setIsSavingGoal(true);
    try {
      const updatedUserData = await updateUserGoal(year, count);
      dispatch(
        updateProfileGoal({
          year: updatedUserData.reading_personality.reading_goal_year,
          count: updatedUserData.reading_personality.reading_goal_count,
        })
      );
      showNotification("Reading goal updated!");
      setIsEditingGoal(false);
    } catch (error) {
      console.error("Failed to save goal:", error);
      showNotification("Failed to save reading goal.", "error");
    } finally {
      setIsSavingGoal(false);
    }
  };

  const handleSaveArchetype = async () => {
    if (isSavingArchetype) return;
    setIsSavingArchetype(true);
    try {
      const updatedUserData = await updateUserArchetype(archetypeInput);
      dispatch(
        updateProfileArchetype(updatedUserData.reading_personality.literary_archetype)
      );
      showNotification("Literary archetype updated!");
      setIsEditingArchetype(false);
    } catch (error) {
      console.error("Failed to save archetype:", error);
      showNotification("Failed to save archetype.", "error");
    } finally {
      setIsSavingArchetype(false);
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

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const book = shelfItems.find((b) => b.ol_key === draggableId);
    if (!book) return;

    if (source.droppableId !== destination.droppableId) {
      let newStatus = null;
      if (destination.droppableId === "reading-shelf") newStatus = "reading";
      else if (destination.droppableId === "want-to-read-shelf") newStatus = "want_to_read";
      else if (destination.droppableId === "read-shelf") newStatus = "read";
      else if (destination.droppableId === "dnf-shelf") newStatus = "did_not_finish";
      
      if (newStatus && book.status !== newStatus) {
        dispatch(
          addBookToShelf({
            ...book, 
            status: newStatus, 
          })
        );
        showNotification(`Moved "${book.title}"`);
      }
    }
    else {
       const reorderedItems = Array.from(shelfItems);
       const globalSourceIndex = shelfItems.findIndex(b => b.ol_key === draggableId);
       
       let subList = [];
       if (destination.droppableId === 'favorites-shelf') subList = favoritesShelf;
       else if (destination.droppableId === 'reading-shelf') subList = readingShelf;
       else if (destination.droppableId === 'want-to-read-shelf') subList = wantToReadShelf;
       else if (destination.droppableId === 'read-shelf') subList = readShelf;
       else if (destination.droppableId === 'dnf-shelf') subList = dnfShelf;

       const destinationItem = subList[destination.index];
       let globalDestinationIndex = -1;

       if (!destinationItem) {
         const lastItemInSublist = subList[subList.length - 1];
         if (!lastItemInSublist) {
           console.error("Drag-and-drop error: sublist is empty.");
           return;
         }
         globalDestinationIndex = shelfItems.findIndex(b => b.ol_key === lastItemInSublist.ol_key);
       } else {
         globalDestinationIndex = shelfItems.findIndex(b => b.ol_key === destinationItem.ol_key);
       }
         
       if (globalSourceIndex === -1 || globalDestinationIndex === -1) {
         console.error("Could not find global index for drag-and-drop");
         return;
       }
       
       const [movedItem] = reorderedItems.splice(globalSourceIndex, 1);
       const newGlobalDestIndex = reorderedItems.findIndex(b => b.ol_key === (destinationItem?.ol_key || null));
       
       if (newGlobalDestIndex !== -1) {
            reorderedItems.splice(newGlobalDestIndex, 0, movedItem);
       } else {
           reorderedItems.push(movedItem);
       }

       const ordered_keys = reorderedItems.map((item) => item.ol_key);
       dispatch(updateShelfOrder(ordered_keys));
    }
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

  const stats = user.stats || {
    books_read_count: 0,
    journal_entries_count: 0,
    posts_count: 0,
    followers_count: 0,
  };
  const goalProgress =
    user.reading_personality?.reading_goal_count && stats.books_read_count
      ? Math.min(
          100,
          Math.round(
            (stats.books_read_count /
              user.reading_personality.reading_goal_count) *
              100
          )
        )
      : 0;
  
  const favoritesShelf = shelfItems.filter((s) => s.is_favorite);
  const readingShelf = shelfItems.filter((s) => s.status === "reading");
  const wantToReadShelf = shelfItems.filter((s) => s.status === "want_to_read");
  const readShelf = shelfItems.filter((s) => s.status === "read");
  const dnfShelf = shelfItems.filter((s) => s.status === "did_not_finish");

  return (
    <>
      {selectedBook && (
        <BookDetailModal 
          book={selectedBook} 
          onClose={() => setSelectedBook(null)} 
        />
      )}

      {isPostModalOpen && (
        <PostCreationModal
          creation={creationToPost}
          onClose={() => setIsPostModalOpen(false)}
          onShare={handleSharePost}
        />
      )}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-body">
        {/* --- HEADER --- */}
        <header className="mb-6 flex flex-col items-center text-center relative">
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
                    onClick={() => {
                      setIsEditingQuote(false);
                      setQuoteInput(user.favorite_quote || "");
                    }} 
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
                    {isSavingQuote ? (
                      <Loader size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    Save
                  </button>
                </div>
              </>
            ) : (
              <>
                {user.favorite_quote ? (
                  <p className="text-text-primary/90 italic text-center">
                    <Quote
                      size={16}
                      className="inline mr-1 text-secondary opacity-50 transform -scale-x-100"
                    />
                    {user.favorite_quote}
                    <Quote
                      size={16}
                      className="inline ml-1 text-secondary opacity-50"
                    />
                  </p>
                ) : (
                  <p className="text-secondary italic text-center text-sm">
                    {isOwner
                      ? "Add your favorite quote..."
                      : "No favorite quote set."}
                  </p>
                )}
                {isOwner && (
                  <button
                    onClick={() => setIsEditingQuote(true)}
                    className="absolute top-2 right-2 p-1 text-secondary opacity-0 group-hover:opacity-100 hover:text-primary transition-opacity duration-200"
                    title="Edit Quote"
                  >
                    <Edit3 size={16} />
                  </button>
                )}
              </>
            )}
          </div>
        </header>

        {/* --- STATS ROW --- */}
        <div className="mb-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center border-y border-border-color py-4">
          <div className="flex flex-col items-center">
            <BookMarked className="h-6 w-6 text-primary mb-1" />
            <span className="text-xl font-bold text-text-primary">
              {stats.books_read_count}
            </span>
            <span className="text-xs text-secondary uppercase tracking-wider">
              Books Read
            </span>
          </div>
          <div className="flex flex-col items-center">
            <StickyNote className="h-6 w-6 text-primary mb-1" />
            <span className="text-xl font-bold text-text-primary">
              {stats.journal_entries_count}
            </span>
            <span className="text-xs text-secondary uppercase tracking-wider">
              Journal Entries
            </span>
          </div>
          <div className="flex flex-col items-center">
            <PenSquare className="h-6 w-6 text-primary mb-1" />
            <span className="text-xl font-bold text-text-primary">
              {stats.posts_count}
            </span>
            <span className="text-xs text-secondary uppercase tracking-wider">
              Posts
            </span>
          </div>
          <div className="flex flex-col items-center">
            <Users className="h-6 w-6 text-primary mb-1" />
            <span className="text-xl font-bold text-text-primary">
              {stats.followers_count}
            </span>
            <span className="text-xs text-secondary uppercase tracking-wider">
              Followers
            </span>
          </div>
        </div>

        {/* --- READING PERSONALITY SECTION --- */}
        <section className="mb-10 p-6 bg-card-background/30 border border-border-color rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-primary mb-6 text-center">
            Reading Personality
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left Column: Genres & Goal */}
            <div className="space-y-6">
              {/* Favorite Genres */}
              <div className="relative group">
                <h3 className="text-lg font-semibold text-text-primary mb-2 flex items-center gap-2">
                  <Tag size={18} /> Favorite Genres
                </h3>
                {isEditingGenres ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={genresInput}
                      onChange={(e) => setGenresInput(e.target.value)}
                      placeholder="e.g., Fantasy, Sci-Fi, Mystery"
                      className="w-full bg-background border border-secondary rounded-md p-2 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                    />
                    <p className="text-xs text-secondary">
                      Separate genres with commas.
                    </p>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setIsEditingGenres(false);
                          setGenresInput(
                            user.reading_personality?.favorite_genres?.join(", ") || ""
                          );
                        }}
                        className="text-xs px-3 py-1 rounded text-secondary hover:bg-secondary/20"
                        disabled={isSavingGenres}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveGenres}
                        className="text-xs px-3 py-1 rounded bg-primary text-text-contrast hover:opacity-90 flex items-center gap-1 disabled:opacity-50"
                        disabled={isSavingGenres}
                      >
                        {isSavingGenres ? (
                          <Loader size={14} className="animate-spin" />
                        ) : (
                          <Save size={14} />
                        )}
                        Save Genres
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {user.reading_personality?.favorite_genres &&
                    user.reading_personality.favorite_genres.length > 0 ? (
                      user.reading_personality.favorite_genres.map((genre, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full"
                        >
                          {genre}
                        </span>
                      ))
                    ) : (
                      <p className="text-secondary text-sm italic">
                        {isOwner
                          ? "Add your favorite genres..."
                          : "No genres specified."}
                      </p>
                    )}
                  </div>
                )}
                {isOwner && !isEditingGenres && (
                  <button
                    onClick={() => setIsEditingGenres(true)}
                    className="absolute top-0 right-0 p-1 text-secondary opacity-0 group-hover:opacity-100 hover:text-primary transition-opacity"
                    title="Edit Genres"
                  >
                    <Edit3 size={16} />
                  </button>
                )}
              </div>

              {/* Reading Goal */}
              <div className="relative group">
                <h3 className="text-lg font-semibold text-text-primary mb-2 flex items-center gap-2">
                  <Target size={18} /> Reading Goal (
                  {user.reading_personality?.reading_goal_year || "Set Year"})
                </h3>
                {isEditingGoal ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={goalYearInput}
                        onChange={(e) => setGoalYearInput(e.target.value)}
                        placeholder="Year"
                        className="w-1/2 bg-background border border-secondary rounded-md p-2 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                      />
                      <input
                        type="number"
                        value={goalCountInput}
                        onChange={(e) => setGoalCountInput(e.target.value)}
                        placeholder="No. of books"
                        className="w-1/2 bg-background border border-secondary rounded-md p-2 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                        min="1"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setIsEditingGoal(false);
                          setGoalYearInput(
                            user.reading_personality?.reading_goal_year ||
                              new Date().getFullYear()
                          );
                          setGoalCountInput(
                            user.reading_personality?.reading_goal_count?.toString() || ""
                          );
                        }}
                        className="text-xs px-3 py-1 rounded text-secondary hover:bg-secondary/20"
                        disabled={isSavingGoal}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveGoal}
                        className="text-xs px-3 py-1 rounded bg-primary text-text-contrast hover:opacity-90 flex items-center gap-1 disabled:opacity-50"
                        disabled={isSavingGoal}
                      >
                        {isSavingGoal ? (
                          <Loader size={14} className="animate-spin" />
                        ) : (
                          <Save size={14} />
                        )}
                        Save Goal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {user.reading_personality?.reading_goal_count &&
                    user.reading_personality?.reading_goal_year ? (
                      <>
                        <p className="text-sm text-text-primary mb-1">
                          Read{" "}
                          <span className="font-bold">
                            {stats.books_read_count}
                          </span>{" "}
                          of{" "}
                          <span className="font-bold">
                            {user.reading_personality.reading_goal_count}
                          </span>{" "}
                          books for {user.reading_personality.reading_goal_year}.
                        </p>
                        <div className="w-full bg-secondary/30 rounded-full h-2.5 dark:bg-gray-700">
                          <div
                            className="bg-primary h-2.5 rounded-full"
                            style={{ width: `${goalProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-secondary text-right mt-1">
                          {goalProgress}% complete
                        </p>
                      </>
                    ) : (
                      <p className="text-secondary text-sm italic">
                        {isOwner
                          ? "Set your yearly reading goal..."
                          : "No reading goal set."}
                      </p>
                    )}
                  </div>
                )}
                {isOwner && !isEditingGoal && (
                  <button
                    onClick={() => setIsEditingGoal(true)}
                    className="absolute top-0 right-0 p-1 text-secondary opacity-0 group-hover:opacity-100 hover:text-primary transition-opacity"
                    title="Edit Goal"
                  >
                    <Edit3 size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Mood & Archetype */}
            <div className="space-y-6">
              <div className="relative group">
                <h3 className="text-lg font-semibold text-text-primary mb-2 flex items-center gap-2">
                  <Award size={18} /> Literary Archetype
                </h3>

                {isEditingArchetype ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={archetypeInput}
                      onChange={(e) => setArchetypeInput(e.target.value)}
                      placeholder="e.g., The Sage, The Hero..."
                      className="w-full bg-background border border-secondary rounded-md p-2 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setIsEditingArchetype(false);
                          setArchetypeInput(
                            user.reading_personality?.literary_archetype || ""
                          );
                        }}
                        className="text-xs px-3 py-1 rounded text-secondary hover:bg-secondary/20"
                        disabled={isSavingArchetype}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveArchetype}
                        className="text-xs px-3 py-1 rounded bg-primary text-text-contrast hover:opacity-90 flex items-center gap-1 disabled:opacity-50"
                        disabled={isSavingArchetype}
                      >
                        {isSavingArchetype ? (
                          <Loader size={14} className="animate-spin" />
                        ) : (
                          <Save size={14} />
                        )}{" "}
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {user.reading_personality?.literary_archetype ? (
                      <span className="px-3 py-1 bg-secondary/10 text-secondary text-sm font-medium rounded-full border border-secondary/30">
                        {user.reading_personality.literary_archetype}
                      </span>
                    ) : (
                      <p className="text-secondary text-sm italic">
                        {isOwner
                          ? "Define your reading style..."
                          : "Archetype not set."}
                      </p>
                    )}
                  </div>
                )}

                {isOwner && !isEditingArchetype && (
                  <button
                    onClick={() => setIsEditingArchetype(true)}
                    className="absolute top-0 right-0 p-1 text-secondary opacity-0 group-hover:opacity-100 hover:text-primary transition-opacity"
                    title="Edit Archetype"
                  >
                    <Edit3 size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="mb-8 flex justify-center border-b border-secondary">
          <button
            onClick={() => setActiveTab("shelves")}
            className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === "shelves"
                ? "border-b-2 border-primary text-primary"
                : "text-secondary hover:text-primary"
            }`}
          >
            <BookOpenCheck size={18} /> Bookshelves ({shelfItems.length})
          </button>
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
            onClick={() => setActiveTab("creations")}
            className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === "creations"
                ? "border-b-2 border-primary text-primary"
                : "text-secondary hover:text-primary"
            }`}
          >
            <Wand2 size={18} /> My Creations ({privateCreations.length})
          </button>
        </div>

        {/* --- TAB CONTENT --- */}
        <div>
          {activeTab === "shelves" && (
            <DragDropContext onDragEnd={onDragEnd}>
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

                {/* --- NEW: Replaced carousels with DraggableShelf components --- */}
                {shelfStatus === "succeeded" && (
                  <>
                    <DraggableShelf 
                      title="Favorites" 
                      icon={<Star size={24} />} 
                      books={favoritesShelf} 
                      droppableId="favorites-shelf"
                      onBookClick={setSelectedBook}
                    />
                    <DraggableShelf 
                      title="Currently Reading" 
                      icon={<BookText size={24} />} 
                      books={readingShelf} 
                      droppableId="reading-shelf"
                      onBookClick={setSelectedBook}
                    />
                    <DraggableShelf 
                      title="Want to Read" 
                      icon={<BookOpenCheck size={24} />} 
                      books={wantToReadShelf} 
                      droppableId="want-to-read-shelf"
                      onBookClick={setSelectedBook}
                    />
                    <DraggableShelf 
                      title="Read" 
                      icon={<BookMarked size={24} />} 
                      books={readShelf} 
                      droppableId="read-shelf"
                      onBookClick={setSelectedBook}
                    />
                    <DraggableShelf 
                      title="Did Not Finish" 
                      icon={<X size={24} />} 
                      books={dnfShelf} 
                      droppableId="dnf-shelf"
                      onBookClick={setSelectedBook}
                    />
                  </>
                )}
              </div>
            </DragDropContext>
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
        </div>
      </div>
    </>
  );
};

export default UserProfilePage;