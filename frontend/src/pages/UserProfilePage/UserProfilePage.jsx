import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchShelf,
  addBookToShelf,
  updateBookFavorite,
  updateBookProgress,
  updateShelfOrder,
  removeBookFromShelf,
} from "@redux/booksSlice";
import { DragDropContext } from "@hello-pangea/dnd";
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
import { fetchEntries } from "@redux/journalSlice";
import { fetchConfessions } from "@redux/confessionSlice";
import {
  User,
  Loader,
  X,
  Trash2,
  Quote,
  Edit3,
  Save,
  BookMarked,
  StickyNote,
  PenSquare,
  Users,
  Star,
  BookText,
} from "lucide-react";
import { useNotification } from "@components/Layout";
import { useAuth } from "@context/AuthContext";
import UserProfileSidebar from "./UserProfileSidebar";
import UserProfileFeed from "./UserProfileFeed";
import ReadingBadge from "./ReadingBadge";

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
      onCloseModal();
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
      showNotification(
        "Please enter a valid number between 0 and 100.",
        "error"
      );
      return;
    }

    dispatch(
      updateBookProgress({
        olKey: shelfItem.ol_key,
        progress: progress,
      })
    );
    showNotification("Progress updated!");
  };

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

      <div className="flex flex-col items-center justify-center gap-2">
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
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      onClick={onClose}
    >
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
  );
};

const UserProfilePage = () => {
  const { name } = useParams();
  const dispatch = useDispatch();
  const { showNotification } = useNotification();
  const { user: currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState("posts");

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

  const { items: journalEntries, status: journalStatus } = useSelector(
    (state) => state.journal
  );

  const { confessions, status: confessionsStatus } = useSelector(
    (state) => state.confessions
  );

  const isOwner = currentUser?.name === name;

  useEffect(() => {
    if (
      name &&
      (profileStatus === "idle" || profile?.user?.username !== name)
    ) {
      dispatch(fetchUserProfile(name));
      dispatch(fetchEntries());
      if (isOwner) {
        dispatch(fetchConfessions());
      }
    }
    if (shelfStatus === "idle") {
      dispatch(fetchShelf());
    }
  }, [
    dispatch,
    name,
    profileStatus,
    shelfStatus,
    profile,
    isOwner,
  ]);

  useEffect(() => {
    setQuoteInput(user?.favorite_quote || "");
  }, [user?.favorite_quote]);

  useEffect(() => {
    if (user) {
      setGenresInput(
        user.reading_personality?.favorite_genres?.join(", ") || ""
      );
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

      await updateUserGenres(genresArray);
      dispatch(updateProfileGenres(genresArray));

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
      await updateUserGoal(year, count);
      dispatch(
        updateProfileGoal({
          year: year,
          count: count,
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
      await updateUserArchetype(archetypeInput);
      dispatch(updateProfileArchetype(archetypeInput));

      showNotification("Literary archetype updated!");
      setIsEditingArchetype(false);
    } catch (error) {
      console.error("Failed to save archetype:", error);
      showNotification("Failed to save archetype.", "error");
    } finally {
      setIsSavingArchetype(false);
    }
  };

  const favoritesShelf = shelfItems.filter((s) => s.is_favorite);
  const readingShelf = shelfItems.filter((s) => s.status === "reading");
  const wantToReadShelf = shelfItems.filter((s) => s.status === "want_to_read");
  const readShelf = shelfItems.filter((s) => s.status === "read");
  const dnfShelf = shelfItems.filter((s) => s.status === "did_not_finish");

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
      else if (destination.droppableId === "want-to-read-shelf")
        newStatus = "want_to_read";
      else if (destination.droppableId === "read-shelf") newStatus = "read";
      else if (destination.droppableId === "dnf-shelf")
        newStatus = "did_not_finish";

      if (newStatus && book.status !== newStatus) {
        dispatch(
          addBookToShelf({
            ...book,
            status: newStatus,
          })
        );
        showNotification(`Moved "${book.title}"`);
      }
    } else {
      const newOrderedList = Array.from(shelfItems);
      const sourceIndex = newOrderedList.findIndex(
        (b) => b.ol_key === draggableId
      );
      if (sourceIndex === -1) return;
      const [movedItem] = newOrderedList.splice(sourceIndex, 1);

      let currentShelfBooks = [];
      if (source.droppableId === "favorites-shelf")
        currentShelfBooks = [...favoritesShelf];
      else if (source.droppableId === "reading-shelf")
        currentShelfBooks = [...readingShelf];
      else if (source.droppableId === "want-to-read-shelf")
        currentShelfBooks = [...wantToReadShelf];
      else if (source.droppableId === "read-shelf")
        currentShelfBooks = [...readShelf];
      else if (source.droppableId === "dnf-shelf")
        currentShelfBooks = [...dnfShelf];
      else return;

      const destinationItem = currentShelfBooks[destination.index];
      let targetIndex = -1;

      if (destinationItem) {
        targetIndex = newOrderedList.findIndex(
          (b) => b.ol_key === destinationItem.ol_key
        );
      } else {
        const lastItemInLocalList = currentShelfBooks
          .filter((b) => b.ol_key !== draggableId)
          .pop();
        if (lastItemInLocalList) {
          const lastItemGlobalIndex = newOrderedList.findIndex(
            (b) => b.ol_key === lastItemInLocalList.ol_key
          );
          targetIndex = lastItemGlobalIndex + 1;
        } else {
          targetIndex = newOrderedList.length;
        }
      }

      if (targetIndex > -1 && targetIndex <= newOrderedList.length) {
        newOrderedList.splice(targetIndex, 0, movedItem);
      } else {
        newOrderedList.push(movedItem);
      }

      dispatch(updateShelfOrder(newOrderedList));
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
    user.reading_personality?.reading_goal_count && readShelf.length
      ? Math.min(
          100,
          Math.round(
            (readShelf.length / user.reading_personality.reading_goal_count) *
              100
          )
        )
      : 0;

  return (
    <>
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
        />
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-body">
        {/* --- HEADER --- */}
        <header className="mb-6 flex flex-col items-center text-center relative">
          {/* NEW: Avatar */}
          <div className="w-28 h-28 rounded-full bg-primary/20 flex items-center justify-center mb-4 overflow-hidden border-4 border-background shadow-lg">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-16 h-16 text-primary" />
            )}
          </div>

          <h1 className="text-5xl font-bold text-primary">
            {user.username || "Book Lover"}
          </h1>
          <p className="mt-2 text-secondary max-w-xl">
            {user.bio || "Avid reader exploring worlds between pages."}
          </p>

          <ReadingBadge readingShelf={readingShelf} />

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
              {readShelf.length}
            </span>
            <span className="text-xs text-secondary uppercase tracking-wider">
              Books Read
            </span>
          </div>
          <div className="flex flex-col items-center">
            <StickyNote className="h-6 w-6 text-primary mb-1" />
            <span className="text-xl font-bold text-text-primary">
              {journalEntries.length}
            </span>
            <span className="text-xs text-secondary uppercase tracking-wider">
              Journal Entries
            </span>
          </div>
          <div className="flex flex-col items-center">
            <PenSquare className="h-6 w-6 text-primary mb-1" />
            <span className="text-xl font-bold text-text-primary">
              {posts.length}
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

        {/* --- TWO-COLUMN LAYOUT --- */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex flex-col lg:flex-row gap-10">
            <UserProfileSidebar
              user={user}
              stats={stats}
              shelfStatus={shelfStatus}
              shelfError={shelfError}
              shelfItems={shelfItems}
              onDragEnd={onDragEnd}
              favoritesShelf={favoritesShelf}
              readingShelf={readingShelf}
              wantToReadShelf={wantToReadShelf}
              readShelf={readShelf}
              dnfShelf={dnfShelf}
              setSelectedBook={setSelectedBook}
              isOwner={isOwner}
              isEditingGenres={isEditingGenres}
              setIsEditingGenres={setIsEditingGenres}
              genresInput={genresInput}
              setGenresInput={setGenresInput}
              handleSaveGenres={handleSaveGenres}
              isSavingGenres={isSavingGenres}
              isEditingGoal={isEditingGoal}
              setIsEditingGoal={setIsEditingGoal}
              goalYearInput={goalYearInput}
              setGoalYearInput={setGoalYearInput}
              goalCountInput={goalCountInput}
              setGoalCountInput={setGoalCountInput}
              handleSaveGoal={handleSaveGoal}
              isSavingGoal={isSavingGoal}
              isEditingArchetype={isEditingArchetype}
              setIsEditingArchetype={setIsEditingArchetype}
              archetypeInput={archetypeInput}
              setArchetypeInput={setArchetypeInput}
              handleSaveArchetype={handleSaveArchetype}
              isSavingArchetype={isSavingArchetype}
              goalProgress={goalProgress}
            />
            <UserProfileFeed
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              posts={posts}
              isOwner={isOwner}
              journalEntries={journalEntries}
              journalStatus={journalStatus}
              confessions={confessions}
              confessionsStatus={confessionsStatus}
            />
          </div>
        </DragDropContext>
      </div>
    </>
  );
};

export default UserProfilePage;
