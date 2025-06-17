// src/components/Layout.jsx

// import { useEffect } from 'react';
import ParticlesBackground from './ParticlesBackground';
import DarkLightIcon from './DarkLightIcon';
import MoodSelector from '@components/MoodSelector';
import { useMood } from '@components/MoodContext';

const Layout = ({ children }) => {
  // Logic is simpler now, we just get the state
  const { theme, setTheme } = useMood();
  const isDark = theme === 'dragon';

  const toggleTheme = () => {
    const newTheme = isDark ? 'coffee' : 'dragon';
    setTheme(newTheme);
  };
  
  // This useEffect for prefers-color-scheme can be removed
  // as our context now handles the initial theme state.

  return (
    // We now use pure Tailwind classes that map to our CSS variables!
    <div className="min-h-screen transition-all duration-500 relative flex flex-col bg-background text-text-primary font-body">
      <ParticlesBackground />

      {/* The button is now styled with pure Tailwind classes */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-2 rounded-full z-30 shadow-lg transition-all duration-300 hover:scale-110 bg-primary text-text-contrast"
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      >
        <DarkLightIcon isDark={isDark} size={24} />
      </button>

      <header className="pt-6 px-4 text-center z-20">
        <MoodSelector />
        <h1 className="text-5xl tracking-widest my-4 text-primary font-body">
          BookLovin
        </h1>
      </header>

      <main className="relative z-10 flex flex-col items-center justify-center flex-grow px-4 pb-4">
        {children}
      </main>
    </div>
  );
};

export default Layout;