import { Sun, Moon } from 'lucide-react'; // Feather = Quill, Wings = Dragon Wing
import { useEffect, useState } from 'react';

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
      <button onClick={toggleTheme} className="theme-toggle-btn flex items-center gap-2">
        {isDark ? (
          <>
            <Sun size={20} className="text-dragon-gold" />
            To Light
          </>
        ) : (
          <>
            <Moon size={20} className="text-coffee-button" />
            To Shadow
          </>
        )}
      </button>

      {children}
    </div>
  );
};

export default Layout;
