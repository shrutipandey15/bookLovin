import React from "react";

const Layout = ({ children }) => {
    const toggleTheme = () => {
        document.documentElement.classList.toggle("dark");
      };
  return (
    <div className="min-h-screen bg-coffee-bg dark:bg-dragon-bg text-coffee-text dark:text-dragon-text font-serif dark:font-fantasy transition-all duration-300">
      {/* Optional: Navbar or Footer */}
      <button
          onClick={toggleTheme}
          className="px-4 py-2 bg-coffee-button text-white dark:bg-dragon-gold dark:text-black rounded absolute top-4 right-4 shadow-md"
        >
          Toggle Theme
        </button>
      {children}
    </div>
  );
};

export default Layout;
