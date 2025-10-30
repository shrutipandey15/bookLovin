import React from 'react';
import BookshelfCarousel from '@components/BookshelfCarousel';
import {
  Loader,
  Edit3,
  Save,
  Tag,
  Target,
  Award,
} from "lucide-react";

const UserProfileSidebar = ({
  user,
  stats,
  shelfStatus,
  shelfError,
  onDragEnd,
  favoritesShelf,
  readingShelf,
  wantToReadShelf,
  readShelf,
  dnfShelf,
  setSelectedBook,
  isOwner,
  isEditingGenres,
  setIsEditingGenres,
  genresInput,
  setGenresInput,
  handleSaveGenres,
  isSavingGenres,
  isEditingGoal,
  setIsEditingGoal,
  goalYearInput,
  setGoalYearInput,
  goalCountInput,
  setGoalCountInput,
  handleSaveGoal,
  isSavingGoal,
  isEditingArchetype,
  setIsEditingArchetype,
  archetypeInput,
  setArchetypeInput,
  handleSaveArchetype,
  isSavingArchetype,
  goalProgress,
}) => {
  return (
    <div className="w-full lg:w-1/3 space-y-10">
      {/* --- READING PERSONALITY SECTION --- */}
      <section className="p-6 bg-card-background/30 border border-border-color rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-primary mb-6 text-center">
          Reading Personality
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 items-start">
          {/* Column 1 (was Left) */}
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

          {/* Column 2 (was Right) */}
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

      {/* --- BOOKSHELF CAROUSEL SECTION --- */}
      <section>
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
        {shelfStatus === "succeeded" && (
          <BookshelfCarousel 
            onDragEnd={onDragEnd}
            favoritesShelf={favoritesShelf}
            readingShelf={readingShelf}
            wantToReadShelf={wantToReadShelf}
            readShelf={readShelf}
            dnfShelf={dnfShelf}
            setSelectedBook={setSelectedBook}
          />
        )}
      </section>
    </div>
  );
};

export default UserProfileSidebar;