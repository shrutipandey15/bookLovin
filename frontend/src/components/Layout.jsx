import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';
import ParticleBackground from './ParticleBackground';

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
    <div className="min-h-screen bg-coffee-bg dark:bg-dragon-bg text-coffee-text dark:text-dragon-text font-serif dark:font-fantasy transition-all duration-300 relative overflow-hidden">
      <ParticleBackground />
      <button
        onClick={toggleTheme}
        className={`theme-toggle-btn ${isDark ? 'dark-btn' : 'light-btn'}`}
      >
        {isDark ? (
          <>
            <Sun size={20} className="text-dragon-gold" />
            <span className="label">To Light</span>
          </>
        ) : (
          <>
            <Moon size={20} className="text-coffee-button" />
            <span className="label">To Shadow</span>
          </>
        )}
      </button>

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default Layout;
