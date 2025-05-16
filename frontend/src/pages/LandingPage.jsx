// src/pages/LandingPage.jsx
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

function LandingPage() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("token");
  const bookRef = useRef(null);

  const handleOpen = () => {
    // Trigger animation class
    bookRef.current.classList.add("open-book");

    // Navigate after animation completes
    setTimeout(() => {
      navigate(isLoggedIn ? "/posts" : "/login");
    }, 1500);
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative flex flex-col items-center justify-center">
      {/* Full screen book background */}
      <div className="absolute inset-0 bg-coffee-button dark:bg-dragon-card border-l-[5vw] border-coffee-hover dark:border-dragon-gold">
        {/* Dotted border overlay */}
        <div className="absolute inset-0 border-[3px] border-dotted border-coffee-accent/30 dark:border-dragon-gold/30 m-4"></div>
      </div>

      {/* Decorative book elements in background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute opacity-10 dark:opacity-5"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          >
            <div className="w-32 h-40 md:w-48 md:h-56 rounded-md"
                 style={{ backgroundColor: i % 2 === 0 ? '#7a5c45' : '#9b6c3d' }}>
            </div>
          </div>
        ))}
      </div>

      {/* Main content - centered in the book */}
      <div
        ref={bookRef}
        className="book-content z-10 flex flex-col items-center justify-center text-center max-w-md"
      >
        {/* Circular logo container */}
        <div className="rounded-full bg-coffee-hover dark:bg-dragon-blue/70 h-24 w-24 flex items-center justify-center mb-6">
          {/* Stacked books icon */}
          <div className="relative w-16 h-12">
            <div className="absolute w-14 h-3 bg-red-500 top-1 transform -rotate-6"></div>
            <div className="absolute w-14 h-3 bg-blue-400 top-4"></div>
            <div className="absolute w-14 h-3 bg-green-500 top-7 transform rotate-6"></div>
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-fantasy text-white dark:text-dragon-gold mb-4">
          Booklovin
        </h1>

        <p className="text-xl md:text-2xl italic text-white dark:text-dragon-subtext opacity-80 mb-12">
          Your Chronicle of Literary Journeys
        </p>

        <button
          onClick={handleOpen}
          className="px-10 py-4 rounded-lg bg-coffee-accent text-coffee-text hover:bg-coffee-bg dark:bg-dragon-blue dark:text-white dark:hover:bg-dragon-blueHover transition font-serif text-xl"
        >
          Open the Book
        </button>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 text-center text-white dark:text-dragon-subtext text-sm">
        <p>© 2025 BookLovin | A place for book enthusiasts</p>
      </footer>
    </div>
  );
}

export default LandingPage;
