import { useEffect, useState } from 'react';
import ParticlesBackground from './ParticlesBackground';
import DarkLightIcon from './DarkLightIcon';
// import TestIcon from './TestIcon';

const Layout = ({ children }) => {

  const [isDark, setIsDark] = useState(
    () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark(!isDark);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      setIsDark(mediaQuery.matches);
      if (mediaQuery.matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    // Set initial theme based on preference
    handleChange();

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup listener on unmount
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className="min-h-screen bg-coffee-bg dark:bg-dragon-bg text-coffee-text dark:text-dragon-text font-serif dark:font-fantasy transition-all duration-300 relative">
      {/* Background particles */}
      <ParticlesBackground />

    {/* <TestIcon isEnabled={!isDark} /> */}

      {/* Theme toggle button */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-1 rounded-full z-20 shadow-md bg-sky-700"
      >
        <DarkLightIcon isDark={isDark} size={24} />
      </button>

      {/* Main content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default Layout;
