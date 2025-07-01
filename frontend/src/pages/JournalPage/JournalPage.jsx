import { useState, useCallback, useEffect } from "react";
import { Routes, Route, useNavigate, Link } from "react-router-dom";
import {
  Search,
  Plus,
  BookOpen,
  Flame,
  Award,
  Star,
  TrendingUp,
  Download,
} from "lucide-react";
import { MOOD_CONFIG } from "@config/moods";
import { calculateStats } from "@utils/journalUtils";
import { useJournalEntries } from "@hooks/useJournalEntries";
import { useLetters } from "@hooks/useLetters";
import axiosInstance from "@api/axiosInstance";
import JournalEditor from "./JournalEditor";
import EntryCard from "./EntryCard";
import ConfirmModal from "@components/ConfirmModal";
import { LettersInbox } from "./LetterInbox";
import { LetterViewer } from "./LetterViewer";
import LetterComposer from "./LetterComposer";
import { LettersNavButton } from "./LetterNavButton";

const JournalPage = () => {
  const [activeEntry, setActiveEntry] = useState(null);
  const [activeLetter, setActiveLetter] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [moodFilter, setMoodFilter] = useState("all");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [entryToDeleteId, setEntryToDeleteId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [editorError, setEditorError] = useState(null);

  const navigate = useNavigate();

  const {
    entries,
    isLoading: journalLoading,
    error: journalError,
    saveEntry,
    deleteEntry,
    toggleFavorite,
    refetchEntries,
  } = useJournalEntries({ searchTerm, moodFilter });
  const {
    letters,
    hasReadyLetters,
    saveLetter,
    deleteLetter,
    markLetterAsOpened,
  } = useLetters();

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
  }, [fetchUserProfile]);

  const handleNewEntry = () => {
    setActiveEntry(null);
    navigate("/journal/new");
  };

  const handleEditEntry = (entry) => {
    setActiveEntry(entry);
    navigate(`/journal/edit/${entry._id}`);
  };

  const handleSaveEntry = async (entryData) => {
    setEditorError(null);
    try {
      await saveEntry(entryData, activeEntry?._id);
      navigate("/journal");
      await Promise.all([refetchEntries(), fetchUserProfile()]);
    } catch (err) {
      console.error(
        "Failed to save entry. Server response:",
        err.response?.data || err.message
      );
      setEditorError("Failed to save the entry. Please try again.");
    }
  };

  const handleDeleteEntry = async () => {
    if (!entryToDeleteId) return;
    try {
      await deleteEntry(entryToDeleteId);
      await refetchEntries(); // Refetch after delete
    } catch (error) {
      console.error("Failed to delete entry", error);
    } finally {
      setShowConfirmModal(false);
      setEntryToDeleteId(null);
    }
  };

  const handleToggleFavorite = async (entryId) => {
    const entry = entries.find((e) => e._id === entryId);
    if (entry) {
      try {
        await toggleFavorite(entry);
      } catch (error) {
        console.error("Favorite toggle failed on the server.", error);
      }
    }
  };

  const handleSaveLetter = async (letterData) => {
    await saveLetter(letterData, activeLetter?._id);
    navigate("/journal/letters");
  };

  const confirmDelete = (entryId) => {
    setEntryToDeleteId(entryId);
    setShowConfirmModal(true);
  };

  const stats = calculateStats(entries);
  const getStreakMessage = (currentStreak) => {
    if (currentStreak === 0) return "Start a new streak today!";
    if (currentStreak > 0 && currentStreak < 7) return "Keep the flame alive!";
    return "You're on an amazing streak!";
  };

  const JournalGrid = (
    <>
      <header className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">My Journal</h1>
          <p className="text-secondary">
            Your private space for thoughts, feelings, and reflections.
          </p>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Link to="/journal/letters">
            <LettersNavButton
              letterCount={letters.length}
              hasReadyLetters={hasReadyLetters}
            />
          </Link>
          <button
            onClick={handleNewEntry}
            className="flex items-center space-x-2 whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-text-contrast shadow-lg transition-transform hover:scale-105"
          >
            <Plus className="h-5 w-5" />
            <span>New Entry</span>
          </button>
        </div>
      </header>

      <div className="mb-8 rounded-xl border border-secondary bg-background p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-secondary" />
            <input
              type="text"
              placeholder="Search entries by title or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-secondary bg-background py-2 pl-10 pr-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={moodFilter}
              onChange={(e) => setMoodFilter(e.target.value)}
              className="w-full rounded-lg border border-secondary bg-background px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary md:w-auto"
            >
              <option value="all">All Moods</option>
              {Object.keys(MOOD_CONFIG).map((moodKey) => (
                <option key={moodKey} value={moodKey}>
                  {MOOD_CONFIG[moodKey].emoji} {MOOD_CONFIG[moodKey].label}
                </option>
              ))}
            </select>
            <button className="hidden items-center space-x-2 rounded-lg border border-secondary px-4 py-2 text-secondary transition-colors hover:border-primary hover:text-primary sm:flex">
              <Download className="h-5 w-5" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {journalLoading ? (
        <div className="py-8 text-center text-secondary">
          Loading your stories...
        </div>
      ) : journalError ? (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4 text-center text-red-500">
          {journalError}
        </div>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            <div className="flex items-center space-x-3 rounded-xl border border-secondary bg-background p-4 shadow-sm">
              <BookOpen className="h-8 w-8 flex-shrink-0 text-primary" />
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {stats.totalEntries}
                </p>
                <p className="text-sm text-secondary">Entries</p>
              </div>
            </div>
            {userProfile && (
              <>
                <div className="flex flex-col justify-between rounded-xl border border-secondary bg-background p-4 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <Flame
                      className={`h-8 w-8 flex-shrink-0 text-primary ${
                        userProfile.currentStreak > 0 && "animate-pulse"
                      }`}
                    />
                    <div>
                      <p className="text-2xl font-bold text-text-primary">
                        {userProfile.currentStreak}
                      </p>
                      <p className="text-sm text-secondary">Day Streak</p>
                    </div>
                  </div>
                  <p className="mt-2 text-center text-xs text-primary">
                    {getStreakMessage(userProfile.currentStreak)}
                  </p>
                </div>
                <div className="flex items-center space-x-3 rounded-xl border border-secondary bg-background p-4 shadow-sm">
                  <Award className="h-8 w-8 flex-shrink-0 text-primary" />
                  <div>
                    <p className="text-2xl font-bold text-text-primary">
                      {userProfile.longestStreak}
                    </p>
                    <p className="text-sm text-secondary">Longest</p>
                  </div>
                </div>
              </>
            )}
            <div className="flex items-center space-x-3 rounded-xl border border-secondary bg-background p-4 shadow-sm">
              <Star className="h-8 w-8 flex-shrink-0 text-primary" />
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {stats.favoriteEntries}
                </p>
                <p className="text-sm text-secondary">Favorites</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 rounded-xl border border-secondary bg-background p-4 shadow-sm">
              <TrendingUp className="h-8 w-8 flex-shrink-0 text-primary" />
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {stats.totalEntries > 0
                    ? Math.round(stats.totalWords / stats.totalEntries)
                    : 0}
                </p>
                <p className="text-sm text-secondary">Avg. Words</p>
              </div>
            </div>
          </div>

          {entries.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-secondary bg-background/50 py-16 text-center">
              <BookOpen className="mx-auto h-16 w-16 text-secondary/50" />
              <h3 className="mt-4 text-xl font-semibold text-text-primary">
                {searchTerm || moodFilter !== "all"
                  ? "No entries found"
                  : "Your journal is a blank page"}
              </h3>
              <p className="mt-2 text-secondary">
                {searchTerm || moodFilter !== "all"
                  ? "Try adjusting your search or filter."
                  : "Ready to write your first entry?"}
              </p>
              {!searchTerm && moodFilter === "all" && (
                <button
                  onClick={handleNewEntry}
                  className="mt-6 rounded-lg bg-primary px-6 py-2 text-text-contrast shadow-lg transition-transform hover:scale-105"
                >
                  Create First Entry
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {entries.map((entry) => (
                <EntryCard
                  key={entry._id}
                  entry={entry}
                  onEdit={() => handleEditEntry(entry)}
                  onDelete={() => confirmDelete(entry._id)}
                  onToggleFavorite={() => handleToggleFavorite(entry._id)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </>
  );

  return (
    <>
      <Routes>
        <Route path="/" element={JournalGrid} />
        <Route
          path="/new"
          element={
            <JournalEditor
              entry={null}
              onSave={handleSaveEntry}
              onCancel={() => navigate("/journal")}
              error={editorError}
            />
          }
        />
        <Route
          path="/edit/:entryId"
          element={
            <JournalEditor
              entry={activeEntry}
              onSave={handleSaveEntry}
              onCancel={() => navigate("/journal")}
              error={editorError}
            />
          }
        />
        <Route
          path="/letters"
          element={
            <LettersInbox
              letters={letters}
              onViewLetter={(l) => {
                setActiveLetter(l);
                navigate(`/journal/letters/view/${l._id}`);
              }}
              onCompose={() => {
                setActiveLetter(null);
                navigate("/journal/letters/new");
              }}
              onBackToJournal={() => navigate("/journal")}
              onDeleteLetter={deleteLetter}
            />
          }
        />
        <Route
          path="/letters/new"
          element={
            <LetterComposer
              letter={null}
              onSave={handleSaveLetter}
              onCancel={() => navigate("/journal/letters")}
            />
          }
        />
        <Route
          path="/letters/view/:letterId"
          element={
            <LetterViewer
              letter={activeLetter}
              onClose={() => navigate("/journal/letters")}
              onMarkAsOpened={markLetterAsOpened}
            />
          }
        />
      </Routes>
      <ConfirmModal
        isOpen={showConfirmModal}
        message="Are you sure you want to delete this entry? This action cannot be undone."
        onConfirm={handleDeleteEntry}
        onCancel={() => setShowConfirmModal(false)}
      />
    </>
  );
};

export default JournalPage;
