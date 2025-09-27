import { useState, useCallback, useEffect } from "react";
import {
  Routes,
  Route,
  useNavigate,
  Link,
  useParams,
  useLocation,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEntries,
  createEntry,
  updateEntry,
  deleteEntry,
  toggleFavorite,
} from "@redux/journalSlice";
import {
  Search,
  Plus,
  BookOpen,
  Flame,
  Star,
} from "lucide-react";
import { useLetters } from "@hooks/useLetters";
import axiosInstance from "@api/axiosInstance";
import { calculateStats } from "@utils/journalUtils";
import JournalEditor from "./JournalEditor";
import EntryCard from "./EntryCard";
import ConfirmModal from "@components/ConfirmModal";
import LettersPage from "./LettersPage"; // Import the new LettersPage
import { LettersNavButton } from "./LetterNavButton";

const JournalWelcome = ({ onNewEntry }) => (
  <div className="flex h-full flex-col items-center justify-center text-center">
    <div className="animate-float">
      <BookOpen className="h-24 w-24 text-primary opacity-50" strokeWidth={1.5} />
    </div>
    <h2 className="mt-8 text-2xl font-bold text-text-primary">Your Journal is a Blank Page</h2>
    <p className="mt-2 text-secondary">Ready to write your first entry?</p>
    <button
      onClick={onNewEntry}
      className="mt-8 flex items-center space-x-2 whitespace-nowrap rounded-lg bg-primary px-6 py-3 text-text-contrast shadow-lg transition-transform hover:scale-105"
    >
      <Plus className="h-5 w-5" />
      <span>Start Journaling</span>
    </button>
  </div>
);

const JournalView = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [entryToDeleteId, setEntryToDeleteId] = useState(null);
  const [editorError, setEditorError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { entryId } = useParams();

  const {
    items: entries,
    status: journalLoading,
    error: journalError,
  } = useSelector((state) => state.journal);

  const { letters, hasReadyLetters } = useLetters();

  const isEditing = !!entryId;
  const isNew = location.pathname.endsWith("/journal/new");
  const activeEntry = isEditing
    ? entries.find((e) => e.uid === entryId)
    : null;

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/auth/me");
      setUserProfile(response.data);
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
    dispatch(fetchEntries({ searchTerm, moodFilter: "all" }));
  }, [dispatch, searchTerm, fetchUserProfile]);

  const handleNewEntry = () => {
    navigate("/journal/new");
  };

  const handleEditEntry = (entry) => {
    navigate(`/journal/edit/${entry.uid}`);
  };

  const handleSaveEntry = async (entryData) => {
    setEditorError(null);
    const action = isEditing
      ? updateEntry({ entryId, entryData })
      : createEntry(entryData);

    try {
      const resultAction = await dispatch(action).unwrap();
      const newEntryId = resultAction?.uid || entryId;
      fetchUserProfile(); // Re-fetch profile to update stats
      navigate(`/journal/edit/${newEntryId}`);
    } catch (err) {
      console.error("Failed to save entry:", err);
      setEditorError(
        err.details || "Failed to save the entry. Please try again."
      );
    }
  };

  const handleDeleteEntry = async () => {
    if (!entryToDeleteId) return;
    try {
      await dispatch(deleteEntry(entryToDeleteId)).unwrap();
      fetchUserProfile(); // Re-fetch profile to update stats
      navigate('/journal');
    } catch (error) {
      console.error("Failed to delete entry", error);
    } finally {
      setShowConfirmModal(false);
      setEntryToDeleteId(null);
    }
  };

  const handleToggleFavorite = (entry) => {
    if (entry) {
      dispatch(toggleFavorite(entry));
    }
  };

  const confirmDelete = (id) => {
    setEntryToDeleteId(id);
    setShowConfirmModal(true);
  };
  
  const stats = calculateStats(entries);

  return (
    <>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Pane: Entry List */}
        <div className="flex w-full max-w-sm flex-col border-r border-border-color lg:max-w-md">
          <header className="flex-shrink-0 border-b border-border-color p-4">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-text-primary">Reading Journal</h1>
              <div className="flex items-center space-x-2">
                <Link to="/journal/letters">
                    <LettersNavButton
                    letterCount={letters.length}
                    hasReadyLetters={hasReadyLetters}
                    />
                </Link>
                <button
                  onClick={handleNewEntry}
                  className="flex items-center space-x-2 whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-text-contrast shadow transition-transform hover:scale-105"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Entry</span>
                </button>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-secondary" />
              <input
                type="text"
                placeholder="Search your journal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-secondary bg-background py-2 pl-10 pr-4 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </header>

          {/* Stats Section */}
          <div className="flex-shrink-0 p-4 border-b border-border-color">
            <div className="flex justify-around items-center text-center">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-bold text-text-primary">{stats.totalEntries}</p>
                  <p className="text-xs text-secondary">Entries</p>
                </div>
              </div>
              {userProfile && (
                  <div className="flex items-center space-x-2">
                    <Flame className={`h-5 w-5 text-primary ${userProfile.currentStreak > 0 && "animate-pulse"}`} />
                    <div>
                      <p className="font-bold text-text-primary">{userProfile.currentStreak}</p>
                      <p className="text-xs text-secondary">Streak</p>
                    </div>
                  </div>
              )}
               <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-bold text-text-primary">{stats.favoriteEntries}</p>
                    <p className="text-xs text-secondary">Favorites</p>
                  </div>
                </div>
            </div>
          </div>
          
          <div className="flex-grow overflow-y-auto p-4">
            {journalLoading === 'loading' && <p className="text-center text-secondary">Loading entries...</p>}
            {journalError && <p className="text-center text-red-500">{journalError}</p>}
            {journalLoading !== 'loading' && !journalError && entries.length === 0 && (
                <div className="text-center text-secondary mt-10">
                    <BookOpen className="mx-auto h-12 w-12" />
                    <p className="mt-2 font-semibold">No entries yet</p>
                    <p className="text-sm">Click "New Entry" to start.</p>
                </div>
            )}
            <div className="space-y-3">
              {entries.map((entry) => (
                <EntryCard
                  key={entry.uid}
                  entry={entry}
                  onEdit={() => handleEditEntry(entry)}
                  onDelete={() => confirmDelete(entry.uid)}
                  onToggleFavorite={() => handleToggleFavorite(entry)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Pane: Editor or Welcome */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            {isEditing || isNew ? (
                 <JournalEditor
                    key={activeEntry?.uid || 'new'}
                    entry={activeEntry}
                    onSave={handleSaveEntry}
                    onCancel={() => navigate("/journal")}
                    error={editorError}
                />
            ) : (
                <JournalWelcome onNewEntry={handleNewEntry} />
            )}
        </div>
      </div>
      <ConfirmModal
        isOpen={showConfirmModal}
        message="Are you sure you want to delete this entry? This action cannot be undone."
        onConfirm={handleDeleteEntry}
        onCancel={() => setShowConfirmModal(false)}
      />
    </>
  );
};

// Main JournalPage component that handles all routing for `/journal/*`
const JournalPage = () => {
    return (
        <Routes>
            <Route path="/" element={<JournalView />} />
            <Route path="/new" element={<JournalView />} />
            <Route path="/edit/:entryId" element={<JournalView />} />
            {/* THIS IS THE ONLY CHANGE IN THIS FILE */}
            <Route path="/letters/*" element={<LettersPage />} />
        </Routes>
    );
};

export default JournalPage;