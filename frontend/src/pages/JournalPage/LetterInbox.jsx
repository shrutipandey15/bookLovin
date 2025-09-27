import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Mail, Send, Search, Trash2 } from "lucide-react";

const LetterCard = ({ letter, isSelected, onSelect }) => {
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

  return (
    <div
      onClick={onSelect}
      className={`group relative cursor-pointer rounded-lg border p-4 transition-all duration-200
        ${isSelected ? 'border-primary bg-primary/10 shadow-md' : 'border-border-color bg-card-background hover:border-primary/50 hover:bg-card-background/80'}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-secondary/20 text-sm font-bold text-primary">
            {letter.isSender ? 'Me' : letter.sender?.charAt(0) || 'A'}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text-primary">
              {letter.isSender ? `To: ${letter.recipient}` : `From: ${letter.sender}`}
            </p>
            <p className="truncate text-sm font-bold text-text-primary">{letter.subject}</p>
            <p className="truncate text-xs text-secondary">{letter.content}</p>
          </div>
        </div>
        {!letter.isRead && !letter.isSender && (
          <div className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-primary" />
        )}
      </div>
      <p className="mt-2 text-right text-xs text-secondary">{formatDate(letter.createdAt)}</p>
    </div>
  );
};

export const LetterList = ({ letters = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const { letterId: selectedLetterId } = useParams();

  const filteredLetters = (letters || []).filter(letter => {
    const term = searchTerm.toLowerCase();
    const matchTerm = !term ||
      letter.subject?.toLowerCase().includes(term) ||
      letter.content?.toLowerCase().includes(term) ||
      letter.sender?.toLowerCase().includes(term) ||
      letter.recipient?.toLowerCase().includes(term);

    const matchFilter = filter === 'all' ||
      (filter === 'received' && !letter.isSender) ||
      (filter === 'sent' && letter.isSender);
      
    return matchTerm && matchFilter;
  });

  const receivedCount = letters.filter(l => !l.isSender).length;
  const sentCount = letters.filter(l => l.isSender).length;

  return (
    <>
      <header className="flex-shrink-0 border-b border-border-color p-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary">Literary Letters</h1>
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
            {['all', 'received', 'sent'].map(f => (
                <button 
                    key={f} 
                    onClick={() => setFilter(f)}
                    className={`rounded-full px-3 py-1 text-sm font-semibold transition-colors ${filter === f ? 'bg-primary text-text-contrast' : 'bg-background hover:bg-secondary/20'}`}
                >
                    {f.charAt(0).toUpperCase() + f.slice(1)} 
                    <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${filter === f ? 'bg-white/20' : 'bg-secondary/20'}`}>
                        {f === 'all' ? letters.length : f === 'received' ? receivedCount : sentCount}
                    </span>
                </button>
            ))}
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
            <p className="mt-2 text-sm">No letters found.</p>
          </div>
        )}
      </div>
    </>
  );
};