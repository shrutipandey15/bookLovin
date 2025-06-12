import { useEffect } from 'react';
import ParticlesBackground from './ParticlesBackground';
import DarkLightIcon from './DarkLightIcon';
import MoodSelector from '@components/MoodSelector';
import { useMood } from '@components/MoodContext';

const Layout = ({ children }) => {
  const { theme, setTheme } = useMood();
  const isDark = theme === 'dragon';

  const toggleTheme = () => {
    const newTheme = isDark ? 'coffee' : 'dragon';
    setTheme(newTheme);
  };

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = prefersDark ? 'dragon' : 'coffee';
    setTheme(initialTheme);
  }, [setTheme]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div
      className="min-h-screen transition-all duration-300 relative"
      style={{
        backgroundColor: 'var(--mood-bg)',
        color: 'var(--mood-text)',
        fontFamily: 'var(--mood-font)',
      }}
    >
      <ParticlesBackground />

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-1 rounded-full z-20 shadow-md bg-sky-700"
        aria-label="Toggle theme"
      >
        <DarkLightIcon isDark={isDark} size={24} />
      </button>

      {/* Mood selector */}
      <div className="pt-6 px-4 text-center">
        <MoodSelector />
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default Layout;
