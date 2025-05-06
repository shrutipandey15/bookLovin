import { useEffect, useState } from "react";

const Layout = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check the initial theme
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const isNowDark = !isDark;
    document.documentElement.classList.toggle("dark");
    setIsDark(isNowDark);
  };

  const themeLabel = isDark ? "☕ To Light" : "🐉 To Shadow";

  return (
    <div className="app min-h-screen w-full bg-coffee-bg dark:bg-dragon-bg text-coffee-text dark:text-dragon-text font-serif dark:font-fantasy transition-all duration-300">
      <button
        onClick={toggleTheme}
        className="theme-toggle-btn"
      >
        {themeLabel}
      </button>
      {children}
    </div>
  );
};

export default Layout;
