import { useEffect, useState } from 'react';
import ParticlesBackground from './ParticlesBackground';
import { Sun, Moon } from 'lucide-react';

const Layout = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark(!isDark);
  };

  useEffect(() => {
    const isDarkActive = document.documentElement.classList.contains("dark");
    setIsDark(isDarkActive);
  }, []);

  return (
    <div className="min-h-screen bg-coffee-bg dark:bg-dragon-bg text-coffee-text dark:text-dragon-text font-serif dark:font-fantasy transition-all duration-300 relative">
      {/* Background particles */}
      <ParticlesBackground />

      {/* Theme toggle button */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-2 rounded-full z-20 shadow-md bg-white dark:bg-black bg-opacity-60 dark:bg-opacity-60 backdrop-blur-md"
      >
        {isDark ? (
          <Sun size={20} className="text-dragon-gold" />
        ) : (
          <Moon size={20} className="text-coffee-button" />
        )}
      </button>

      {/* Main content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default Layout;
