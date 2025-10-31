import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Mail, Send, Search, Clock, Calendar } from "lucide-react";
import { LetterType } from "@constants/letterType";

const LetterCard = ({ letter, isSelected }) => {
  const displayDate =
    letter.type === LetterType.PAST ? letter.targetDate : letter.createdAt;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isReadyToOpen =
    letter.type === LetterType.FUTURE &&
    letter.status === "scheduled" &&
    new Date(letter.targetDate) <= new Date();

  return (
    <div
      className={`group relative cursor-pointer rounded-lg border p-4 transition-all duration-200
        ${
          isSelected
            ? "border-primary bg-primary/10 shadow-md"
            : "border-border-color bg-card-background hover:border-primary/50 hover:bg-card-background/80"
        }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
              isSelected ? "bg-primary/20" : "bg-secondary/20"
            } text-primary`}
          >
            {letter.type === LetterType.FUTURE ? (
              <Clock size={20} />
            ) : (
              <Calendar size={20} />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text-primary">
              {letter.type === LetterType.FUTURE
                ? "Letter to Future Self"
                : "Memory from Past Self"}
            </p>
            {/* We use content as the preview now */}
            <p className="truncate text-sm font-medium text-text-primary">
              {letter.content.substring(0, 50)}...
            </p>
          </div>
        </div>
        {/* Show dot for unread *future* letters */}
        {letter.status === "scheduled" && letter.type === LetterType.FUTURE && (
          <div
            className={`absolute right-2 top-2 h-2.5 w-2.5 rounded-full ${
              isReadyToOpen ? "bg-red-500 animate-pulse" : "bg-primary"
            }`}
            title={isReadyToOpen ? "Ready to open!" : "Scheduled"}
          />
        )}
      </div>
      <p className="mt-2 text-right text-xs text-secondary">
        {letter.type === LetterType.FUTURE
          ? `Written: ${formatDate(displayDate)}`
          : `Memory Date: ${formatDate(displayDate)}`}
      </p>
    </div>
  );
};

export const LetterList = ({ letters = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState(LetterType.FUTURE); // Default to future
  const { letterId: selectedLetterId } = useParams();

  const filteredLetters = (letters || [])
    .filter((letter) => {
      // Filter by type (Past/Future)
      return letter.type === filter;
    })
    .filter((letter) => {
      // Then filter by search term
      const term = searchTerm.toLowerCase();
      return !term || letter.content?.toLowerCase().includes(term);
    })
    .sort((a, b) => new Date(b.targetDate) - new Date(a.targetDate)); // Sort by target date

  const futureCount = letters.filter(
    (l) => l.type === LetterType.FUTURE
  ).length;
  const pastCount = letters.filter((l) => l.type === LetterType.PAST).length;

  return (
    <>
      <header className="flex-shrink-0 border-b border-border-color p-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary">
            Literary Letters
          </h1>
          <Link
            to="/journal/letters/new"
            className="flex items-center space-x-2 whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-text-contrast shadow transition-transform hover:scale-105"
          >
            <Send className="h-4 w-4" />
            <span>Compose</span>
          </Link>
        </div>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-secondary" />
          <input
            type="text"
            placeholder="Search letters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-secondary bg-background py-2 pl-10 pr-4 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            key="future"
            onClick={() => setFilter(LetterType.FUTURE)}
            className={`rounded-full px-3 py-1 text-sm font-semibold transition-colors ${
              filter === LetterType.FUTURE
                ? "bg-primary text-text-contrast"
                : "bg-background hover:bg-secondary/20"
            }`}
          >
            Future
            <span
              className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${
                filter === LetterType.FUTURE
                  ? "bg-white/20"
                  : "bg-secondary/20"
              }`}
            >
              {futureCount}
            </span>
          </button>
          <button
            key="past"
            onClick={() => setFilter(LetterType.PAST)}
            className={`rounded-full px-3 py-1 text-sm font-semibold transition-colors ${
              filter === LetterType.PAST
                ? "bg-primary text-text-contrast"
                : "bg-background hover:bg-secondary/20"
            }`}
          >
            Past
            <span
              className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${
                filter === LetterType.PAST ? "bg-white/20" : "bg-secondary/20"
              }`}
            >
              {pastCount}
            </span>
          </button>
        </div>
      </header>
      <div className="flex-grow overflow-y-auto p-4 space-y-3">
        {filteredLetters.length > 0 ? (
          filteredLetters.map((letter) => (
            <Link key={letter.uid} to={`/journal/letters/view/${letter.uid}`}>
              <LetterCard
                letter={letter}
                isSelected={selectedLetterId === letter.uid}
              />
            </Link>
          ))
        ) : (
          <div className="py-10 text-center text-secondary">
            <Mail className="mx-auto h-10 w-10 opacity-50" />
            <p className="mt-2 text-sm">No letters found in this view.</p>
          </div>
        )}
      </div>
    </>
  );
};
