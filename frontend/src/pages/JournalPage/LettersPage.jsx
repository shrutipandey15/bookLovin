import { Routes, Route, useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { useLetters } from "@hooks/useLetters";
import { ScrollText, Send } from "lucide-react";

import { LetterList } from "./LetterInbox";
import { LetterViewer } from "./LetterViewer";
import LetterComposer from "./LetterComposer";

const LettersWelcome = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="animate-float">
        <ScrollText className="h-24 w-24 text-primary opacity-50" strokeWidth={1.5} />
      </div>
      <h2 className="mt-8 text-2xl font-bold text-text-primary">Your Literary Correspondence</h2>
      <p className="mt-2 text-secondary">
        Select a letter to read, or compose a new one to connect.
      </p>
      <Link
        to="/journal/letters/new"
        className="mt-8 flex items-center space-x-2 whitespace-nowrap rounded-lg bg-primary px-6 py-3 text-text-contrast shadow-lg transition-transform hover:scale-105"
      >
        <Send className="h-5 w-5" />
        <span>Write Your First Letter</span>
      </Link>
    </div>
  );
};

const LettersPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  
  const { letters, saveLetter, deleteLetter, markLetterAsOpened, loading } = useLetters();
  
  const wildcardPath = params['*'] || '';
  const letterId = wildcardPath.startsWith('view/') 
    ? wildcardPath.replace('view/', '') 
    : undefined;

  const activeLetter = letterId ? letters.find(l => l.uid === letterId) : null;

  const handleSaveLetter = async (letterData) => {
    await saveLetter(letterData);
    navigate("/journal/letters");
  };

  if (loading && letterId) {
    return (
      <div className="flex h-[calc(100vh-4rem)]">
        <div className="flex w-full max-w-sm flex-col border-r border-border-color lg:max-w-md">
          <LetterList letters={letters} onDeleteLetter={deleteLetter} />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-secondary">Loading letter...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Left Pane: Letter List */}
      <div className="flex w-full max-w-sm flex-col border-r border-border-color lg:max-w-md">
        <LetterList
          letters={letters}
          onDeleteLetter={deleteLetter}
        />
      </div>
      {/* Right Pane: Viewer, Composer, or Welcome */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <Routes>
          <Route index element={<LettersWelcome />} />
          <Route 
            path="new" 
            element={
              <LetterComposer
                onSave={handleSaveLetter}
                onCancel={() => navigate("/journal/letters")}
              />
            } 
          />
          <Route 
            path="view/:letterId" 
            element={
              activeLetter ? (
                <LetterViewer
                  letter={activeLetter}
                  onClose={() => navigate("/journal/letters")}
                  onMarkAsOpened={markLetterAsOpened}
                />
              ) : (
                <div className="text-center text-secondary">
                  <p>Letter not found</p>
                  <button 
                    onClick={() => navigate("/journal/letters")}
                    className="mt-4 rounded-lg bg-primary px-4 py-2 text-text-contrast"
                  >
                    Back to Letters
                  </button>
                </div>
              )
            } 
          />
        </Routes>
      </div>
    </div>
  );
};

export default LettersPage;