import { useEffect } from 'react';
import DarkLightIcon from './DarkLightIcon';
import { useMood } from '@components/MoodContext';

const Layout = ({ children }) => {
  const { theme, setTheme } = useMood();
  const isDark = theme === 'dragon';

  const toggleTheme = () => {
    const newTheme = isDark ? 'coffee' : 'dragon';
    setTheme(newTheme);
  };
  
  // This logic for setting the theme class is perfect.
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    // This is now just a simple container for the current page.
    <div className="min-h-screen bg-background text-text-primary font-body transition-colors duration-500">
      
      {/* The theme toggle button remains as a global element */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 rounded-full bg-primary p-2 text-text-contrast shadow-lg transition-all duration-300 hover:scale-110"
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      >
        <DarkLightIcon isDark={isDark} size={24} />
      </button>

      {/* The 'children' prop renders whatever page is active (e.g., HomePage) */}
      <main>{children}</main>

    </div>
  );
};

export default Layout;